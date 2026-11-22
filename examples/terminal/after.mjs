// The same command, result first. Colour has one meaning each; nothing relies on colour alone.
const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code, s) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : s);
const bold = (s) => paint('1', s);
const dim = (s) => paint('2', s);
const green = (s) => paint('32', s);
const yellow = (s) => paint('33', s);
const width = process.stdout.columns || 80;

// Wrap detail text at the real width, indented, so nothing breaks mid-word.
function wrap(text, indent) {
  const lines = [];
  let line = '';
  for (const word of text.split(' ')) {
    if ((line + ' ' + word).trim().length + indent > width) {
      lines.push(line);
      line = word;
    } else line = (line + ' ' + word).trim();
  }
  if (line) lines.push(line);
  return lines.map((l) => ' '.repeat(indent) + l).join('\n');
}

const out = (s = '') => process.stdout.write(`${s}\n`);
out(`${green('✓')} ${bold('Deployed to staging')} ${dim('in 14.2s')}`);
out(dim(wrap('Built in 6.1s, 48 tests passed, uploaded 3 files', 2)));
out();
out(`${yellow('!')} API_URL is not set, using localhost:3000`);
out(dim(wrap('Set it with: deploymatic env set API_URL <url>', 2)));
out();
out(`  ${bold('https://staging.example.com/app-3f9a')}`);
