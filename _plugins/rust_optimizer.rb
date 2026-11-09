# Docker builds optimize every completed output, including live rebuilds.
# Actions invoke the same binary explicitly after CSS purging instead.
require_relative '../bin/asset_cache'

Jekyll::Hooks.register :site, :post_write do |site|
  optimizer = ENV['SITE_OPTIMIZER_BIN']
  next if optimizer.nil? || optimizer.empty?

  assets = File.join(site.dest, 'assets')
  next unless File.directory?(assets)

  Jekyll.logger.info 'Rust optimizer:', assets
  cache = File.expand_path(site.config['cache_dir'], site.source)
  SiteAssetCache.optimize_pngs(assets, optimizer, cache)
end
