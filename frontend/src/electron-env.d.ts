export {};

declare global {
  interface Window {
    electronAPI?: {
      reportStartupTime: (ms: number) => void;
      isFirstLaunch: () => Promise<boolean | null>;
      getWizardProgress: () => Promise<Record<string, unknown> | null>;
      saveWizardProgress: (progress: Record<string, unknown>) => Promise<boolean | null>;
      markWizardSkipped: () => Promise<boolean | null>;
      acceptPrivacy: () => Promise<boolean | null>;
    };
  }
}
