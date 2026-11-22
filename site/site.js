// The page's behaviours: the sticky header, copy buttons, the before/after compare with its
// one sweep on load, and the scroll reveals. The page reads fine without any of it.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Header: solid once the page has moved.
  const bar = document.querySelector('[data-bar]');
  if (bar) {
    const onScroll = () => bar.classList.toggle('is-stuck', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // The menu: one control on a phone. It closes on a link, on Escape, and on a click outside, so the
  // panel never strands the reader with the page dimmed behind it.
  const menuBtn = document.querySelector('[data-menu-btn]');
  if (menuBtn && bar) {
    const setMenu = (open) => {
      bar.toggleAttribute('data-open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
    };
    menuBtn.addEventListener('click', () => setMenu(!bar.hasAttribute('data-open')));
    bar.addEventListener('click', (event) => {
      if (event.target.closest('.links a')) setMenu(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !bar.hasAttribute('data-open')) return;
      setMenu(false);
      menuBtn.focus();
    });
    document.addEventListener('click', (event) => {
      if (!bar.contains(event.target)) setMenu(false);
    });
  }

  // Copy buttons.
  for (const button of document.querySelectorAll('[data-copy]')) {
    button.addEventListener('click', async () => {
      const text = button.getAttribute('data-copy');
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const area = document.createElement('textarea');
        area.value = text;
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        area.remove();
      }
      const label = button.textContent;
      button.textContent = 'Copied';
      setTimeout(() => { button.textContent = label; }, 1600);
    });
  }

  // Before and after: drag to compare, and one sweep on load so the idea lands without a caption.
  const frame = document.getElementById('compare');
  if (frame) {
    const range = document.getElementById('c-range');
    const set = (value) => frame.style.setProperty('--pos', `${value}%`);
    let grabbed = false;
    range.addEventListener('input', () => { grabbed = true; set(range.value); });
    range.addEventListener('pointerdown', () => { grabbed = true; });
    set(range.value);

    if (!reduce) {
      const start = performance.now() + 1500;
      const from = 8;
      const to = 42;
      const duration = 1100;
      const tick = (now) => {
        if (grabbed) return;
        const t = Math.min(1, Math.max(0, (now - start) / duration));
        const eased = 1 - Math.pow(1 - t, 3);
        const value = from + (to - from) * eased;
        range.value = value;
        set(value);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  }

  // The receipt: count what this page actually uses, with the same probe drift.mjs runs, and write the
  // numbers back. The markup already carries them, so this only keeps them true as the page changes.
  const receipt = document.querySelector('[data-receipt]');
  if (receipt && window.__countPage) {
    const write = () => {
      const raw = window.__countPage();
      const found = {
        sizes: Object.keys(raw.fontSizes).length,
        colours: Object.keys(raw.textColors).length,
        radii: Object.keys(raw.radii).length,
        spacing: Object.keys(raw.spacing).length,
      };
      for (const el of receipt.querySelectorAll('[data-count]')) {
        const value = found[el.dataset.count];
        if (!value) continue;
        el.textContent = String(value);
        // Kept so the test can compare what the markup claims against what the page actually uses.
        el.dataset.measured = String(value);
      }
    };
    // After the fonts land, or the counts include the fallback face's metrics.
    if (document.fonts?.ready) document.fonts.ready.then(write);
    else write();
  }

  // Scroll reveals: once, and never hidden if the script does not run.
  const items = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window) || reduce) {
    for (const el of items) el.classList.add('in');
  } else {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    for (const el of items) io.observe(el);
  }
})();
