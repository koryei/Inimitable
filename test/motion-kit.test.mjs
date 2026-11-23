// The motion kit, in a real browser: every behaviour does what it says, and the fallbacks hold.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { findChrome, launch, openPage, toUrl } from '../scripts/lib/chrome.mjs';

const skip = findChrome() ? false : 'no Chrome installed';
const fixture = fileURLToPath(new URL('./fixtures/motion-kit.html', import.meta.url));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function session(options = {}) {
  const chrome = await launch();
  const page = await openPage(chrome.browser, { width: 1280, height: 800, ...options });
  return { chrome, page };
}
const style = (page, sel, prop) => page.evaluate(`getComputedStyle(document.querySelector(${JSON.stringify(sel)}))[${JSON.stringify(prop)}]`);
const mouse = (page, type, x, y) => page.send('Input.dispatchMouseEvent', { type, x, y, button: 'none' });
const centre = (page, sel) => page.evaluate(`(() => { const r = document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height }; })()`);

test('the entrance starts hidden and ends visible, in order', { skip }, async () => {
  const { chrome, page } = await session();
  try {
    await page.goto(toUrl(fixture), 0);
    await wait(60);
    const early = await style(page, '#sub', 'opacity');
    await wait(1500);
    const late = await style(page, '#sub', 'opacity');
    assert.ok(Number(early) < 0.6, `the subhead should be fading in at 60 ms, was ${early}`);
    assert.equal(Number(late), 1);
    assert.ok(['none', 'matrix(1, 0, 0, 1, 0, 0)'].includes(await style(page, '#h .m-line:first-child > span', 'transform')), 'the headline has settled');
  } finally { await chrome.close(); }
});

test('a reveal is hidden until it scrolls in, then shows once', { skip }, async () => {
  const { chrome, page } = await session();
  try {
    await page.goto(toUrl(fixture), 400);
    assert.equal(Number(await style(page, '#reveal', 'opacity')), 0);
    await page.evaluate("document.querySelector('#reveal').scrollIntoView({ block: 'center' })");
    await wait(1100);
    assert.equal(Number(await style(page, '#reveal', 'opacity')), 1);
    assert.equal(await page.evaluate("document.querySelector('#reveal').classList.contains('in')"), true);
  } finally { await chrome.close(); }
});

test('counters start low and end on the real number', { skip }, async () => {
  const { chrome, page } = await session();
  try {
    await page.goto(toUrl(fixture), 300);
    assert.equal(await page.evaluate("document.querySelector('#count').textContent"), '0K+');
    await page.evaluate("document.querySelector('#count').scrollIntoView({ block: 'center' })");
    await wait(2000);
    assert.equal(await page.evaluate("document.querySelector('#count').textContent"), '120K+');
    assert.equal(await page.evaluate("document.querySelector('#count2').textContent"), '98.5%');
  } finally { await chrome.close(); }
});

test('a magnetic element leans toward the pointer and comes home', { skip }, async () => {
  const { chrome, page } = await session();
  try {
    await page.goto(toUrl(fixture), 1200);
    const c = await centre(page, '#btn');
    await mouse(page, 'mouseMoved', c.x + c.w / 2 - 4, c.y);
    await wait(300);
    const pulled = parseFloat(await page.evaluate("document.querySelector('#btn').style.getPropertyValue('--tx')"));
    assert.ok(pulled > 5, `pulled ${pulled}px`);
    await mouse(page, 'mouseMoved', 5, 5);
    await wait(500);
    assert.equal(await page.evaluate("document.querySelector('#btn').style.getPropertyValue('--tx')"), '0px');
  } finally { await chrome.close(); }
});

test('a button answers hover with a visible fill and a visible arrow change', { skip }, async () => {
  const { chrome, page } = await session();
  try {
    await page.goto(toUrl(fixture), 1200);
    const c = await centre(page, '#btn');
    const before = await style(page, '#btn', 'color');
    await mouse(page, 'mouseMoved', c.x, c.y);
    await wait(500);
    const after = await style(page, '#btn', 'color');
    assert.notEqual(before, after, 'the label colour changes as the fill sweeps in');
    assert.equal(await page.evaluate("getComputedStyle(document.querySelector('#btn'), '::before').transform"), 'none');
  } finally { await chrome.close(); }
});

test('tilt leans with the pointer and resets', { skip }, async () => {
  const { chrome, page } = await session();
  try {
    await page.goto(toUrl(fixture), 300);
    await page.evaluate("document.querySelector('#tilt').scrollIntoView({ block: 'center' })");
    await wait(200);
    const c = await centre(page, '#tilt');
    await mouse(page, 'mouseMoved', c.x + c.w / 2 - 2, c.y);
    // Poll rather than sleep: on a loaded machine the frame that writes the lean can come late.
    const read = async () => parseFloat(await page.evaluate("document.querySelector('#tilt').style.getPropertyValue('--ry')"));
    let ry = 0;
    for (let i = 0; i < 20 && !(ry > 4); i++) { await wait(150); ry = await read(); }
    assert.ok(ry > 4, `ry ${ry}`);
    await mouse(page, 'mouseMoved', 2, 2);
    let back = '';
    for (let i = 0; i < 20 && back !== '0deg'; i++) { await wait(150); back = await page.evaluate("document.querySelector('#tilt').style.getPropertyValue('--ry')"); }
    assert.equal(back, '0deg');
  } finally { await chrome.close(); }
});

