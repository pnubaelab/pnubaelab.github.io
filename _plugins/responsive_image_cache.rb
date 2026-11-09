# Keep the existing ImageMagick transformations and Jekyll output paths.
# Hash inputs instead of relying on checkout timestamps or retaining all of _site.
require 'jekyll-imagemagick'
require 'open3'
require_relative '../bin/asset_cache'

module ResponsiveImageCache
  private

  def generate_files(site, tuples, formats)
    version, status = Open3.capture2('convert', '-version')
    raise 'ImageMagick is unavailable' unless status.success?

    cache = SiteAssetCache.new(File.expand_path(site.config['cache_dir'], site.source), 'responsive-v1')
    digests = {}
    generated = 0
    reused = 0
    tuples.each do |input, output, edge|
      extension = File.extname(output).delete_prefix('.')
      digest = (digests[input] ||= Digest::SHA256.file(input).hexdigest)
      key = cache.key(version, digest, extension, formats[extension], edge, @config['resize_flags'])
      cached = cache.lookup(key)
      if cached
        reused += 1
      else
        # Keep the extension: ImageMagick selects its encoder from the filename.
        Tempfile.create(['image-', ".#{extension}"]) do |temporary|
          JekyllImagemagick::ImageConvert.run(input, temporary.path, formats[extension], edge, @config['resize_flags'])
          cached = cache.store(key, temporary.path)
        end
        generated += 1
      end
      FileUtils.copy_file(cached, output)

      prefix = File.dirname(input.sub(site.source, ''))
      site.static_files << JekyllImagemagick::ImageFile.new(site, site.dest, prefix, File.basename(output))
    end
    Jekyll.logger.info 'Image cache:', "#{reused} reused, #{generated} generated"
    generated
  end
end

JekyllImagemagick::ImageGenerator.prepend(ResponsiveImageCache)
