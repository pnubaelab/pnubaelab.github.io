# Keep the existing ImageMagick transformations and Jekyll output paths.
# Hash inputs instead of relying on checkout timestamps or retaining all of _site.
require 'jekyll-imagemagick'
require 'open3'
require_relative '../bin/asset_cache'

module ResponsiveImageCache
  def generate(site)
    photos = site.collections['photo']&.docs || []
    photos.each { |photo| photo.data.delete('photo_sources') }
    @photo_variants = Hash.new { |hash, path| hash[path] = [] }
    result = super

    photos.each do |photo|
      image = photo.data['img']
      width = photo.data['photo_width']
      next unless image.is_a?(String) && width.is_a?(Integer) && width.positive?

      path = File.expand_path(image.sub(%r{\A/+}, ''), site.source)
      sources = @photo_variants[path].map do |url, edge|
        { 'url' => url, 'width' => edge.zero? ? width : [edge, width].min }
      end.uniq { |source| source['width'] }.sort_by { |source| source['width'] }
      photo.data['photo_sources'] = sources unless sources.empty?
    end
    result
  end

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
      if extension == 'webp'
        url = output.delete_prefix(site.dest + File::SEPARATOR)
        @photo_variants[File.expand_path(input)] << [url, edge]
      end

      prefix = File.dirname(input.sub(site.source, ''))
      site.static_files << JekyllImagemagick::ImageFile.new(site, site.dest, prefix, File.basename(output))
    end
    Jekyll.logger.info 'Image cache:', "#{reused} reused, #{generated} generated"
    generated
  end
end

JekyllImagemagick::ImageGenerator.prepend(ResponsiveImageCache)
