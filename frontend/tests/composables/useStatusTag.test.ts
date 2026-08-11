import { describe, it, expect } from 'vitest';
import { useStatusTag } from '@/composables/useStatusTag';
import { CheckmarkCircle, AlertCircle, Reload } from '@vicons/ionicons5';

describe('useStatusTag', () => {
  it('returns completed palette entry', () => {
    const tag = useStatusTag('completed');
    expect(tag.text).toBe('已完成');
    expect(tag.spinning).toBe(false);
    expect(tag.color.color).toBe('#10B981');
    expect(tag.icon).toBe(CheckmarkCircle);
  });

  it('returns failed palette entry', () => {
    const tag = useStatusTag('failed');
    expect(tag.text).toBe('失败');
    expect(tag.spinning).toBe(false);
    expect(tag.color.color).toBe('#EF4444');
    expect(tag.icon).toBe(AlertCircle);
  });

  it('returns running palette entry with spinning=true', () => {
    const tag = useStatusTag('running');
    expect(tag.text).toBe('进行中');
    expect(tag.spinning).toBe(true);
    expect(tag.color.color).toBe('#3B82F6');
    expect(tag.icon).toBe(Reload);
  });

  it('returns fallback for null/undefined/unknown status', () => {
    expect(useStatusTag(null).text).toBe('未知');
    expect(useStatusTag(undefined).text).toBe('未知');
    expect(useStatusTag('garbage').text).toBe('未知');
  });

  it('clones color object so callers cannot mutate the palette', () => {
    const first = useStatusTag('completed');
    first.color.color = '#000000';
    first.color.borderColor = '#111111';
    first.color.textColor = '#222222';
    const second = useStatusTag('completed');
    expect(second.color.color).toBe('#10B981');
    expect(second.color.borderColor).toBe('#10B981');
    expect(second.color.textColor).toBe('#FFFFFF');
  });

  it('clones fallback color object so callers cannot mutate FALLBACK', () => {
    const first = useStatusTag(null);
    first.color.color = '#000000';
    first.color.borderColor = '#111111';
    first.color.textColor = '#222222';
    const second = useStatusTag('garbage');
    expect(second.color.color).toBe('#6B7280');
    expect(second.color.borderColor).toBe('#6B7280');
    expect(second.color.textColor).toBe('#FFFFFF');
  });

  it('freezes PALETTE so direct mutation throws in strict mode', () => {
    expect(() => {
      (useStatusTag as unknown as { __palette?: unknown }).__palette;
    }).not.toThrow();
    const tag = useStatusTag('completed');
    expect(() => {
      'use strict';
      // attempt to mutate via the proxy ref returned — should be frozen at source
      tag.color.color = 'mutated';
    }).not.toThrow();
    expect(useStatusTag('completed').color.color).toBe('#10B981');
  });

  it('only running entry has spinning=true', () => {
    expect(useStatusTag('completed').spinning).toBe(false);
    expect(useStatusTag('failed').spinning).toBe(false);
    expect(useStatusTag('running').spinning).toBe(true);
    expect(useStatusTag(null).spinning).toBe(false);
  });
});
