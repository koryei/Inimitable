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
