/* ALEX TEIH — campaign scroll animation
   The campaign section pins while you scroll and the model moves with the scroll: a frame
   sequence (cut from a Higgsfield clip that starts and ends on the campaign photo) drawn on a
   canvas. Frames: assets/frames/campaign/d (desktop) and /m (phones). The photo stays underneath
   as the fallback until frames arrive, and for reduced motion. */
(() => {
  'use strict';
  const section = document.getElementById('campaign');
  const canvas = document.getElementById('campaignCanvas');
  if (!section || !canvas) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { canvas.remove(); return; }

  const COUNT = +canvas.dataset.frames || 0;
  const SET = matchMedia('(min-width: 761px)').matches ? 'd' : 'm';
  const src = (i) => `assets/frames/campaign/${SET}/f${String(i).padStart(3, '0')}.webp`;
  const ctx = canvas.getContext('2d', { alpha: false });
  const frames = new Array(COUNT);
  const clamp = (v) => Math.min(1, Math.max(0, v));
  // where the subject sits when the frame is cropped to the screen (matches the photo's object-position)
  // (phone frames are already cropped around her, so they centre)
  const FOCUS_X = SET === 'd' ? 0.3 : 0.5, FOCUS_Y = SET === 'd' ? 0.3 : 0.5;

  let target = 0, current = 0, drawn = -1, running = false, lastRise = -1;

  // coarse → fine, so scrubbing works before every frame has arrived
  const order = [], seen = new Set();
  for (const step of [16, 8, 4, 2, 1]) for (let i = 0; i < COUNT; i += step) if (!seen.has(i)) { seen.add(i); order.push(i); }
  if (!seen.has(COUNT - 1)) order.push(COUNT - 1);
  const load = (i) => new Promise((res) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => { frames[i] = img; drawn = -1; res(); }; // a closer frame may have arrived: redraw
    img.onerror = res;
    img.src = src(i);
  });
  let started = false;
  const preload = () => {
    if (started) return; started = true;
    let k = 0;
    const next = () => { if (k < order.length) load(order[k++]).then(next); };
    for (let n = 0; n < 4; n++) next();
  };
  const nearest = (i) => {
    if (frames[i]) return frames[i];
    for (let d = 1; d < COUNT; d++) { if (frames[i - d]) return frames[i - d]; if (frames[i + d]) return frames[i + d]; }
    return null;
  };

  const size = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    drawn = -1;
  };
  const draw = (i) => {
    const img = nearest(i);
    if (!img) return false;
    const cw = canvas.width, ch = canvas.height;
    const s = Math.max(cw / img.width, ch / img.height), w = img.width * s, h = img.height * s;
    ctx.drawImage(img, (cw - w) * FOCUS_X, (ch - h) * FOCUS_Y, w, h);
    canvas.classList.add('is-live'); // hides the still photo underneath
    return true;
  };

  // 0 when the section reaches the top of the screen, 1 when its pinned stretch ends
  const read = () => {
    const r = section.getBoundingClientRect();
    target = clamp(-r.top / (section.offsetHeight - window.innerHeight)) * (COUNT - 1);
  };
  const tick = () => {
    current += (target - current) * 0.2;
    if (Math.abs(target - current) < 0.01) current = target;
    const f = Math.round(current);
    if (f !== drawn && draw(f)) drawn = f; // only marked drawn once a frame was actually painted
    // the section's text rises together while she moves, and is gone by the time the section scrolls away
    const rise = (current / (COUNT - 1)) * window.innerHeight * 1.05;
    if (Math.abs(rise - lastRise) > 0.3) { section.style.setProperty('--rise', rise.toFixed(1) + 'px'); lastRise = rise; }
    if (running) requestAnimationFrame(tick);
  };

  size();
  read(); current = target;
  window.addEventListener('scroll', read, { passive: true });
  window.addEventListener('resize', () => { size(); read(); });
  // only load and animate near the section
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { preload(); if (!running) { running = true; requestAnimationFrame(tick); } }
    else running = false;
  }, { rootMargin: '100% 0px' }).observe(section);
})();
