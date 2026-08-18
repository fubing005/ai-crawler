import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mockAnalyzeResponse } from '@/mocks/analyze-mock';

describe('api/analyze.ts', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('真实分支发起 POST /api/v1/page-analyses 并解包信封', async () => {
    vi.stubEnv('MODE', 'development');
    vi.stubEnv('VITE_MOCK_BACKEND', '');
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockAnalyzeResponse, message: 'Success' })
    });
    vi.stubGlobal('fetch', fetchMock);
    const { analyze } = await import('@/api/analyze');
    const result = await analyze('https://example.com/product');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/v1/page-analyses');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ url: 'https://example.com/product' });
    expect(result.page_title).toBe(mockAnalyzeResponse.page_title);
    expect(result.detected_type).toBe('ecommerce');
  });

  it('非 2xx 响应抛出携带后端错误码的 Error', async () => {
    vi.stubEnv('MODE', 'development');
    vi.stubEnv('VITE_MOCK_BACKEND', '');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        json: async () => ({ error: { code: 'UNREACHABLE', message: '无法访问该网站' } })
      })
    );
    const { analyze } = await import('@/api/analyze');
    await expect(analyze('https://example.com/x')).rejects.toThrow('UNREACHABLE');
  });

  it('非 2xx 且响应体无错误码时使用默认错误码', async () => {
    vi.stubEnv('MODE', 'development');
    vi.stubEnv('VITE_MOCK_BACKEND', '');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) })
    );
    const { analyze } = await import('@/api/analyze');
    await expect(analyze('https://example.com/x')).rejects.toThrow('ANALYZE_FAILED');
  });

  it('abort signal 透传给 fetch', async () => {
    vi.stubEnv('MODE', 'development');
    vi.stubEnv('VITE_MOCK_BACKEND', '');
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockAnalyzeResponse, message: 'Success' })
    });
    vi.stubGlobal('fetch', fetchMock);
    const { analyze } = await import('@/api/analyze');
    const controller = new AbortController();
    await analyze('https://example.com/product', { signal: controller.signal });
    expect(fetchMock.mock.calls[0][1].signal).toBe(controller.signal);
  });

  it('测试模式走 mock 分支且响应含新增字段', async () => {
    vi.stubEnv('MODE', 'test');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const { analyze } = await import('@/api/analyze');
    vi.useFakeTimers();
    const promise = analyze('https://example.com/product');
    const advanced = vi.advanceTimersByTimeAsync(800);
    const result = (await Promise.all([promise, advanced]))[0];
    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.detected_type).toBe('ecommerce');
    expect(result.overall_confidence).toBe(0.9);
    expect(result.main_content_selector).toBe('ul.product-list');
    vi.useRealTimers();
  });
});
