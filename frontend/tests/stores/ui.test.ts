import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { createApp, type App } from 'vue';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { useUiStore } from '@/stores/ui';

async function waitForPersist(key: string, maxMs = 200): Promise<string | null> {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const raw = localStorage.getItem(key);
    if (raw !== null) return raw;
    await new Promise((r) => setTimeout(r, 5));
  }
  return localStorage.getItem(key);
}

describe('useUiStore', () => {
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

  it('defaults to simple view preference', () => {
    const store = useUiStore();
    expect(store.viewPreference).toBe('simple');
  });

  it('persists setViewPreference to localStorage', async () => {
    const store = useUiStore();
    store.setViewPreference('dashboard');
    expect(store.viewPreference).toBe('dashboard');
    const raw = await waitForPersist('ai-crawler:view-preference');
    expect(raw).toContain('dashboard');
  });
});
