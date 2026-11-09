(function () {
<<<<<<< HEAD
    var randomWideItemRatio = 0.05;
    var scheduledGrids = [];
    var pendingPlacements = new Map();
    var enteringCandidates = [];
    var activeGrids = new Set();
    var dirtyGrids = new Set();
    var grids = Array.prototype.slice.call(document.querySelectorAll('.photo-masonry'));
=======
  var randomWideItemRatio = 0.05;
  var scheduledGrids = [];
  var pendingPlacements = new Map();
  var enteringCandidates = [];
  var activeGrids = new Set();
  var dirtyGrids = new Set();
  var grids = Array.prototype.slice.call(document.querySelectorAll(".photo-masonry"));
>>>>>>> refs/remotes/origin/main

  function isNearViewport(item, margin) {
    var rect = item.getBoundingClientRect();
    return rect.bottom >= -margin && rect.top <= window.innerHeight + margin;
  }
  var layoutFrame = null;
  var pendingLayoutRects = new WeakMap();
  var layoutCache = new WeakMap();
  var activeLayoutAnimations = new WeakMap();
  var reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var layoutAnimationDuration = 520;

  function getLoadedItems(grid) {
    return Array.prototype.slice.call(grid.querySelectorAll(".grid-item.is-photo-loaded, .grid-item.is-photo-error"));
  }

  function captureLayoutPositions(grid) {
    if (pendingLayoutRects.has(grid) || reducedMotionQuery.matches) return;

    var positions = getLoadedItems(grid)
      .filter(function (item) {
        return isNearViewport(item, 0);
      })
      .map(function (item) {
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

      if (!item.isConnected || !grid.contains(item) || !isNearViewport(item, 0) || typeof item.animate !== "function") return;

      var rect = item.getBoundingClientRect();
      var deltaX = position.left - (rect.left + window.scrollX);
      var deltaY = position.top - (rect.top + window.scrollY);

      if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) return;

      var animation = item.animate([{ translate: deltaX + "px " + deltaY + "px" }, { translate: "0px 0px" }], {
        duration: layoutAnimationDuration,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      });

      activeLayoutAnimations.set(item, animation);

      function clearFinishedAnimation() {
        if (activeLayoutAnimations.get(item) === animation) {
          activeLayoutAnimations.delete(item);
        }
<<<<<<< HEAD
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

    function assignWidePlacements(grid, columnCount) {
      // Use date order, including pending images, so loading cannot flip sides.
      grid.querySelectorAll('.grid-item.grid-item--wide').forEach(function (item, index) {
        if (columnCount >= 3) {
          var columnStart = index % 2 === 0 ? 1 : columnCount - 1;
          item.style.gridColumn = columnStart + ' / span 2';
        } else {
          item.style.removeProperty('grid-column');
        }
      });
    }

    function applyMasonry(grid) {
      var computedStyle = window.getComputedStyle(grid);
      var columnCount = parseInt(computedStyle.getPropertyValue('--photo-column-count'), 10);
      var rowHeight = parseFloat(computedStyle.getPropertyValue('grid-auto-rows'));
      var rowGap = parseFloat(computedStyle.getPropertyValue('row-gap'));

      if (!rowHeight || rowHeight <= 0) return;

      // Set widths before measuring card heights at this breakpoint.
      assignWidePlacements(grid, columnCount);

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
    }

    function scheduleMasonry(grid) {
      dirtyGrids.add(grid);
      if (!activeGrids.has(grid)) return;
      if (scheduledGrids.indexOf(grid) === -1) scheduledGrids.push(grid);
      if (layoutFrame !== null) return;

      layoutFrame = window.requestAnimationFrame(function () {
        var batch = scheduledGrids.slice();
        scheduledGrids = [];
        layoutFrame = null;

        enteringCandidates = [];
        // Capture each visible grid once before any image-completion writes.
        batch.forEach(captureLayoutPositions);
        batch.forEach(function (grid) {
          var placements = pendingPlacements.get(grid) || [];
          pendingPlacements.delete(grid);
          placements.forEach(function (placement) { placement(); });
          applyMasonry(grid);
          animateLayoutPositions(grid);
          dirtyGrids.delete(grid);
        });
        // Read visibility after the final placement, then start only onscreen effects.
        var entering = reducedMotionQuery.matches ? [] : enteringCandidates.filter(function (item) {
          return isNearViewport(item, 0);
        });
        entering.forEach(function (item) {
          item.classList.add('is-photo-entering');
          item.addEventListener('animationend', function () {
            item.classList.remove('is-photo-entering');
          }, { once: true });
        });
      });
    }

    function layoutAllMasonry() {
      // Clear stale desktop column constraints even in deferred sections so they
      // cannot widen the document when switching to a narrow viewport.
      if (window.matchMedia('(max-width: 768px)').matches) {
        document.querySelectorAll('.photo-masonry .grid-item.grid-item--wide').forEach(function (item) {
          item.style.removeProperty('grid-column');
        });
      }
      grids.forEach(scheduleMasonry);
    }

    var resizeTimer;
    function onResize() {
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

          isPlaced = true;

          if (img) {
            img.removeEventListener('load', revealLoadedPhoto);
            img.removeEventListener('error', revealErroredPhoto);
          }

          var placements = pendingPlacements.get(grid) || [];
          placements.push(function () {
            // Reveal in place: the template already supplies newest-first order.
            item.removeAttribute('aria-hidden');
            item.classList.add(stateClass);
            if (stateClass === 'is-photo-loaded') enteringCandidates.push(item);
          });
          pendingPlacements.set(grid, placements);
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

    grids.forEach(function (grid) {
      // One initial sizing pass reserves the original aspect ratios for lazy images.
      initializePhotoGrid(grid);
=======
      }

      animation.addEventListener("finish", clearFinishedAnimation, { once: true });
      animation.addEventListener("cancel", clearFinishedAnimation, { once: true });
    });
  }

  function stopLayoutAnimations() {
    document.querySelectorAll(".photo-masonry .grid-item").forEach(function (item) {
      var activeAnimation = activeLayoutAnimations.get(item);
      item.classList.remove("is-photo-entering");

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

  if (typeof reducedMotionQuery.addEventListener === "function") {
    reducedMotionQuery.addEventListener("change", handleReducedMotionChange);
  } else {
    reducedMotionQuery.addListener(handleReducedMotionChange);
  }

  function findOpenPlacement(card, occupied) {
    var best = null;
    for (var column = 0; column <= occupied.length - card.columns; column += 1) {
      var intervals = [];
      for (var offset = 0; offset < card.columns; offset += 1) {
        intervals = intervals.concat(occupied[column + offset]);
      }
      intervals.sort(function (first, second) {
        return first.top - second.top;
      });
      var top = 0;
      var limit = Infinity;
      for (var index = 0; index < intervals.length; index += 1) {
        var interval = intervals[index];
        if (interval.top >= top + card.rows) {
          limit = interval.top;
          break;
        }
        top = Math.max(top, interval.bottom);
      }
      var waste = limit - top - card.rows;
      if (!best || top < best.top || (top === best.top && waste < best.waste)) {
        best = { card: card, column: column, top: top, waste: waste };
      }
    }
    return best;
  }

  function packOrder(order, columnCount) {
    var occupied = Array.from({ length: columnCount }, function () {
      return [];
    });
    var placements = order.map(function (card) {
      var placement = findOpenPlacement(card, occupied);
      for (var offset = 0; offset < card.columns; offset += 1) {
        occupied[placement.column + offset].push({ top: placement.top, bottom: placement.top + card.rows });
      }
      return placement;
    });
    var height = 0;
    var gaps = 0;
    occupied.forEach(function (intervals) {
      intervals.sort(function (first, second) {
        return first.top - second.top;
      });
      var bottom = 0;
      intervals.forEach(function (interval) {
        gaps += interval.top - bottom;
        bottom = interval.bottom;
      });
      height = Math.max(height, bottom);
    });
    var chronologyCost = placements
      .slice()
      .sort(function (first, second) {
        return first.top - second.top || first.column - second.column;
      })
      .reduce(function (cost, placement, index) {
        return cost + Math.abs(placement.card.index - index);
      }, 0);
    return { placements: placements, height: height, gaps: gaps, chronologyCost: chronologyCost, order: order };
  }

  function comparePlans(first, second) {
    return first.height - second.height || first.gaps - second.gaps || first.chronologyCost - second.chronologyCost;
  }

  function compactPlan(cards, columnCount) {
    // A single column already has no packing gaps; keep exact date order there.
    var best = packOrder(cards, columnCount);
    var priority = cards.filter(function (card) {
      return card.priority;
    });
    var movable = cards.filter(function (card) {
      return !card.priority;
    });
    if (columnCount === 1 || movable.length < 2) return best.placements;
    var lowerBound = Math.max.apply(
      null,
      cards.map(function (card) {
        return card.rows;
      })
    );
    lowerBound = Math.max(
      lowerBound,
      Math.ceil(
        cards.reduce(function (area, card) {
          return area + card.rows * card.columns;
        }, 0) / columnCount
      )
    );
    var orders = [
      movable.slice().sort(function (a, b) {
        return b.rows - a.rows || a.index - b.index;
      }),
      movable.slice().sort(function (a, b) {
        return b.rows * b.columns - a.rows * a.columns || a.index - b.index;
      }),
      movable.slice().sort(function (a, b) {
        return b.columns - a.columns || b.rows - a.rows || a.index - b.index;
      }),
      movable.slice().sort(function (a, b) {
        return b.columns - a.columns || a.rows - b.rows || a.index - b.index;
      }),
      movable.slice().reverse(),
    ];
    // Stable shuffled candidates broaden the search without shuffling DOM dates.
    for (var seed = 1; seed <= 6; seed += 1) {
      var shuffled = movable.slice();
      var random = seed * 2654435761;
      for (var index = shuffled.length - 1; index > 0; index -= 1) {
        random ^= random << 13;
        random ^= random >>> 17;
        random ^= random << 5;
        var swap = (random >>> 0) % (index + 1);
        var card = shuffled[index];
        shuffled[index] = shuffled[swap];
        shuffled[swap] = card;
      }
      orders.push(shuffled);
    }
    orders.forEach(function (order) {
      var plan = packOrder(priority.concat(order), columnCount);
      if (comparePlans(plan, best) < 0) best = plan;
    });
    // Bound local refinement so a dense year cannot monopolize the main thread.
    for (var attempt = 0; attempt < Math.min(24, movable.length * 2) && best.height > lowerBound; attempt += 1) {
      var order = best.order.slice();
      var offset = attempt % (movable.length - 1);
      var first = priority.length + offset;
      var second = attempt < movable.length - 1 ? first + 1 : order.length - 1 - offset;
      var card = order[first];
      order[first] = order[second];
      order[second] = card;
      var plan = packOrder(order, columnCount);
      if (comparePlans(plan, best) < 0) best = plan;
    }
    return best.placements;
  }

  function applyMasonry(grid) {
    grid.classList.add("is-masonry");
    var computedStyle = window.getComputedStyle(grid);
    var columnCount = parseInt(computedStyle.getPropertyValue("--photo-column-count"), 10);
    var rowHeight = parseFloat(computedStyle.getPropertyValue("grid-auto-rows"));
    var rowGap = parseFloat(computedStyle.getPropertyValue("row-gap")) || 0;
    if (!columnCount || !rowHeight || rowHeight <= 0) return;

    // Measure once at each card's final responsive width, never during search.
    var items = Array.prototype.slice.call(grid.querySelectorAll(".grid-item"));
    items.forEach(function (item) {
      item.style.removeProperty("grid-column");
      item.style.removeProperty("grid-row-start");
    });
    var cards = items.map(function (item, index) {
      var content = item.querySelector(".card") || item;
      var img = item.querySelector(".photo-img");
      return {
        item: item,
        index: index,
        priority: img && img.loading === "eager",
        columns: columnCount > 1 && item.classList.contains("grid-item--wide") ? 2 : 1,
        rows: Math.max(1, Math.ceil((content.offsetHeight + rowGap) / (rowHeight + rowGap))),
      };
    });
    var key =
      [columnCount, rowHeight, rowGap, grid.clientWidth].join(":") +
      ":" +
      cards
        .map(function (card) {
          return card.rows + "x" + card.columns + (card.priority ? "p" : "");
        })
        .join(",");
    var cached = layoutCache.get(grid);
    var placements = cached && cached.key === key ? cached.placements : null;
    if (!placements) {
      placements = compactPlan(cards, columnCount);
      layoutCache.set(grid, { key: key, placements: placements });
    }
    placements.forEach(function (placement) {
      var item = placement.card.item;
      item.style.setProperty("--masonry-row-span", placement.card.rows);
      item.style.gridRowStart = placement.top + 1;
      item.style.gridColumn = placement.column + 1 + " / span " + placement.card.columns;
    });
    // Eager images cannot use sizes=auto. Once layout is known, account for
    // their exact width, including wide cards and responsive column changes.
    grid.querySelectorAll('.photo-img[loading="eager"][srcset]').forEach(function (img) {
      if (img.clientWidth > 0) img.sizes = Math.ceil(img.clientWidth) + "px";
    });
  }

  function scheduleMasonry(grid) {
    dirtyGrids.add(grid);
    if (!activeGrids.has(grid)) return;
    if (scheduledGrids.indexOf(grid) === -1) scheduledGrids.push(grid);
    if (layoutFrame !== null) return;

    layoutFrame = window.requestAnimationFrame(function () {
      var batch = scheduledGrids.slice();
      scheduledGrids = [];
      layoutFrame = null;

      enteringCandidates = [];
      // Capture each visible grid once before any image-completion writes.
      batch.forEach(captureLayoutPositions);
      batch.forEach(function (grid) {
        var placements = pendingPlacements.get(grid) || [];
        pendingPlacements.delete(grid);
        placements.forEach(function (placement) {
          placement();
        });
        applyMasonry(grid);
        animateLayoutPositions(grid);
        dirtyGrids.delete(grid);
      });
      // Read visibility after the final placement, then start only onscreen effects.
      var entering = reducedMotionQuery.matches
        ? []
        : enteringCandidates.filter(function (item) {
            return isNearViewport(item, 0);
          });
      entering.forEach(function (item) {
        item.classList.add("is-photo-entering");
        item.addEventListener(
          "animationend",
          function () {
            item.classList.remove("is-photo-entering");
          },
          { once: true }
        );
      });
    });
  }

  function layoutAllMasonry() {
    // Clear stale desktop column constraints even in deferred sections so they
    // cannot widen the document when switching to a narrow viewport.
    if (window.matchMedia("(max-width: 768px)").matches) {
      document.querySelectorAll(".photo-masonry .grid-item").forEach(function (item) {
        item.style.removeProperty("grid-column");
        item.style.removeProperty("grid-row-start");
      });
    }
    grids.forEach(scheduleMasonry);
  }

  var resizeTimer;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(layoutAllMasonry, 120);
  }

  function assignRandomWideItems() {
    var items = Array.prototype.slice.call(document.querySelectorAll(".photo-masonry .grid-item"));

    items.forEach(function (item) {
      item.classList.remove("grid-item--wide");
    });

    var candidates = items.filter(function (item) {
      return item.querySelector(".photo-img");
    });

    if (candidates.length === 0) return;

    var fixedWideItems = candidates.filter(function (item) {
      return item.dataset.fixedWide === "true";
    });
    var randomCandidates = candidates.filter(function (item) {
      return item.dataset.fixedWide !== "true";
    });
    var randomWideItemCount = Math.min(randomCandidates.length, Math.round(candidates.length * randomWideItemRatio));

    fixedWideItems.forEach(function (item) {
      item.classList.add("grid-item--wide");
    });

    for (var index = randomCandidates.length - 1; index > 0; index -= 1) {
      var randomIndex = Math.floor(Math.random() * (index + 1));
      var currentItem = randomCandidates[index];
      randomCandidates[index] = randomCandidates[randomIndex];
      randomCandidates[randomIndex] = currentItem;
    }

    randomCandidates.slice(0, randomWideItemCount).forEach(function (item) {
      item.classList.add("grid-item--wide");
    });
  }

  function initializePhotoGrid(grid) {
    grid.querySelectorAll(".grid-item").forEach(function (item) {
      var img = item.querySelector(".photo-img");
      var isPlaced = false;

      item.setAttribute("aria-hidden", "true");

      function finishPlacement(stateClass) {
        if (isPlaced) return;

        isPlaced = true;

        if (img) {
          img.removeEventListener("load", revealLoadedPhoto);
          img.removeEventListener("error", revealErroredPhoto);
        }

        var placements = pendingPlacements.get(grid) || [];
        placements.push(function () {
          // Reveal in place: loading order must never change the date sequence.
          item.removeAttribute("aria-hidden");
          item.classList.add(stateClass);
          if (stateClass === "is-photo-loaded") enteringCandidates.push(item);
        });
        pendingPlacements.set(grid, placements);
        scheduleMasonry(grid);
      }

      function revealLoadedPhoto() {
        finishPlacement("is-photo-loaded");
      }

      function revealErroredPhoto() {
        finishPlacement("is-photo-error");
      }

      if (!img) {
        revealErroredPhoto();
        return;
      }

      img.addEventListener("load", revealLoadedPhoto, { once: true });
      img.addEventListener("error", revealErroredPhoto, { once: true });

      if (img.complete && img.naturalWidth > 0) {
        revealLoadedPhoto();
      } else if (img.complete) {
        revealErroredPhoto();
      }
>>>>>>> refs/remotes/origin/main
    });

    // Leave distant sections in ordinary CSS grid flow. Intrinsic image
    // dimensions reserve their height without measuring cards or searching.
    scheduleMasonry(grid);
  }

  assignRandomWideItems();

  grids.forEach(function (grid) {
    initializePhotoGrid(grid);
  });

  if (typeof IntersectionObserver === "function") {
    var gridObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            activeGrids.add(entry.target);
            if (dirtyGrids.has(entry.target)) scheduleMasonry(entry.target);
          } else {
            activeGrids.delete(entry.target);
            getLoadedItems(entry.target).forEach(function (item) {
              var animation = activeLayoutAnimations.get(item);
              if (animation) animation.cancel();
              activeLayoutAnimations.delete(item);
              item.classList.remove("is-photo-entering");
            });
          }
        });
      },
      { rootMargin: "600px 0px" }
    );
    grids.forEach(function (grid) {
      gridObserver.observe(grid);
      // Start the first screen without waiting for the observer's first callback.
      if (isNearViewport(grid, 600)) {
        activeGrids.add(grid);
        scheduleMasonry(grid);
      }
    });
  } else {
    grids.forEach(function (grid) {
      activeGrids.add(grid);
      scheduleMasonry(grid);
    });
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stopLayoutAnimations();
    else activeGrids.forEach(scheduleMasonry);
  });

  window.addEventListener("resize", onResize);
  window.addEventListener("load", layoutAllMasonry);
})();
