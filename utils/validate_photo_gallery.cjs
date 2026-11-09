const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const source = fs.readFileSync(path.join(__dirname, "../assets/js/photo-gallery.js"), "utf8");

function fixture({
  intersectionObserver = true,
  heights = [200, 200, 200],
  columns = 3,
  eagerImages = 0,
  fixedWideIndices = [],
  gridCount = 2,
} = {}) {
  const frames = [];
  const timers = new Map();
  const windowEvents = {};
  let nextTimer = 0;
  let observer;
  function classList() {
    const names = new Set();
    return {
      add: (...values) => values.forEach((v) => names.add(v)),
      remove: (...values) => values.forEach((v) => names.delete(v)),
      contains: (v) => names.has(v),
    };
  }
  function eventTarget() {
    const events = {};
    return {
      addEventListener: (name, fn) => {
        (events[name] ||= new Set()).add(fn);
      },
      removeEventListener: (name, fn) => events[name]?.delete(fn),
      dispatch: (name) => [...(events[name] || [])].forEach((fn) => fn()),
    };
  }
  function makeGrid(top) {
    const grid = {
      items: [],
      classList: classList(),
      clientWidth: 900,
      reads: 0,
      getBoundingClientRect: () => ({ top, bottom: top + heights.length * 200, left: 0 }),
    };
    grid.querySelectorAll = (selector) => {
      if (selector.startsWith(".photo-img")) return grid.items.map((item) => item.img).filter((img) => img.loading === "eager" && img.srcset);
      return grid.items.filter((item) => {
        if (selector === ".grid-item") return true;
        if (selector === ".grid-item.grid-item--wide") return item.classList.contains("grid-item--wide");
        return item.classList.contains("is-photo-loaded") || item.classList.contains("is-photo-error");
      });
    };
    grid.contains = (item) => grid.items.includes(item);
    grid.appendChild = (item) => {
      grid.items.splice(grid.items.indexOf(item), 1);
      grid.items.push(item);
    };
    for (let index = 0; index < heights.length; index++) {
      const img = {
        ...eventTarget(),
        complete: false,
        naturalWidth: 1000,
        loading: top === 0 && index < eagerImages ? "eager" : "lazy",
        srcset: "preview.webp 480w",
        get clientWidth() {
          return grid.clientWidth / columns - 20;
        },
      };
      const values = new Map();
      const attrs = new Map();
      const item = {
        ...eventTarget(),
        img,
        index,
        values,
        dataset: { fixedWide: fixedWideIndices.includes(index) ? "true" : undefined },
        classList: classList(),
        isConnected: true,
        style: {
          setProperty: (key, value) => values.set(key, value),
          removeProperty: (key) => values.delete(key),
          get gridColumn() {
            return values.get("grid-column");
          },
          set gridColumn(value) {
            values.set("grid-column", value);
          },
          get gridRowStart() {
            return values.get("grid-row-start");
          },
          set gridRowStart(value) {
            values.set("grid-row-start", value);
          },
        },
        setAttribute: (key, value) => attrs.set(key, value),
        removeAttribute: (key) => attrs.delete(key),
        hasAttribute: (key) => attrs.has(key),
        getBoundingClientRect: () => ({ top, bottom: top + 200, left: 0 }),
        querySelector: (selector) => (selector === ".photo-img" ? img : card),
      };
      const card = {
        get offsetHeight() {
          grid.reads++;
          return heights[index];
        },
      };
      grid.items.push(item);
    }
    return grid;
  }
  const grids = Array.from({ length: gridCount }, (_, index) => makeGrid(index * 5000));
  const document = {
    querySelectorAll: (selector) => (selector === ".photo-masonry" ? grids : grids.flatMap((grid) => grid.items)),
    addEventListener() {},
    hidden: false,
  };
  const window = {
    innerHeight: 800,
    scrollX: 0,
    scrollY: 0,
    matchMedia: () => ({ matches: true, addEventListener() {} }),
    getComputedStyle: () => ({
      getPropertyValue: (key) => ({ "--photo-column-count": String(columns), "column-gap": "4", "row-gap": "4", "grid-auto-rows": "2" })[key],
    }),
    requestAnimationFrame: (fn) => {
      frames.push(fn);
      return frames.length;
    },
    addEventListener: (event, fn) => {
      windowEvents[event] = fn;
    },
  };
  const context = {
    document,
    window,
    Math: Object.assign(Object.create(Math), { random: () => 0.5 }),
    setTimeout: (fn) => {
      const id = ++nextTimer;
      timers.set(id, fn);
      return id;
    },
    clearTimeout: (id) => timers.delete(id),
  };
  if (intersectionObserver) {
    context.IntersectionObserver = class {
      constructor(callback, options) {
        observer = { callback, options, observed: [] };
      }
      observe(grid) {
        observer.observed.push(grid);
      }
    };
  }
  vm.runInNewContext(source, context);
  return {
    setColumns: (value) => {
      columns = value;
    },
    grids,
    frames,
    timers,
    windowEvents,
    observer: () => observer,
    activate: (grid, isIntersecting = true) => observer.callback([{ target: grid, isIntersecting }]),
    flushFrame: () => {
      const batch = frames.splice(0);
      batch.forEach((fn) => fn());
    },
    flushTimers: () => {
      const batch = [...timers.values()];
      timers.clear();
      batch.forEach((fn) => fn());
    },
  };
}

