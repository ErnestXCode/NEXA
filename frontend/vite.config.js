import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      strategies: "injectManifest",
      srcDir: "public",
      filename: "custom-sw.js",
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"], // static files only
      },
      devOptions: { enabled: true }, // SW works in localhost
    }),
  ],
});
