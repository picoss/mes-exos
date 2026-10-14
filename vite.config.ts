import preact from "@preact/preset-vite";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vitest/config";
import { APP_DESCRIPTION, APP_NAME, DEFAULT_THEME } from "./src/config.ts";

export default defineConfig({
  // Chemins relatifs : le site marche quelle que soit son adresse (ex. <user>.github.io/<dépôt>/).
  base: "./",
  plugins: [
    preact(),
    {
      name: "app-name",
      transformIndexHtml: (html) =>
        html.replaceAll("%APP_NAME%", APP_NAME).replaceAll("%APP_DESCRIPTION%", APP_DESCRIPTION),
    },
    VitePWA({
      registerType: "prompt",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: APP_NAME,
        short_name: APP_NAME,
        description: APP_DESCRIPTION,
        lang: "fr",
        start_url: ".",
        scope: ".",
        display: "standalone",
        background_color: DEFAULT_THEME.colors.bg,
        theme_color: DEFAULT_THEME.colors.bg,
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "icons/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
      },
    }),
  ],
  test: {
    include: ["src/**/*.test.ts"],
  },
});
