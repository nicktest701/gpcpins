import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5002,
  },
  plugins: [
    react(),


  ],
  resolve: {
    alias: {
      '@': '/src', // Add this alias
    },
  },

});