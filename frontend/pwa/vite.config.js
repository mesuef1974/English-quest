import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/icon-192.svg", "icons/icon-512.svg"],
      manifest: {
        name: "English Quest — رحلة تعلّم الإنجليزية",
        short_name: "English Quest",
        description: "تطبيق تعليمي تفاعلي لتعليم الإنجليزية للأطفال العرب",
        theme_color: "#1A1A2E",
        background_color: "#0f172a",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        dir: "rtl",
        lang: "ar",
        categories: ["education", "kids"],
        icons: [
          { src: "icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml", purpose: "any" },
          { src: "icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml", purpose: "any" },
          { src: "icons/icon-maskable.svg", sizes: "512x512", type: "image/svg+xml", purpose: "maskable" },
        ],
        screenshots: [],
        shortcuts: [
          {
            name: "ابدأ اللعب",
            short_name: "العب",
            url: "/?mode=play",
            icons: [{ src: "icons/icon-192.svg", sizes: "192x192" }]
          }
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: "CacheFirst",
            options: { cacheName: "google-fonts-stylesheets", expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: "CacheFirst",
            options: { cacheName: "google-fonts-webfonts", expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            urlPattern: /^https:\/\/translate\.google\.com\/translate_tts/,
            handler: "CacheFirst",
            options: { cacheName: "tts-audio-cache", expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 } },
          },
        ],
      },
    }),
  ],
  server: { port: 3000 },
  build: { outDir: "dist", sourcemap: false },
});
