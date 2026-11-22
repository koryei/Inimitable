// A small terminal emulator: feed it the bytes a program wrote, get back the screen as text or HTML.
// Handles what real CLIs and Ink apps use: printing, newlines, cursor moves, erase, colours and styles.
// It ignores what does not change the picture (modes, titles, mouse).

const PALETTE = [
  '#1d1f21', '#cc6666', '#b5bd68', '#f0c674', '#81a2be', '#b294bb', '#8abeb7', '#c5c8c6',
  '#666666', '#d54e53', '#b9ca4a', '#e7c547', '#7aa6da', '#c397d8', '#70c0b1', '#eaeaea',
];

function xterm256(n) {
  if (n < 16) return PALETTE[n];
  if (n >= 232) {
    const v = 8 + (n - 232) * 10;
    return `rgb(${v},${v},${v})`;
  }
  const i = n - 16;
  const steps = [0, 95, 135, 175, 215, 255];
  return `rgb(${steps[Math.floor(i / 36)]},${steps[Math.floor(i / 6) % 6]},${steps[i % 6]})`;
}

// Terminal cell width: 2 for wide East Asian characters and most emoji, 0 for combining marks.
export function cellWidth(cp) {
  if (cp === 0 || (cp >= 0x300 && cp <= 0x36f) || cp === 0x200d || (cp >= 0xfe00 && cp <= 0xfe0f)) return 0;
  if (
    (cp >= 0x1100 && cp <= 0x115f) || (cp >= 0x2e80 && cp <= 0xa4cf) || (cp >= 0xac00 && cp <= 0xd7a3) ||
    (cp >= 0xf900 && cp <= 0xfaff) || (cp >= 0xfe30 && cp <= 0xfe6f) || (cp >= 0xff00 && cp <= 0xff60) ||
    (cp >= 0xffe0 && cp <= 0xffe6) || (cp >= 0x1f300 && cp <= 0x1faff) || (cp >= 0x20000 && cp <= 0x3fffd)
  ) return 2;
  return 1;
}

const blank = () => ({ ch: ' ', fg: null, bg: null, bold: false, dim: false, italic: false, underline: false, inverse: false });

export class Terminal {
  constructor(cols = 80, rows = 24) {
    this.cols = cols;
    this.rows = rows;
    this.screen = Array.from({ length: rows }, () => this.newRow());
    this.scrollback = [];
    this.x = 0;
    this.y = 0;
    this.pen = blank();
    this.pendingWrap = false;
    this.wrapped = 0; // how many lines were wrapped by the width
  }

  newRow() {
    return { cells: Array.from({ length: this.cols }, blank), wrapped: false };
  }

  scrollUp() {
    this.scrollback.push(this.screen.shift());
    this.screen.push(this.newRow());
  }

  lineFeed() {
    if (this.y === this.rows - 1) this.scrollUp();
    else this.y++;
  }

  put(ch, width) {
    if (width === 0) {
      // combining: append to the previous cell
      const prev = this.screen[this.y].cells[Math.max(0, this.x - 1)];
      if (prev) prev.ch += ch;
      return;
    }
    if (this.pendingWrap || this.x + width > this.cols) {
      this.screen[this.y].wrapped = true;
      this.wrapped++;
      this.x = 0;
      this.lineFeed();
      this.pendingWrap = false;
    }
    const cell = this.screen[this.y].cells[this.x];
    Object.assign(cell, this.pen, { ch });
    if (width === 2 && this.x + 1 < this.cols) Object.assign(this.screen[this.y].cells[this.x + 1], this.pen, { ch: '' });
    this.x += width;
    if (this.x >= this.cols) {
      this.x = this.cols - 1;
      this.pendingWrap = true;
    }
  }

  write(input) {
    const data = typeof input === 'string' ? input : input.toString('utf8');
    const chars = Array.from(data);
    for (let i = 0; i < chars.length; i++) {
      const c = chars[i];
      if (c === '\x1b') {
        const next = chars[i + 1];
        if (next === '[') {
          let j = i + 2;
          let params = '';
          while (j < chars.length && /[0-9;:?<>= ]/.test(chars[j])) params += chars[j++];
          this.csi(params, chars[j]);
          i = j;
        } else if (next === ']') {
          let j = i + 2;
          while (j < chars.length && chars[j] !== '\x07' && !(chars[j] === '\x1b' && chars[j + 1] === '\\')) j++;
          i = chars[j] === '\x1b' ? j + 1 : j;
        } else i += 1;
        continue;
      }
      if (c === '\n') {
        this.pendingWrap = false;
        this.lineFeed();
      } else if (c === '\r') {
        this.x = 0;
        this.pendingWrap = false;
      } else if (c === '\b') {
        this.x = Math.max(0, this.x - 1);
        this.pendingWrap = false;
      } else if (c === '\t') this.x = Math.min(this.cols - 1, (Math.floor(this.x / 8) + 1) * 8);
      else if (c >= ' ' && c !== '\x7f') this.put(c, cellWidth(c.codePointAt(0)));
    }
  }

