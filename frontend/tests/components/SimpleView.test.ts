import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import SimpleView from '@/views/SimpleView.vue';
import { createTestingPinia } from '@pinia/testing';

describe('SimpleView.vue', () => {
  beforeEach(() => localStorage.clear());

  it('renders placeholder empty state', () => {
    const wrapper = mount(SimpleView, {
      global: { plugins: [createTestingPinia({ createSpy: () => () => null })] }
    });
    expect(wrapper.text()).toContain('简洁视图');
    expect(wrapper.text()).toContain('尚未开始爬取');
  });

  it('shows error hint on empty url + 开始爬取', async () => {
    const wrapper = mount(SimpleView, {
      global: { plugins: [createTestingPinia({ createSpy: () => () => null })] }
    });
    const btn = wrapper.findAll('button').find((b) => b.text().includes('开始爬取'));
    await btn?.trigger('click');
    expect(wrapper.text()).toContain('请先粘贴网址');
  });

  it('shows invalid url hint on bad URL', async () => {
    const wrapper = mount(SimpleView, {
      global: { plugins: [createTestingPinia({ createSpy: () => () => null })] }
    });
    const input = wrapper.find('input');
    await input.setValue('not-a-url');
    const btn = wrapper.findAll('button').find((b) => b.text().includes('开始爬取'));
    await btn?.trigger('click');
    expect(wrapper.text()).toContain('网址格式不正确');
  });
});
