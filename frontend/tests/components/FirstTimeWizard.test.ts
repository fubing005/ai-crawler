import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import FirstTimeWizard from '@/components/FirstTimeWizard.vue';
import { createTestingPinia } from '@pinia/testing';
import { createRouter, createWebHashHistory } from 'vue-router';
import confetti from 'canvas-confetti';

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

const mockedAnalyze = vi.fn();
const mockedCrawl = vi.fn();
const mockedTestAi = vi.fn();

vi.mock('@/api/analyze', () => ({
  analyze: (...args: unknown[]) => (mockedAnalyze as unknown as (...a: unknown[]) => unknown)(...args),
  crawl: (...args: unknown[]) => (mockedCrawl as unknown as (...a: unknown[]) => unknown)(...args),
  testAiProvider: (...args: unknown[]) => (mockedTestAi as unknown as (...a: unknown[]) => unknown)(...args)
}));

function makeRouter() {
  return createRouter({
    history: createWebHashHistory(),
    routes: [
      { path: '/wizard', name: 'wizard', component: FirstTimeWizard },
      { path: '/simple-view', name: 'simple-view', component: { template: '<div>simple</div>' } }
    ]
  });
}

async function mountWizard() {
  const router = makeRouter();
  router.push('/wizard');
  await router.isReady();
  const wrapper = mount(FirstTimeWizard, {
    global: {
      plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false }), router]
    }
  });
  await flushPromises();
  return { wrapper, router };
}

describe('FirstTimeWizard.vue', () => {
  beforeEach(() => {
    localStorage.clear();
    mockedAnalyze.mockReset();
    mockedCrawl.mockReset();
    mockedTestAi.mockReset();
    (confetti as unknown as ReturnType<typeof vi.fn>).mockClear?.();
  });

  it('renders 5 step indicators and starts at step 1', async () => {
    const { wrapper } = await mountWizard();
    expect(wrapper.text()).toContain('5 步带您完成首次爬取');
    expect(wrapper.text()).toContain('步骤 1/5');
  });

  it('Step 1 → Step 2 advances when an example selected', async () => {
    const { wrapper } = await mountWizard();
    const example = wrapper.findAll('article').find((a) => a.text().includes('电商商品'));
    await example?.trigger('click');
    const nextBtn = wrapper.findAll('button').find((b) => b.text().includes('下一步'));
    await nextBtn?.trigger('click');
    await flushPromises();
    expect(wrapper.text()).toContain('选择 AI 助手');
  });

  it('Step 2 cannot advance until provider chosen', async () => {
    const { wrapper } = await mountWizard();
    const example = wrapper.findAll('article').find((a) => a.text().includes('电商商品'));
    await example?.trigger('click');
    const next = wrapper.findAll('button').find((b) => b.text().includes('下一步'));
    await next?.trigger('click');
    await flushPromises();
    const nextStep2 = wrapper.findAll('button').find((b) => b.text().includes('下一步'));
    // 没选 provider 时 disabled
    expect(nextStep2?.attributes('disabled')).toBeDefined();
    const providerCard = wrapper.findAll('article').find((a) => a.text().includes('本地 Ollama'));
    await providerCard?.trigger('click');
    await flushPromises();
    expect(nextStep2?.attributes('disabled')).toBeUndefined();
  });

  it('testAiProvider shows ok result', async () => {
    mockedTestAi.mockResolvedValueOnce(true);
    const { wrapper } = await mountWizard();
    // advance to step 2
    const example = wrapper.findAll('article').find((a) => a.text().includes('电商商品'));
    await example?.trigger('click');
    await wrapper.findAll('button').find((b) => b.text().includes('下一步'))?.trigger('click');
    await flushPromises();
    const provider = wrapper.findAll('article').find((a) => a.text().includes('本地 Ollama'));
    await provider?.trigger('click');
    await flushPromises();
    const testBtn = wrapper.findAll('button').find((b) => b.text().includes('测试连接'));
    await testBtn?.trigger('click');
    await flushPromises();
    expect(mockedTestAi).toHaveBeenCalled();
    expect(wrapper.text()).toContain('已连通');
  });

  it('Step 3 invalid custom URL shows error', async () => {
    const { wrapper } = await mountWizard();
    // advance to step 3
    const example = wrapper.findAll('article').find((a) => a.text().includes('电商商品'));
    await example?.trigger('click');
    await wrapper.findAll('button').find((b) => b.text().includes('下一步'))?.trigger('click');
    await flushPromises();
    const provider = wrapper.findAll('article').find((a) => a.text().includes('本地 Ollama'));
    await provider?.trigger('click');
    await wrapper.findAll('button').find((b) => b.text().includes('下一步'))?.trigger('click');
    await flushPromises();
    const input = wrapper.find('input[placeholder*="自定义网址"], input[aria-label="自定义网址"]');
    await input.setValue('not-a-url');
    await input.trigger('blur');
    await flushPromises();
    expect(wrapper.text()).toContain('网址格式不正确');
  });

  it('Step 3 → Step 4 triggers analyze and shows fields', async () => {
    mockedAnalyze.mockResolvedValueOnce({
      page_title: '示例页',
      detected_type: 'ecommerce',
      fields: [
        { name: 'title', selector: 'h1', confidence: 0.9, sample: '示例' }
      ]
    });
    const { wrapper } = await mountWizard();
    // advance to step 3
    await wrapper.findAll('article').find((a) => a.text().includes('电商商品'))?.trigger('click');
    await wrapper.findAll('button').find((b) => b.text().includes('下一步'))?.trigger('click');
    await flushPromises();
    await wrapper.findAll('article').find((a) => a.text().includes('本地 Ollama'))?.trigger('click');
    await wrapper.findAll('button').find((b) => b.text().includes('下一步'))?.trigger('click');
    await flushPromises();
    // 选择 url 卡片
    const urlCard = wrapper.findAll('article').find((a) => a.text().includes('示例商品页'));
    await urlCard?.trigger('click');
    await wrapper.findAll('button').find((b) => b.text().includes('下一步'))?.trigger('click');
    await flushPromises();
    expect(mockedAnalyze).toHaveBeenCalled();
    expect(wrapper.text()).toContain('AI 已识别');
    expect(wrapper.text()).toContain('title');
  });

  it('skip wizard routes to simple-view', async () => {
    const { wrapper, router } = await mountWizard();
    const spy = vi.spyOn(router, 'replace');
    const skip = wrapper.findAll('button').find((b) => b.text().includes('跳过向导'));
    await skip?.trigger('click');
    await flushPromises();
    expect(spy).toHaveBeenCalledWith({ name: 'simple-view' });
  });
});
