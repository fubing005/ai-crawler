import { describe, it, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
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

describe('useCrawlStore', () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
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

  it('getTaskById returns the record or null', () => {
    const store = useCrawlStore();
    const rec = makeRecord({ id: 'lookup-id' });
    store.addTask(rec);
    expect(store.getTaskById('lookup-id')).toEqual(rec);
    expect(store.getTaskById('missing')).toBeNull();
  });

  it('persist writes history into localStorage under ai-crawler:crawl-history key', () => {
    const store = useCrawlStore();
    store.addTask(makeRecord({ id: 'persist-1' }));
    const raw = localStorage.getItem('ai-crawler:crawl-history');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw as string);
    expect(parsed.history).toBeInstanceOf(Array);
    expect(parsed.history[0].id).toBe('persist-1');
  });
});
