import { defineConfig } from 'electron-vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';

export default defineConfig({
  main: {
    build: {
      outDir: 'dist-electron',
      lib: {
        entry: 'electron/main.ts',
        formats: ['cjs'],
        fileName: () => 'main.cjs'
      },
      rollupOptions: {
        external: ['electron', 'electron-log']
      }
    },
    resolve: {
      alias: {
        '@electron': resolve(__dirname, 'electron')
      }
    }
  },
  preload: {
    build: {
      outDir: 'dist-electron',
      emptyOutDir: false,
      lib: {
        entry: 'electron/preload.ts',
        formats: ['cjs'],
        fileName: () => 'preload.cjs'
      },
      rollupOptions: {
        external: ['electron']
      }
    }
  },
  renderer: {
    root: '.',
    build: {
      outDir: 'dist-renderer',
      target: 'esnext',
      rollupOptions: {
        input: resolve(__dirname, 'index.html')
      }
    },
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    server: {
      proxy: {
        '/api/v1': {
          target: 'http://localhost:8000',
          bypass: (req) => {
            if (process.env.VITE_MOCK_BACKEND === 'true') {
              return req.url;
            }
            return null;
          }
        }
      }
    }
  }
});
