import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import critical from 'rollup-plugin-critical';

export default defineConfig({
  plugins: [
    react(),
    critical({
      // Use dist directory as base; plugin appends page uri
      criticalUrl: './dist/',
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