const env = fixture();
const [visible, offscreen] = env.grids;
assert.equal(env.observer().observed.length, 2);
assert.equal(env.observer().options.rootMargin, "600px 0px");
assert.equal(env.frames.length, 1, "first screen must be scheduled before the initial observer callback");
assert.equal(offscreen.reads, 0, "distant sections must not measure any cards during initialization");
assert.equal(offscreen.classList.contains("is-masonry"), false, "deferred sections must retain normal CSS grid height");
env.flushFrame();
assert.ok(visible.classList.contains("is-masonry"));
assert.equal(offscreen.reads, 0, "first-screen planning must not measure distant cards");
const initialReads = offscreen.reads;
const offscreenItem = offscreen.items[0];
offscreenItem.img.dispatch("load");
assert.equal(env.frames.length, 0);
assert.equal(offscreen.reads, initialReads, "offscreen completions must not measure layout");
assert.ok(offscreenItem.hasAttribute("aria-hidden"), "reveal is deferred until activation");
env.activate(offscreen);
assert.equal(env.frames.length, 1);
env.flushFrame();
assert.ok(offscreenItem.classList.contains("is-photo-loaded"));
assert.equal(offscreenItem.hasAttribute("aria-hidden"), false);
assert.ok(offscreen.reads > initialReads);
env.activate(offscreen, false);

env.activate(visible);
const originals = [...visible.items];
originals[2].img.dispatch("load");
originals[0].img.dispatch("error");
originals[1].img.dispatch("load");
assert.equal(env.frames.length, 1, "burst image callbacks must share one animation frame");
const beforeBurstReads = visible.reads;
env.flushFrame();
assert.equal(visible.reads - beforeBurstReads, 3, "burst must measure each card once");
assert.deepEqual(
  visible.items.map((item) => item.index),
  [0, 1, 2],
  "retain chronological DOM order despite out-of-order image completions"
);
assert.ok(originals[0].classList.contains("is-photo-error"));
assert.ok(originals[1].classList.contains("is-photo-loaded"));
originals[0].img.dispatch("load");
assert.equal(env.frames.length, 0, "load after error must not place an item twice");

env.windowEvents.resize();
env.windowEvents.resize();
assert.equal(env.timers.size, 1, "resize bursts must debounce");
assert.equal(env.frames.length, 0);
env.flushTimers();
assert.equal(env.frames.length, 1, "resize must schedule a frame for active grids");
const inactiveReads = offscreen.reads;
env.flushFrame();
assert.equal(offscreen.reads, inactiveReads, "resize must defer inactive grids");
assert.ok(
  offscreen.items.every((item) => !item.style.gridColumn && !item.style.gridRowStart),
  "inactive grids must not retain stale desktop rows or columns"
);
env.activate(offscreen);
assert.equal(env.frames.length, 1, "reactivation must flush a deferred resize");
env.flushFrame();

const fallback = fixture({ intersectionObserver: false });
assert.equal(fallback.frames.length, 1, "no-observer fallback must initialize all grids in one frame");
fallback.flushFrame();
const distantItem = fallback.grids[1].items[0];
distantItem.img.dispatch("load");
assert.equal(fallback.frames.length, 1, "fallback must continue revealing offscreen images");
fallback.flushFrame();
assert.ok(distantItem.classList.contains("is-photo-loaded"));
function placements(grid) {
  return grid.items.map((item) => {
    const [column, span] = item.style.gridColumn.split(" / span ").map(Number);
    return {
      index: item.index,
      row: Number(item.style.gridRowStart) - 1,
      column: column - 1,
      columns: span,
      rows: Number(item.values.get("--masonry-row-span")),
    };
  });
}
function validateLayout(grid, columns) {
  const plan = placements(grid);
  const occupied = new Set();
  plan.forEach((card) => {
    assert.ok(card.column >= 0 && card.column + card.columns <= columns, "placement stays within columns");
    for (let row = card.row; row < card.row + card.rows; row++) {
      for (let column = card.column; column < card.column + card.columns; column++) {
        const key = `${row}:${column}`;
        assert.ok(!occupied.has(key), "cards must not overlap");
        occupied.add(key);
      }
    }
  });
  return plan;
}

