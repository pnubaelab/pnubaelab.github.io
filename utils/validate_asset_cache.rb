# Real ImageMagick conversions, plus a deterministic stand-in for the tested Rust CLI.
require 'jekyll'
require 'minitest/autorun'
require_relative '../_plugins/responsive_image_cache'

class AssetCacheTest < Minitest::Test
  def setup
    @root = Dir.mktmpdir('asset-cache-test-')
    @source = File.join(@root, 'source')
    @destination = File.join(@root, 'output')
    @cache = File.join(@root, 'cache')
    FileUtils.mkdir_p(File.join(@source, 'assets/img'))
    @input = File.join(@source, 'assets/img/sample.png')
    @output = File.join(@destination, 'assets/img/sample-16.webp')
    image('red')
  end

  def teardown
    FileUtils.remove_entry(@root)
  end

  def image(color)
    raise 'fixture conversion failed' unless system('convert', '-size', '32x24', "xc:#{color}", @input)
  end

  def generate(quality = 85)
    config = Jekyll.configuration('source' => @source, 'destination' => @destination,
      'cache_dir' => @cache, 'plugins' => [],
      'imagemagick' => { 'enabled' => true, 'input_directories' => ['assets/img/'],
        'input_formats' => ['.png'], 'widths' => [16],
        'output_formats' => { 'webp' => "-quality #{quality} -auto-orient -strip" } })
    site = Jekyll::Site.new(config)
    JekyllImagemagick::ImageGenerator.new.generate(site)
    assert_equal 1, site.static_files.length
    assert File.file?(@output)
  end

  def test_responsive_cache_survives_clean_output_and_checkout_timestamps
    original = JekyllImagemagick::ImageConvert.method(:run)
    calls = 0
    JekyllImagemagick::ImageConvert.stub(:run, ->(*args) { calls += 1; original.call(*args) }) do
      generate
      bytes = File.binread(@output)
      FileUtils.rm_rf(@destination)
      File.utime(Time.now + 100, Time.now + 100, @input)
      generate
      assert_equal 1, calls
      assert_equal bytes, File.binread(@output)
      assert_equal 0o644, File.stat(@output).mode & 0o777
      # Compare the cached artifact with a direct run of the original converter.
      direct = File.join(@root, 'direct.webp')
      original.call(@input, direct, '-quality 85 -auto-orient -strip', 16, nil)
      assert_equal File.binread(direct), bytes

      timestamp = File.mtime(@input)
      image('blue')
      File.utime(timestamp, timestamp, @input)
      generate
      assert_equal 2, calls, 'changed contents must invalidate even with identical timestamps'
      refute_equal bytes, File.binread(@output)
      generate(60)
      assert_equal 3, calls, 'changed quality must invalidate'
    end
  end

  def test_failed_conversion_is_not_cached
    JekyllImagemagick::ImageConvert.stub(:run, ->(*) {}) do
      assert_raises(RuntimeError) { generate }
    end
    assert_empty Dir.glob(File.join(@cache, 'responsive-v1', '*'))
    generate
  end

  def test_png_cache_invalidates_source_and_optimizer_and_skips_symlinks
    assets = File.join(@root, 'pngs')
    FileUtils.mkdir_p(assets)
    png = File.join(assets, 'input.png')
    File.binwrite(png, 'original')
    outside = File.join(@root, 'outside.png')
    File.binwrite(outside, 'outside')
    File.symlink(outside, File.join(assets, 'link.png'))
    binary = File.join(@root, 'optimizer')
    counter = File.join(@root, 'calls')
    File.write(binary, <<~SCRIPT)
      #!/usr/bin/env ruby
      File.open(#{counter.inspect}, 'a') { |file| file.puts 'run' }
      Dir.glob(File.join(ARGV.fetch(0), '*.png')).each do |path|
        File.binwrite(path, File.binread(path) + '-optimized')
      end
    SCRIPT
    File.chmod(0o755, binary)
    optimize = -> { SiteAssetCache.optimize_pngs(assets, binary, @cache) }
    optimize.call
    assert_equal 'original-optimized', File.binread(png)
    File.binwrite(png, 'original')
    optimize.call
    optimize.call # Already optimized output must also be a hit.
    assert_equal 1, File.readlines(counter).length
    assert_equal 'original-optimized', File.binread(png)
    assert_equal 'outside', File.binread(outside)
    File.binwrite(png, 'changed')
    optimize.call
    assert_equal 2, File.readlines(counter).length
    File.open(binary, 'a') { |file| file.puts '# new optimizer version' }
    optimize.call
    assert_equal 3, File.readlines(counter).length
  end

  def test_failed_optimizer_does_not_replace_output_or_cache_it
    binary = File.join(@root, 'failure')
    File.write(binary, "#!/bin/sh\nexit 1\n")
    File.chmod(0o755, binary)
    before = File.binread(@input)
    assert_raises(RuntimeError) { SiteAssetCache.optimize_pngs(File.dirname(@input), binary, @cache) }
    assert_equal before, File.binread(@input)
    assert_empty Dir.glob(File.join(@cache, 'png-*', '*'))
  end
end
