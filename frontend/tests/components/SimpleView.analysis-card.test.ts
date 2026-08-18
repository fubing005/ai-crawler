import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import SimpleView from '@/views/SimpleView.vue';
import { createTestingPinia } from '@pinia/testing';
import { NNotificationProvider, NMessageProvider } from 'naive-ui';
import * as analyzeApi from '@/api/analyze';
import { useCrawlStore } from '@/stores/crawl';
import { mockNotification } from '../setup-notification';

const Host = defineComponent({
  components: { SimpleView, NNotificationProvider, NMessageProvider },
  template: `<NMessageProvider><NNotificationProvider><SimpleView /></NNotificationProvider></NMessageProvider>`
});

async function submitUrl(wrapper: ReturnType<typeof mount>) {
  const input = wrapper.find('input');
  await input.setValue('https://example.com/product');
  const btn = wrapper.findAll('button').find((b) => b.text().includes('开始爬取'));
  await btn?.trigger('click');
}

describe('SimpleView.vue 分析结果卡片集成', () => {
  beforeEach(() => {
    localStorage.clear();
    mockNotification.mockClear();
    mockNotification.permission = 'default';
    mockNotification.requestPermission = vi.fn().mockResolvedValue('granted');
  });

  afterEach(() => {
    try { useCrawlStore().stopTick(); } catch (e) {
      if (!/no active pinia/.test(String(e))) throw e;
    }
  });

  it('分析完成后挂载分析结果卡片含页面类型标签', async () => {
    vi.useFakeTimers();
    const wrapper = mount(Host, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn })] }
    });
    await submitUrl(wrapper);
    await vi.advanceTimersByTimeAsync(6500);
    expect(wrapper.text()).toContain('电商商品列表');
    expect(wrapper.text()).toContain('推荐字段');
    expect(wrapper.text()).toContain('整体置信度');
    vi.useRealTimers();
  });

  it('重新开始爬取时清除上一轮卡片', async () => {
    vi.useFakeTimers();
    const wrapper = mount(Host, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn })] }
    });
    await submitUrl(wrapper);
    await vi.advanceTimersByTimeAsync(6500);
    expect(wrapper.text()).toContain('电商商品列表');

    // 完成态下提交按钮文案为"完成"，改用 Ctrl+Enter 重新触发
    const input = wrapper.find('input');
    await input.trigger('keydown', { key: 'Enter', ctrlKey: true });
    await vi.advanceTimersByTimeAsync(100);
    expect(wrapper.text()).not.toContain('电商商品列表');
    vi.useRealTimers();
  });

  it('analyze 失败(UNREACHABLE)显示无法访问该网站与建议文案', async () => {
    const analyzeSpy = vi.spyOn(analyzeApi, 'analyze').mockRejectedValue(new Error('UNREACHABLE'));
    const progressSpy = vi.spyOn(analyzeApi, 'getCrawlProgress').mockRejectedValue(new Error('x'));
    const crawlSpy = vi.spyOn(analyzeApi, 'crawl').mockRejectedValue(new Error('x'));
    vi.useFakeTimers();
    const wrapper = mount(Host, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn })] }
    });
    await submitUrl(wrapper);
    await vi.advanceTimersByTimeAsync(100);
    expect(wrapper.text()).toContain('无法访问该网站');
    expect(wrapper.text()).toContain('请检查网址拼写，或尝试其他网址');
    expect(wrapper.text()).not.toContain('电商商品列表');
    vi.useRealTimers();
    analyzeSpy.mockRestore();
    progressSpy.mockRestore();
    crawlSpy.mockRestore();
  });

  it('analyze 超时(ANALYSIS_TIMEOUT)显示分析超时文案', async () => {
    const analyzeSpy = vi.spyOn(analyzeApi, 'analyze').mockRejectedValue(new Error('ANALYSIS_TIMEOUT'));
    const progressSpy = vi.spyOn(analyzeApi, 'getCrawlProgress').mockRejectedValue(new Error('x'));
    const crawlSpy = vi.spyOn(analyzeApi, 'crawl').mockRejectedValue(new Error('x'));
    vi.useFakeTimers();
    const wrapper = mount(Host, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn })] }
    });
    await submitUrl(wrapper);
    await vi.advanceTimersByTimeAsync(100);
    expect(wrapper.text()).toContain('分析超时，请稍后再试');
    vi.useRealTimers();
    analyzeSpy.mockRestore();
    progressSpy.mockRestore();
    crawlSpy.mockRestore();
  });
});
