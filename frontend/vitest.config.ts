import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [vue()],
  define: {
    'import.meta.env.VITE_MOCK_BACKEND': JSON.stringify('true')
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@electron': resolve(__dirname, 'electron')
    }
  },
  test: {
    environment: 'jsdom',
    include: [
      'tests/unit/**/*.test.ts',
      'tests/components/**/*.test.ts',
      'tests/stores/**/*.test.ts',
      'tests/composables/**/*.test.ts'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: [
        'electron/services/**/*.ts',
        'src/composables/**/*.ts',
        'src/api/**/*.ts',
        'src/stores/**/*.ts',
        'src/components/**/*.vue',
        'src/views/**/*.vue'
      ],
      exclude: ['tests/**', 'dist-electron/**', 'dist-renderer/**', '**/*.test.ts', '**/*.spec.ts']
    }
  }
});
