# Content-addressed build artifacts, shared by local Jekyll and Actions.
require 'digest'
require 'fileutils'
require 'find'
require 'tmpdir'
require 'tempfile'

class SiteAssetCache
  def initialize(root, namespace)
    @root = File.join(root, namespace)
  end

  def key(*parts)
    Digest::SHA256.hexdigest(Marshal.dump(parts))
  end

  def lookup(key)
    path = File.join(@root, key)
    path if File.file?(path) && File.size?(path)
  end

  def store(key, source)
    raise "Empty build artifact: #{source}" unless File.size?(source)

    FileUtils.mkdir_p(@root)
    Tempfile.create('.asset-', @root) do |file|
      FileUtils.copy_file(source, file.path)
      File.chmod(0o644, file.path)
      File.rename(file.path, File.join(@root, key))
    end
    File.join(@root, key)
  end

  # Stage only misses so the existing Rust binary still processes them in parallel.
  def self.optimize_pngs(assets, optimizer, root)
    cache = new(root, "png-#{Digest::SHA256.file(optimizer).hexdigest}")
    misses = Hash.new { |hash, key| hash[key] = [] }
    hits = 0
    Find.find(assets) do |path|
      if File.symlink?(path)
        Find.prune
      elsif File.file?(path) && File.extname(path).casecmp?('.png')
        key = Digest::SHA256.file(path).hexdigest
        if (cached = cache.lookup(key))
          FileUtils.copy_file(cached, path)
          hits += 1
        else
          misses[key] << path
        end
      end
    end

    unless misses.empty?
      Dir.mktmpdir('site-png-') do |stage|
        misses.each { |key, paths| FileUtils.copy_file(paths.first, File.join(stage, "#{key}.png")) }
        raise 'Rust asset optimization failed' unless system(optimizer, stage)

        misses.each do |key, paths|
          optimized = File.join(stage, "#{key}.png")
          cached = cache.store(key, optimized)
          # A watched build can contain the already optimized version too.
          cache.store(Digest::SHA256.file(optimized).hexdigest, optimized)
          paths.each { |path| FileUtils.copy_file(cached, path) }
        end
      end
    end
    puts "PNG cache: #{hits} reused, #{misses.length} unique inputs optimized"
  end
end

if $PROGRAM_NAME == __FILE__
  abort 'Usage: ruby bin/asset_cache.rb ASSETS OPTIMIZER CACHE_DIRECTORY' unless ARGV.length == 3
  SiteAssetCache.optimize_pngs(*ARGV)
end
