import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import HistoryCard from '@/components/simple/HistoryCard.vue';
import type { CrawlTaskRecord } from '@/types/crawl';

function makeRecord(overrides: Partial<CrawlTaskRecord> = {}): CrawlTaskRecord {
  return {
    id: 'test-id',
    url: 'https://example.com/product',
    pageTitle: '示例电商商品页',
    extractedCount: 156,
    completedAt: Date.now() - 3 * 60_000,
    status: 'completed',
    fields: [],
    ...overrides
  };
}

function mountCard(record: CrawlTaskRecord) {
  return mount(HistoryCard, {
    props: { record, exportDisabled: true },
    global: { stubs: { NIcon: true } }
  });
}

describe('HistoryCard.vue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-08T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders 已完成 badge for completed status', () => {
    const wrapper = mountCard(makeRecord({ status: 'completed' }));
    expect(wrapper.text()).toContain('已完成');
    expect(wrapper.text()).not.toContain('失败');
  });

  it('renders 失败 badge for failed status', () => {
    const wrapper = mountCard(makeRecord({ status: 'failed' }));
    expect(wrapper.text()).toContain('失败');
  });

  it('formats time relatively for recent record', () => {
    const wrapper = mountCard(makeRecord({ completedAt: Date.now() - 5 * 60_000 }));
    expect(wrapper.text()).toContain('5 分钟前');
  });

  it('formats time as absolute date for records older than 7 days', () => {
    const wrapper = mountCard(makeRecord({ completedAt: Date.now() - 10 * 24 * 60 * 60_000 }));
    expect(wrapper.text()).toMatch(/2026/);
    expect(wrapper.text()).not.toContain('天前');
  });

  it('点击删除按钮触发 delete 事件', async () => {
    const wrapper = mountCard(makeRecord());
    const deleteBtn = wrapper.findAll('button').find((b) => b.text().includes('删除'));
    expect(deleteBtn).toBeTruthy();
    await deleteBtn!.trigger('click');
    expect(wrapper.emitted('delete')).toBeTruthy();
  });

  it('点击查看按钮触发 view 事件', async () => {
    const wrapper = mountCard(makeRecord());
    const viewBtn = wrapper.findAll('button').find((b) => b.text().includes('查看'));
    expect(viewBtn).toBeTruthy();
    await viewBtn!.trigger('click');
    expect(wrapper.emitted('view')).toBeTruthy();
  });

  it('shows 未提取到数据 for zero extractedCount', () => {
    const wrapper = mountCard(makeRecord({ extractedCount: 0 }));
    expect(wrapper.text()).toContain('未提取到数据');
  });
});
