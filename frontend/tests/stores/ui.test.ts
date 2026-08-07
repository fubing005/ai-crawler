import { describe, it, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { useUiStore } from '@/stores/ui';

describe('useUiStore', () => {
  beforeEach(() => {
    localStorage.clear();
    const pinia = createPinia();
    pinia.use(piniaPluginPersistedstate);
    setActivePinia(pinia);
  });

  it('defaults to simple view preference', () => {
    const store = useUiStore();
    expect(store.viewPreference).toBe('simple');
  });

  it('persists setViewPreference to localStorage', () => {
    const store = useUiStore();
    store.setViewPreference('dashboard');
    expect(store.viewPreference).toBe('dashboard');
    const raw = localStorage.getItem('ai-crawler:view-preference');
    expect(raw).toContain('dashboard');
  });
});
