// Tiny argument parser: positional values and --flag, --key value, --key=value.
export function parseArgs(argv, { booleans = [] } = {}) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      positional.push(arg);
      continue;
    }
    const [rawKey, inline] = arg.slice(2).split('=');
    if (inline !== undefined) flags[rawKey] = inline;
    else if (booleans.includes(rawKey) || i + 1 >= argv.length || argv[i + 1].startsWith('--')) flags[rawKey] = true;
    else flags[rawKey] = argv[++i];
  }
  return { positional, flags };
}

// True when the file is run directly (works with spaces in the path).
export function isMain(metaUrl) {
  return process.argv[1] && new URL(metaUrl).pathname === new URL(`file://${encodeURI(process.argv[1])}`).pathname;
}
