import { describe, it, expect } from 'vitest';
import { formatRelativeTime, formatAbsoluteTime } from '@/composables/useRelativeTime';

const NOW = new Date('2026-08-08T12:00:00').getTime();

describe('formatRelativeTime', () => {
  it('returns 刚刚 under 60s', () => {
    expect(formatRelativeTime(NOW - 5_000, NOW)).toBe('刚刚');
    expect(formatRelativeTime(NOW - 59_999, NOW)).toBe('刚刚');
  });

  it('returns minutes format under 60m', () => {
    expect(formatRelativeTime(NOW - 60_000, NOW)).toBe('1 分钟前');
    expect(formatRelativeTime(NOW - 5 * 60_000, NOW)).toBe('5 分钟前');
    expect(formatRelativeTime(NOW - 59 * 60_000, NOW)).toBe('59 分钟前');
  });

  it('returns hours format under 24h', () => {
    expect(formatRelativeTime(NOW - 60 * 60_000, NOW)).toBe('1 小时前');
    expect(formatRelativeTime(NOW - 2 * 60 * 60_000, NOW)).toBe('2 小时前');
    expect(formatRelativeTime(NOW - 23 * 60 * 60_000, NOW)).toBe('23 小时前');
  });

  it('handles 61m boundary (still 1 小时前, not 2 小时前)', () => {
    expect(formatRelativeTime(NOW - 61 * 60_000, NOW)).toBe('1 小时前');
    expect(formatRelativeTime(NOW - 119 * 60_000, NOW)).toBe('1 小时前');
  });

  it('returns days format under 7d', () => {
    expect(formatRelativeTime(NOW - 24 * 60 * 60_000, NOW)).toBe('1 天前');
    expect(formatRelativeTime(NOW - 3 * 24 * 60 * 60_000, NOW)).toBe('3 天前');
    expect(formatRelativeTime(NOW - 6 * 24 * 60 * 60_000, NOW)).toBe('6 天前');
  });

  it('handles 25h boundary (still 1 天前, not 2 天前)', () => {
    expect(formatRelativeTime(NOW - 25 * 60 * 60_000, NOW)).toBe('1 天前');
    expect(formatRelativeTime(NOW - 47 * 60 * 60_000, NOW)).toBe('1 天前');
  });

  it('returns absolute date on >=7d', () => {
    const out = formatRelativeTime(NOW - 8 * 24 * 60 * 60_000, NOW);
    expect(out).toMatch(/2026/);
    expect(out).not.toContain('天前');
  });

  it('handles 100 days ago with absolute date', () => {
    const out = formatRelativeTime(NOW - 100 * 24 * 60 * 60_000, NOW);
    expect(out).toMatch(/2026/);
  });
});

describe('formatAbsoluteTime', () => {
  it('produces a locale string containing year and time digits', () => {
    const out = formatAbsoluteTime(NOW);
    expect(out).toContain('2026');
    expect(out).toMatch(/\d{2}:\d{2}/);
  });
});
