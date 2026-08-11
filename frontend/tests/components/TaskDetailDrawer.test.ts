import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TaskDetailDrawer from '@/components/simple/TaskDetailDrawer.vue';
import type { CrawlTaskRecord } from '@/types/crawl';

function makeRecord(overrides: Partial<CrawlTaskRecord> = {}): CrawlTaskRecord {
  return {
    id: 'abcdef1234567890',
    url: 'https://example.com/product',
    pageTitle: '示例电商商品页',
    extractedCount: 156,
    completedAt: Date.now() - 3 * 60_000,
    status: 'completed',
    fields: [
      { name: 'title', selector: 'h1.product-title', confidence: 0.95, sample: '示例商品' },
      { name: 'price', selector: 'span.price', confidence: 0.9, sample: '¥299.00' }
    ],
    ...overrides
  };
}

function mountDrawer(show: boolean, record: CrawlTaskRecord | null) {
  return mount(TaskDetailDrawer, {
    props: { show, record, now: Date.now() },
    global: {
      stubs: {
        NIcon: true,
        NProgress: true,
        NEllipsis: { template: '<div><slot /></div>' },
        Drawer: {
          name: 'Drawer',
          props: {
            show: Boolean,
            width: [Number, String],
            placement: String,
            closable: Boolean
          },
          template: '<div><slot /></div>'
        },
        DrawerContent: {
          name: 'DrawerContent',
          template: '<div><slot name="title" /><slot /><slot name="footer" /></div>'
        },
        NEmpty: { template: '<div><slot name="extra" />{{ description }}</div>' },
        NTag: { template: '<span><slot /></span>' },
        NText: { template: '<span><slot /></span>' },
        NButton: { template: '<button :disabled="disabled"><slot /></button>' }
      }
    }
  });
}

describe('TaskDetailDrawer.vue', () => {
  it('renders field list when record is non-null', () => {
    const wrapper = mountDrawer(true, makeRecord());
    expect(wrapper.text()).toContain('AI 识别的字段');
    expect(wrapper.text()).toContain('title');
    expect(wrapper.text()).toContain('price');
    expect(wrapper.text()).toContain('h1.product-title');
  });

  it('renders 还没有详情 empty state when record is null', () => {
    const wrapper = mountDrawer(true, null);
    expect(wrapper.text()).toContain('还没有详情');
  });

  it('导出数据 button is disabled', () => {
    const wrapper = mountDrawer(true, makeRecord());
    const exportBtn = wrapper.findAll('button').find((b) => b.text().includes('导出数据'));
    expect(exportBtn).toBeTruthy();
    expect(exportBtn!.attributes('disabled')).toBeDefined();
  });

  it('forwards update:show=false from NDrawer to parent emit', async () => {
    const wrapper = mountDrawer(true, makeRecord());
    const drawer = wrapper.findComponent({ name: 'Drawer' });
    expect(drawer.exists()).toBe(true);
    expect(drawer.props('show')).toBe(true);
    expect(drawer.props('placement')).toBe('right');
    drawer.vm.$emit('update:show', false);
    await wrapper.vm.$nextTick();
    const events = wrapper.emitted('update:show');
    expect(events).toBeTruthy();
    expect(events![0]).toEqual([false]);
  });
});
