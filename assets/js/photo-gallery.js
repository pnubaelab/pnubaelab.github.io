(function () {
  var randomWideItemRatio = 0.05;
  var widePlacementPassCount = 3;
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
    var columnCount = parseInt(computedStyle.getPropertyValue("--photo-column-count"), 10);
    var columnGap = parseFloat(computedStyle.getPropertyValue("column-gap")) || 0;
    var rowGap = parseFloat(computedStyle.getPropertyValue("row-gap")) || 0;
    var wideItems = Array.prototype.slice.call(grid.querySelectorAll(".grid-item.grid-item--wide"));

    wideItems.forEach(function (item) {
      if (!item.classList.contains("is-photo-loaded") && !item.classList.contains("is-photo-error")) {
        item.style.removeProperty("grid-column");
      }
    });

    if (!columnCount || columnCount < 3 || grid.clientWidth <= 0) {
      wideItems.forEach(function (item) {
        item.style.removeProperty("grid-column");
      });
      return;
    }

    var loadedItems = getLoadedItems(grid);
    var loadedWideItems = wideItems.filter(function (item) {
      return item.classList.contains("is-photo-loaded") || item.classList.contains("is-photo-error");
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
            wideItem.style.removeProperty("grid-column");
          } else {
            wideItem.style.gridColumn = columnStart + " / span 2";
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
            wideItem.style.removeProperty("grid-column");
          } else {
            wideItem.style.gridColumn = bestPlacement.columnStart + " / span 2";
          }
        }
      });
    }
  }

  function applyMasonry(grid) {
    var computedStyle = window.getComputedStyle(grid);
    var columnCount = parseInt(computedStyle.getPropertyValue("--photo-column-count"), 10);
    var rowHeight = parseFloat(computedStyle.getPropertyValue("grid-auto-rows"));
    var rowGap = parseFloat(computedStyle.getPropertyValue("row-gap"));

    if (!rowHeight || rowHeight <= 0) return;

    if (columnCount < 3) {
      grid.querySelectorAll(".grid-item.grid-item--wide").forEach(function (item) {
        item.style.removeProperty("grid-column");
      });
    }

    var measurements = Array.prototype.slice.call(grid.querySelectorAll(".grid-item")).map(function (item) {
      var content = item.querySelector(".card") || item;
      var contentHeight = content.offsetHeight;
      var rowSpan = Math.ceil((contentHeight + rowGap) / (rowHeight + rowGap));

      return {
        item: item,
        rowSpan: rowSpan,
      };
    });

    measurements.forEach(function (measurement) {
      measurement.item.style.setProperty("--masonry-row-span", measurement.rowSpan);
    });

    optimizeWidePlacements(grid, computedStyle);
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
      document.querySelectorAll(".photo-masonry .grid-item.grid-item--wide").forEach(function (item) {
        item.style.removeProperty("grid-column");
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
          // Retain completion ordering within each year without a layout per load.
          grid.appendChild(item);
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
