import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [],
  root: 'src-modern',
  publicDir: '../public-assets',
  base: './',
  build: {
    outDir: '../dist-modern',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(fileURLToPath(new URL('.', import.meta.url)), 'src-modern/index.html'),
        analytics: resolve(fileURLToPath(new URL('.', import.meta.url)), 'src-modern/analytics.html'),
        calendar: resolve(fileURLToPath(new URL('.', import.meta.url)), 'src-modern/calendar.html'),
        orders: resolve(fileURLToPath(new URL('.', import.meta.url)), 'src-modern/orders.html'),
        products: resolve(fileURLToPath(new URL('.', import.meta.url)), 'src-modern/products.html'),
        settings: resolve(fileURLToPath(new URL('.', import.meta.url)), 'src-modern/settings.html'),
        users: resolve(fileURLToPath(new URL('.', import.meta.url)), 'src-modern/users.html')
      }
    }
  },
  server: {
    port: 3000,
    open: true
    ,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path

      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin', 'color-functions']
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(fileURLToPath(new URL('.', import.meta.url)), 'src-modern'),
      '~bootstrap': resolve(fileURLToPath(new URL('.', import.meta.url)), 'node_modules/bootstrap'),
    }
  }
}); 