const packing = fixture({ intersectionObserver: false, heights: [120, 350, 80, 280, 110, 230, 170, 310, 150, 90, 240, 190, 75, 300, 140] });
packing.flushFrame();
const packed = validateLayout(packing.grids[0], 3);
const originalOrder = packing.grids[0].items.map((item) => item.index);
[...packing.grids[0].items].reverse().forEach((item) => item.img.dispatch("load"));
packing.flushFrame();
assert.deepEqual(
  packing.grids[0].items.map((item) => item.index),
  originalOrder,
  "network timing must not reorder dates"
);
assert.deepEqual(placements(packing.grids[0]), packed, "loading must not change reserved geometry");
packing.setColumns(2);
packing.windowEvents.resize();
packing.flushTimers();
packing.flushFrame();
validateLayout(packing.grids[0], 2);
packing.setColumns(1);
packing.windowEvents.resize();
packing.flushTimers();
packing.flushFrame();
const single = validateLayout(packing.grids[0], 1);
assert.deepEqual(
  [...single].sort((a, b) => a.row - b.row).map((card) => card.index),
  originalOrder,
  "single-column mobile layout must be strictly chronological"
);

// This fixture has a known shorter arrangement than chronological shortest-column placement.
const optimization = fixture({ intersectionObserver: false, heights: [120, 350, 80, 280, 110, 230] });
optimization.flushFrame();
const optimized = validateLayout(optimization.grids[0], 3);
const greedyHeights = [0, 0, 0];
[120, 350, 80, 280, 110, 230].forEach((height) => {
  const column = greedyHeights.indexOf(Math.min(...greedyHeights));
  greedyHeights[column] += Math.ceil((height + 4) / 6);
});
assert.ok(
  Math.max(...optimized.map((card) => card.row + card.rows)) < Math.max(...greedyHeights),
  "compact search should improve known greedy whitespace"
);

const bridge = fixture({ intersectionObserver: false, heights: [100, 200, 100, 150, 80], fixedWideIndices: [2], gridCount: 1 });
bridge.flushFrame();
const bridgePlan = validateLayout(bridge.grids[0], 3);
// Chronological skyline placement needs 52 rows and loses the gap below the wide card.
assert.ok(Math.max(...bridgePlan.map((card) => card.row + card.rows)) < 52, "global packing must reclaim space lost below wide cards");
assert.ok(
  bridgePlan.some((card, index) => bridgePlan.slice(index + 1).some((later) => later.row < card.row)),
  "density is allowed to take precedence over visual date order"
);
const priority = fixture({ eagerImages: 3 });
priority.flushFrame();
assert.equal(Number(priority.grids[0].items[0].style.gridRowStart), 1, "first priority photo must stay at the top");
assert.ok(
  priority.grids[0].items.every((item) => item.img.sizes === "280px"),
  "eager images must use their measured card width"
);
priority.setColumns(1);
priority.windowEvents.resize();
priority.flushTimers();
priority.flushFrame();
assert.ok(
  priority.grids[0].items.every((item) => item.img.sizes === "880px"),
  "eager image sizes must follow responsive layout"
);
// Alternation must survive packing search, out-of-order loads and resizing.
const alternating = fixture({
  intersectionObserver: false,
  heights: [220, 100, 310, 150, 180, 90, 260, 130],
  fixedWideIndices: [0, 2, 4, 6],
  eagerImages: 3,
  gridCount: 1,
});
function validateAlternation() {
  const plan = validateLayout(alternating.grids[0], 3);
  const wide = plan.filter((card) => [0, 2, 4, 6].includes(card.index));
  assert.deepEqual(wide.map((card) => card.column), [0, 1, 0, 1], "large photos must alternate left and right in date order");
  assert.ok(wide.every((card, index) => index === 0 || card.row > wide[index - 1].row), "packing must preserve visual order of large photos");
}
alternating.flushFrame();
validateAlternation();
[...alternating.grids[0].items].reverse().forEach((item) => item.img.dispatch("load"));
alternating.flushFrame();
validateAlternation();
for (const columns of [2, 1, 3]) {
  alternating.setColumns(columns);
  alternating.windowEvents.resize();
  alternating.flushTimers();
  alternating.flushFrame();
  validateLayout(alternating.grids[0], columns);
}
validateAlternation();
for (const filename of ["assets/js/photo-gallery.js", "_pages/photos.md", "utils/validate_photo_gallery.cjs"]) {
  const content = fs.readFileSync(path.join(__dirname, "..", filename), "utf8");
  assert.doesNotMatch(content, /^(?:<{7}|={7}|>{7})(?: |$)/m, `${filename} must not contain merge conflict markers`);
}
console.log("Photo gallery chronology, alternating large photos, gap filling, responsive geometry, loading and merge integrity checks passed.");
