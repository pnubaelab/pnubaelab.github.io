const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

let time = 0;
let frames = [];
const context = {
  module: { exports: {} },
  document: { addEventListener() {} },
  IntersectionObserver: class { observe() {} },
  performance: { now: () => time },
  requestAnimationFrame: callback => { frames.push(callback); return frames.length; },
  cancelAnimationFrame() {},
};
vm.runInNewContext(fs.readFileSync('assets/js/count-up.js', 'utf8'), context);
const CountUp = context.module.exports;

for (const direction of ['up', 'down']) {
  for (const frameDurations of [[16], [100], [16, 250, 16, 500]]) {
    time = 0;
    frames = [];
    const element = { textContent: '' };
    const counter = new CountUp(element, { to: 2886, duration: 2, direction });
    counter.start();
    for (let frame = 0; frames.length && frame < 2000; frame++) {
      time += frameDurations[frame % frameDurations.length];
      frames.shift()();
      assert.ok(Number.isFinite(counter.currentValue), 'counter became non-finite');
      assert.ok(counter.currentValue >= 0 && counter.currentValue <= 2886, 'counter diverged outside its range');
    }
    assert.equal(frames.length, 0, 'animation did not settle');
    assert.equal(counter.currentValue, direction === 'up' ? 2886 : 0);
    assert.equal(element.textContent, direction === 'up' ? '2,886' : '0');
  }
}
console.log('Count-up animations remain bounded and settle at normal and slow frame rates.');
