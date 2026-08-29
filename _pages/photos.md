---
layout: page
title: 📸Photos
permalink: /photos/
description: 
nav: true
display_categories: [2026,2025,2024,2023,2022,2021,2020]
---

<style>
.parisienne-regular {
  font-family: "Parisienne", cursive;
  font-weight: 400;
  font-style: normal;
}

.photo-gallery {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 5px;
}

.photo-masonry {
  --photo-column-count: 3;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-auto-flow: dense;
  gap: 4px;
  margin: 20px 0;
  position: relative;
}

.photo-masonry.is-masonry {
  grid-auto-rows: 2px;
}

.photo-masonry .grid-item {
  order: 1;
  width: 100% !important;
  margin-bottom: 0 !important;
  opacity: 0;
  transform: translateY(14px) scale(0.96);
  will-change: opacity, transform;
  pointer-events: none;
}

.photo-masonry.is-masonry .grid-item {
  grid-row-end: span var(--masonry-row-span, 1);
}

.photo-masonry .grid-item.is-photo-loaded {
  order: 0;
  animation: photo-pop-in 0.48s cubic-bezier(0.18, 0.89, 0.32, 1.28) both;
  pointer-events: auto;
}

.photo-masonry .grid-item.is-photo-error {
  order: 0;
  opacity: 1;
  transform: none;
  will-change: auto;
  pointer-events: auto;
}

.photo-masonry .grid-item.grid-item--wide {
  grid-column: span 2;
}

.photo-masonry .card {
  width: 100%;
  margin: 0;
  background: transparent;
  border: none;
  box-shadow: none;
  transition: transform 0.2s ease;
}

.photo-masonry .card:hover {
  transform: scale(1.02);
  z-index: 10;
  position: relative;
}

.photo-masonry .photo-img {
  width: 100%;
  height: auto;
  border-radius: 4px;
  display: block;
}

@keyframes photo-pop-in {
  0% {
    opacity: 0;
    transform: translateY(16px) scale(0.92);
  }
  65% {
    opacity: 1;
    transform: translateY(-2px) scale(1.025);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .photo-masonry .grid-item.is-photo-loaded,
  .photo-masonry .grid-item.is-photo-error {
    animation: none;
    opacity: 1;
    transform: none;
    will-change: auto;
  }
}

.photo-masonry .card-body {
  padding: 6px 8px !important;
  max-width: 100% !important;
  margin: 0 !important;
}

.photo-masonry .card-date {
  font-size: 0.85rem;
  margin: 0;
  opacity: 0.8;
}

.category-section {
  margin-bottom: 40px;
}

.category-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 2rem;
  font-weight: 600;
  margin: 30px 0 15px 0;
  color: var(--global-text-color);
}

.category-title::before,
.category-title::after {
  content: "";
  flex: 1 1 auto;
  border-bottom: 2px solid currentColor;
}

.category-title--even::before,
.category-title--odd::after {
  display: none;
}

