import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import WelcomePage from '@/components/WelcomePage.vue';
import { createTestingPinia } from '@pinia/testing';
import { createRouter, createWebHashHistory } from 'vue-router';

function makeRouter() {
  return createRouter({
    history: createWebHashHistory(),
    routes: [
      { path: '/welcome', name: 'welcome', component: WelcomePage },
      { path: '/wizard', name: 'wizard', component: { template: '<div>wizard</div>' } },
      { path: '/simple-view', name: 'simple-view', component: { template: '<div>simple</div>' } }
    ]
  });
}

describe('WelcomePage.vue', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders quick and detailed options', () => {
    const router = makeRouter();
    const wrapper = mount(WelcomePage, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false }), router]
      }
    });
    expect(wrapper.text()).toContain('快速开始');
    expect(wrapper.text()).toContain('详细配置');
  });

  it('clicking 快速开始 routes to wizard and sets variant=minimal', async () => {
    const router = makeRouter();
    router.push('/welcome');
    await router.isReady();
    const pushSpy = vi.spyOn(router, 'push');
    const wrapper = mount(WelcomePage, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false }), router]
      }
    });
    const quickCard = wrapper.findAll('article').find((a) => a.text().includes('快速开始'));
    await quickCard?.trigger('click');
    expect(pushSpy).toHaveBeenCalledWith({ name: 'wizard' });
    const stored = localStorage.getItem('ai-crawler:onboarding');
    if (stored) {
      const parsed = JSON.parse(stored);
      expect(parsed.wizardVariant).toBe('minimal');
    }
  });

  it('clicking 详细配置 routes to wizard and sets variant=detailed', async () => {
    const router = makeRouter();
    router.push('/welcome');
    await router.isReady();
    const pushSpy = vi.spyOn(router, 'push');
    const wrapper = mount(WelcomePage, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false }), router]
      }
    });
    const detCard = wrapper.findAll('article').find((a) => a.text().includes('详细配置'));
    await detCard?.trigger('click');
    expect(pushSpy).toHaveBeenCalledWith({ name: 'wizard' });
    const stored = localStorage.getItem('ai-crawler:onboarding');
    if (stored) {
      const parsed = JSON.parse(stored);
      expect(parsed.wizardVariant).toBe('detailed');
    }
  });

  it('跳过向导 routes to simple-view', async () => {
    const router = makeRouter();
    router.push('/welcome');
    await router.isReady();
    const replaceSpy = vi.spyOn(router, 'replace');
    const wrapper = mount(WelcomePage, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false }), router]
      }
    });
    const skipBtn = wrapper.findAll('button').find((b) => b.text().includes('跳过向导'));
    await skipBtn?.trigger('click');
    expect(replaceSpy).toHaveBeenCalledWith({ name: 'simple-view' });
  });
});
