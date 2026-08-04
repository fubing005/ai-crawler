import { defineStore } from 'pinia';

export interface OnboardingState {
  privacyConsented: boolean;
  consentedAt: string | null;
  wizardVariant: 'minimal' | 'detailed' | null;
  currentStep: number;
  wizardCompleted: boolean;
  wizardSkipped: boolean;
  selectedFields: string[];
  sourceUrl: string | null;
  aiProvider: 'ollama' | 'cloud' | null;
}

const STORAGE_KEY = 'ai-crawler:onboarding';

const defaultState: OnboardingState = {
  privacyConsented: false,
  consentedAt: null,
  wizardVariant: null,
  currentStep: 1,
  wizardCompleted: false,
  wizardSkipped: false,
  selectedFields: [],
  sourceUrl: null,
  aiProvider: null
};

function loadFromLocalStorage(): OnboardingState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultState };
    const parsed = JSON.parse(raw);
    return { ...defaultState, ...parsed };
  } catch {
    return { ...defaultState };
  }
}

interface WizardProgressPayload {
  currentStep?: number;
  aiProvider?: 'ollama' | 'cloud' | null;
  sourceUrl?: string | null;
  wizardVariant?: 'minimal' | 'detailed' | null;
  selectedFields?: string[];
}

export const useOnboardingStore = defineStore('onboarding', {
  state: (): OnboardingState => ({ ...defaultState }),
  actions: {
    async loadInitial() {
      const persisted = loadFromLocalStorage();
      this.privacyConsented = persisted.privacyConsented;
      this.consentedAt = persisted.consentedAt;
      this.wizardSkipped = persisted.wizardSkipped;
      this.wizardCompleted = persisted.wizardCompleted;

      // 通过 IPC 同步 userData 中的 first-launch-flag.json 真实 consent 状态
      if (window.electronAPI?.isFirstLaunch) {
        try {
          const first = await window.electronAPI.isFirstLaunch();
          // isFirstLaunch=true 表示尚未同意；false 表示已同意
          if (first === false) {
            this.privacyConsented = true;
          } else if (first === true) {
            this.privacyConsented = false;
          }
          // null：IPC 失败，保留 localStorage 派生值
        } catch {
          // 静默
        }
      }

      if (window.electronAPI?.getWizardProgress) {
        try {
          const progress = (await window.electronAPI.getWizardProgress()) as WizardProgressPayload | null;
          if (progress) {
            if (typeof progress.currentStep === 'number') this.currentStep = progress.currentStep;
            if (progress.aiProvider) this.aiProvider = progress.aiProvider;
            if (typeof progress.sourceUrl === 'string') this.sourceUrl = progress.sourceUrl;
            if (progress.wizardVariant) this.wizardVariant = progress.wizardVariant;
            if (Array.isArray(progress.selectedFields)) this.selectedFields = progress.selectedFields;
          }
        } catch {
          // handler 失败返回 null 时静默
        }
      }
    },

    async acceptPrivacy() {
      this.privacyConsented = true;
      this.consentedAt = new Date().toISOString();
      this.persist();
      if (window.electronAPI?.acceptPrivacy) {
        try {
          await window.electronAPI.acceptPrivacy();
        } catch {
          // 静默 — localStorage 已落盘，IPC 失败下次启动会重试
        }
      }
    },

    declinePrivacy() {
      this.privacyConsented = false;
      this.consentedAt = null;
      this.persist();
    },

    setWizardVariant(variant: 'minimal' | 'detailed') {
      this.wizardVariant = variant;
      this.persist();
    },

    setCurrentStep(step: number) {
      this.currentStep = step;
      this.persistToDisk();
    },

    setAiProvider(provider: 'ollama' | 'cloud') {
      this.aiProvider = provider;
      this.persistToDisk();
    },

    setSourceUrl(url: string | null) {
      this.sourceUrl = url;
      this.persistToDisk();
    },

    setSelectedFields(fields: string[]) {
      this.selectedFields = fields;
      this.persistToDisk();
    },

    completeWizard() {
      this.wizardCompleted = true;
      this.persist();
      if (window.electronAPI?.saveWizardProgress) {
        window.electronAPI.saveWizardProgress({ wizardCompleted: true }).catch(() => null);
      }
    },

    skipWizard() {
      this.wizardSkipped = true;
      this.persist();
      if (window.electronAPI?.markWizardSkipped) {
        window.electronAPI.markWizardSkipped().catch(() => null);
      }
    },

    restartWizard() {
      this.wizardSkipped = false;
      this.wizardCompleted = false;
      this.currentStep = 1;
      this.persist();
    },

    persist() {
      const snapshot: OnboardingState = {
        privacyConsented: this.privacyConsented,
        consentedAt: this.consentedAt,
        wizardVariant: this.wizardVariant,
        currentStep: this.currentStep,
        wizardCompleted: this.wizardCompleted,
        wizardSkipped: this.wizardSkipped,
        selectedFields: this.selectedFields,
        sourceUrl: this.sourceUrl,
        aiProvider: this.aiProvider
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    },

    persistToDisk() {
      this.persist();
      if (window.electronAPI?.saveWizardProgress) {
        window.electronAPI
          .saveWizardProgress({
            currentStep: this.currentStep,
            wizardVariant: this.wizardVariant,
            aiProvider: this.aiProvider,
            sourceUrl: this.sourceUrl,
            selectedFields: this.selectedFields
          })
          .catch(() => null);
      }
    }
  }
});
