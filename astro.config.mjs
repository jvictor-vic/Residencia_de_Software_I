// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.example.com',
  trailingSlash: 'always',

  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Roboto',
      cssVariable: '--font-roboto',
      weights: [600, 700, 800, 900],
      fallbacks: ['Arial', 'sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Cabin',
      cssVariable: '--font-cabin',
      weights: [500, 600],
      fallbacks: ['Trebuchet MS', 'Arial', 'sans-serif'],
    },
  ],

  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
});
