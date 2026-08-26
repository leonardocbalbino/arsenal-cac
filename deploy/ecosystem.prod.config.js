const fs = require('fs');
const path = require('path');

function loadEnvFile(file) {
  const out = {};
  if (!fs.existsSync(file)) return out;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

// deploy/secrets.env não vai pro git — criar uma vez na VPS com
// DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN (ver deploy/README.md).
const secrets = loadEnvFile(path.join(__dirname, 'secrets.env'));

module.exports = {
  apps: [
    {
      name: 'arsenal-cac-api-prod',
      script: 'dist/main.js',
      cwd: '/var/www/projetos/repo/arsenal-cac/prod/current/api',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        ...secrets,
        PORT: 3100,
      },
      max_memory_restart: '400M',
      wait_ready: false,
      listen_timeout: 10000,
      kill_timeout: 5000,
      time: true,
    },
    {
      name: 'arsenal-cac-web-prod',
      script: 'node_modules/.bin/next',
      args: 'start -p 3110',
      cwd: '/var/www/projetos/repo/arsenal-cac/prod/current/web',
      instances: 1,
      exec_mode: 'fork',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production',
        PORT: 3110,
      },
      max_memory_restart: '400M',
      wait_ready: false,
      listen_timeout: 10000,
      kill_timeout: 5000,
      time: true,
    },
  ],
};
