# Docker builds optimize every completed output, including live rebuilds.
# Actions invoke the same binary explicitly after CSS purging instead.
Jekyll::Hooks.register :site, :post_write do |site|
  optimizer = ENV['SITE_OPTIMIZER_BIN']
  next if optimizer.nil? || optimizer.empty?

  assets = File.join(site.dest, 'assets')
  next unless File.directory?(assets)

  Jekyll.logger.info 'Rust optimizer:', assets
  unless system(optimizer, assets)
    raise Jekyll::Errors::FatalException, 'Rust asset optimization failed'
  end
end
