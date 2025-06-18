// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: false,
  },
  css: {
    preprocessorOptions: {
      css: {
        charset: false,
      },
    },
  },
});
