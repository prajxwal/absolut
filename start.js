/**
 * Stealth launcher — copies the Electron binary to a disguised name
 * and patches its PE metadata so Task Manager shows "Runtime" instead
 * of "Electron".
 *
 * Usage:  node start.js
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { rcedit } = require('rcedit');

const DISGUISED_NAME = 'Runtime.exe';
const electronDir = path.join(__dirname, 'node_modules', 'electron', 'dist');
const src = path.join(electronDir, 'electron.exe');
const dst = path.join(electronDir, DISGUISED_NAME);

async function main() {
  // Copy the binary if it doesn't already exist (or is outdated)
  try {
    const srcStat = fs.statSync(src);
    let needsCopy = true;
    try {
      const dstStat = fs.statSync(dst);
      needsCopy = srcStat.mtimeMs > dstStat.mtimeMs;
    } catch {
      // dst doesn't exist yet
    }
    if (needsCopy) {
      console.log('[stealth] copying electron.exe -> ' + DISGUISED_NAME);
      fs.copyFileSync(src, dst);

      // Patch PE version-info so Task Manager shows "Runtime"
      console.log('[stealth] patching exe metadata...');
      await rcedit(dst, {
        'version-string': {
          FileDescription: 'Runtime',
          ProductName: 'Runtime',
          InternalName: 'Runtime',
          OriginalFilename: DISGUISED_NAME,
          CompanyName: 'Microsoft Corporation'
        },
        'product-version': '10.0.0',
        'file-version': '10.0.0'
      });
      console.log('[stealth] done');
    }
  } catch (e) {
    console.error('[stealth] failed:', e.message);
    process.exit(1);
  }

  // Launch the disguised binary pointing at the current directory (the app)
  const child = spawn(dst, ['.'], {
    cwd: __dirname,
    detached: true,
    stdio: 'ignore',
    windowsHide: true
  });

  child.unref();
}

main();
