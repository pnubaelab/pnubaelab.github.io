# Run with bundle exec ruby utils/validate_photo_dimensions.rb. No image tools run.
require 'jekyll'
require 'tmpdir'
require 'ostruct'
require_relative '../_plugins/photo_dimensions'

def check(value, message)
  raise message unless value
end

original_capture = Open3.method(:capture3)
requests = []
output = '4032 3024 TopLeft'
success = true
Open3.define_singleton_method(:capture3) do |*args|
  requests << args
  [output, '', OpenStruct.new(success?: success)]
end

begin
  Dir.mktmpdir('photo-dimensions') do |source|
    File.write(File.join(source, 'original image.jpg'), 'original image bytes')
    make_doc = ->(image) { OpenStruct.new(data: { 'img' => image }) }
    docs = [make_doc.call('original image.jpg'), make_doc.call('/original image.jpg')]
    invalid = [nil, '', 'https://example.com/image.jpg', '//example.com/image.jpg', '../outside.jpg', 'missing.jpg']
    docs.concat(invalid.map { |image| make_doc.call(image) })
    site = OpenStruct.new(source: source, collections: { 'photo' => OpenStruct.new(docs: docs) })
    generator = Jekyll::PhotoDimensionsGenerator.new
    generator.generate(site)
    check(requests.length == 1, 'duplicate local paths should read image headers once per build')
    check(requests.first == ['identify', '-ping', '-format', '%w %h %[orientation]', File.join(source, 'original image.jpg')], 'identify must receive separate arguments and original path')
    docs.first(2).each do |doc|
      check(doc.data.values_at('photo_width', 'photo_height') == [4032, 3024], 'original dimensions must be integers')
    end
    docs.drop(2).each { |doc| check(!doc.data.key?('photo_width'), 'invalid images must have no dimensions') }
    check(File.read(File.join(source, 'original image.jpg')) == 'original image bytes', 'source bytes must remain intact')

    # EXIF 5–8 swap natural axes; 1–4 and absent orientation keep them.
    %w[LeftTop RightTop RightBottom LeftBottom].each do |orientation|
      output = "4032 3024 #{orientation}"
      generator.generate(site)
      check(docs.first.data.values_at('photo_width', 'photo_height') == [3024, 4032], "#{orientation} must swap browser dimensions")
    end
    ['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft', 'Undefined', ''].each do |orientation|
      output = "4032 3024 #{orientation}"
      generator.generate(site)
      check(docs.first.data.values_at('photo_width', 'photo_height') == [4032, 3024], "#{orientation} must preserve stored dimensions")
    end

    ['0 12', '12 0', '-1 12', '10 20junk', "10 20\n30 40", ''].each do |invalid_output|
      output = invalid_output
      generator.generate(site)
      check(!docs.first.data.key?('photo_width'), 'invalid identify output must clear previous dimensions')
    end
    output = '10 20'
    success = false
    generator.generate(site)
    check(!docs.first.data.key?('photo_width'), 'failed identify must not populate dimensions')
    Open3.define_singleton_method(:capture3) { |*| raise Errno::ENOENT, 'identify unavailable' }
    generator.generate(site)
    check(!docs.first.data.key?('photo_width'), 'missing identify must not break builds')
    generator.generate(OpenStruct.new(collections: {}))
  end
ensure
  Open3.define_singleton_method(:capture3, original_capture)
end
puts 'Photo dimensions, header-read caching, invalid inputs and graceful fallback checks passed.'
