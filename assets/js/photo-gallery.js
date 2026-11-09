(function () {
  var randomWideItemRatio = 0.05;
  var gallery = document.querySelector(".photo-gallery");
  var placementBatchSize = Math.max(1, Math.min(8, parseInt(gallery && gallery.dataset.photoBatchSize, 10) || 6));
  var placementBeamWidth = 64;
  var scheduledGrids = [];
  var pendingPlacements = new Map();
  var enteringCandidates = [];
  var activeGrids = new Set();
  var dirtyGrids = new Set();
  var grids = Array.prototype.slice.call(document.querySelectorAll(".photo-masonry"));

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

  function placeCard(state, card, column, floor) {
    var top = floor;
    for (var offset = 0; offset < card.columns; offset += 1) {
      top = Math.max(top, state.heights[column + offset]);
    }
    var heights = state.heights.slice();
    var gaps = state.gaps;
    for (var offset = 0; offset < card.columns; offset += 1) {
      gaps += top - heights[column + offset];
      heights[column + offset] = top + card.rows;
    }
    return {
      heights: heights,
      gaps: gaps,
      remaining: state.remaining.filter(function (candidate) {
        return candidate !== card;
      }),
      placements: state.placements.concat([{ card: card, column: column, top: top }]),
      chronologyCost: state.chronologyCost + Math.abs(card.localIndex - state.placements.length),
    };
  }

  function comparePlacements(first, second) {
    return (
      Math.max.apply(null, first.heights) - Math.max.apply(null, second.heights) ||
      first.gaps - second.gaps ||
      first.chronologyCost - second.chronologyCost
    );
  }

  function searchBatch(cards, heights, floor) {
    var initial = { heights: heights, gaps: 0, remaining: cards, placements: [], chronologyCost: 0 };
    // Keep a chronological greedy baseline so search can never make its score worse.
    var baseline = initial;
    cards.forEach(function (card) {
      var candidates = [];
      for (var column = 0; column <= heights.length - card.columns; column += 1) {
        candidates.push(placeCard(baseline, card, column, floor));
      }
      candidates.sort(comparePlacements);
      baseline = candidates[0];
    });
    if (heights.length === 1 || cards.length === 1) return baseline;

    var beam = [initial];
    for (var depth = 0; depth < cards.length; depth += 1) {
      var candidates = [];
      beam.forEach(function (state) {
        state.remaining.forEach(function (card) {
          for (var column = 0; column <= heights.length - card.columns; column += 1) {
            candidates.push(placeCard(state, card, column, floor));
          }
        });
      });
      // Estimate the best possible final height, including cards still unplaced.
      candidates.forEach(function (candidate) {
        var area = candidate.heights.reduce(function (sum, height) {
          return sum + height;
        }, 0);
        area += candidate.remaining.reduce(function (sum, card) {
          return sum + card.rows * card.columns;
        }, 0);
        candidate.bound = Math.max(Math.max.apply(null, candidate.heights), area / heights.length);
      });
      candidates.sort(function (first, second) {
        return first.bound - second.bound || first.gaps - second.gaps || first.chronologyCost - second.chronologyCost;
      });
      var seen = new Set();
      beam = candidates
        .filter(function (candidate) {
          var key =
            candidate.remaining
              .map(function (card) {
                return card.localIndex;
              })
              .join(",") +
            ":" +
            candidate.heights.join(",");
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .slice(0, placementBeamWidth);
    }
    beam.push(baseline);
    beam.sort(comparePlacements);
    return beam[0];
  }

  function applyMasonry(grid) {
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
    var cards = items.map(function (item) {
      var content = item.querySelector(".card") || item;
      return {
        item: item,
        columns: columnCount > 1 && item.classList.contains("grid-item--wide") ? 2 : 1,
        rows: Math.max(1, Math.ceil((content.offsetHeight + rowGap) / (rowHeight + rowGap))),
      };
    });
    var key =
      [columnCount, rowHeight, rowGap, grid.clientWidth, placementBatchSize].join(":") +
      ":" +
      cards
        .map(function (card) {
          return card.rows + "x" + card.columns;
        })
        .join(",");
    var cached = layoutCache.get(grid);
    var placements = cached && cached.key === key ? cached.placements : null;
    if (!placements) {
      var heights = Array(columnCount).fill(0);
      var floor = 0;
      placements = [];
      for (var start = 0; start < cards.length; start += placementBatchSize) {
        var batch = cards.slice(start, start + placementBatchSize);
        batch.forEach(function (card, index) {
          card.localIndex = index;
        });
        var result = searchBatch(batch, heights, floor);
        heights = result.heights;
        placements = placements.concat(result.placements);
        // Later date batches may use the skyline, but must start below every
        // preceding batch's card top. They cannot backfill above newer photos.
        floor =
          Math.max.apply(
            null,
            result.placements.map(function (placement) {
              return placement.top;
            })
          ) + 1;
      }
      layoutCache.set(grid, { key: key, placements: placements });
    }
    placements.forEach(function (placement) {
      var item = placement.card.item;
      item.style.setProperty("--masonry-row-span", placement.card.rows);
      item.style.gridRowStart = placement.top + 1;
      item.style.gridColumn = placement.column + 1 + " / span " + placement.card.columns;
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
    grid.classList.add("is-masonry");

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
    });

    applyMasonry(grid);
  }

  assignRandomWideItems();

  grids.forEach(function (grid) {
    // One initial sizing pass reserves the original aspect ratios for lazy images.
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
