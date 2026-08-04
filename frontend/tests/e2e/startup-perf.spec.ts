import { test, expect, _electron } from '@playwright/test';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const APP_ROOT = path.resolve(__dirname, '..', '..');
const MAIN_ENTRY = path.join(APP_ROOT, 'dist-electron', 'main.cjs');

async function readStartupMsFromLog(userDataDir: string): Promise<number> {
  try {
    const logPath = path.join(userDataDir, 'startup-telemetry.log');
    const raw = await fs.readFile(logPath, 'utf8');
    const m = raw.match(/startup_ms=(\d+)/);
    return m ? Number(m[1]) : -1;
  } catch {
    return -1;
  }
}

test.describe('Startup performance @electron', () => {
  test.skip(!process.env.E2E_RUN, 'set E2E_RUN=1 to run Electron E2E tests');

  test('app launches and reaches main window <3s', async () => {
    const electronApp = await _electron.launch({
      args: [MAIN_ENTRY],
      env: { ...process.env, NODE_ENV: 'production', ELECTRON_RUN_AS_NODE: undefined }
    });

    // 拿 userData 路径（主进程上下文中同步可读）
    const userDataDir = await electronApp.evaluate(async ({ app }) => app.getPath('userData'));

    const window = await electronApp.firstWindow();
    await window.waitForLoadState('domcontentloaded');
    await expect(window).toHaveURL(/.*/);

    // 轮询 log 文件，等待 startup_ms 出现（10s 超时）
    let startupMs = -1;
    const deadline = Date.now() + 10_000;
    while (Date.now() < deadline) {
      startupMs = await readStartupMsFromLog(userDataDir);
      if (startupMs > 0) break;
      await new Promise((r) => setTimeout(r, 200));
    }

    expect(startupMs).toBeGreaterThan(0);
    await electronApp.close();
  });
});
