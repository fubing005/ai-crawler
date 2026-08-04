import { contextBridge, ipcRenderer } from 'electron';

const api = {
  reportStartupTime: (ms: number) => {
    try {
      ipcRenderer.send('startup:report', ms);
    } catch {
      // 静默
    }
  },
  isFirstLaunch: (): Promise<boolean | null> =>
    ipcRenderer.invoke('app:isFirstLaunch').catch(() => null),
  getWizardProgress: (): Promise<Record<string, unknown> | null> =>
    ipcRenderer.invoke('wizard:getProgress').catch(() => null),
  saveWizardProgress: (progress: Record<string, unknown>): Promise<boolean | null> =>
    ipcRenderer.invoke('wizard:saveProgress', progress).catch(() => null),
  markWizardSkipped: (): Promise<boolean | null> =>
    ipcRenderer.invoke('wizard:markSkipped').catch(() => null),
  acceptPrivacy: (): Promise<boolean | null> =>
    ipcRenderer.invoke('app:acceptPrivacy').catch(() => null)
};

contextBridge.exposeInMainWorld('electronAPI', api);

export type ElectronApi = typeof api;
