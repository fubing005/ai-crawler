import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import SmartURLInput from '@/components/SmartURLInput.vue';

describe('SmartURLInput.vue', () => {
  beforeEach(() => localStorage.clear());

  it('renders empty state by default', () => {
    const wrapper = mount(SmartURLInput, { props: { modelValue: '' } });
    expect(wrapper.find('input').exists()).toBe(true);
    expect(wrapper.text()).not.toContain('网址格式不正确');
  });

  it('marks valid url status', async () => {
    const wrapper = mount(SmartURLInput, { props: { modelValue: '' } });
    await wrapper.find('input').setValue('https://example.com/product');
    expect(wrapper.text()).not.toContain('网址格式不正确');
  });

  it('marks invalid url with javascript protocol', async () => {
    const wrapper = mount(SmartURLInput, { props: { modelValue: '' } });
    await wrapper.find('input').setValue('javascript:alert(1)');
    expect(wrapper.text()).toContain('网址格式不正确');
  });

  it('marks invalid url with file protocol', async () => {
    const wrapper = mount(SmartURLInput, { props: { modelValue: '' } });
    await wrapper.find('input').setValue('file:///etc/passwd');
    expect(wrapper.text()).toContain('网址格式不正确');
  });

  it('marks invalid url missing protocol', async () => {
    const wrapper = mount(SmartURLInput, { props: { modelValue: '' } });
    await wrapper.find('input').setValue('example.com');
    expect(wrapper.text()).toContain('网址格式不正确');
  });

  it('accepts ipv6 with port', async () => {
    const wrapper = mount(SmartURLInput, { props: { modelValue: '' } });
    await wrapper.find('input').setValue('https://[2001:db8::1]:8080/path');
    expect(wrapper.text()).not.toContain('网址格式不正确');
  });

  it('renders examples as chips', () => {
    const wrapper = mount(SmartURLInput, {
      props: { modelValue: '', examples: ['https://a.example.com', 'https://b.example.com'] }
    });
    expect(wrapper.text()).toContain('https://a.example.com');
    expect(wrapper.text()).toContain('https://b.example.com');
  });

  it('fills url on chip click + emits update', async () => {
    const wrapper = mount(SmartURLInput, {
      props: { modelValue: '', examples: ['https://example.com/x'] }
    });
    const chip = wrapper.findAll('.smart-url-input__chip').find((el) => el.text().includes('example.com'));
    await chip?.trigger('click');
    expect(wrapper.emitted('update:modelValue')?.some((v) => v[0] === 'https://example.com/x')).toBe(true);
  });

  it('emits submit on Ctrl+Enter', async () => {
    const wrapper = mount(SmartURLInput, {
      props: { modelValue: 'https://example.com' }
    });
    const input = wrapper.find('input');
    await input.trigger('keydown', { key: 'Enter', ctrlKey: true });
    const submits = wrapper.emitted('submit');
    expect(submits && submits.length === 1).toBe(true);
  });

  it('emits submit on Cmd+Enter (mac)', async () => {
    const wrapper = mount(SmartURLInput, {
      props: { modelValue: 'https://example.com' }
    });
    const input = wrapper.find('input');
    await input.trigger('keydown', { key: 'Enter', metaKey: true });
    expect(wrapper.emitted('submit')).toBeTruthy();
  });

  it('chip is tabbable (tabindex=0)', () => {
    const wrapper = mount(SmartURLInput, {
      props: { modelValue: '', examples: ['https://example.com/x'] }
    });
    const chip = wrapper.find('.smart-url-input__chip');
    expect(chip.attributes('tabindex')).toBe('0');
  });

  it('chip fills url on Enter keydown', async () => {
    const wrapper = mount(SmartURLInput, {
      props: { modelValue: '', examples: ['https://example.com/x'] }
    });
    const chip = wrapper.find('.smart-url-input__chip');
    await chip.trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('update:modelValue')?.some((v) => v[0] === 'https://example.com/x')).toBe(true);
  });

  it('sets aria-invalid on invalid url', async () => {
    const wrapper = mount(SmartURLInput, { props: { modelValue: '' } });
    await wrapper.find('input').setValue('not-a-url');
    const input = wrapper.find('input');
    expect(input.attributes('aria-invalid')).toBe('true');
  });

  it('disables button when loading', () => {
    const wrapper = mount(SmartURLInput, {
      props: { modelValue: 'https://example.com', loading: true }
    });
    const btn = wrapper.find('button');
    expect(btn.attributes('disabled')).toBeDefined();
  });
});
