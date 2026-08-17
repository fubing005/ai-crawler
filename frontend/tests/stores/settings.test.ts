import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { createApp, type App } from 'vue';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { useSettingsStore } from '@/stores/settings';

async function waitForPersist(key: string, maxMs = 200): Promise<string | null> {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const raw = localStorage.getItem(key);
    if (raw !== null) return raw;
    await new Promise((r) => setTimeout(r, 5));
  }
  return localStorage.getItem(key);
}

describe('useSettingsStore', () => {
  let app: App | null = null;

  beforeEach(() => {
    localStorage.clear();
    const pinia = createPinia();
    pinia.use(piniaPluginPersistedstate);
    app = createApp({});
    app.use(pinia);
    setActivePinia(pinia);
  });

  afterEach(() => {
    app?.unmount();
    app = null;
  });

  it('defaults to light theme / zh-CN / enabled+onFailure', () => {
    const store = useSettingsStore();
    expect(store.themePreference).toBe('light');
    expect(store.languagePreference).toBe('zh-CN');
    expect(store.notificationPreference).toEqual({
      enabled: true,
      onComplete: false,
      onFailure: true
    });
  });

  it('setTheme updates themePreference', () => {
    const store = useSettingsStore();
    store.setTheme('dark');
    expect(store.themePreference).toBe('dark');
  });

  it('setTheme falls back to light on invalid value', () => {
    const store = useSettingsStore();
    store.setTheme('invalid' as unknown as 'light');
    expect(store.themePreference).toBe('light');
  });

  it('setLanguage updates languagePreference', () => {
    const store = useSettingsStore();
    store.setLanguage('en');
    expect(store.languagePreference).toBe('en');
  });

  it('setLanguage falls back to zh-CN on invalid value', () => {
    const store = useSettingsStore();
    store.setLanguage('fr' as unknown as 'zh-CN');
    expect(store.languagePreference).toBe('zh-CN');
  });

  it('setNotificationPreference merges shallowly preserving other fields', () => {
    const store = useSettingsStore();
    store.setNotificationPreference({ onComplete: true });
    expect(store.notificationPreference).toEqual({
      enabled: true,
      onComplete: true,
      onFailure: true
    });
  });

  it('resetToDefaults restores all three fields', () => {
    const store = useSettingsStore();
    store.setTheme('dark');
    store.setLanguage('en');
    store.setNotificationPreference({ enabled: false, onComplete: true, onFailure: false });
    store.resetToDefaults();
    expect(store.themePreference).toBe('light');
    expect(store.languagePreference).toBe('zh-CN');
    expect(store.notificationPreference).toEqual({
      enabled: true,
      onComplete: false,
      onFailure: true
    });
  });

  it('persists themePreference to localStorage after setTheme', async () => {
    const store = useSettingsStore();
    store.setTheme('dark');
    const raw = await waitForPersist('ai-crawler:settings-preferences');
    expect(raw).not.toBeNull();
    expect(raw!).toContain('"themePreference":"dark"');
  });

  it('restores from localStorage when store initializes', async () => {
    localStorage.setItem(
      'ai-crawler:settings-preferences',
      JSON.stringify({
        themePreference: 'dark',
        languagePreference: 'zh-CN',
        notificationPreference: { enabled: false, onComplete: true, onFailure: false }
      })
    );
    const store = useSettingsStore();
    expect(store.themePreference).toBe('dark');
    expect(store.notificationPreference).toEqual({
      enabled: false,
      onComplete: true,
      onFailure: false
    });
  });

  it('defends against corrupted persisted themePreference value', async () => {
    localStorage.setItem(
      'ai-crawler:settings-preferences',
      JSON.stringify({
        themePreference: 'purple',
        languagePreference: 'zh-CN',
        notificationPreference: { enabled: true, onComplete: false, onFailure: true }
      })
    );
    const store = useSettingsStore();
    // afterHydrate 归一化：腐蚀值在 hydrate 后立即兜底为 'light'，无需 setTheme 触发
    expect(store.themePreference).toBe('light');
  });

  it('defends against corrupted persisted languagePreference value', async () => {
    localStorage.setItem(
      'ai-crawler:settings-preferences',
      JSON.stringify({
        themePreference: 'light',
        languagePreference: 'fr',
        notificationPreference: { enabled: true, onComplete: false, onFailure: true }
      })
    );
    const store = useSettingsStore();
    expect(store.languagePreference).toBe('zh-CN');
  });
});
