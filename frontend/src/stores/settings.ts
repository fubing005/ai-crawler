import { defineStore } from 'pinia';
import { ref } from 'vue';

export type ThemePreference = 'light' | 'dark';
export type LanguagePreference = 'zh-CN' | 'en';

export interface NotificationPreference {
  enabled: boolean;
  onComplete: boolean;
  onFailure: boolean;
}

const DEFAULT_THEME: ThemePreference = 'light';
const DEFAULT_LANGUAGE: LanguagePreference = 'zh-CN';
const DEFAULT_NOTIFICATION: NotificationPreference = {
  enabled: true,
  onComplete: false,
  onFailure: true
};

function normalizeTheme(value: unknown): ThemePreference {
  return value === 'dark' ? 'dark' : 'light';
}

function normalizeLanguage(value: unknown): LanguagePreference {
  return value === 'en' ? 'en' : 'zh-CN';
}

export const useSettingsStore = defineStore(
  'settings',
  () => {
    const themePreference = ref<ThemePreference>(DEFAULT_THEME);
    const languagePreference = ref<LanguagePreference>(DEFAULT_LANGUAGE);
    const notificationPreference = ref<NotificationPreference>({ ...DEFAULT_NOTIFICATION });

    function setTheme(value: ThemePreference) {
      themePreference.value = normalizeTheme(value);
    }

    function setLanguage(value: LanguagePreference) {
      languagePreference.value = normalizeLanguage(value);
    }

    function setNotificationPreference(partial: Partial<NotificationPreference>) {
      notificationPreference.value = { ...notificationPreference.value, ...partial };
    }

    function resetToDefaults() {
      themePreference.value = DEFAULT_THEME;
      languagePreference.value = DEFAULT_LANGUAGE;
      notificationPreference.value = { ...DEFAULT_NOTIFICATION };
    }

    return {
      themePreference,
      languagePreference,
      notificationPreference,
      setTheme,
      setLanguage,
      setNotificationPreference,
      resetToDefaults
    };
  },
  {
    persist: {
      key: 'ai-crawler:settings-preferences',
      storage: localStorage,
      pick: ['themePreference', 'languagePreference', 'notificationPreference'],
      afterRestore: (ctx) => {
        ctx.store.themePreference = normalizeTheme(ctx.store.themePreference);
        ctx.store.languagePreference = normalizeLanguage(ctx.store.languagePreference);
      }
    }
  }
);
