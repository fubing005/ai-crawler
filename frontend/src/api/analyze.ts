import type { AnalyzeResponse } from '@/types/analyze';
import { mockAnalyzeResponse } from '@/mocks/analyze-mock';

export interface AnalyzeOptions {
  signal?: AbortSignal;
}

const MOCK_BACKEND =
  import.meta.env.DEV || import.meta.env.VITE_MOCK_BACKEND === 'true';

export async function analyze(url: string, options: AnalyzeOptions = {}): Promise<AnalyzeResponse> {
  if (MOCK_BACKEND) {
    await new Promise((r) => setTimeout(r, 800));
    return { ...mockAnalyzeResponse, page_title: `${mockAnalyzeResponse.page_title} — ${url}` };
  }
  const target = `/api/v1/analyze?url=${encodeURIComponent(url)}`;
  const res = await fetch(target, { signal: options.signal });
  if (!res.ok) {
    throw new Error(`analyze failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as AnalyzeResponse;
}

export async function crawl(url: string, fields: string[], options: AnalyzeOptions = {}): Promise<{ rows: number }> {
  if (MOCK_BACKEND) {
    await new Promise((r) => setTimeout(r, 1200));
    return { rows: fields.length };
  }
  const res = await fetch('/api/v1/crawl', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, fields }),
    signal: options.signal
  });
  if (!res.ok) throw new Error(`crawl failed: ${res.status}`);
  return (await res.json());
}

export async function testAiProvider(endpoint: string, options: AnalyzeOptions = {}): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);
  try {
    if (options.signal) {
      options.signal.addEventListener('abort', () => controller.abort(), { once: true });
    }
    if (MOCK_BACKEND) {
      await new Promise((r) => setTimeout(r, 200));
      clearTimeout(timeoutId);
      return endpoint.includes('localhost') || endpoint.includes('127.0.0.1');
    }
    const res = await fetch('/api/v1/ai-providers/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return res.ok;
  } catch {
    clearTimeout(timeoutId);
    return false;
  }
}
