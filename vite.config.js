import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In local dev each /api prefix is proxied to the service that owns it, so the
// browser only ever talks to the Vite dev server (no CORS needed).
const services = {
  '/api/customers': 'http://localhost:8081',
  '/api/emails': 'http://localhost:8082',
  '/api/analytics': 'http://localhost:8083',
};

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: Object.fromEntries(
      Object.entries(services).map(([path, target]) => [path, { target, changeOrigin: true }]),
    ),
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
});
