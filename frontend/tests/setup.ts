import { vi, beforeEach, afterEach } from 'vitest';

beforeEach(() => {
  const cryptoStub = {
    randomUUID: () => 'mock-uuid-' + Math.random().toString(36).slice(2, 10)
  };
  vi.stubGlobal('crypto', cryptoStub);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// canvas-confetti stub
vi.mock('canvas-confetti', () => ({
  default: vi.fn()
}));
