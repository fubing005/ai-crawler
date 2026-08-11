import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import SimpleView from '@/views/SimpleView.vue';
import { createTestingPinia } from '@pinia/testing';
import { NNotificationProvider, NMessageProvider } from 'naive-ui';
import * as analyzeApi from '@/api/analyze';
import { useCrawlStore } from '@/stores/crawl';

describe('SimpleView.vue', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    try { useCrawlStore().stopTick(); } catch (e) {
      if (!/no active pinia/.test(String(e))) throw e;
    }
  });

  it('renders placeholder empty state', () => {
    const wrapper = mount(SimpleView, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn })] }
    });
    expect(wrapper.text()).toContain('简洁视图');
    expect(wrapper.text()).toContain('尚未开始爬取');
  });

  it('shows error hint on empty url + 开始爬取', async () => {
    const wrapper = mount(SimpleView, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn })] }
    });
    const btn = wrapper.findAll('button').find((b) => b.text().includes('开始爬取'));
    await btn?.trigger('click');
    expect(wrapper.text()).toContain('请先粘贴网址');
  });

  it('shows invalid url hint on bad URL', async () => {
    const wrapper = mount(SimpleView, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn })] }
    });
    const input = wrapper.find('input');
    await input.setValue('not-a-url');
    const btn = wrapper.findAll('button').find((b) => b.text().includes('开始爬取'));
    await btn?.trigger('click');
    expect(wrapper.text()).toContain('网址格式不正确');
  });

  it('renders example chips from mockExamples', () => {
    const wrapper = mount(SimpleView, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn })] }
    });
    expect(wrapper.text()).toContain('https://example.com/product');
  });

  it('clicking example chip fills url input', async () => {
    const wrapper = mount(SimpleView, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn })] }
    });
    const chip = wrapper.findAll('.smart-url-input__chip').find((el) => el.text().includes('example.com'));
    await chip?.trigger('click');
    const input = wrapper.find('input');
    expect((input.element as HTMLInputElement).value).toContain('example.com');
  });

  it('disables 开始爬取 button while loading', async () => {
    const wrapper = mount(SimpleView, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn })] }
    });
    const input = wrapper.find('input');
    await input.setValue('https://example.com/product');
    const btn = wrapper.findAll('button').find((b) => b.text().includes('开始爬取'));
    await btn?.trigger('click');
    expect(wrapper.text()).not.toContain('请先粘贴网址');
  });

  it('progress panel shows AI stage labels on crawl', async () => {
    vi.useFakeTimers();
    const wrapper = mount(SimpleView, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn })] }
    });
    const input = wrapper.find('input');
    await input.setValue('https://example.com/product');
    const btn = wrapper.findAll('button').find((b) => b.text().includes('开始爬取'));
    await btn?.trigger('click');
    expect(wrapper.text()).toContain('AI 正在浏览页面');
    await vi.advanceTimersByTimeAsync(6500);
    expect(wrapper.text()).toContain('完成');
    vi.useRealTimers();
  });

  it('retry button appears after failed crawl', async () => {
    const analyzeSpy = vi.spyOn(analyzeApi, 'analyze').mockRejectedValue(new Error('mock fail'));
    const progressSpy = vi.spyOn(analyzeApi, 'getCrawlProgress').mockRejectedValue(new Error('mock fail'));
    const crawlSpy = vi.spyOn(analyzeApi, 'crawl').mockRejectedValue(new Error('mock fail'));
    vi.useFakeTimers();
    const wrapper = mount(SimpleView, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn })] }
    });
    const input = wrapper.find('input');
    await input.setValue('https://example.com/product');
    const btn = wrapper.findAll('button').find((b) => b.text().includes('开始爬取'));
    await btn?.trigger('click');
    await vi.advanceTimersByTimeAsync(100);
    expect(wrapper.text()).toContain('AI 暂时没找到字段');
    expect(wrapper.find('.simple-view__retry').exists()).toBe(true);
    vi.useRealTimers();
    analyzeSpy.mockRestore();
    progressSpy.mockRestore();
    crawlSpy.mockRestore();
  });

  it('Ctrl+Enter submits valid url', async () => {
    const wrapper = mount(SimpleView, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn })] }
    });
    const input = wrapper.find('input');
    await input.setValue('https://example.com/product');
    await input.trigger('keydown', { key: 'Enter', ctrlKey: true });
    expect(wrapper.text()).not.toContain('请先粘贴网址');
  });

  it('view switcher triggers store update on toggle', async () => {
    const pinia = createTestingPinia({ createSpy: vi.fn });
    const store = (await import('@/stores/ui')).useUiStore();
    store.viewPreference = 'dashboard';
    const wrapper = mount(SimpleView, { global: { plugins: [pinia] } });
    const buttons = wrapper.findAll('button').filter((b) => b.text().includes('简洁视图'));
    await buttons[0].trigger('click');
    expect(store.setViewPreference).toHaveBeenCalledWith('simple');
  });

  it('shows 立即开始爬取 button in empty history area', () => {
    const wrapper = mount(SimpleView, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn })] }
    });
    expect(wrapper.text()).toContain('还没有爬取历史');
    expect(wrapper.text()).toContain('立即开始爬取');
  });

  it('clicking 立即开始爬取 in empty history scrolls to top and focuses input', async () => {
    const scrollToSpy = vi.fn();
    const focusSpy = vi.fn();
    (Element.prototype as Partial<Element> as { scrollTo?: unknown }).scrollTo = scrollToSpy;
    (HTMLInputElement.prototype as Partial<HTMLInputElement> as { focus?: unknown }).focus = focusSpy;
    const wrapper = mount(SimpleView, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn })] }
    });
    const btn = wrapper.findAll('button').find((b) => b.text().includes('立即开始爬取'));
    await btn?.trigger('click');
    await nextTick();
    expect(scrollToSpy).toHaveBeenCalled();
    expect(focusSpy).toHaveBeenCalled();
  });

  it('retry button after failed crawl re-validates url and re-runs', async () => {
    const analyzeSpy = vi.spyOn(analyzeApi, 'analyze').mockRejectedValue(new Error('mock fail'));
    const progressSpy = vi.spyOn(analyzeApi, 'getCrawlProgress').mockRejectedValue(new Error('mock fail'));
    const crawlSpy = vi.spyOn(analyzeApi, 'crawl').mockRejectedValue(new Error('mock fail'));
    vi.useFakeTimers();
    const wrapper = mount(SimpleView, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn })] }
    });
    const input = wrapper.find('input');
    await input.setValue('https://example.com/product');
    const btn = wrapper.findAll('button').find((b) => b.text().includes('开始爬取'));
    await btn?.trigger('click');
    await vi.advanceTimersByTimeAsync(100);
    const retryBtn = wrapper.find('.simple-view__retry');
    expect(retryBtn.exists()).toBe(true);
    await retryBtn.trigger('click');
    await vi.advanceTimersByTimeAsync(100);
    expect(analyzeSpy).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
    analyzeSpy.mockRestore();
    progressSpy.mockRestore();
    crawlSpy.mockRestore();
  });

  it('retry button on empty url shows 请先粘贴网址 hint', async () => {
    const analyzeSpy = vi.spyOn(analyzeApi, 'analyze').mockRejectedValue(new Error('mock fail'));
    const progressSpy = vi.spyOn(analyzeApi, 'getCrawlProgress').mockRejectedValue(new Error('mock fail'));
    const crawlSpy = vi.spyOn(analyzeApi, 'crawl').mockRejectedValue(new Error('mock fail'));
    vi.useFakeTimers();
    const wrapper = mount(SimpleView, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn })] }
    });
    const input = wrapper.find('input');
    await input.setValue('https://example.com/product');
    const btn = wrapper.findAll('button').find((b) => b.text().includes('开始爬取'));
    await btn?.trigger('click');
    await vi.advanceTimersByTimeAsync(100);
    const retryBtn = wrapper.find('.simple-view__retry');
    expect(retryBtn.exists()).toBe(true);
    await input.setValue('');
    await retryBtn.trigger('click');
    expect(wrapper.text()).toContain('请先粘贴网址');
    vi.useRealTimers();
    analyzeSpy.mockRestore();
    progressSpy.mockRestore();
    crawlSpy.mockRestore();
  });

  it('rejects javascript: protocol url with invalid format hint', async () => {
    const wrapper = mount(SimpleView, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn })] }
    });
    const input = wrapper.find('input');
    await input.setValue('javascript:alert(1)');
    const btn = wrapper.findAll('button').find((b) => b.text().includes('开始爬取'));
    await btn?.trigger('click');
    expect(wrapper.text()).toContain('网址格式不正确');
  });

  it('爬取完成后历史卡片出现（store 历史长度增长）', async () => {
    vi.useFakeTimers();
    const wrapper = mount(SimpleView, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })],
        stubs: { NIcon: true }
      }
    });
    const input = wrapper.find('input');
    await input.setValue('https://example.com/product');
    const btn = wrapper.findAll('button').find((b) => b.text().includes('开始爬取'));
    await btn?.trigger('click');
    await vi.advanceTimersByTimeAsync(6500);
    const store = (await import('@/stores/crawl')).useCrawlStore();
    expect(store.history.length).toBeGreaterThanOrEqual(1);
    expect(wrapper.findAll('.history-card').length).toBeGreaterThanOrEqual(1);
    vi.useRealTimers();
  });

  it('点击 HistoryCard 查看按钮打开任务详情抽屉', async () => {
    vi.useFakeTimers();
    const wrapper = mount(SimpleView, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })],
        stubs: { NIcon: true, NProgress: true, NEllipsis: true, NDrawer: true, NDrawerContent: true }
      }
    });
    const input = wrapper.find('input');
    await input.setValue('https://example.com/product');
    const btn = wrapper.findAll('button').find((b) => b.text().includes('开始爬取'));
    await btn?.trigger('click');
    await vi.advanceTimersByTimeAsync(6500);
    const viewBtn = wrapper.findAll('button').find((b) => b.text().includes('查看'));
    expect(viewBtn).toBeTruthy();
    await viewBtn!.trigger('click');
    await nextTick();
    const store = (await import('@/stores/crawl')).useCrawlStore();
    expect(store.activeTask).not.toBeNull();
    vi.useRealTimers();
  });

  it('点击删除按钮移除条目并显示撤销通知', async () => {
    vi.useFakeTimers();
    const wrapper = mount(SimpleView, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })],
        stubs: { NIcon: true, NProgress: true, NEllipsis: true },
        components: { NNotificationProvider, NMessageProvider }
      }
    });
    const input = wrapper.find('input');
    await input.setValue('https://example.com/product');
    const btn = wrapper.findAll('button').find((b) => b.text().includes('开始爬取'));
    await btn?.trigger('click');
    await vi.advanceTimersByTimeAsync(6500);
    const store = (await import('@/stores/crawl')).useCrawlStore();
    const initialCount = store.history.length;
    const deleteBtn = wrapper.findAll('button').find((b) => b.text().includes('删除'));
    expect(deleteBtn).toBeTruthy();
    await deleteBtn!.trigger('click');
    expect(store.history.length).toBe(initialCount - 1);
    expect(wrapper.text()).toContain('已删除，5 秒内可撤销');
    vi.useRealTimers();
  });

  it('撤销删除恢复条目', async () => {
    vi.useFakeTimers();
    const wrapper = mount(SimpleView, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })],
        stubs: { NIcon: true, NProgress: true, NEllipsis: true },
        components: { NNotificationProvider, NMessageProvider }
      }
    });
    const input = wrapper.find('input');
    await input.setValue('https://example.com/product');
    const btn = wrapper.findAll('button').find((b) => b.text().includes('开始爬取'));
    await btn?.trigger('click');
    await vi.advanceTimersByTimeAsync(6500);
    const store = (await import('@/stores/crawl')).useCrawlStore();
    const initialCount = store.history.length;
    const removedId = store.history[0]?.id;
    const deleteBtn = wrapper.findAll('button').find((b) => b.text().includes('删除'));
    await deleteBtn!.trigger('click');
    expect(store.history.length).toBe(initialCount - 1);
    const undoBtn = wrapper.find('.simple-view__undo-action');
    expect(undoBtn.exists()).toBe(true);
    await undoBtn.trigger('click');
    expect(store.history.length).toBe(initialCount);
    expect(store.history[0]?.id).toBe(removedId);
    vi.useRealTimers();
  });

  it('撤销删除恢复条目到中间位置（非顶部）', async () => {
    vi.useFakeTimers();
    const wrapper = mount(SimpleView, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })],
        stubs: { NIcon: true, NProgress: true, NEllipsis: true },
        components: { NNotificationProvider, NMessageProvider }
      }
    });
    const store = (await import('@/stores/crawl')).useCrawlStore();
    // Seed two extra records so the deleted one is at the middle slot.
    store.addTask({
      id: 'seed-1',
      url: 'https://example.com/seed1',
      pageTitle: 'seed1',
      extractedCount: 0,
      completedAt: Date.now(),
      status: 'completed',
      fields: []
    });
    store.addTask({
      id: 'seed-2',
      url: 'https://example.com/seed2',
      pageTitle: 'seed2',
      extractedCount: 0,
      completedAt: Date.now(),
      status: 'completed',
      fields: []
    });
    const input = wrapper.find('input');
    await input.setValue('https://example.com/product');
    const btn = wrapper.findAll('button').find((b) => b.text().includes('开始爬取'));
    await btn?.trigger('click');
    await vi.advanceTimersByTimeAsync(6500);
    // Layout: [newest, seed-2, seed-1] — the new crawl is at index 0.
    const initialCount = store.history.length;
    expect(initialCount).toBeGreaterThanOrEqual(3);
    // Delete seed-2 which sits at index 1 (middle). Its captured neighbor is seed-1 (idx 2).
    const removedId = 'seed-2';
    const expectedNeighbor = 'seed-1';
    const deleteButtons = wrapper.findAll('button').filter((b) => b.text().includes('删除'));
    // Find the delete button whose parent card corresponds to seed-2.
    // Each HistoryCard has a 删除 button in order; store order is [newest, seed-2, seed-1].
    // Middle button corresponds to seed-2.
    await deleteButtons[1].trigger('click');
    expect(store.history.map((r) => r.id)).not.toContain(removedId);
    const undoBtn = wrapper.find('.simple-view__undo-action');
    expect(undoBtn.exists()).toBe(true);
    await undoBtn.trigger('click');
    expect(store.history.map((r) => r.id)).toContain(removedId);
    // seed-2 should be restored before expectedNeighbor (the originally-following record);
    // i.e., at index 1, between newest (index 0) and seed-1 (index 2).
    const restoredIdx = store.history.findIndex((r) => r.id === removedId);
    expect(restoredIdx).toBe(1);
    expect(store.history[restoredIdx + 1]?.id).toBe(expectedNeighbor);
    vi.useRealTimers();
  });
});