/* 반응형 컬럼 수 조정 */
@media (max-width: 768px) {
  .photo-masonry {
    --photo-column-count: 2;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .photo-masonry .grid-item.grid-item--wide {
    grid-column: span 2;
  }
  .category-title {
    font-size: 1.6rem;
  }
}

@media (max-width: 480px) {
  .photo-masonry {
    --photo-column-count: 1;
    grid-template-columns: 1fr;
    gap: 3px;
  }
  .photo-masonry .grid-item.grid-item--wide {
    grid-column: span 1;
  }
  .photo-gallery {
    padding: 0 3px;
  }
  .category-title {
    font-size: 1.4rem;
  }
}
</style>

<div class="photo-gallery">
  {% assign sorted_projects = site.photo | sort: 'date' | reverse %}

  {% if page.display_categories %}
    {% for year in page.display_categories %}
      {% assign year_str = year | append: '' %}
      {% assign has_year_projects = false %}
      {% for project in sorted_projects %}
        {% assign project_year = project.date | date: "%Y" %}
        {% if project_year == year_str %}
          {% assign has_year_projects = true %}
          {% break %}
        {% endif %}
      {% endfor %}
      {% if has_year_projects %}
        <div class="category-section">
          {% assign year_mod = year | modulo: 2 %}
          <h2 class="category-title {% if year_mod == 0 %}category-title--even{% else %}category-title--odd{% endif %}">{{ year }}</h2>
          <div class="photo-masonry">
            {% for project in sorted_projects %}
              {% assign project_year = project.date | date: "%Y" %}
              {% if project_year == year_str %}
                {% include photo.html %}
              {% endif %}
            {% endfor %}
          </div>
        </div>
      {% endif %}
    {% endfor %}
  {% else %}
    <div class="photo-masonry">
      {% for project in sorted_projects %}
        {% include photo.html %}
      {% endfor %}
    </div>
  {% endif %}
</div>

<div class="parisienne-regular" style="text-align: center; color: #666;">
La photographie est l’art d’arrêter le temps. <br>
Roland Barthes
</div>

<script>
  (function () {
    var randomWideItemRatio = 0.05;
    var widePlacementPassCount = 3;
    var scheduledGrids = [];
    var layoutFrame = null;
    var pendingLayoutRects = new WeakMap();
    var activeLayoutAnimations = new WeakMap();
    var reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    var layoutAnimationDuration = 520;

    function getLoadedItems(grid) {
      return Array.prototype.slice.call(grid.querySelectorAll('.grid-item.is-photo-loaded, .grid-item.is-photo-error'));
    }

    function captureLayoutPositions(grid) {
      if (pendingLayoutRects.has(grid) || reducedMotionQuery.matches) return;

      var positions = getLoadedItems(grid).map(function (item) {
        var rect = item.getBoundingClientRect();

        return {
          item: item,
          left: rect.left + window.scrollX,
          top: rect.top + window.scrollY,
        };
      });

      if (positions.length === 0) return;

      // Keep the current visual position before replacing an in-progress move
      // with the next layout transition.
      positions.forEach(function (position) {
        var activeAnimation = activeLayoutAnimations.get(position.item);

        if (activeAnimation) {
          activeAnimation.cancel();
          activeLayoutAnimations.delete(position.item);
        }
      });

      pendingLayoutRects.set(grid, positions);
    }

    function animateLayoutPositions(grid) {
      var positions = pendingLayoutRects.get(grid);
      pendingLayoutRects.delete(grid);

      if (!positions || reducedMotionQuery.matches) return;

      positions.forEach(function (position) {
        var item = position.item;

        if (!item.isConnected || !grid.contains(item) || typeof item.animate !== 'function') return;

        var rect = item.getBoundingClientRect();
        var deltaX = position.left - (rect.left + window.scrollX);
        var deltaY = position.top - (rect.top + window.scrollY);

        if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) return;

        var animation = item.animate(
          [
            { translate: deltaX + 'px ' + deltaY + 'px' },
            { translate: '0px 0px' },
          ],
          {
            duration: layoutAnimationDuration,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          }
        );

        activeLayoutAnimations.set(item, animation);

        function clearFinishedAnimation() {
          if (activeLayoutAnimations.get(item) === animation) {
            activeLayoutAnimations.delete(item);
          }
        }

        animation.addEventListener('finish', clearFinishedAnimation, { once: true });
        animation.addEventListener('cancel', clearFinishedAnimation, { once: true });
      });
    }

    function stopLayoutAnimations() {
      document.querySelectorAll('.photo-masonry .grid-item').forEach(function (item) {
        var activeAnimation = activeLayoutAnimations.get(item);

        if (activeAnimation) {
          activeAnimation.cancel();
          activeLayoutAnimations.delete(item);
        }
      });

      pendingLayoutRects = new WeakMap();
    }

    function handleReducedMotionChange(event) {
      if (event.matches) stopLayoutAnimations();
    }

    if (typeof reducedMotionQuery.addEventListener === 'function') {
      reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
    } else {
      reducedMotionQuery.addListener(handleReducedMotionChange);
    }

    function measureLoadedBottom(items) {
      return items.reduce(function (bottom, item) {
        return Math.max(bottom, item.offsetTop + item.offsetHeight);
      }, 0);
    }

    function getRenderedColumnStart(grid, item, columnCount, columnGap) {
      var columnWidth = (grid.clientWidth - columnGap * (columnCount - 1)) / columnCount;
      var columnStep = columnWidth + columnGap;
      return Math.max(1, Math.min(columnCount - 1, Math.round(item.offsetLeft / columnStep) + 1));
    }

    function measureWideTopGap(grid, wideItem, loadedItems, columnCount, columnGap, rowGap, columnStart) {
      var columnWidth = (grid.clientWidth - columnGap * (columnCount - 1)) / columnCount;
      var wideTop = wideItem.offsetTop;
      var totalGap = 0;

      for (var offset = 0; offset < 2; offset += 1) {
        var columnIndex = columnStart - 1 + offset;
        var columnCenter = columnIndex * (columnWidth + columnGap) + columnWidth / 2;
        var supportBottom = 0;

        loadedItems.forEach(function (item) {
          if (item === wideItem) return;

          var itemBottom = item.offsetTop + item.offsetHeight;
          var coversColumn = item.offsetLeft <= columnCenter && item.offsetLeft + item.offsetWidth >= columnCenter;

          if (coversColumn && itemBottom <= wideTop) {
            supportBottom = Math.max(supportBottom, itemBottom);
          }
        });

        totalGap += Math.max(0, wideTop - supportBottom - rowGap);
      }

      return totalGap;
    }

    function measureTotalWideTopGap(grid, wideItems, loadedItems, columnCount, columnGap, rowGap) {
      return wideItems.reduce(function (totalGap, wideItem) {
        var columnStart = getRenderedColumnStart(grid, wideItem, columnCount, columnGap);
        return totalGap + measureWideTopGap(grid, wideItem, loadedItems, columnCount, columnGap, rowGap, columnStart);
      }, 0);
    }

    function optimizeWidePlacements(grid, computedStyle) {
      var columnCount = parseInt(computedStyle.getPropertyValue('--photo-column-count'), 10);
      var columnGap = parseFloat(computedStyle.getPropertyValue('column-gap')) || 0;
      var rowGap = parseFloat(computedStyle.getPropertyValue('row-gap')) || 0;
      var wideItems = Array.prototype.slice.call(grid.querySelectorAll('.grid-item.grid-item--wide'));

      wideItems.forEach(function (item) {
        if (!item.classList.contains('is-photo-loaded') && !item.classList.contains('is-photo-error')) {
          item.style.removeProperty('grid-column');
        }
      });

      if (!columnCount || columnCount < 3 || grid.clientWidth <= 0) {
        wideItems.forEach(function (item) {
          item.style.removeProperty('grid-column');
        });
        return;
      }

      var loadedItems = getLoadedItems(grid);
      var loadedWideItems = wideItems.filter(function (item) {
        return item.classList.contains('is-photo-loaded') || item.classList.contains('is-photo-error');
      });

      // Re-evaluate both adjacent column pairs. A few light coordinate-descent
      // passes let neighboring wide cards settle without changing DOM order.
      for (var pass = 0; pass < widePlacementPassCount; pass += 1) {
        loadedWideItems.forEach(function (wideItem) {
          var bestPlacement = null;
          var candidateStarts = [null];

          for (var start = 1; start < columnCount; start += 1) {
            candidateStarts.push(start);
          }

          candidateStarts.forEach(function (columnStart) {
            if (columnStart === null) {
              wideItem.style.removeProperty('grid-column');
            } else {
              wideItem.style.gridColumn = columnStart + ' / span 2';
            }

            var layoutBottom = measureLoadedBottom(loadedItems);
            var topGap = measureTotalWideTopGap(grid, loadedWideItems, loadedItems, columnCount, columnGap, rowGap);
            var layoutScore = layoutBottom + topGap;

            if (
              !bestPlacement ||
              layoutScore < bestPlacement.layoutScore - 0.5 ||
              (Math.abs(layoutScore - bestPlacement.layoutScore) <= 0.5 && layoutBottom < bestPlacement.layoutBottom - 0.5) ||
              (Math.abs(layoutScore - bestPlacement.layoutScore) <= 0.5 &&
                Math.abs(layoutBottom - bestPlacement.layoutBottom) <= 0.5 &&
                topGap < bestPlacement.topGap)
            ) {
              bestPlacement = {
                columnStart: columnStart,
                layoutBottom: layoutBottom,
                topGap: topGap,
                layoutScore: layoutScore,
              };
            }
          });

          if (bestPlacement) {
            if (bestPlacement.columnStart === null) {
              wideItem.style.removeProperty('grid-column');
            } else {
              wideItem.style.gridColumn = bestPlacement.columnStart + ' / span 2';
            }
          }
        });
      }
    }

    function applyMasonry(grid) {
      var computedStyle = window.getComputedStyle(grid);
      var columnCount = parseInt(computedStyle.getPropertyValue('--photo-column-count'), 10);
      var rowHeight = parseFloat(computedStyle.getPropertyValue('grid-auto-rows'));
      var rowGap = parseFloat(computedStyle.getPropertyValue('row-gap'));

      if (!rowHeight || rowHeight <= 0) return;

      if (columnCount < 3) {
        grid.querySelectorAll('.grid-item.grid-item--wide').forEach(function (item) {
          item.style.removeProperty('grid-column');
        });
      }

      var measurements = Array.prototype.slice.call(grid.querySelectorAll('.grid-item')).map(function (item) {
        var content = item.querySelector('.card') || item;
        var contentHeight = content.offsetHeight;
        var rowSpan = Math.ceil((contentHeight + rowGap) / (rowHeight + rowGap));

        return {
          item: item,
          rowSpan: rowSpan,
        };
      });

      measurements.forEach(function (measurement) {
        measurement.item.style.setProperty('--masonry-row-span', measurement.rowSpan);
      });

      optimizeWidePlacements(grid, computedStyle);
    }

    function scheduleMasonry(grid) {
      if (scheduledGrids.indexOf(grid) === -1) {
        scheduledGrids.push(grid);
      }

      if (layoutFrame !== null) return;

      layoutFrame = window.requestAnimationFrame(function () {
        var grids = scheduledGrids.slice();
        scheduledGrids = [];
        layoutFrame = null;

        grids.forEach(function (grid) {
          applyMasonry(grid);
          animateLayoutPositions(grid);
        });
      });
    }

    function layoutAllMasonry() {
      var grids = document.querySelectorAll('.photo-masonry');
      grids.forEach(function (grid) {
        grid.classList.add('is-masonry');
        applyMasonry(grid);
      });
    }

    var resizeTimer;
    function onResize() {
      if (window.matchMedia('(max-width: 768px)').matches) {
        document.querySelectorAll('.photo-masonry .grid-item.grid-item--wide').forEach(function (item) {
          item.style.removeProperty('grid-column');
        });
      }

      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(layoutAllMasonry, 120);
    }

    function assignRandomWideItems() {
      var items = Array.prototype.slice.call(document.querySelectorAll('.photo-masonry .grid-item'));

      items.forEach(function (item) {
        item.classList.remove('grid-item--wide');
      });

      var candidates = items.filter(function (item) {
        return item.querySelector('.photo-img');
      });

      if (candidates.length === 0) return;

      var fixedWideItems = candidates.filter(function (item) {
        return item.dataset.fixedWide === 'true';
      });
      var randomCandidates = candidates.filter(function (item) {
        return item.dataset.fixedWide !== 'true';
      });
      var randomWideItemCount = Math.min(randomCandidates.length, Math.round(candidates.length * randomWideItemRatio));

      fixedWideItems.forEach(function (item) {
        item.classList.add('grid-item--wide');
      });

      for (var index = randomCandidates.length - 1; index > 0; index -= 1) {
        var randomIndex = Math.floor(Math.random() * (index + 1));
        var currentItem = randomCandidates[index];
        randomCandidates[index] = randomCandidates[randomIndex];
        randomCandidates[randomIndex] = currentItem;
      }

      randomCandidates.slice(0, randomWideItemCount).forEach(function (item) {
        item.classList.add('grid-item--wide');
      });
    }

    function initializePhotoGrid(grid) {
      grid.classList.add('is-masonry');

      grid.querySelectorAll('.grid-item').forEach(function (item) {
        var img = item.querySelector('.photo-img');
        var isPlaced = false;

        item.setAttribute('aria-hidden', 'true');

        function finishPlacement(stateClass) {
          if (isPlaced) return;

          captureLayoutPositions(grid);
          isPlaced = true;

          if (img) {
            img.removeEventListener('load', revealLoadedPhoto);
            img.removeEventListener('error', revealErroredPhoto);
          }

          // Moving the completed card to the end makes the DOM order among
          // completed cards match the actual image completion order.
          grid.appendChild(item);
          item.removeAttribute('aria-hidden');

          if (stateClass === 'is-photo-loaded') {
            item.addEventListener(
              'animationend',
              function () {
                item.style.willChange = 'auto';
              },
              { once: true }
            );
          }

          item.classList.add(stateClass);
          scheduleMasonry(grid);
        }

        function revealLoadedPhoto() {
          finishPlacement('is-photo-loaded');
        }

        function revealErroredPhoto() {
          finishPlacement('is-photo-error');
        }

        if (!img) {
          revealErroredPhoto();
          return;
        }

        img.addEventListener('load', revealLoadedPhoto, { once: true });
        img.addEventListener('error', revealErroredPhoto, { once: true });

        if (img.complete && img.naturalWidth > 0) {
          revealLoadedPhoto();
        } else if (img.complete) {
          revealErroredPhoto();
        }
      });

      applyMasonry(grid);
    }

    assignRandomWideItems();

    document.querySelectorAll('.photo-masonry').forEach(function (grid) {
      initializePhotoGrid(grid);
    });

    window.addEventListener('resize', onResize);
    window.addEventListener('load', layoutAllMasonry);
  })();
</script>
