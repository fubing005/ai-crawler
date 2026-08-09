import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import SmartURLInput from '@/components/SmartURLInput.vue';

function mountInput(historyItems: Array<{ url: string; completedAt: number }>) {
  return mount(SmartURLInput, {
    props: {
      modelValue: '',
      historyItems
    },
    global: {
      stubs: {
        NIcon: true,
        Popover: {
          name: 'Popover',
          template: '<div><slot name="trigger" /><slot /></div>'
        }
      }
    }
  });
}

describe('SmartURLInput.vue 历史 dropdown', () => {
  it('historyItems 非空 + focus 显示 popover', async () => {
    const wrapper = mountInput([
      { url: 'https://example.com/a', completedAt: Date.now() - 60_000 }
    ]);
    const input = wrapper.find('input');
    await input.trigger('focus');
    expect(wrapper.vm).toBeTruthy();
    // showHistory 在 focus 后变 true；popover 渲染任一历史项
    expect(wrapper.html()).toContain('example.com');
    expect(wrapper.html()).toContain('分钟前');
  });

  it('historyItems 为空 + focus 不显示 popover（无可点击项）', async () => {
    const wrapper = mountInput([]);
    await wrapper.find('input').trigger('focus');
    const items = wrapper.findAll('.smart-url-input__history-item');
    expect(items.length).toBe(0);
  });

  it('点击历史项触发 update:modelValue 并填充 URL', async () => {
    const wrapper = mountInput([
      { url: 'https://example.com/page1', completedAt: Date.now() }
    ]);
    await wrapper.find('input').trigger('focus');
    const item = wrapper.find('.smart-url-input__history-item');
    expect(item.exists()).toBe(true);
    await item.trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['https://example.com/page1']);
  });
});
