#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if we're in IDX environment (Nix-based)
const isIdxEnvironment = (process.env.TERM_PROGRAM === 'vscode' && process.env.SHELL?.includes('idx')) ||
                        fs.existsSync('/google/idx');

// Check if we're in Vercel environment
const isVercelEnvironment = process.env.VERCEL === '1' ||
                           process.env.VERCEL_ENV ||
                           process.env.NOW_BUILDER;

console.log('Build environment detection:');
console.log('- IDX environment:', isIdxEnvironment);
console.log('- Vercel environment:', isVercelEnvironment);

const nextDir = path.join(__dirname, '..', '.next');
try {
  if (fs.existsSync(nextDir)) {
    fs.rmSync(nextDir, { recursive: true, force: true });
  }
} catch {}

try {
  if (isIdxEnvironment && !isVercelEnvironment) {
    // IDX environment - use nix-shell with OpenSSL
    console.log('Using IDX build configuration with nix-shell...');
    execSync('nix-shell -p openssl.dev --run "export LD_LIBRARY_PATH=/nix/store/3dxy700bd43x9zh8n2klpygrj37yy67q-openssl-3.0.14/lib:$LD_LIBRARY_PATH && prisma generate && next build"', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
  } else {
    // Standard environment (Vercel, local Linux/Mac, etc.)
    console.log('Using standard build configuration...');
    execSync('prisma generate && next build', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
  }

  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}