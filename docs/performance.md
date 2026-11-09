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

The gallery displays the existing generated WebP variants in cards and loads the original image when zooming. Source files and their original resolution remain intact. A build-time header read adds each photo's `width` and `height` attributes, accounting for EXIF display orientation; CSS continues to display the same responsive size. Reserving the correct aspect ratio lets the browser's native lazy loading defer distant previews. The responsive preview behavior is detailed below.

Photo card styles appear once per gallery page. The gallery controller is a separate cacheable script. Image completion callbacks are batched into one animation frame per affected visible year section and reveal photos in place without changing their chronological DOM order. Numeric layout search fills available space across each year as described below. IntersectionObserver defers later layout passes for distant sections. Entrance and movement effects run for visible cards; resizing clears stale desktop row/column constraints before deferred sections are activated. Reduced motion and browsers without IntersectionObserver retain functional fallbacks.

Checks: `npm run test:photo-gallery` exercises burst batching, offscreen deferral/reactivation, error handling, resizing and the observer fallback. `bundle exec ruby utils/validate_photo_dimensions.rb` verifies safe original-header reads, caching, invalid paths and unavailable ImageMagick. Both are wired into Actions. Real Chromium checks on port 8080 cover desktop/mobile, all 165 photos through scrolling, no gallery runtime errors, and medium-zoom opening an original image. Timing/network counts depend on browser heuristics and viewport; no render-speed multiplier is claimed.

## Build caching and redundant CSS compression (2026-11-09)

Markdown, Liquid templates, image dimensions, ImageMagick conversion flags and original image files remain the same. Sass already emits compressed `assets/css/main.css`; it is now excluded from the second CSSminify2 pass. In the baseline, that pass reduced 618,879 bytes to 618,728 bytes while occupying most of the write phase. Other CSS and HTML retain their existing minification.

`_plugins/responsive_image_cache.rb` stores the existing ImageMagick converter's output under `.jekyll-cache/responsive-v1`. Keys include the original file's SHA-256, output format, width, conversion flags, resize flags and ImageMagick version. The generator restores each expected output and registers it with Jekyll's cleaner. Rebuilding after deleting `_site`, or after a checkout changes timestamps, reuses unchanged conversions. Changes to image contents or conversion options regenerate the affected variants.

`bin/asset_cache.rb` stages PNG cache misses for the existing parallel Rust optimizer. Keys include the input bytes and the optimizer executable's SHA-256. Both original and already optimized inputs can reuse their result. Failed conversions/optimizer runs do not populate successful cache entries. Cache writes use temporary files followed by rename; symlinked PNGs are skipped. Original source images are never modified.

The Docker hook and Actions use this same PNG cache. Actions restores `.jekyll-cache` across runs and saves a new snapshot after success; it does not restore `_site`. Jekyll still renders all pages, preserving collection/listing updates and deletions. `--profile` now records rendering costs in deployment logs. The first build populates the cache; deleting `.jekyll-cache` safely forces regeneration.

Validation: `bundle exec ruby utils/validate_asset_cache.rb` checks real ImageMagick output against an uncached conversion, rebuilding with a clean destination and changed timestamps, content/settings invalidation, PNG optimizer invalidation, symlink handling, output permissions and failed-conversion recovery. The PNG integration test substitutes a deterministic CLI; the existing Rust pixel-preservation tests remain in the deployment workflow.

Local production benchmarks on 2026-11-09 used isolated copies and the same existing `pnubaelab-site:local` Docker image, `JEKYLL_ENV=production`, `jekyll build --profile` and the same Rust executable. Times include the post-write PNG optimizer; dependency installation, Rust compilation, PurgeCSS and remote cache transfer are excluded.

| Build                                                           |    Total | Generation | Rendering | Writing, including PNG optimization |
| --------------------------------------------------------------- | -------: | ---------: | --------: | ----------------------------------: |
| Before, empty output/cache                                      | 465.725s |   211.472s |   23.068s |                            230.943s |
| After, empty output/cache                                       | 274.062s |   223.016s |   22.487s |                             28.353s |
| After, cached assets, empty output and changed image timestamps |  37.400s |     3.656s |   22.385s |                             11.140s |

The cold build took about 41% less time; the cached build took about 92% less time than the uncached baseline. The cached run reused all 786 responsive images and all 34 PNGs without running conversion/optimization again. These are local measurements, not GitHub Actions duration guarantees. A cache miss still performs the existing image transformations.

All 786 WebP and 34 optimized PNG outputs matched the baseline byte for byte. All 401 HTML routes remained. The main stylesheet retained 14,398 top-level rules, selectors and declaration ordering with no stylesheet parse errors; the existing graph CSS validation passed. Its bytes differ because it now uses Sass output directly instead of CSSminify2's additional value/whitespace normalizations. All 262 original image assets remained byte-identical. The four cache tests passed 30 assertions.

