// Small behaviours: copy buttons, and the before/after compare with its tabs. The page reads fine without it.
(() => {
  const copyButtons = document.querySelectorAll('[data-copy]');
  for (const button of copyButtons) {
    button.addEventListener('click', async () => {
      const text = button.getAttribute('data-copy');
      try {
        await navigator.clipboard.writeText(text);
        button.textContent = 'Copied';
      } catch {
        const area = document.createElement('textarea');
        area.value = text;
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        area.remove();
        button.textContent = 'Copied';
      }
      setTimeout(() => { button.textContent = 'Copy'; }, 1800);
    });
  }

  const examples = {
    dashboard: { before: 'img/dashboard-before.jpg', after: 'img/dashboard-after.jpg', note: 'An operations dashboard. 75 machine-made tells (9 kinds) down to none; spacing values off the 4 px grid 15 down to 0; colour hues 6 down to 2; no more sideways scroll on a phone.', link: 'dashboard' },
    landing: { before: 'img/landing-before.jpg', after: 'img/landing-after.jpg', note: 'A landing page. 36 tells (12 kinds) down to none; font sizes 9 down to 6; heavy weights gone; every claim the page could not support removed.', link: 'landing' },
    messaging: { before: 'img/messaging-before.jpg', after: 'img/messaging-after.jpg', note: 'An encrypted messaging page from a six-fact brief. Mechanical score 68 up to 100. The hero is the product&rsquo;s own idea: an example message that dissolves into noise, every label marked as an example.', link: 'instrument-messaging' },
    chip: { before: 'img/chip-before.jpg', after: 'img/chip-after.jpg', note: 'An AI accelerator page. Score 43 up to 94. A halftone card at true proportions with callouts, each marked &ldquo;Example placement&rdquo;. The page without the skill drew a richer circuit board: an honest point to the other side.', link: 'instrument-chip' },
    terminal: { before: 'img/terminal-before.jpg', after: 'img/terminal-after.jpg', note: 'A deploy command at 60 columns. Result first: 13 lines down to 7, 14 emoji to none, no wrapped lines, readable with colour switched off.', link: 'terminal' },
  };
  const frame = document.querySelector('.compare-frame');
  if (!frame) return;
  const range = document.getElementById('c-range');
  const before = frame.querySelector('.c-before');
  const after = frame.querySelector('.c-after');
  const note = document.getElementById('c-note');
  const set = (value) => frame.style.setProperty('--pos', `${value}%`);
  range.addEventListener('input', () => set(range.value));
  set(range.value);
  for (const tab of document.querySelectorAll('.tab')) {
    tab.addEventListener('click', () => {
      const example = examples[tab.dataset.key];
      for (const other of document.querySelectorAll('.tab')) other.setAttribute('aria-selected', String(other === tab));
      before.src = example.before;
      after.src = example.after;
      before.alt = 'Without the skill';
      after.alt = 'With the skill';
      note.innerHTML = `${example.note} <a href="https://github.com/koryei/Inimitable/tree/main/examples/${example.link}">See this example</a>`;
      range.value = 50;
      set(50);
    });
  }
  note.innerHTML = `${examples.dashboard.note} <a href="https://github.com/koryei/Inimitable/tree/main/examples/dashboard">See this example</a>`;
})();
