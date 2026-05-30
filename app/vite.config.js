import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5002,
    proxy: {
      "/socket.io": {
        target: "http://localhost:5000", // Your backend server port
        ws: true, // CRITICAL: Tells Vite to proxy WebSockets
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src", // Add this alias
    },
  },
});
