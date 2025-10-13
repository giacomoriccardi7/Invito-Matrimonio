import { defineConfig } from 'vite';
import reactPlugin from '@vitejs/plugin-react';
import javascriptObfuscator from 'vite-plugin-javascript-obfuscator';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';
  return {
    plugins: [
      reactPlugin(),
      ...(isProd
        ? [
            javascriptObfuscator({
              compact: true,
              controlFlowFlattening: false,
              deadCodeInjection: false,
              debugProtection: false,
              disableConsoleOutput: true,
              identifierNamesGenerator: 'mangled',
              log: false,
              numbersToExpressions: true,
              renameGlobals: false,
              rotateStringArray: true,
              selfDefending: false,
              simplify: true,
              splitStrings: false,
              stringArray: true,
              stringArrayEncoding: ['rc4'],
              stringArrayThreshold: 0.75,
              transformObjectKeys: true,
            }),
          ]
        : []),
    ],
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
    build: {
      sourcemap: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          passes: 2,
          drop_console: true,
          drop_debugger: true,
        },
        mangle: true,
        safari10: true,
      },
    },
  };
});
