import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true,
    },
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    allowedHosts: ["oresto.local"], // 👈 autorise l'accès à oresto.local
  },
});
