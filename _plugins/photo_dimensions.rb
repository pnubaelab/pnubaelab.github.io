require 'open3'

module Jekyll
  # Read original image headers once per build; never transform image files.
  class PhotoDimensionsGenerator < Generator
    safe true
    priority :low

    def generate(site)
      photos = site.collections['photo']
      return unless photos

      source = File.realpath(site.source)
      cache = {}
      photos.docs.each do |document|
        document.data.delete('photo_width')
        document.data.delete('photo_height')
        path = local_image(source, document.data['img'])
        next unless path

        stat = File.stat(path)
        key = [path, stat.mtime, stat.size]
        dimensions = cache.fetch(key) { cache[key] = identify_dimensions(path) }
        next unless dimensions

        document.data['photo_width'], document.data['photo_height'] = dimensions
      rescue SystemCallError, ArgumentError
        # Missing/unreadable local images retain their existing browser behavior.
        next
      end
    end

    private

    def local_image(source, image)
      return unless image.is_a?(String) && !image.empty?
      return if image.start_with?('//') || image.match?(/\A[a-z][a-z0-9+.-]*:/i)

      path = File.realpath(File.join(source, image.sub(%r{\A/+}, '')))
      return unless path.start_with?(source + File::SEPARATOR) && File.file?(path)

      path
    end

    def identify_dimensions(path)
      output, _error, status = Open3.capture3('identify', '-ping', '-format', '%w %h %[orientation]', path)
      return unless status.success?
      match = output.match(/\A([1-9]\d*) ([1-9]\d*)(?: ([A-Za-z]*))?\z/)
      return unless match

      dimensions = [match[1].to_i, match[2].to_i]
      # Browsers apply EXIF orientation when computing an image's natural size.
      # Orientations 5–8 rotate the stored pixel axes, including mirrored cases.
      dimensions.reverse! if %w[LeftTop RightTop RightBottom LeftBottom].include?(match[3])
      dimensions
    rescue SystemCallError
      nil
    end
  end
end
