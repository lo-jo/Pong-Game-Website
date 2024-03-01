// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  server: {
    // https: {
    //   key: '/etc/ssl/private/selfsigned.key',
    //   cert: '/etc/ssl/private/selfsigned.crt',
    // },
    watch: {
      usePolling: true
    }
  },
  optimizeDeps: {
    include: ['jquery'],
  },
});
