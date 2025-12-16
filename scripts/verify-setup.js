const fs = require('fs');
const path = require('path');
const http = require('http');

const logEndpoint = 'http://127.0.0.1:7242/ingest/4522d9df-bdad-4563-bb43-9ffb355963c3';
const logPath = path.join(__dirname, '..', '.cursor', 'debug.log');

function log(level, message, data = {}) {
  const logEntry = {
    sessionId: 'debug-session',
    runId: 'verify-setup',
    hypothesisId: 'H1',
    location: 'scripts/verify-setup.js',
    message: `${level}: ${message}`,
    data,
    timestamp: Date.now()
  };
  try {
    const logDir = path.dirname(logPath);
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');
    const url = new URL(logEndpoint);
    const req = http.request({ hostname: url.hostname, port: url.port, path: url.pathname, method: 'POST', headers: { 'Content-Type': 'application/json' } }, () => {}).on('error', () => {});
    req.write(JSON.stringify(logEntry));
    req.end();
  } catch (e) {}
}

const rootDir = path.join(__dirname, '..');
const nodeModulesPath = path.join(rootDir, 'node_modules');
const packageJsonPath = path.join(rootDir, 'package.json');
const envLocalPath = path.join(rootDir, '.env.local');
const nextPath = path.join(nodeModulesPath, 'next');

log('CHECK', 'Verifying setup requirements', { rootDir });

const hasNodeModules = fs.existsSync(nodeModulesPath);
const hasPackageJson = fs.existsSync(packageJsonPath);
const hasEnvLocal = fs.existsSync(envLocalPath);
const hasNext = fs.existsSync(nextPath);

log('RESULT', 'Setup verification complete', {
  hasNodeModules,
  hasPackageJson,
  hasEnvLocal,
  hasNext,
  readyToStart: hasNodeModules && hasPackageJson && hasNext
});

if (!hasNodeModules) {
  console.log('❌ node_modules not found. Run: npm install');
  process.exit(1);
}
if (!hasNext) {
  console.log('❌ Next.js not installed. Run: npm install');
  process.exit(1);
}
if (!hasEnvLocal) {
  console.log('⚠️  .env.local not found. Server may fail without environment variables.');
}

console.log('✅ Setup verification passed. You can run: npm run dev');

