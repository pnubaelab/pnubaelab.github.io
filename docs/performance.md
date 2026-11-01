# Performance pipeline

The site remains a static Jekyll site. Ruby runs at build time, not in a visitor's browser. Liquid templates, bibliography rendering, routes and content collections still use Jekyll; this is an incremental Rust adoption, not a complete replacement of Ruby.

The production workflow now runs a Rust PNG optimizer after building and purging CSS. It processes files in parallel (up to four workers by default), preserves decoded pixels, transparent RGB, metadata and color profiles, and only replaces a generated file when the output is smaller. Atomic file replacement protects each file against interrupted writes. Original assets are unchanged. JPEG, GIF, SVG, WebP and other files are untouched.

```sh
bundle exec jekyll build
cargo test --locked --manifest-path rust/Cargo.toml
cargo run --release --locked --manifest-path rust/Cargo.toml -- _site/assets
```

Use `--check` before the directory to calculate savings without writing, or `--jobs 2` to bound concurrency. A malformed PNG fails the command rather than silently publishing an incomplete optimization pass. Some files may already have been optimized when another file fails; rebuilding regenerates the output.

Measured on 2026-11-01 using the repository's `assets/img` and a release build: 32 PNGs, 56,252,127 → 44,032,461 bytes, saving 12,219,666 bytes (21.72%) in 20.60 seconds. This measures PNG payload savings, not total page weight or browser rendering speed. Pages using generated WebP sources may see no PNG transfer reduction. Compilation time is excluded.

Browser improvements:

- Core scripts use `defer`, retaining jQuery → Bootstrap → MDB ordering.
- Masonry and imagesLoaded load only when a `.grid` exists.
- Altmetric and Dimensions scripts load only when their badge elements exist.
- Optional script dependencies load in order and retain configured integrity checks.
- Theme initialization and MathJax keep their existing loading behavior.

Run regression checks with:

```sh
npm run test:research-vectors
npm run test:count-up
npm run test:optional-libraries
node utils/validate_collabo_css.cjs _site/publications/index.html
```

A complete Rust renderer would also need compatible Liquid tags, Scholar/BibTeX formatting, Markdown, archive generation, feed/sitemap generation, notebook conversion and image generation. Removing Ruby before output and browser parity are established would risk changing existing pages. No complete renderer migration or measured browser speed multiplier is claimed by this change.

Integration validation: the production Jekyll build completed successfully in an isolated Docker environment (346.647 seconds, including all responsive image generation). All 396 generated HTML files parsed successfully for optional library configuration (1,173 JSON configurations); the loader asset was emitted and Rust sources were excluded. The built publication graph CSS check passed. Existing Sass deprecation, empty-slug and duplicate archive destination warnings remain. Browser visual comparisons and browser timing benchmarks have not been performed.

On the completed production output (`assets`, including additional PNG directories), the optimizer processed 34 PNGs: 65,756,870 → 51,531,683 bytes, saving 14,225,187 bytes (21.63%) in 23.14 seconds. These are uncompressed file sizes, not measured network transfer or render times.

## Docker and GitHub Actions

Both Compose files now build `pnubaelab-site:local` from this repository. The multi-stage Dockerfile compiles and tests the optimizer in a Rust stage, then copies only its executable into the Ruby runtime. `SITE_OPTIMIZER_BIN` enables a Jekyll `post_write` hook, so initial builds and watched rebuilds both optimize generated PNG files before Jekyll serves the output. The entrypoint preserves the mounted Gemfile.lock and supervises the exact Jekyll child process when restarting for configuration changes.

```sh
docker compose build
docker compose up -d --no-build --pull never
docker compose logs -f jekyll
curl --fail http://localhost:8080/
docker compose exec -T jekyll site-optimize --help
```

The first build can take several minutes while Jekyll creates responsive images and compresses HTML. Docker health checks allow ten minutes for startup. The Compose default remains `JEKYLL_ENV=development` with live reload; Actions sets `JEKYLL_ENV=production`.

`deploy.yml` retains the production static-site deployment, with explicit Rust optimization after CSS purging. It also deploys the latest default branch after the daily `Update Data Files` workflow succeeds, since that workflow commits using `GITHUB_TOKEN`. `docker-verify.yml` independently rebuilds Docker and checks HTTP routes, emitted JavaScript and Rust optimization logs on relevant pushes and pull requests. Local verification does not trigger a remote Actions run or publish the GitHub Pages site; the workflow changes must reach GitHub first.

Local Docker validation on 2026-11-01: built image `pnubaelab-site:local` (`7d6d9e04a1ef`), recreated the 8080 Compose service, confirmed healthy status and HTTP 200 for `/`, `/photos/`, `/publications/` and `/assets/js/optional-libraries.js`. The actual Jekyll hook optimized 34 PNGs by 14,225,187 bytes (21.63%). Built graph CSS and served optional JSON configuration checks passed.

The startup check also exposed Google Scholar network timeouts and the live watcher traversing a local `.venv` symlink. Python virtual environments are now explicitly excluded from Jekyll, and Scholar HTTP requests use a five-second connection timeout and ten-second read timeout. The existing random delay and `N/A` failure fallback remain. `bundle exec ruby utils/validate_scholar_timeouts.rb` verifies timeout options, successful parsing and cached failure behavior without accessing the network; both workflows run it.

After the watcher exclusions and network timeout changes, the final 8080 restart completed in 59.381 seconds (existing responsive images reused), compared with 229.918 seconds for the earlier local startup that waited on Scholar. The final container was healthy; all four HTTP checks and graph CSS validation passed again. This is local startup timing, not browser performance or a clean-build benchmark.

## Photo gallery without reducing image quality

The gallery keeps the original image URLs, files, resolution and zoom behavior. A build-time header read adds each photo's `width` and `height` attributes, accounting for EXIF display orientation; CSS continues to display the same responsive size. Reserving the correct aspect ratio lets the browser's native lazy loading defer distant original images. No thumbnail conversion or downsampling is introduced.

Photo card styles now appear once per gallery page. The gallery controller is a separate cacheable script. Image completion callbacks are batched into one animation frame per affected visible year section, preserving completion ordering and the existing wide-card placement scoring algorithm. IntersectionObserver defers later layout passes for distant sections. Entrance and movement effects run for visible cards; resizing clears stale desktop column constraints before deferred sections are activated. Reduced motion and browsers without IntersectionObserver retain functional fallbacks.

Checks: `npm run test:photo-gallery` exercises burst batching, offscreen deferral/reactivation, error handling, resizing and the observer fallback. `bundle exec ruby utils/validate_photo_dimensions.rb` verifies safe original-header reads, caching, invalid paths and unavailable ImageMagick. Both are wired into Actions. Real Chromium checks on port 8080 cover desktop/mobile, all 165 photos through scrolling, no gallery runtime errors, and medium-zoom opening an original image. Timing/network counts depend on browser heuristics and viewport; no render-speed multiplier is claimed.
