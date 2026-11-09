const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const source = fs.readFileSync(path.join(__dirname, "../assets/js/photo-gallery.js"), "utf8");

function fixture({ intersectionObserver = true, columnCount = 3 } = {}) {
  const frames = [];
  const timers = new Map();
  const windowEvents = {};
  let nextTimer = 0;
  let observer;
  function classList() {
    const names = new Set();
    return { add: (...values) => values.forEach((v) => names.add(v)), remove: (...values) => values.forEach((v) => names.delete(v)), contains: (v) => names.has(v) };
  }
  function eventTarget() {
    const events = {};
    return {
      addEventListener: (name, fn) => { (events[name] ||= new Set()).add(fn); },
      removeEventListener: (name, fn) => events[name]?.delete(fn),
      dispatch: (name) => [...(events[name] || [])].forEach((fn) => fn()),
    };
  }
  function makeGrid(top) {
    const grid = { items: [], classList: classList(), clientWidth: 900, reads: 0 };
    grid.querySelectorAll = (selector) => grid.items.filter((item) => {
      if (selector === ".grid-item") return true;
      if (selector === ".grid-item.grid-item--wide") return item.classList.contains("grid-item--wide");
      return item.classList.contains("is-photo-loaded") || item.classList.contains("is-photo-error");
    });
    grid.contains = (item) => grid.items.includes(item);
    grid.appendChild = () => { assert.fail("image completion must not reorder date-sorted items"); };
    for (let index = 0; index < 3; index++) {
      const img = { ...eventTarget(), complete: false, naturalWidth: 1000 };
      const values = new Map();
      const attrs = new Map();
      const item = {
        ...eventTarget(), img, index, dataset: { fixedWide: index % 2 === 0 ? "true" : "false" }, classList: classList(), isConnected: true,
        style: { setProperty: (key, value) => values.set(key, value), removeProperty(key) { values.delete(key); if (key === "grid-column") delete this.gridColumn; } },
        setAttribute: (key, value) => attrs.set(key, value), removeAttribute: (key) => attrs.delete(key),
        hasAttribute: (key) => attrs.has(key),
        getBoundingClientRect: () => ({ top, bottom: top + 200, left: 0 }),
        querySelector: (selector) => selector === ".photo-img" ? img : card,
      };
      const card = { get offsetHeight() { grid.reads++; return 200; } };
      grid.items.push(item);
    }
    return grid;
  }
  const grids = [makeGrid(0), makeGrid(5000)];
  const document = {
    querySelectorAll: (selector) => selector === ".photo-masonry" ? grids : grids.flatMap((grid) => grid.items),
    addEventListener() {}, hidden: false,
  };
  const window = {
    innerHeight: 800, scrollX: 0, scrollY: 0,
    matchMedia: () => ({ matches: true, addEventListener() {} }),
    getComputedStyle: () => ({ getPropertyValue: (key) => ({ "--photo-column-count": String(columnCount), "column-gap": "4", "row-gap": "4", "grid-auto-rows": "2" })[key] }),
    requestAnimationFrame: (fn) => { frames.push(fn); return frames.length; },
    addEventListener: (event, fn) => { windowEvents[event] = fn; },
  };
  const context = {
    document, window,
    setTimeout: (fn) => { const id = ++nextTimer; timers.set(id, fn); return id; },
    clearTimeout: (id) => timers.delete(id),
  };
  if (intersectionObserver) {
    context.IntersectionObserver = class {
      constructor(callback, options) { observer = { callback, options, observed: [] }; }
      observe(grid) { observer.observed.push(grid); }
    };
  }
  vm.runInNewContext(source, context);
  return {
    grids, frames, timers, windowEvents,
    setColumnCount: (value) => { columnCount = value; },
    observer: () => observer,
    activate: (grid, isIntersecting = true) => observer.callback([{ target: grid, isIntersecting }]),
    flushFrame: () => { const batch = frames.splice(0); batch.forEach((fn) => fn()); },
    flushTimers: () => { const batch = [...timers.values()]; timers.clear(); batch.forEach((fn) => fn()); },
  };
}

const env = fixture();
const [visible, offscreen] = env.grids;
assert.equal(env.observer().observed.length, 2);
assert.equal(env.observer().options.rootMargin, "600px 0px");
assert.equal(env.frames.length, 0, "inactive grids must not schedule frames");
for (const grid of env.grids) {
  assert.equal(grid.items[0].style.gridColumn, "1 / span 2", "first large photo starts on the left before loading");
  assert.equal(grid.items[2].style.gridColumn, "2 / span 2", "next large photo starts on the right before loading");
}
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
assert.equal(offscreen.items[2].style.gridColumn, "2 / span 2", "pending large photos retain their alternating side");
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
assert.deepEqual(visible.items.map((item) => item.index), [0, 1, 2], "retain newest-first order despite out-of-order loading");
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
// Exercise breakpoint changes with pending and completed large photos.
for (const columns of [2, 1, 3]) {
  fallback.setColumnCount(columns);
  fallback.windowEvents.resize();
  fallback.flushTimers();
  fallback.flushFrame();
  for (const grid of fallback.grids) {
    assert.equal(grid.items[0].style.gridColumn, columns >= 3 ? "1 / span 2" : undefined);
    assert.equal(grid.items[2].style.gridColumn, columns >= 3 ? "2 / span 2" : undefined);
    assert.deepEqual(grid.items.map((item) => item.index), [0, 1, 2]);
  }
}

const page = fs.readFileSync(path.join(__dirname, "../_pages/photos.md"), "utf8");
assert.match(page, /grid-auto-flow:\s*row\s+dense\s*;/, "CSS must fill gaps while retaining date-sorted source order");
assert.doesNotMatch(page, /\border:\s*\d/, "loading state must not change visual order");
console.log("Photo gallery chronology, alternating large photos, responsive placement, batching and deferred loading checks passed.");
