import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Served behind the LaMaison nginx hub at /laplante/ (uniform access pattern).
  // Assets are emitted under /laplante/assets/... so the hub can proxy /laplante/ → backend :3001.
  base: '/laplante/',
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/photos': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
});
