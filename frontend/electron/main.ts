import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import log from 'electron-log';
import {
  checkDependencies,
  formatMissingMessage,
  installRuntime,
  getDownloadUrl,
  type RuntimeKind,
  type InstallResult
} from './services/dependency-checker';

log.transports.file.level = 'info';
log.transports.file.resolvePathFn = () => path.join(app.getPath('userData'), 'startup-telemetry.log');

let mainWindow: BrowserWindow | null = null;
let splashWindow: BrowserWindow | null = null;
let T0 = 0;

async function ensureUserDataFiles(): Promise<void> {
  const userData = app.getPath('userData');
  await fs.mkdir(userData, { recursive: true });
}

async function readFirstLaunchFlag(): Promise<Record<string, unknown> | null> {
  try {
    const filePath = path.join(app.getPath('userData'), 'first-launch-flag.json');
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function writeFirstLaunchFlag(data: Record<string, unknown>): Promise<void> {
  const filePath = path.join(app.getPath('userData'), 'first-launch-flag.json');
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

async function readWizardProgress(): Promise<Record<string, unknown> | null> {
  try {
    const filePath = path.join(app.getPath('userData'), 'wizard-progress.json');
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function writeWizardProgress(data: Record<string, unknown>): Promise<void> {
  const filePath = path.join(app.getPath('userData'), 'wizard-progress.json');
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 480,
    height: 320,
    frame: false,
    transparent: true,
    alwaysOnTop: false,
    resizable: false,
    show: true,
    skipTaskbar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true
    }
  });
  splashWindow.loadFile(path.join(__dirname, '..', 'splash.html'));
  splashWindow.on('closed', () => {
    splashWindow = null;
  });
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    show: false,
    backgroundColor: '#F9FAFB',
    title: 'AI 爬虫',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  // 先注册 did-finish-load 再触发加载，避免竞态
  mainWindow.webContents.once('did-finish-load', () => {
    if (splashWindow) {
      splashWindow.close();
      splashWindow = null;
    }
    if (mainWindow && !mainWindow.isVisible()) {
      mainWindow.show();
    }
  });

  const devUrl = process.env['ELECTRON_RENDERER_URL'];
  if (devUrl) {
    mainWindow.loadURL(devUrl);
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist-renderer', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

async function runDependencyCheck(showDialog = false): Promise<void> {
  const report = checkDependencies();
  if (report.allInstalled) return;

  const missing: RuntimeKind[] = [];
  if (!report.python.installed) missing.push('python');
  if (!report.node.installed) missing.push('node');
  const message = formatMissingMessage(missing);

  if (!showDialog) return;

  const result = await dialog.showMessageBox({
    type: 'warning',
    title: '需要先准备',
    message: message,
    buttons: ['一键安装', '跳过依赖，直接进入应用', '手动安装（打开浏览器）'],
    defaultId: 0,
    cancelId: 1
  });

  if (result.response === 0) {
    // 一键安装
    const { shell } = await import('electron');
    const failures: string[] = [];
    for (const kind of missing) {
      const progressWindow = new BrowserWindow({
        width: 420,
        height: 220,
        frame: false,
        resizable: false,
        show: true,
        webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true }
      });
      try {
        const url = getDownloadUrl(kind);
        const res: InstallResult = await installRuntime({
          kind,
          downloadUrl: url,
          onProgress: (p, msg) => {
            log.info(`install ${kind} ${p}% ${msg}`);
          }
        });
        if (!res.ok) {
          failures.push(`${kind}: ${res.message}`);
          log.error(`install ${kind} failed:`, res.message);
        }
      } finally {
        progressWindow.close();
      }
    }
    if (failures.length > 0) {
      await dialog.showMessageBox({
        type: 'error',
        title: '安装失败',
        message: '部分依赖安装失败，已记录日志。可改用手动安装。',
        detail: failures.join('\n'),
        buttons: ['打开手动安装页', '退出']
      }).then((r) => {
        if (r.response === 0) {
          for (const kind of missing) {
            if (kind === 'python') shell.openExternal('https://www.python.org/downloads/');
            else shell.openExternal('https://nodejs.org/');
          }
        }
      });
      return;
    }
    app.relaunch();
    app.exit(0);
  } else if (result.response === 2) {
    // 手动安装：打开浏览器 — python 与 node 同时缺失时打开两个
    const { shell } = await import('electron');
    if (missing.includes('python')) shell.openExternal('https://www.python.org/downloads/');
    if (missing.includes('node')) shell.openExternal('https://nodejs.org/');
  }
  // option 1: 跳过 — 继续启动
}

app.whenReady().then(async () => {
  T0 = process.uptime();
  await ensureUserDataFiles();
  createSplashWindow();

  // Task 7: 启动序列不强制依赖远端服务连通性
  await runDependencyCheck(false).catch((err) => {
    log.warn('dependency check failed:', err);
  });

  createMainWindow();
}).catch((err) => {
  log.error('app.whenReady failed:', err);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

// IPC handlers
ipcMain.on('startup:report', (_event, ms: number) => {
  try {
    if (ms < 0) {
      // PrivacyConsent 拒绝 — 退出应用
      log.info('privacy denied, exiting');
      app.quit();
      return;
    }
    // 跨进程合成：T0 为 main 进程 uptime（秒），收到 IPC 时再取一次 uptime，差值即启动时长
    const startupMs = Math.max(0, Math.round((process.uptime() - T0) * 1000));
    log.info(`startup_ms=${startupMs} processor=T0:${T0.toFixed(4)}`);
  } catch (err) {
    log.warn('startup:report failed', err);
  }
});

ipcMain.handle('app:isFirstLaunch', async () => {
  try {
    const flag = await readFirstLaunchFlag();
    if (flag === null) return true;
    return flag.consent !== true;
  } catch {
    return null;
  }
});

ipcMain.handle('wizard:getProgress', async () => {
  try {
    return await readWizardProgress();
  } catch {
    return null;
  }
});

ipcMain.handle('wizard:saveProgress', async (_event, progress: Record<string, unknown>) => {
  try {
    await writeWizardProgress(progress);
    return true;
  } catch {
    return false;
  }
});

ipcMain.handle('wizard:markSkipped', async () => {
  try {
    const flag = (await readFirstLaunchFlag()) ?? {};
    await writeFirstLaunchFlag({ ...flag, wizardSkipped: true });
    return true;
  } catch {
    return false;
  }
});

ipcMain.handle('app:acceptPrivacy', async () => {
  try {
    const flag = (await readFirstLaunchFlag()) ?? {};
    await writeFirstLaunchFlag({
      ...flag,
      consent: true,
      acceptedAt: new Date().toISOString()
    });
    return true;
  } catch {
    return false;
  }
});
