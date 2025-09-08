import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import critical from 'rollup-plugin-critical';

export default defineConfig({
  plugins: [
    react(),
    critical({
      criticalUrl: './dist/index.html',
      criticalBase: './dist',
      criticalPages: [
        { uri: 'index.html', template: 'index' }
      ],
      criticalConfig: {
        inline: true,
        extract: false,
        width: 1200,
        height: 900,
      },
    }),
  ],
});
