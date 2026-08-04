import { describe, it, expect, vi, beforeEach } from 'vitest';

const { execMock } = vi.hoisted(() => ({
  execMock: vi.fn()
}));

vi.mock('node:child_process', () => ({
  execSync: execMock,
  default: { execSync: execMock }
}));

import {
  checkDependencies,
  detectPython,
  detectNode,
  buildInstallArgs,
  getDownloadUrl,
  formatMissingMessage,
  installRuntime
} from '@electron/services/dependency-checker';

describe('dependency-checker', () => {
  beforeEach(() => {
    execMock.mockReset();
  });

  describe('detectPython', () => {
    it('returns installed=true when python --version succeeds', () => {
      execMock.mockReturnValueOnce('Python 3.12.7\n');
      const r = detectPython();
      expect(r.installed).toBe(true);
      expect(r.version).toContain('Python 3.12.7');
    });

    it('falls back to python3 command when python missing', () => {
      execMock
        .mockImplementationOnce(() => { throw new Error('not found'); })
        .mockReturnValueOnce('Python 3.11.6\n');
      const r = detectPython();
      expect(r.installed).toBe(true);
      expect(r.version).toContain('Python 3.11.6');
    });

    it('returns installed=false when both python and python3 missing', () => {
      execMock.mockImplementation(() => { throw new Error('not found'); });
      const r = detectPython();
      expect(r.installed).toBe(false);
      expect(r.version).toBeNull();
    });
  });

  describe('detectNode', () => {
    it('returns installed=true when node --version succeeds', () => {
      execMock.mockReturnValueOnce('v20.18.0\n');
      const r = detectNode();
      expect(r.installed).toBe(true);
      expect(r.version).toContain('v20.18.0');
    });

    it('returns installed=false when node missing', () => {
      execMock.mockImplementation(() => { throw new Error('not found'); });
      const r = detectNode();
      expect(r.installed).toBe(false);
    });
  });

  describe('checkDependencies', () => {
    it('allInstalled=true when both detected', () => {
      execMock
        .mockReturnValueOnce('Python 3.12.0')
        .mockReturnValueOnce('v20.18.0');
      const r = checkDependencies();
      expect(r.allInstalled).toBe(true);
    });

    it('allInstalled=false when Python missing', () => {
      execMock
        .mockImplementation(() => { throw new Error('not found'); })
        .mockReturnValueOnce('v20.18.0');
      const r = checkDependencies();
      expect(r.allInstalled).toBe(false);
    });
  });

  describe('getDownloadUrl', () => {
    it('returns a non-empty URL for python on win32', () => {
      const url = getDownloadUrl('python');
      expect(typeof url).toBe('string');
      expect(url).toContain('python.org');
    });

    it('returns a non-empty URL for node on win32', () => {
      const url = getDownloadUrl('node');
      expect(url).toContain('nodejs.org');
    });
  });

  describe('buildInstallArgs', () => {
    it('returns Windows silent args for python', () => {
      const args = buildInstallArgs('python', 'C:\\temp\\py.exe');
      expect(args).toEqual(['/quiet', 'InstallAllUsers=0', 'PrependPath=1', 'Include_test=0']);
    });

    it('returns msiexec args for node .msi installer', () => {
      const args = buildInstallArgs('node', 'C:\\temp\\node.msi');
      expect(args).toEqual(['/i', 'C:\\temp\\node.msi', '/qn', 'ADDLOCAL=ALL']);
    });

    it('returns /S for node .exe installer on Windows', () => {
      const args = buildInstallArgs('node', 'C:\\temp\\node.exe');
      expect(args).toEqual(['/S']);
    });
  });

  describe('formatMissingMessage', () => {
    it('returns empty when no missing', () => {
      expect(formatMissingMessage([])).toBe('');
    });

    it('lists Python when missing', () => {
      const msg = formatMissingMessage(['python']);
      expect(msg).toContain('Python 3.10+');
    });

    it('lists both when both missing', () => {
      const msg = formatMissingMessage(['python', 'node']);
      expect(msg).toContain('Python 3.10+');
      expect(msg).toContain('Node.js 18+');
    });
  });

  describe('installRuntime', () => {
    it('returns failure when no installer path and no url', async () => {
      const r = await installRuntime({ kind: 'python' });
      expect(r.ok).toBe(false);
      expect(r.message).toContain('未提供安装包路径');
    });

    it('returns failure when installerPath missing', async () => {
      const r = await installRuntime({ kind: 'python', downloadUrl: 'https://x' });
      expect(r.ok).toBe(false);
      expect(r.message).toContain('未提供安装包路径');
    });
  });
});
