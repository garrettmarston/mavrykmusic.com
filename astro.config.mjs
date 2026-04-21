// @ts-check
import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://mavrykmusic.com",
  output: "static",

  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
  }),

  integrations: [react(), sitemap()],
});