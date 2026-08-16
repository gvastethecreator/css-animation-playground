import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite-plus';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/css-animation-playground/' : '/',
  server: {
    port: 3000,
    host: process.env.VITE_HOST || '127.0.0.1',
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, '.'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['utils/**', 'hooks/**', 'store/**', 'easing.ts', 'components/**'],
      reportsDirectory: './coverage',
    },
  },
  fmt: {
    semi: true,
    singleQuote: true,
    trailingComma: 'all',
    printWidth: 120,
    tabWidth: 2,
    ignorePatterns: ['docs/codemap/**'],
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  build: {
    target: 'es2022',
    sourcemap: false,
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, '/');

          if (normalizedId.includes('/node_modules/react/') || normalizedId.includes('/node_modules/react-dom/')) {
            return 'vendor-react';
          }

          if (normalizedId.includes('/node_modules/three/')) {
            return 'vendor-three';
          }

          return undefined;
        },
      },
    },
  },
});