  csi(params, final) {
    const nums = params.replace(/^[?<>=]/, '').split(';').map((p) => (p === '' ? NaN : Number(p)));
    const n = (i, d) => (Number.isNaN(nums[i]) || nums[i] === undefined ? d : nums[i]);
    if (/^[?<>=]/.test(params)) return; // modes
    switch (final) {
      case 'A': this.y = Math.max(0, this.y - n(0, 1)); break;
      case 'B': this.y = Math.min(this.rows - 1, this.y + n(0, 1)); break;
      case 'C': this.x = Math.min(this.cols - 1, this.x + n(0, 1)); break;
      case 'D': this.x = Math.max(0, this.x - n(0, 1)); break;
      case 'E': this.y = Math.min(this.rows - 1, this.y + n(0, 1)); this.x = 0; break;
      case 'F': this.y = Math.max(0, this.y - n(0, 1)); this.x = 0; break;
      case 'G': this.x = Math.min(this.cols - 1, Math.max(0, n(0, 1) - 1)); break;
      case 'H': case 'f':
        this.y = Math.min(this.rows - 1, Math.max(0, n(0, 1) - 1));
        this.x = Math.min(this.cols - 1, Math.max(0, n(1, 1) - 1));
        break;
      case 'J': {
        const mode = n(0, 0);
        if (mode === 2 || mode === 3) for (let r = 0; r < this.rows; r++) this.screen[r] = this.newRow();
        else if (mode === 0) {
          this.clearRow(this.y, this.x, this.cols);
          for (let r = this.y + 1; r < this.rows; r++) this.screen[r] = this.newRow();
        } else if (mode === 1) {
          for (let r = 0; r < this.y; r++) this.screen[r] = this.newRow();
          this.clearRow(this.y, 0, this.x + 1);
        }
        break;
      }
      case 'K': {
        const mode = n(0, 0);
        if (mode === 0) this.clearRow(this.y, this.x, this.cols);
        else if (mode === 1) this.clearRow(this.y, 0, this.x + 1);
        else this.clearRow(this.y, 0, this.cols);
        break;
      }
      case 'm': this.sgr(nums.map((v) => (Number.isNaN(v) ? 0 : v))); break;
      default: break;
    }
    this.pendingWrap = false;
  }

  clearRow(y, from, to) {
    for (let x = from; x < to && x < this.cols; x++) Object.assign(this.screen[y].cells[x], blank());
  }

  sgr(codes) {
    if (!codes.length) codes = [0];
    for (let i = 0; i < codes.length; i++) {
      const c = codes[i];
      if (c === 0) this.pen = blank();
      else if (c === 1) this.pen.bold = true;
      else if (c === 2) this.pen.dim = true;
      else if (c === 3) this.pen.italic = true;
      else if (c === 4) this.pen.underline = true;
      else if (c === 7) this.pen.inverse = true;
      else if (c === 22) { this.pen.bold = false; this.pen.dim = false; }
      else if (c === 23) this.pen.italic = false;
      else if (c === 24) this.pen.underline = false;
      else if (c === 27) this.pen.inverse = false;
      else if (c >= 30 && c <= 37) this.pen.fg = PALETTE[c - 30];
      else if (c >= 90 && c <= 97) this.pen.fg = PALETTE[c - 90 + 8];
      else if (c >= 40 && c <= 47) this.pen.bg = PALETTE[c - 40];
      else if (c >= 100 && c <= 107) this.pen.bg = PALETTE[c - 100 + 8];
      else if (c === 39) this.pen.fg = null;
      else if (c === 49) this.pen.bg = null;
      else if (c === 38 || c === 48) {
        const key = c === 38 ? 'fg' : 'bg';
        if (codes[i + 1] === 5) { this.pen[key] = xterm256(codes[i + 2]); i += 2; }
        else if (codes[i + 1] === 2) { this.pen[key] = `rgb(${codes[i + 2]},${codes[i + 3]},${codes[i + 4]})`; i += 4; }
      }
    }
  }

  // Everything that has been printed, scrollback first, trailing blank rows removed.
  rowsAll() {
    const all = [...this.scrollback, ...this.screen];
    while (all.length && all[all.length - 1].cells.every((c) => c.ch === ' ' && !c.bg)) all.pop();
    return all;
  }

  text() {
    return this.rowsAll().map((row) => row.cells.map((c) => c.ch).join('').replace(/\s+$/, '')).join('\n');
  }

  // Styles used: for reporting colour meaning.
  colours() {
    const used = {};
    for (const row of this.rowsAll()) for (const c of row.cells) if (c.ch.trim() && c.fg) used[c.fg] = (used[c.fg] || 0) + 1;
    return used;
  }

  html({ fg = '#c5c8c6', bg = '#141415', fontSize = 14, font = 'JetBrains Mono, SF Mono, Menlo, monospace' } = {}) {
    const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const lines = this.rowsAll().map((row) => {
      let out = '';
      let open = null;
      const flush = () => { if (open !== null) out += '</span>'; open = null; };
      for (const c of row.cells) {
        if (c.ch === '') continue;
        let f = c.fg || fg;
        let b = c.bg;
        if (c.inverse) [f, b] = [b || bg, f];
        const style = `${f !== fg ? `color:${f};` : ''}${b ? `background:${b};` : ''}${c.bold ? 'font-weight:700;' : ''}${c.dim ? 'opacity:.6;' : ''}${c.italic ? 'font-style:italic;' : ''}${c.underline ? 'text-decoration:underline;' : ''}`;
        if (style !== open) {
          flush();
          if (style) out += `<span style="${style}">`;
          open = style || null;
        }
        out += esc(c.ch);
      }
      flush();
      return out;
    });
    return `<!doctype html><meta charset="utf-8"><body style="margin:0;background:${bg}"><pre style="margin:0;padding:16px;color:${fg};background:${bg};font:${fontSize}px/1.3 ${font};white-space:pre;width:${this.cols}ch">${lines.join('\n')}</pre></body>`;
  }
}
