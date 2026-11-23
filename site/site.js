// The parts of this page that the motion kit does not cover: the phone menu, the copy buttons, the
// before and after with its one sweep on load, and the receipt. The page reads fine without any of it.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // The menu is a <details>. It closes on a link, on Escape (returning focus to its button) and on a
  // click outside, so the panel never strands the reader with the page dimmed behind it.
  const menu = document.querySelector('[data-menu]');
  if (menu) {
    const summary = menu.querySelector('summary');
    menu.addEventListener('click', (event) => {
      if (event.target.closest('a')) menu.open = false;
    });
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !menu.open) return;
      menu.open = false;
      summary.focus();
    });
    document.addEventListener('click', (event) => {
      if (menu.open && !menu.contains(event.target)) menu.open = false;
    });
  }

  // Copy buttons. The label says "Copied" for a moment, so the press is answered.
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

  // Before and after: drag to compare, with one sweep on load so the idea lands without a caption.
  const frame = document.getElementById('compare');
  if (frame) {
    const range = document.getElementById('c-range');
    const set = (value) => frame.style.setProperty('--pos', `${value}%`);
    let grabbed = false;
    range.addEventListener('input', () => { grabbed = true; set(range.value); });
    range.addEventListener('pointerdown', () => { grabbed = true; });
    set(range.value);

    if (!reduce && 'IntersectionObserver' in window) {
      // Sweep when the frame is actually on screen, not while it is still below the fold.
      const io = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        io.disconnect();
        const start = performance.now() + 500;
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
      }, { threshold: 0.4 });
      io.observe(frame);
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
      for (const el of receipt.querySelectorAll('[data-measure]')) {
        const value = found[el.dataset.measure];
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
})();
