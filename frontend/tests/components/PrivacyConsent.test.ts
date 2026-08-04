import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { NCheckbox, NCard, NTabs, NTabPane, NButton, NCollapse, NCollapseItem } from 'naive-ui';
import PrivacyConsent from '@/components/PrivacyConsent.vue';
import { createTestingPinia } from '@pinia/testing';
import { createRouter, createWebHashHistory } from 'vue-router';

const stubs = {
  NCard: { name: 'NCard', template: '<div><slot name="header" /><slot /></div>' },
  NTabs: { name: 'NTabs', template: '<div class="ntabs"><slot /></div>', props: ['value'] },
  NTabPane: { name: 'NTabPane', template: '<div class="npane"><slot /></div>', props: ['name', 'tab'] },
  NButton: {
    name: 'NButton',
    template: '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
    props: ['disabled', 'type', 'tertiary']
  },
  NCollapse: { name: 'NCollapse', template: '<div><slot /></div>' },
  NCollapseItem: { name: 'NCollapseItem', template: '<div><slot /><slot name="header" /></div>', props: ['title', 'name'] }
};

function makeRouter() {
  return createRouter({
    history: createWebHashHistory(),
    routes: [
      { path: '/privacy', name: 'privacy', component: PrivacyConsent },
      { path: '/welcome', name: 'welcome', component: { template: '<div>welcome</div>' } }
    ]
  });
}

describe('PrivacyConsent.vue', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders title and key sections', () => {
    const router = makeRouter();
    const wrapper = mount(PrivacyConsent, {
      global: {
        plugins: [
          createTestingPinia({ createSpy: vi.fn, stubActions: false }),
          router
        ],
        stubs
      }
    });
    expect(wrapper.text()).toContain('隐私保护说明');
    expect(wrapper.text()).toContain('不收集您的个人身份信息');
  });

  it('disables agree button until checkbox checked', () => {
    const router = makeRouter();
    const wrapper = mount(PrivacyConsent, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn }), router],
        stubs
      }
    });
    const agreeBtn = wrapper.findAll('button').find((b) => b.text().includes('同意'));
    expect(agreeBtn?.attributes('disabled')).toBeDefined();
  });

  it('accepts privacy and navigates to /welcome', async () => {
    const router = makeRouter();
    router.push('/privacy');
    await router.isReady();
    const pushSpy = vi.spyOn(router, 'replace');
    const wrapper = mount(PrivacyConsent, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false }), router],
        stubs
      }
    });
    await flushPromises();
    const checkbox = wrapper.findComponent(NCheckbox);
    expect(checkbox.exists()).toBe(true);
    checkbox.vm.$emit('update:checked', true);
    await flushPromises();
    const agreeBtn = wrapper.findAll('button').find((b) => b.text().includes('同意'));
    expect(agreeBtn?.attributes('disabled')).toBeUndefined();
    await agreeBtn?.trigger('click');
    await flushPromises();
    expect(pushSpy).toHaveBeenCalledWith({ name: 'welcome' });
  });

  it('decline path sets privacyConsented=false and alerts', async () => {
    const router = makeRouter();
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const wrapper = mount(PrivacyConsent, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false }), router],
        stubs
      }
    });
    const declineBtn = wrapper.findAll('button').find((b) => b.text().includes('拒绝'));
    await declineBtn?.trigger('click');
    await flushPromises();
    await new Promise((r) => setTimeout(r, 150));
    expect(alertSpy).toHaveBeenCalled();
    alertSpy.mockRestore();
  });
});
