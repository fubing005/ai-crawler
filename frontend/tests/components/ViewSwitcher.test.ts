import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ViewSwitcher from '@/components/ViewSwitcher.vue';
import { createTestingPinia } from '@pinia/testing';
import { useUiStore } from '@/stores/ui';

describe('ViewSwitcher.vue', () => {
  beforeEach(() => localStorage.clear());

  it('renders three view buttons with simple selected by default', () => {
    const wrapper = mount(ViewSwitcher, {
      props: { modelValue: 'simple' },
      global: { plugins: [createTestingPinia({ createSpy: vi.fn })] }
    });
    const buttons = wrapper.findAll('button');
    expect(buttons.length).toBe(3);
    expect(buttons[0].text()).toContain('简洁视图');
    expect(buttons[1].text()).toContain('仪表板视图');
    expect(buttons[2].text()).toContain('专业视图');
  });

  it('disabled buttons do not emit update', async () => {
    const wrapper = mount(ViewSwitcher, {
      props: { modelValue: 'simple' },
      global: { plugins: [createTestingPinia({ createSpy: vi.fn })] }
    });
    const buttons = wrapper.findAll('button');
    await buttons[1].trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
  });

  it('clicking simple emits update + persists via store', async () => {
    const pinia = createTestingPinia({ createSpy: vi.fn });
    const wrapper = mount(ViewSwitcher, {
      props: { modelValue: 'dashboard' },
      global: { plugins: [pinia] }
    });
    const store = useUiStore();
    const buttons = wrapper.findAll('button');
    await buttons[0].trigger('click');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['simple']);
    expect(store.setViewPreference).toHaveBeenCalledWith('simple');
  });
});
