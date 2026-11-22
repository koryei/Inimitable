// Minimal headless Chrome driver over the DevTools protocol.
// No dependencies: needs Node 22+ (global WebSocket) and an installed Chrome, Edge or Chromium.
// Set CHROME_PATH when the browser is somewhere unusual.

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const CANDIDATES = {
  darwin: [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  ],
  linux: [
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/microsoft-edge',
  ],
  win32: [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  ],
};

export function findChrome() {
  const fromEnv = process.env.CHROME_PATH;
  if (fromEnv && existsSync(fromEnv)) return fromEnv;
  for (const path of CANDIDATES[process.platform] ?? []) {
    if (existsSync(path)) return path;
  }
  return null;
}

// A DevTools connection: send commands, listen for events.
export async function connect(url) {
  const ws = new WebSocket(url);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = () => reject(new Error(`Could not connect to ${url}`));
  });
  let nextId = 0;
  const pending = new Map();
  const listeners = [];
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id !== undefined && pending.has(message.id)) {
      const { resolve, reject, method } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(`${method}: ${message.error.message}`));
      else resolve(message.result);
    } else if (message.method) {
      for (const listener of listeners) listener(message);
    }
  };
  return {
    send(method, params = {}, sessionId) {
      const id = ++nextId;
      ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
      return new Promise((resolve, reject) => pending.set(id, { resolve, reject, method }));
    },
    on(listener) {
      listeners.push(listener);
    },
    close() {
      ws.close();
    },
  };
}

// Start Chrome and return a handle. Always call close().
export async function launch() {
  const chrome = findChrome();
  if (!chrome) {
    throw new Error(
      'No Chrome, Edge or Chromium found. Install one, or set CHROME_PATH to its executable.',
    );
  }
  const profile = mkdtempSync(join(tmpdir(), 'inimitable-chrome-'));
  const proc = spawn(
    chrome,
    [
      '--headless=new',
      '--remote-debugging-port=0',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-color-profile=srgb',
      `--user-data-dir=${profile}`,
      'about:blank',
    ],
    { stdio: ['ignore', 'ignore', 'pipe'] },
  );
  const endpoint = await new Promise((resolve, reject) => {
    let seen = '';
    const timer = setTimeout(() => reject(new Error('Chrome did not start in 20 seconds.')), 20000);
    proc.stderr.on('data', (chunk) => {
      seen += chunk.toString();
      const match = seen.match(/DevTools listening on (ws:\/\/\S+)/);
      if (match) {
        clearTimeout(timer);
        resolve(match[1]);
      }
    });
    proc.on('exit', (code) => reject(new Error(`Chrome exited early (code ${code}).`)));
  });
  const browser = await connect(endpoint);
  return {
    browser,
    async close() {
      try {
        browser.close();
      } catch {}
      proc.kill();
      await new Promise((resolve) => setTimeout(resolve, 100));
      try {
        rmSync(profile, { recursive: true, force: true });
      } catch {}
    },
  };
}

// Open one page at a given viewport. Returns helpers bound to it.
export async function openPage(browser, { width, height, deviceScaleFactor = 1, mobile = false, colorScheme }) {
  const { targetId } = await browser.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await browser.send('Target.attachToTarget', { targetId, flatten: true });
  const send = (method, params) => browser.send(method, params, sessionId);
  const logs = [];
  browser.on((message) => {
    if (message.sessionId !== sessionId) return;
    if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
      logs.push(message.params.args.map((a) => a.value ?? a.description ?? '').join(' '));
    }
    if (message.method === 'Runtime.exceptionThrown') {
      logs.push(message.params.exceptionDetails.exception?.description ?? 'exception');
    }
  });
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor, mobile });
  if (colorScheme) {
    await send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-color-scheme', value: colorScheme }],
    });
  }
  return {
    logs,
    send,
    async goto(url, settleMs = 400) {
      const loaded = new Promise((resolve) => {
        browser.on((m) => {
          if (m.sessionId === sessionId && m.method === 'Page.loadEventFired') resolve();
        });
      });
      await send('Page.navigate', { url });
      await Promise.race([loaded, new Promise((r) => setTimeout(r, 15000))]);
      await send('Runtime.evaluate', {
        expression: 'document.fonts ? document.fonts.ready.then(() => true) : true',
        awaitPromise: true,
      });
      await new Promise((r) => setTimeout(r, settleMs));
    },
    async evaluate(expression) {
      const result = await send('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true,
      });
      if (result.exceptionDetails) {
        throw new Error(result.exceptionDetails.exception?.description ?? 'evaluate failed');
      }
      return result.result.value;
    },
    async screenshot({ fullPage = false, clip: region } = {}) {
      let clip = region;
      if (fullPage) {
        const { cssContentSize } = await send('Page.getLayoutMetrics');
        clip = { x: 0, y: 0, width: width, height: Math.min(Math.ceil(cssContentSize.height), 16000), scale: 1 };
      }
      const { data } = await send('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: fullPage,
        ...(clip ? { clip } : {}),
      });
      return Buffer.from(data, 'base64');
    },
    async close() {
      await browser.send('Target.closeTarget', { targetId });
    },
  };
}

// Turn a path or URL into something Chrome can open.
export function toUrl(input) {
  if (/^[a-z][a-z0-9+.-]*:/i.test(input)) return input;
  return pathToFileURL(resolve(input)).href;
}
