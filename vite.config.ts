import { defineConfig } from 'vite';
import reactPlugin from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactPlugin()],
  build: {
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2018',
    cssTarget: 'es2018',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
    // Rimuove debugger/console in produzione senza impattare funzionalità
    esbuild: {
      drop: ['console', 'debugger'],
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
