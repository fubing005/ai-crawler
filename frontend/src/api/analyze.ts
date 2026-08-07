import type { AnalyzeResponse, CrawlStage } from '@/types/analyze';
import { mockAnalyzeResponse } from '@/mocks/analyze-mock';

const MOCK_FINAL_EXTRACTED_COUNT = 156;

export interface AnalyzeOptions {
  signal?: AbortSignal;
}

export type ProgressHandler = (progress: number, stage: CrawlStage, extractedCount: number) => void;

const MOCK_BACKEND =
  import.meta.env.DEV ||
  import.meta.env.MODE === 'test' ||
  import.meta.env.VITE_MOCK_BACKEND === 'true';

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

export async function getCrawlProgress(
  taskId: string,
  onProgress: ProgressHandler,
  options: AnalyzeOptions = {}
): Promise<void> {
  if (options.signal?.aborted) return Promise.resolve();
  if (MOCK_BACKEND) {
    return new Promise<void>((resolve) => {
      let progress = 0;
      let stage: CrawlStage = 'analyzing';
      let count = 0;
      const id = setInterval(() => {
        if (options.signal?.aborted) {
          clearInterval(id);
          resolve();
          return;
        }
        progress = Math.min(progress + 5, 100);
        if (progress < 60) {
          stage = 'analyzing';
        } else if (progress < 100) {
          stage = 'extracting';
          count = Math.round(((progress - 60) / 40) * MOCK_FINAL_EXTRACTED_COUNT);
        } else {
          stage = 'completed';
          count = 156;
        }
        onProgress(progress, stage, count);
        if (progress >= 100) {
          clearInterval(id);
          resolve();
        }
      }, 200);
      options.signal?.addEventListener('abort', () => {
        clearInterval(id);
        resolve();
      });
    });
  }
  const ws = new WebSocket(`ws://localhost:8000/ws/progress/${taskId}`);
  await new Promise<void>((resolve, reject) => {
    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload?.event === 'crawl_progress') {
          onProgress(
            payload.data.progress,
            payload.data.stage,
            payload.data.extracted_count
          );
        } else if (payload?.event === 'task_completed') {
          onProgress(100, 'completed', payload.data.extracted_count);
          ws.close();
          resolve();
        }
      } catch {
        reject(new Error('invalid ws payload'));
      }
    };
    ws.onerror = () => reject(new Error('ws error'));
    ws.onclose = () => resolve();
    options.signal?.addEventListener('abort', () => ws.close());
  });
}
