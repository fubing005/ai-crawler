import { execSync } from 'node:child_process';
import { platform } from 'node:os';

export type RuntimeKind = 'python' | 'node';

export interface DetectionResult {
  name: RuntimeKind;
  installed: boolean;
  version: string | null;
  rawError?: string;
}

const PYTHON_COMMANDS = ['python', 'python3'];
const NODE_COMMANDS = ['node'];

function safeExec(commands: string[], versionFlag: string): { version: string | null; error?: string } {
  for (const cmd of commands) {
    try {
      const output = execSync(`"${cmd}" ${versionFlag}`, {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
        timeout: 5000
      });
      if (typeof output !== 'string' || !output.trim()) {
        continue;
      }
      return { version: output.trim() };
    } catch {
      continue;
    }
  }
  return { version: null, error: 'command not found' };
}

// Python `--version` 输出形如 "Python 3.12.7"；解析主次版本号，要求 ≥ 3.10
function pythonVersionOk(raw: string | null): boolean {
  if (!raw) return false;
  const m = raw.match(/Python\s+(\d+)\.(\d+)/i);
  if (!m) return false;
  const major = Number(m[1]);
  const minor = Number(m[2]);
  return major > 3 || (major === 3 && minor >= 10);
}

// Node `--version` 输出形如 "v20.18.0"；解析主版本，要求 ≥ 18
function nodeVersionOk(raw: string | null): boolean {
  if (!raw) return false;
  const m = raw.match(/v?(\d+)/);
  if (!m) return false;
  return Number(m[1]) >= 18;
}

export function detectPython(): DetectionResult {
  const { version, error } = safeExec(PYTHON_COMMANDS, '--version');
  return { name: 'python', installed: pythonVersionOk(version), version, rawError: error };
}

export function detectNode(): DetectionResult {
  const { version, error } = safeExec(NODE_COMMANDS, '--version');
  return { name: 'node', installed: nodeVersionOk(version), version, rawError: error };
}

export interface DependencyCheckReport {
  python: DetectionResult;
  node: DetectionResult;
  allInstalled: boolean;
}

export function checkDependencies(): DependencyCheckReport {
  const python = detectPython();
  const node = detectNode();
  return {
    python,
    node,
    allInstalled: python.installed && node.installed
  };
}

export interface InstallOptions {
  kind: 'python' | 'node';
  downloadUrl?: string;
  installerPath?: string;
  onProgress?: (percent: number, message: string) => void;
}

export interface InstallResult {
  ok: boolean;
  message: string;
  installerPath?: string;
}

const PYTHON_DOWNLOAD_URLS: Record<string, string> = {
  win32: 'https://www.python.org/ftp/python/3.12.7/python-3.12.7-amd64.exe',
  darwin: 'https://www.python.org/ftp/python/3.12.7/python-3.12.7-macos11.pkg',
  linux: ''
};

const NODE_DOWNLOAD_URLS: Record<string, string> = {
  win32: 'https://nodejs.org/dist/v20.18.0/node-v20.18.0-x64.msi',
  darwin: 'https://nodejs.org/dist/v20.18.0/node-v20.18.0.pkg',
  linux: ''
};

export function getDownloadUrl(kind: RuntimeKind): string {
  const currentPlatform = platform();
  if (kind === 'python') {
    return PYTHON_DOWNLOAD_URLS[currentPlatform] ?? '';
  }
  return NODE_DOWNLOAD_URLS[currentPlatform] ?? '';
}

export function buildInstallArgs(kind: RuntimeKind, installerPath: string): string[] {
  if (kind === 'python') {
    if (process.platform === 'win32') {
      return ['/quiet', 'InstallAllUsers=0', 'PrependPath=1', 'Include_test=0'];
    }
    return [];
  }
  // node
  if (process.platform === 'win32') {
    if (installerPath.toLowerCase().endsWith('.msi')) {
      return ['/i', installerPath, '/qn', 'ADDLOCAL=ALL'];
    }
    return ['/S'];
  }
  return [];
}

export async function installRuntime(options: InstallOptions): Promise<InstallResult> {
  const { kind, onProgress } = options;
  onProgress?.(5, '正在准备下载…');

  const url = options.downloadUrl ?? getDownloadUrl(kind);
  if (!url) {
    return { ok: false, message: '当前平台无可用下载地址，请前往官网手动安装。' };
  }

  // macOS / Linux：本 story 仅做检测与引导，不实施自动安装（涉及 sudo / 包管理器差异）
  if (process.platform !== 'win32') {
    return {
      ok: false,
      message: '当前平台不支持一键安装，请点击"手动安装"打开浏览器前往官方下载页。'
    };
  }

  onProgress?.(15, '正在获取安装包…');

  const installerPath = options.installerPath ?? '';
  if (!installerPath) {
    return { ok: false, message: '未提供安装包路径，请先下载到本地再调用安装。' };
  }

  const args = buildInstallArgs(kind, installerPath);
  onProgress?.(70, '正在执行安装命令…');

  try {
    if (kind === 'node' && installerPath.toLowerCase().endsWith('.msi')) {
      execSync(`msiexec ${args.join(' ')}`, { stdio: 'inherit', timeout: 120_000 });
    } else {
      execSync(`"${installerPath}" ${args.join(' ')}`, { stdio: 'inherit', timeout: 120_000 });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, message, installerPath };
  }

  onProgress?.(100, '安装完成。');
  return { ok: true, message: '安装完成', installerPath };
}

export function formatMissingMessage(missing: RuntimeKind[]): string {
  if (missing.length === 0) return '';
  const names = missing.map((m) => (m === 'python' ? 'Python 3.10+' : 'Node.js 18+')).join('、');
  return `没找到 ${names}，需要它才能开始爬取。点这里一键安装（约 30 秒）。`;
}
