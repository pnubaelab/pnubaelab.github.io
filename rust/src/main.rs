//! Lossless, output-only asset optimization for the existing Jekyll renderer.
use rayon::prelude::*;
use std::{
    env,
    error::Error,
    fs,
    io::Write,
    path::{Path, PathBuf},
    time::{Duration, Instant},
};

type Result<T> = std::result::Result<T, Box<dyn Error + Send + Sync>>;

fn collect(root: &Path, files: &mut Vec<PathBuf>) -> Result<()> {
    // Never follow symlinks: generated assets must stay inside the selected tree.
    for entry in fs::read_dir(root)? {
        let entry = entry?;
        let kind = entry.file_type()?;
        if kind.is_dir() {
            collect(&entry.path(), files)?;
        } else if kind.is_file()
            && entry
                .path()
                .extension()
                .is_some_and(|x| x.eq_ignore_ascii_case("png"))
        {
            files.push(entry.path());
        }
    }
    Ok(())
}

fn options() -> oxipng::Options {
    let mut options = oxipng::Options::from_preset(2);
    // Preserve metadata, color profiles, transparent RGB and interlace behavior.
    options.strip = oxipng::StripChunks::None;
    options.optimize_alpha = false;
    options.bit_depth_reduction = false;
    options.color_type_reduction = false;
    options.palette_reduction = false;
    options.grayscale_reduction = false;
    options.interlace = None;
    options.timeout = Some(Duration::from_secs(30));
    options.max_decompressed_size = Some(512 * 1024 * 1024);
    options
}

fn optimize(path: &Path, check: bool) -> Result<(u64, u64)> {
    let original = fs::read(path)?;
    let optimized = oxipng::optimize_from_memory(&original, &options())
        .map_err(|error| format!("{}: {error}", path.display()))?;
    let before = original.len() as u64;
    let after = optimized.len().min(original.len()) as u64;
    if !check && after < before {
        // Write beside the original and rename only after the complete write succeeds.
        let mut temporary = tempfile::NamedTempFile::new_in(path.parent().unwrap())?;
        temporary
            .as_file()
            .set_permissions(fs::metadata(path)?.permissions())?;
        temporary.write_all(&optimized)?;
        temporary.as_file().sync_all()?;
        temporary.persist(path).map_err(|error| error.error)?;
    }
    Ok((before, after))
}

fn run() -> Result<()> {
    let mut root = None;
    let mut check = false;
    let mut jobs = std::thread::available_parallelism()?.get().min(4);
    let mut args = env::args().skip(1);
    while let Some(arg) = args.next() {
        match arg.as_str() {
            "--check" => check = true,
            "--jobs" => jobs = args.next().ok_or("--jobs requires a number")?.parse()?,
            "--help" | "-h" => {
                println!(
                    "site-optimize [--check] [--jobs N] <generated-asset-directory>\nLosslessly optimize PNGs; --check reports savings without writing."
                );
                return Ok(());
            }
            _ if arg.starts_with('-') => return Err(format!("unknown option: {arg}").into()),
            _ => {
                if root.replace(PathBuf::from(arg)).is_some() {
                    return Err("provide exactly one generated asset directory".into());
                }
            }
        }
    }
    if jobs == 0 {
        return Err("--jobs must be positive".into());
    }
    let root = root.ok_or("provide a generated asset directory, e.g. _site/assets")?;
    if fs::symlink_metadata(&root)?.file_type().is_symlink() {
        return Err("asset directory must not be a symlink".into());
    }
    let start = Instant::now();
    let mut files = Vec::new();
    collect(&root, &mut files)?;
    files.sort();
    let pool = rayon::ThreadPoolBuilder::new().num_threads(jobs).build()?;
    let results = pool.install(|| {
        files
            .par_iter()
            .map(|path| optimize(path, check))
            .collect::<Vec<_>>()
    });
    let (mut before, mut after, mut changed) = (0u64, 0u64, 0usize);
    for result in results {
        let (a, b) = result?;
        before += a;
        after += b;
        changed += usize::from(b < a);
    }
    println!(
        "PNG {}: {} files, {} improved, {} -> {} bytes (saved {} bytes, {:.2}%), {:.2}s",
        if check { "analysis" } else { "optimization" },
        files.len(),
        changed,
        before,
        after,
        before - after,
        if before == 0 {
            0.0
        } else {
            (before - after) as f64 / before as f64 * 100.0
        },
        start.elapsed().as_secs_f64()
    );
    Ok(())
}

fn main() {
    if let Err(error) = run() {
        eprintln!("site-optimize: {error}");
        std::process::exit(1);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    fn fixture(path: &Path) {
        let mut bytes = Vec::new();
        {
            let mut encoder = png::Encoder::new(&mut bytes, 64, 64);
            encoder.set_color(png::ColorType::Rgba);
            encoder.set_depth(png::BitDepth::Eight);
            encoder.set_compression(png::Compression::NoCompression);
            let mut writer = encoder.write_header().unwrap();
            writer
                .write_image_data(&[12, 34, 56, 0].repeat(64 * 64))
                .unwrap();
        }
        fs::write(path, bytes).unwrap();
    }
    fn pixels(path: &Path) -> Vec<u8> {
        let decoder = png::Decoder::new(std::io::BufReader::new(fs::File::open(path).unwrap()));
        let mut reader = decoder.read_info().unwrap();
        let mut bytes = vec![0; reader.output_buffer_size().unwrap()];
        let frame = reader.next_frame(&mut bytes).unwrap();
        bytes.truncate(frame.buffer_size());
        bytes
    }
    #[test]
    fn optimization_preserves_pixels_and_check_does_not_write() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("fixture.png");
        fixture(&path);
        let original = fs::read(&path).unwrap();
        let expected = pixels(&path);
        let (before, after) = optimize(&path, true).unwrap();
        assert!(after < before);
        assert_eq!(fs::read(&path).unwrap(), original);
        optimize(&path, false).unwrap();
        let output = fs::read(&path).unwrap();
        assert!(output.len() < original.len());
        assert_eq!(pixels(&path), expected);
        let second = optimize(&path, false).unwrap();
        assert_eq!(second.0, second.1);
    }
    #[test]
    fn corrupt_png_is_not_overwritten() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("bad.png");
        fs::write(&path, b"invalid").unwrap();
        assert!(optimize(&path, false).is_err());
        assert_eq!(fs::read(path).unwrap(), b"invalid");
    }
}
