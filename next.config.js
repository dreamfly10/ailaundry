/** @type {import('next').NextConfig} */
// #region agent log
const fs = require('fs');
const path = require('path');
const http = require('http');
const logEndpoint = 'http://127.0.0.1:7242/ingest/4522d9df-bdad-4563-bb43-9ffb355963c3';
const logPath = path.join(process.cwd(), '.cursor', 'debug.log');

function log(level, message, data = {}) {
  const logEntry = {
    sessionId: 'debug-session',
    runId: 'startup',
    hypothesisId: 'H3',
    location: 'next.config.js',
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

try {
  log('INFO', 'next.config.js loaded', { cwd: process.cwd(), nodeEnv: process.env.NODE_ENV });
} catch (e) {}
// #endregion

const nextConfig = {
  reactStrictMode: true,
}

// #region agent log
try {
  log('INFO', 'next.config.js exported', { hasConfig: !!nextConfig });
} catch (e) {}
// #endregion

module.exports = nextConfig

