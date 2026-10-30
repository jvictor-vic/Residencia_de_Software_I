// @ts-check
import { defineConfig } from "astro/config";

const siteUrl = process.env.URL || "https://www.localhost.com";

// https://astro.build/config
export default defineConfig({
  site: siteUrl,
  base: "/docs",
  trailingSlash: "always",

  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
});
