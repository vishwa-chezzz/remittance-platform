import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The proxy forwards /api calls to the Express server, so no CORS headaches in dev
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': 'http://localhost:5000' } },
});
