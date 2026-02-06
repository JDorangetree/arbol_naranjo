/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    // Ambiente de testing
    environment: 'jsdom',

    // Archivos de setup
    setupFiles: ['./src/test/setup.ts'],

    // Patrones de archivos de test
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],

    // Excluir
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],

    // Globals (describe, it, expect sin importar)
    globals: true,

    // Coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/test/**',
        'src/main.tsx',
        'src/vite-env.d.ts',
      ],
      // Umbrales de coverage
      thresholds: {
        statements: 60,
        branches: 60,
        functions: 60,
        lines: 60,
      },
    },

    // Timeouts
    testTimeout: 10000,
    hookTimeout: 10000,

    // Reporter
    reporters: ['verbose'],

    // Watch mode
    watch: false,
  },
});