test('split text keeps its sentence for screen readers and shows every word', { skip }, async () => {
  const { chrome, page } = await session();
  try {
    await page.goto(toUrl(fixture), 300);
    assert.equal(await page.evaluate("document.querySelector('#split').getAttribute('aria-label')"), 'Every word rises in turn');
    assert.equal(await page.evaluate("document.querySelectorAll('#split > span').length"), 5);
    await page.evaluate("document.querySelector('#split').scrollIntoView({ block: 'center' })");
    await wait(1400);
    assert.equal(await page.evaluate("[...document.querySelectorAll('#split > span > span')].every((s) => s.style.transform === 'none')"), true);
  } finally { await chrome.close(); }
});

test('the marquee duplicates its track once and pauses on hover', { skip }, async () => {
  const { chrome, page } = await session();
  try {
    await page.goto(toUrl(fixture), 300);
    assert.equal(await page.evaluate("document.querySelectorAll('#marq .m-track').length"), 2);
    await page.evaluate("document.querySelector('#marq').scrollIntoView({ block: 'center' })");
    await wait(200);
    const c = await centre(page, '#marq');
    assert.equal(await style(page, '#marq .m-track', 'animationPlayState'), 'running');
    await mouse(page, 'mouseMoved', c.x, c.y);
    await wait(200);
    assert.equal(await style(page, '#marq .m-track', 'animationPlayState'), 'paused');
  } finally { await chrome.close(); }
});

test('under reduced motion everything is visible, nothing loops, counters show the final value', { skip }, async () => {
  const { chrome, page } = await session({ reducedMotion: true });
  try {
    await page.goto(toUrl(fixture), 300);
    assert.equal(Number(await style(page, '#reveal', 'opacity')), 1);
    assert.equal(Number(await style(page, '#sub', 'opacity')), 1);
    assert.equal(await page.evaluate("document.querySelector('#count').textContent"), '120K+');
    assert.equal(await page.evaluate("document.querySelectorAll('#marq .m-track').length"), 1);
    assert.equal(await style(page, '#marq .m-track', 'animationName'), 'none');
    assert.equal(await page.evaluate("document.getAnimations().filter((a) => a.playState === 'running' && a.effect.getTiming().iterations === Infinity).length"), 0);
  } finally { await chrome.close(); }
});

test('with the script removed the page still reads: nothing important stays hidden', { skip }, async () => {
  const { chrome, page } = await session();
  try {
    await page.goto(toUrl(fixture), 200);
    await page.evaluate("document.documentElement.classList.remove('m-js'); document.querySelectorAll('[data-reveal]').forEach((e) => e.classList.remove('in'))");
    await wait(100);
    assert.equal(Number(await style(page, '#reveal', 'opacity')), 1);
  } finally { await chrome.close(); }
});

test('an element in the last screenful of the page still reveals', { skip }, async () => {
  const { chrome, page } = await session();
  try {
    await page.goto(toUrl(fixture), 300);
    await page.evaluate("window.scrollTo(0, document.documentElement.scrollHeight)");
    await wait(1400);
    const hidden = await page.evaluate("[...document.querySelectorAll('[data-reveal]')].filter((e) => { const r = e.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && !e.classList.contains('in'); }).length");
    assert.equal(hidden, 0, 'every visible reveal is shown once the page is scrolled to its end');
    assert.equal(await page.evaluate("[...document.querySelectorAll('#split > span > span')].every((s) => s.style.transform === 'none')"), true);
  } finally { await chrome.close(); }
});

// The pointer effects must follow the device: on for a mouse, on when no pointer is reported (headless, embedded), off for touch.
async function withPointer(kind, run) {
  const { chrome, page } = await session();
  try {
    const script = `(() => { const real = window.matchMedia.bind(window); window.matchMedia = (q) => { const r = real(q); const touch = ${kind === 'touch'}; const none = ${kind === 'none'}; if (/pointer: coarse/.test(q)) return { ...r, matches: touch, addEventListener() {} }; if (/pointer: fine/.test(q) || /hover: hover/.test(q)) return { ...r, matches: !touch && !none, addEventListener() {} }; if (/hover: none|pointer: none/.test(q)) return { ...r, matches: touch || none, addEventListener() {} }; return r; }; })();`;
    await page.send('Page.addScriptToEvaluateOnNewDocument', { source: script });
    await page.goto(toUrl(fixture), 1200);
    await run(page);
  } finally { await chrome.close(); }
}
const pulled = async (page) => {
  const c = await centre(page, '#btn');
  await mouse(page, 'mouseMoved', c.x + c.w / 2 - 4, c.y);
  await wait(300);
  return parseFloat(await page.evaluate("document.querySelector('#btn').style.getPropertyValue('--tx')") || '0');
};

test('a mouse gets the magnetic pull', { skip }, async () => withPointer('mouse', async (page) => assert.ok((await pulled(page)) > 5)));
test('a machine that reports no pointer at all still gets it', { skip }, async () => withPointer('none', async (page) => assert.ok((await pulled(page)) > 5)));
test('a touch screen gets no pointer effects', { skip }, async () => withPointer('touch', async (page) => assert.ok(!((await pulled(page)) > 0))));
