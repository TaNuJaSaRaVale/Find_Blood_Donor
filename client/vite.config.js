import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// During development every call to /api/... is forwarded to the Express server on port 5000,
// so the frontend and backend behave as if they were on the same origin.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
});
