// vite.config.js
import { defineConfig } from 'vite';
// import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  root: 'src',
  server: {
    https: {
      key: '/etc/ssl/private/selfsigned.key',
      cert: '/etc/ssl/private/selfsigned.crt',
    },
    watch: {
      usePolling: true
    }
  },
  // plugins: [
  //   basicSsl()
  // ]
});
