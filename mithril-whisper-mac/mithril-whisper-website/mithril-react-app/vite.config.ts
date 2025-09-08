import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// Removed rollup-plugin-critical due to headless Chromium issues on Vercel

export default defineConfig({
  plugins: [
    react(),
  ],
});