## Responsive gallery previews (2026-11-09)

The ImageMagick generator now exposes only variants actually produced during the build as `photo_sources`. Width descriptors reflect the smaller of the requested width and original oriented width, so small images are never advertised as upscaled; repeated widths are removed. Missing dimensions, external originals, disabled conversion and unsupported formats retain their original image source. This reuses the same cached WebP files without additional image transformations.

Photo cards use WebP `srcset` with `sizes="auto, (max-width: 768px) 100vw, 620px"`. Supporting browsers use the card's actual width, including randomly widened cards, while older browsers get conservative fallback sizes. `data-zoom-src` points to the original for the existing medium-zoom library. Lazy loading, aspect ratio reservation, masonry, animations, Markdown and original assets remain in place.

Validation: all 167 generated gallery images have responsive sources. The five cache/gallery tests passed 57 assertions, including real variant dimensions, duplicate-width removal, original zoom URLs and disabled/external fallbacks. The production build reused all 786 WebP and 34 PNG cache entries and completed in 38.018 seconds locally. Chromium checks at desktop 1280×900 (DPR 1) and mobile 390×844 (DPR 2) confirmed that no gallery original was requested before zoom, previews loaded as WebP, clicking loaded the original and no JavaScript exceptions occurred. For `2026Informs.jpg`, desktop selected the 20,402-byte 480px preview and mobile selected the 49,042-byte 800px preview, compared with the 1,867,680-byte original. These are file-size comparisons, not network-speed benchmarks.

## First-screen loading and deferred planning (2026-11-09)

Only the first three rendered gallery photos use `loading="eager"`; only the first uses `fetchpriority="high"`. The remaining 164 photos keep native lazy loading. Eager images use explicit responsive size hints because `sizes="auto"` requires lazy loading; after placement and resize, their measured display width updates the hint, including wide cards. The original zoom source is unchanged.

Distant year sections remain in normal CSS grid flow with intrinsic image dimensions reserving their height. They install completion listeners but perform no card-height measurement or packing search. The first nearby section is scheduled immediately; IntersectionObserver activates other sections within 600px of the viewport. Without IntersectionObserver all sections are planned in a batched fallback. Existing geometry caching prevents repeated search when image loading does not change dimensions.

Unit checks verify zero initial measurements in distant sections, first-screen scheduling before the first observer callback, deferred reveal/resize, eager responsive size updates and no-observer behavior. The five Ruby cache/template tests passed 81 assertions, including the exact eager/high-priority rules. Chromium desktop/mobile checks observed only 1 of 5 year sections initially planned, confirmed that the other sections retained positive height with no explicit placements, and activated all years during scrolling. These structural improvements have not been measured as an end-to-end network speedup.

## Compact gallery layout (2026-11-09)

Year sections remain newest first. Within a year, visual density now takes priority over date order; the six-photo boundary and `photo_batch_size` setting have been removed. The DOM retains its chronological sequence, captions retain dates, and a one-column mobile viewport stays strictly chronological. The first three priority photos remain leading placements for first-screen loading.

The planner tracks occupied vertical intervals in each column, allowing later photos to fill holes below wide cards instead of treating each column as a solid skyline. It evaluates chronological, height/area, wide-first and six deterministic shuffled orders, then tries at most 24 local order refinements. It selects lower total height first, less enclosed empty space second, and smaller date displacement as a tie-breaker. The chronological candidate remains available as a baseline. Candidate search uses measured geometry without DOM reads or writes, and results are cached by viewport/card geometry. This is bounded heuristic search, not a guarantee of a global optimum.

Validation covers a known wide-card gap case, no overlap, chronological DOM despite reverse image completion, responsive geometry, exact single-column date order, first-priority placement, deferred sections and observer fallback. Chromium at desktop 1280×900 (DPR 1) and mobile 390×844 (DPR 2) scrolled all years, verified nonoverlap and no horizontal overflow after resizing, confirmed no gallery-original request before zoom, and decoded the zoomed original at 4000×1848 pixels without JavaScript exceptions.

A desktop comparison used the same 167 photos and a fixed random seed for identical wide-card selection. Empty layout cells, including ragged trailing edges but excluding normal CSS gutters, decreased from 667 to 91 (86.4%). Total occupied area was identical at 11,012 cells. Overall grid fill increased from 94.3% to 99.2%; the 69-photo year improved from 92.5% to 99.4%. These are layout measurements, not loading-speed measurements; results vary with viewport and wide-card selection. Existing responsive image variants and source assets are unchanged.
