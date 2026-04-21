import { defineConfig } from 'vite';
import react            from '@vitejs/plugin-react';
import { resolve }      from 'path';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      /* Mirrors the paths in tsconfig.app.json */
      '@': resolve(__dirname, './src'),
    },
    /* Vite resolves these extensions in order — no need to write them in imports */
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
  },

  server: {
    port: 5173,
    proxy: {
      /* Forward /api calls to FastAPI during development */
      '/api': {
        target:    'http://localhost:8000',
        changeOrigin: true,
      },
      /* Forward WebSocket connections */
      '/ws': {
        target:    'ws://localhost:8000',
        ws:        true,
        changeOrigin: true,
      },
    },
  },
});