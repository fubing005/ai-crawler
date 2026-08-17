import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { useNotifications } from '@/composables/useNotifications';
import { mockNotification } from '../setup-notification';

const Probe = defineComponent({
  setup() {
    const api = useNotifications();
    return { ...api };
  },
  template: '<div />'
});

function mountProbe() {
  return mount(Probe);
}

describe('useNotifications', () => {
  beforeEach(() => {
    mockNotification.mockClear();
    mockNotification.permission = 'default';
    mockNotification.requestPermission = vi.fn().mockResolvedValue('granted');
  });

  it('notify calls Notification constructor with title + options when permission=granted', async () => {
    mockNotification.permission = 'granted';
    const wrapper = mountProbe();
    // Trigger onMounted ref sync (already done in setup but be safe)
    await wrapper.vm.$nextTick();
    wrapper.vm.notify('爬取完成', { body: '正文', tag: 'r1' });
    expect(mockNotification).toHaveBeenCalledWith('爬取完成', {
      body: '正文',
      tag: 'r1',
      icon: undefined
    });
    expect(mockNotification).toHaveBeenCalledTimes(1);
  });

  it('requestPermission resolves to granted when stub returns granted', async () => {
    const wrapper = mountProbe();
    const result = await wrapper.vm.requestPermission();
    expect(result).toBe('granted');
    expect(wrapper.vm.permission).toBe('granted');
  });

  it('requestPermission resolves to denied when stub returns denied', async () => {
    mockNotification.requestPermission = vi.fn().mockResolvedValue('denied');
    const wrapper = mountProbe();
    const result = await wrapper.vm.requestPermission();
    expect(result).toBe('denied');
    expect(wrapper.vm.permission).toBe('denied');
  });

  it('permission ref reads Notification.permission on mount', async () => {
    mockNotification.permission = 'granted';
    const wrapper = mountProbe();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.permission).toBe('granted');
  });

  it('notify onClick callback registered and invoked with tag', async () => {
    mockNotification.permission = 'granted';
    const onClick = vi.fn();
    const wrapper = mountProbe();
    await wrapper.vm.$nextTick();
    const inst = wrapper.vm.notify('标题', { body: 'b', tag: 'tag-1', onClick }) as unknown as { onclick: null | (() => void) };
    expect(inst).not.toBeNull();
    expect(typeof inst!.onclick).toBe('function');
    inst!.onclick!();
    expect(onClick).toHaveBeenCalledWith('tag-1');
  });

  it('requestPermission returns unsupported when Notification API not available', async () => {
    const original = (globalThis as { Notification?: unknown }).Notification;
    Object.defineProperty(globalThis, 'Notification', { value: undefined, configurable: true, writable: true });
    try {
      const wrapper = mountProbe();
      const result = await wrapper.vm.requestPermission();
      expect(result).toBe('unsupported');
      expect(wrapper.vm.permission).toBe('unsupported');
    } finally {
      // restore
      (globalThis as { Notification?: unknown }).Notification = original;
    }
  });

  it('notify returns null when permission !== granted', async () => {
    mockNotification.permission = 'denied';
    const wrapper = mountProbe();
    await wrapper.vm.$nextTick();
    const result = wrapper.vm.notify('标题', { body: 'b', tag: 't' });
    expect(result).toBeNull();
    expect(mockNotification).not.toHaveBeenCalled();
  });
});
