/* Motion kit: behaviour. No dependencies. Load it with a deferred script tag.
   Everything is opt-in by attribute, runs once unless stated, and does nothing under prefers-reduced-motion
   except put content in its final state (counters show their final value, reveals show immediately).

   [data-reveal]            fade and rise when it enters (set --i for a stagger index)
   [data-split]             split text into words that rise in a stagger when it enters
   [data-count="120"]       count up to a number when it enters (data-prefix, data-suffix, data-decimals)
   [data-magnet]            leans toward a fine pointer (data-strength, default 0.25)
   [data-tilt]              tilts toward a fine pointer (data-max degrees, default 6)
   [data-spot]              a soft light follows the pointer inside the element
   [data-parallax="0.08"]   moves slightly with scroll (one element per page, never on touch)
   [data-nav]               gets .is-stuck after the page scrolls 8px
   [data-draw]              SVG strokes draw themselves when it enters
   .m-marquee               duplicates its track once for a seamless loop
*/
(() => {
  const doc = document;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Pointer effects are for a mouse or trackpad. A touch screen reports a coarse pointer and gets none of them; a machine
  // that reports no pointer at all (some headless and embedded browsers) is treated as having one.
  const fine = !matchMedia('(pointer: coarse)').matches;
  const $$ = (sel, root = doc) => [...root.querySelectorAll(sel)];
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

  // One observer for everything that happens when something enters.
  // An element in the last screenful of a page can never reach a trigger line set above the bottom edge,
  // so once the page is scrolled to its end, anything visible at all is let in.
  const pending = new Set();
  const atEnd = () => scrollY + innerHeight >= doc.documentElement.scrollHeight - 4;
  const sweep = () => {
    if (!atEnd()) return;
    for (const item of [...pending]) {
      const r = item.el.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) { pending.delete(item); item.io.unobserve(item.el); item.fn(item.el); }
    }
  };
  addEventListener('scroll', () => requestAnimationFrame(sweep), { passive: true });
  addEventListener('load', sweep);
  const onEnter = (el, fn, { threshold = 0.12, margin = '0px 0px -8% 0px' } = {}) => {
    if (!('IntersectionObserver' in window)) return fn(el);
    const item = { el, fn };
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        pending.delete(item);
        fn(e.target);
      }
    }, { threshold, rootMargin: margin });
    item.io = io;
    pending.add(item);
    io.observe(el);
  };

  // Reveal
  for (const el of $$('[data-reveal]')) {
    if (reduce) { el.classList.add('in'); continue; }
    onEnter(el, (t) => t.classList.add('in'));
  }

  // Split text into words, keeping the sentence readable to screen readers.
  for (const el of $$('[data-split]')) {
    const text = el.textContent.trim();
    el.setAttribute('aria-label', text);
    el.textContent = '';
    text.split(/\s+/).forEach((word, i) => {
      const mask = doc.createElement('span');
      mask.setAttribute('aria-hidden', 'true');
      mask.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.08em;margin-bottom:-.08em';
      const inner = doc.createElement('span');
      inner.textContent = word;
      inner.style.cssText = `display:inline-block;transform:${reduce ? 'none' : 'translateY(105%)'};transition:transform 700ms cubic-bezier(.22,1,.36,1) ${i * 45}ms`;
      mask.appendChild(inner);
      el.appendChild(mask);
      if (i < text.split(/\s+/).length - 1) el.appendChild(doc.createTextNode(' '));
    });
    const run = () => $$('span > span', el).forEach((s) => { s.style.transform = 'none'; });
    if (reduce) run(); else onEnter(el, run);
  }

  // Count up. The element's own text is the real number, so no script means a correct page.
  for (const el of $$('[data-count]')) {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const fmt = (n) => prefix + n.toLocaleString('en-GB', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
    el.textContent = fmt(reduce ? target : 0);
    if (reduce) continue;
    onEnter(el, () => {
      const t0 = performance.now();
      const dur = 1400;
      const step = (now) => {
        const p = clamp((now - t0) / dur, 0, 1);
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = fmt(target * eased);
        if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(target);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.4 });
  }

  // Marquee: duplicate the track once.
  for (const m of $$('.m-marquee')) {
    const track = m.querySelector('.m-track');
    if (!track || m.dataset.ready) continue;
    m.dataset.ready = '1';
    if (reduce) continue;
    const clone = track.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    for (const f of $$('a, button, [tabindex]', clone)) f.setAttribute('tabindex', '-1');
    m.appendChild(clone);
  }

  // Pointer behaviours only for a fine pointer and not under reduced motion.
  if (fine && !reduce) {
    for (const el of $$('[data-magnet]')) {
      const strength = parseFloat(el.dataset.strength || '0.25');
      const lean = (e) => {
        const r = el.getBoundingClientRect();
        el.classList.add('is-pulled');
        el.style.setProperty('--tx', `${(e.clientX - (r.left + r.width / 2)) * strength}px`);
        el.style.setProperty('--ty', `${(e.clientY - (r.top + r.height / 2)) * strength}px`);
      };
      el.addEventListener('pointerenter', lean);
      el.addEventListener('pointermove', lean);
      el.addEventListener('pointerleave', () => {
        el.classList.remove('is-pulled');
        el.style.setProperty('--tx', '0px');
        el.style.setProperty('--ty', '0px');
      });
    }
    for (const el of $$('[data-tilt]')) {
      const max = parseFloat(el.dataset.max || '6');
      const lean = (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.classList.add('is-tilting');
        el.style.setProperty('--ry', `${x * max * 2}deg`);
        el.style.setProperty('--rx', `${-y * max * 2}deg`);
      };
      el.addEventListener('pointerenter', lean);
      el.addEventListener('pointermove', lean);
      el.addEventListener('pointerleave', () => {
        el.classList.remove('is-tilting');
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
      });
    }
    for (const el of $$('[data-spot]')) {
      const light = (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${e.clientX - r.left}px`);
        el.style.setProperty('--my', `${e.clientY - r.top}px`);
      };
      el.addEventListener('pointerenter', light);
      el.addEventListener('pointermove', light);
    }
  }

  // Parallax: small, one element, never on touch.
  const par = $$('[data-parallax]');
  if (par.length && fine && !reduce) {
    let ticking = false;
    const update = () => {
      ticking = false;
      for (const el of par) {
        const r = el.getBoundingClientRect();
        const k = parseFloat(el.dataset.parallax || '0.08');
        const progress = clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1) - 0.5;
        el.style.transform = `translate3d(0, ${(-progress * r.height * k * 2).toFixed(1)}px, 0)`;
      }
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  // Nav that settles.
  const nav = doc.querySelector('[data-nav]');
  if (nav) {
    const set = () => nav.classList.toggle('is-stuck', scrollY > 8);
    addEventListener('scroll', set, { passive: true });
    set();
  }

  // Draw SVG strokes.
  for (const svg of $$('[data-draw]')) {
    const parts = $$('path, line, polyline', svg);
    for (const p of parts) {
      const len = p.getTotalLength ? p.getTotalLength() : 0;
      if (!len) continue;
      p.style.strokeDasharray = String(len);
      p.style.strokeDashoffset = reduce ? '0' : String(len);
    }
    if (!reduce) onEnter(svg, () => parts.forEach((p) => { p.style.strokeDashoffset = '0'; }), { threshold: 0.3 });
  }
})();
