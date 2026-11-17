/*
MIT + Commons Clause License Condition v1.0

Copyright (c) 2026 David Haz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, and distribute the Software **as part of an application, website, or product**, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

## Commons Clause Restriction

You may use this Software, including for any commercial purpose, **so long as you do not sell, sublicense, or redistribute the components themselves-whether alone, in a bundle, or as a ported version.**

The same restriction covers the React Bits tools (Background Studio, Texture Lab, Shape Magic, Center Stage, Sound Lab and any tools added later) and the sounds in the sound library. **You may not sell, sublicense, or redistribute the tools or the sounds themselves, or offer the tools or a substantially similar copy of them as a hosted service-whether alone, in a bundle, or as a ported version.**

What you make with the tools is yours to use. You can use exported code, images, videos, and audio files in any personal or commercial application, website, or product, including paid ones. **You may not sell or redistribute the exports on their own, either individually or as the product itself, such as a sound, texture, background, or template pack.**

## No Warranty

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/* TechText clickKick renderer adapted from React Bits:
 * https://reactbits.dev/text-animations/tech-text
 * The static DOM text supplies the layout. Canvas handles pointer hover and
 * clickKick; there is no intro, idle sweep, or drag interaction.
 */
(() => {
  "use strict";

  const SPRING = 320;
  const KICK_DECAY = 0.62;
  const BOUNCE = 0.4;
  const DAMPING = 2 * Math.sqrt(SPRING) * (1 - BOUNCE * 0.96);

  const approach = (current, target, dt, seconds) => current + (target - current) * (1 - Math.exp(-dt / seconds));

  function mountTechText(container) {
    const label = container.querySelector(".tech-text-label");
    const canvas = container.querySelector(".tech-text-canvas");
    const ctx = canvas?.getContext("2d");
    if (!label || !ctx) return;

    // A zero-size inline marker measures the actual text baseline without
    // changing its font, spacing, alignment, or line height.
    const baselineMarker = document.createElement("span");
    baselineMarker.className = "tech-text-baseline";
    baselineMarker.setAttribute("aria-hidden", "true");
    label.after(baselineMarker);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let glyphs = [];
    let kicks = [];
    let raf = 0;
    let last = 0;
    let elapsed = 0;
    let dpr = 1;
    let fontSize = 1;
    let pad = 0;
    let baseline = 0;
    let press = null;
    let hovered = -1;
    let ink = "#fff";
    const frame = { x1: 0, y1: 0, x2: 0, y2: 0, alpha: 0, index: -1 };

    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      kicks = [];
      hovered = -1;
      frame.alpha = 0;
      frame.index = -1;
      glyphs.forEach((glyph) => {
        glyph.offset = 0;
        glyph.velocity = 0;
        glyph.reveal = 0;
      });
      container.classList.remove("tech-text--animating");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    // Preserve TechText's fill and dashed outer-outline sprites.
    const sprite = (glyph, outlined, font, color) => {
      const edge = 7;
      const left = glyph.x - glyph.metrics.actualBoundingBoxLeft - edge;
      const top = baseline - glyph.metrics.actualBoundingBoxAscent - edge;
      const image = document.createElement("canvas");
      image.width = Math.max(1, Math.ceil((glyph.metrics.actualBoundingBoxLeft + glyph.metrics.actualBoundingBoxRight + edge * 2) * dpr));
      image.height = Math.max(1, Math.ceil((glyph.metrics.actualBoundingBoxAscent + glyph.metrics.actualBoundingBoxDescent + edge * 2) * dpr));
      const c = image.getContext("2d");
      c.setTransform(dpr, 0, 0, dpr, -left * dpr, -top * dpr);
      c.font = font;
      c.textBaseline = "alphabetic";
      c.fillStyle = color;
      if (outlined) {
        c.lineJoin = "round";
        c.lineWidth = 3;
        c.strokeStyle = color;
        c.setLineDash([4, 2]);
        c.strokeText(glyph.char, glyph.x, baseline);
        c.globalCompositeOperation = "destination-out";
      }
      c.fillText(glyph.char, glyph.x, baseline);
      return { image, left, top };
    };

    const layout = () => {
      stop();
      const rect = container.getBoundingClientRect();
      const style = getComputedStyle(label);
      fontSize = parseFloat(style.fontSize);
      ink = style.color;
      pad = Math.ceil(fontSize * 0.8);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round((rect.height + pad * 2) * dpr));
      canvas.style.top = `${-pad}px`;
      canvas.style.height = `${rect.height + pad * 2}px`;
      baseline = baselineMarker.getBoundingClientRect().top - rect.top + pad;
      const font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      ctx.font = font;
      ctx.textBaseline = "alphabetic";
      const range = document.createRange();
      const textNode = label.firstChild;
      let offset = 0;
      glyphs = Array.from(label.textContent, (char) => {
        range.setStart(textNode, offset);
        offset += char.length;
        range.setEnd(textNode, offset);
        const box = range.getBoundingClientRect();
        if (!char.trim()) return null;
        const glyph = {
          char,
          x: box.left - rect.left,
          left: box.left - rect.left,
          right: box.right - rect.left,
          top: box.top - rect.top,
          bottom: box.bottom - rect.top,
          metrics: ctx.measureText(char),
          offset: 0,
          velocity: 0,
          reveal: 0,
        };
        glyph.fill = sprite(glyph, false, font, style.color);
        glyph.outline = sprite(glyph, true, font, style.color);
        return glyph;
      }).filter(Boolean);
    };

    const blit = (art, dy = 0) => {
      ctx.drawImage(art.image, Math.round(art.left * dpr), Math.round((art.top + dy) * dpr));
    };

    const drawFrame = () => {
      if (frame.alpha < 0.01 || frame.index < 0) return;
      const glyph = glyphs[frame.index];
      const width = frame.x2 - frame.x1;
      const height = frame.y2 - frame.y1;
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.strokeStyle = ink;
      ctx.fillStyle = ink;
      ctx.lineWidth = 1;
      ctx.globalAlpha = frame.alpha * 0.5;
      ctx.strokeRect(Math.round(frame.x1) + 0.5, Math.round(frame.y1) + 0.5, width, height);
      ctx.globalAlpha = frame.alpha * 0.95;
      for (const [x, y] of [
        [frame.x1, frame.y1],
        [frame.x2, frame.y1],
        [frame.x2, frame.y2],
        [frame.x1, frame.y2],
      ]) {
        ctx.fillRect(Math.round(x) - 2, Math.round(y) - 2, 5, 5);
      }
      ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
      ctx.textBaseline = "bottom";
      ctx.globalAlpha = frame.alpha * 0.62;
      ctx.fillText(`${glyph.char}  ${Math.round(width - 12)} × ${Math.round(height - 12)}`, frame.x1, frame.y1 - 7);
      // Seed each letter's blinking squares so the hover frame has TechText's
      // technical selection effect without an idle sweep across other letters.
      for (let i = 0; i < (reducedMotion.matches ? 0 : 15); i++) {
        const phase = elapsed / (0.5 + (i % 5) * 0.2) + i * 0.37;
        const life = phase % 1;
        if (life > 0.7) continue;
        const seed = Math.sin((frame.index + 1) * 71 + i * 137 + Math.floor(phase) * 53) * 43758.5453;
        let distance = (seed - Math.floor(seed)) * 2 * (width + height);
        const out = 5 + (i % 5) * 3;
        let x, y;
        if (distance < width) {
          x = frame.x1 + distance;
          y = frame.y1 - out;
        } else if ((distance -= width) < height) {
          x = frame.x2 + out;
          y = frame.y1 + distance;
        } else if ((distance -= height) < width) {
          x = frame.x2 - distance;
          y = frame.y2 + out;
        } else {
          x = frame.x1 - out;
          y = frame.y2 - (distance - width);
        }
        const size = i % 4 === 0 ? 5 : 2;
        ctx.globalAlpha = frame.alpha * (life < 0.06 ? 0.25 : 0.65);
        ctx.fillRect(Math.round(x), Math.round(y), size, size);
      }
      ctx.restore();
    };

    const tick = (now) => {
      raf = 0;
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      elapsed += dt;
      for (let i = kicks.length - 1; i >= 0; i--) {
        if (kicks[i].at > elapsed) continue;
        glyphs[kicks[i].index].velocity -= kicks[i].velocity;
        kicks.splice(i, 1);
      }
      let moving = false;
      for (const glyph of glyphs) {
        if (Math.abs(glyph.offset) < 0.05 && Math.abs(glyph.velocity) < 0.5) {
          glyph.offset = 0;
          glyph.velocity = 0;
          continue;
        }
        glyph.velocity += (-SPRING * glyph.offset - DAMPING * glyph.velocity) * dt;
        glyph.offset += glyph.velocity * dt;
        moving = true;
      }
      for (const [index, glyph] of glyphs.entries()) {
        const target = index === hovered && Math.abs(glyph.offset) < 1 ? 1 : 0;
        glyph.reveal = reducedMotion.matches ? target : approach(glyph.reveal, target, dt, 0.09);
        if (Math.abs(glyph.reveal - target) > 0.002) moving = true;
        else glyph.reveal = target;
      }
      if (hovered >= 0) {
        const glyph = glyphs[hovered];
        const target = {
          x1: glyph.x - glyph.metrics.actualBoundingBoxLeft - 6,
          y1: baseline - glyph.metrics.actualBoundingBoxAscent + glyph.offset - 6,
          x2: glyph.x + glyph.metrics.actualBoundingBoxRight + 6,
          y2: baseline + glyph.metrics.actualBoundingBoxDescent + glyph.offset + 6,
        };
        for (const key of ["x1", "y1", "x2", "y2"]) {
          frame[key] = reducedMotion.matches || frame.index < 0 || frame.alpha < 0.02 ? target[key] : approach(frame[key], target[key], dt, 0.08);
        }
        frame.index = hovered;
      }
      const frameTarget = hovered >= 0 ? 1 : 0;
      frame.alpha = reducedMotion.matches ? frameTarget : approach(frame.alpha, frameTarget, dt, 0.1);
      if (!moving && !kicks.length && hovered < 0 && frame.alpha < 0.01) {
        stop();
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const glyph of glyphs) {
        if (Math.abs(glyph.offset) > 1) {
          ctx.globalAlpha = Math.min(1, Math.abs(glyph.offset) / 24) * 0.55;
          blit(glyph.outline);
          ctx.globalAlpha = 1;
        }
        ctx.globalAlpha = 1 - glyph.reveal;
        blit(glyph.fill, glyph.offset);
        ctx.globalAlpha = glyph.reveal;
        if (glyph.reveal > 0.001) blit(glyph.outline, glyph.offset);
        ctx.globalAlpha = 1;
      }
      drawFrame();
      container.classList.add("tech-text--animating");
      if (!reducedMotion.matches) raf = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    const glyphAt = (event) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      return glyphs.findIndex((glyph) => x >= glyph.left && x <= glyph.right && y >= glyph.top && y <= glyph.bottom);
    };

    container.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch") return;
      const index = glyphAt(event);
      if (index !== hovered) {
        hovered = index;
        wake();
      }
    });
    container.addEventListener("pointerleave", () => {
      press = null;
      if (hovered >= 0) {
        hovered = -1;
        wake();
      }
    });

    const kick = (index) => {
      const strength = fontSize * 11;
      kicks.push({ index, at: elapsed, velocity: strength });
      for (let distance = 1; distance < glyphs.length; distance++) {
        const velocity = strength * Math.pow(KICK_DECAY, distance);
        if (velocity < 30) break;
        for (const neighbour of [index - distance, index + distance]) {
          if (neighbour >= 0 && neighbour < glyphs.length) {
            kicks.push({ index: neighbour, at: elapsed + distance * 0.055, velocity });
          }
        }
      }
      wake();
    };

    container.addEventListener("pointerdown", (event) => {
      press = event.isPrimary && event.button === 0 ? { x: event.clientX, y: event.clientY, at: performance.now() } : null;
    });
    container.addEventListener("pointercancel", () => {
      press = null;
    });
    container.addEventListener("pointerup", (event) => {
      const start = press;
      press = null;
      if (!start || reducedMotion.matches || performance.now() - start.at >= 450) return;
      if (Math.hypot(event.clientX - start.x, event.clientY - start.y) >= 6) return;
      const index = glyphAt(event);
      if (index >= 0) kick(index);
    });

    new ResizeObserver(layout).observe(container);
    if (document.fonts) {
      document.fonts.ready.then(layout);
      document.fonts.addEventListener("loadingdone", layout);
    }
    reducedMotion.addEventListener("change", () => {
      const index = hovered;
      stop();
      hovered = index;
      if (hovered >= 0) wake();
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
    });
    layout();
  }

  const init = () => document.querySelectorAll("[data-tech-text]").forEach(mountTechText);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
