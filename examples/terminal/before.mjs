// A deploy command that prints the way a model usually writes one.
const c = (n, s) => `\x1b[${n}m${s}\x1b[0m`;
const out = (s) => process.stdout.write(`${s}\n`);
out(c(35, '╔══════════════════════════════════════════════╗'));
out(c(35, '║') + c(1 + ';36', '   🚀 WELCOME TO DEPLOYMATIC v2.0 🚀   ') + c(35, '     ║'));
out(c(35, '╚══════════════════════════════════════════════╝'));
out(c(33, '⏳ Starting deployment process, please wait while we get everything ready for you...'));
out(c(34, '📦 Building project...') + c(32, ' DONE!!'));
out(c(36, '🔍 Running tests...') + c(32, ' ALL PASSED!!!'));
out(c(31, '⚠️  WARNING: ') + c(33, 'Environment variable API_URL is not set, using default value http://localhost:3000 which may not be what you want'));
out(c(35, '☁️  Uploading to server...') + c(32, ' SUCCESS!'));
out(c(1 + ';32', '🎉🎉🎉 Deployment completed successfully!!! 🎉🎉🎉'));
out(c(36, '🌐 Your app is live at: ') + c(4 + ';34', 'https://staging.example.com/app-3f9a'));
