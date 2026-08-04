import { vi } from 'vitest';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body><div id="app"></div></body></html>', {
  url: 'http://localhost/'
});

globalThis.window = dom.window as unknown as typeof globalThis.window;
globalThis.document = dom.window.document;
globalThis.navigator = dom.window.navigator;
globalThis.localStorage = (() => {
  let store: Record<string, string> = {};
  const ls: Storage = {
    get length() { return Object.keys(store).length; },
    key: (i: number) => Object.keys(store)[i] ?? null,
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => {
      store[k] = String(v);
    },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { store = {}; }
  };
  return ls;
})();

globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.customElements = dom.window.customElements;

// canvas-confetti stub
vi.mock('canvas-confetti', () => ({
  default: vi.fn()
}));
