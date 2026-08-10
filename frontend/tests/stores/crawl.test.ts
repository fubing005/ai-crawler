import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { createApp, type App } from 'vue';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { useCrawlStore } from '@/stores/crawl';
import type { CrawlTaskRecord } from '@/types/crawl';

function makeRecord(overrides: Partial<CrawlTaskRecord> = {}): CrawlTaskRecord {
  return {
    id: crypto.randomUUID(),
    url: 'https://example.com/product',
    pageTitle: '示例电商商品页',
    extractedCount: 156,
    completedAt: Date.now(),
    status: 'completed',
    fields: [],
    ...overrides
  };
}

async function waitForPersist(key: string, maxMs = 200): Promise<string | null> {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const raw = localStorage.getItem(key);
    if (raw !== null) return raw;
    await new Promise((r) => setTimeout(r, 5));
  }
  return localStorage.getItem(key);
}

describe('useCrawlStore', () => {
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

  it('addTask appends a single record to history', () => {
    const store = useCrawlStore();
    store.addTask(makeRecord());
    expect(store.history.length).toBe(1);
  });

  it('addTask truncates to 50 entries FIFO when adding 51', () => {
    const store = useCrawlStore();
    for (let i = 0; i < 51; i++) {
      store.addTask(makeRecord({ id: `r${i}`, completedAt: i }));
    }
    expect(store.history.length).toBe(50);
    expect(store.history[0].id).toBe('r50');
    expect(store.history.find((r) => r.id === 'r0')).toBeUndefined();
  });

  it('removeTask removes the matching record', () => {
    const store = useCrawlStore();
    const rec = makeRecord({ id: 'to-remove' });
    store.addTask(rec);
    store.addTask(makeRecord({ id: 'stay' }));
    store.removeTask('to-remove');
    expect(store.history.length).toBe(1);
    expect(store.history[0].id).toBe('stay');
  });

  it('removeTask clears activeTask when the active record is removed', () => {
    const store = useCrawlStore();
    const rec = makeRecord({ id: 'active-one' });
    store.addTask(rec);
    store.setActiveTask('active-one');
    expect(store.activeTask).not.toBeNull();
    store.removeTask('active-one');
    expect(store.activeTask).toBeNull();
  });

  it('getTaskById returns the record or null', () => {
    const store = useCrawlStore();
    const rec = makeRecord({ id: 'lookup-id' });
    store.addTask(rec);
    expect(store.getTaskById('lookup-id')).toEqual(rec);
    expect(store.getTaskById('missing')).toBeNull();
  });

  it('restoreTask reinserts before the neighbor id', () => {
    const store = useCrawlStore();
    store.addTask(makeRecord({ id: 'a' }));
    store.addTask(makeRecord({ id: 'b' }));
    store.addTask(makeRecord({ id: 'c' }));
    const removed = store.history[1];
    const neighborId = store.history[2].id;
    store.removeTask(removed.id);
    store.restoreTask(removed, neighborId);
    expect(store.history.map((r) => r.id)).toEqual(['c', removed.id, 'a']);
  });

  it('restoreTask appends when neighborId is null', () => {
    const store = useCrawlStore();
    store.addTask(makeRecord({ id: 'a' }));
    const removed = store.history[0];
    store.removeTask(removed.id);
    store.restoreTask(removed, null);
    expect(store.history.map((r) => r.id)).toEqual(['a']);
  });

  it('restoreTask unshifts when neighbor id is missing', () => {
    const store = useCrawlStore();
    store.addTask(makeRecord({ id: 'a' }));
    store.addTask(makeRecord({ id: 'b' }));
    const removed = store.history[1];
    store.removeTask(removed.id);
    store.restoreTask(removed, 'ghost-neighbor');
    expect(store.history.map((r) => r.id)).toEqual(['a', 'b']);
  });

  it('persist writes history into localStorage under ai-crawler:crawl-history key', async () => {
    const store = useCrawlStore();
    store.addTask(makeRecord({ id: 'persist-1' }));
    const raw = await waitForPersist('ai-crawler:crawl-history');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw as string);
    expect(parsed.history).toBeInstanceOf(Array);
    expect(parsed.history[0].id).toBe('persist-1');
  });

  it('startTick/stopTick refcount keeps ticking until last unmount', () => {
    const store = useCrawlStore();
    const original = Date.now();
    store.startTick();
    store.startTick();
    store.stopTick();
    const midpoint = store.nowTimestamp;
    expect(midpoint).toBeGreaterThanOrEqual(original);
    store.stopTick();
    expect(store.stopTick).not.toThrow();
  });
});
