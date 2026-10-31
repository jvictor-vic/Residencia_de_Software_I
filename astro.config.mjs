// @ts-check
import { defineConfig, fontProviders, svgoOptimizer } from 'astro/config';

import react from '@astrojs/react';

import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.example.com',
  trailingSlash: 'ignore',
  output: 'server',

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
      weights: [500, 600, 700],
      fallbacks: ['Trebuchet MS', 'Arial', 'sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Permanent Marker',
      cssVariable: '--font-permanent-marker',
      weights: [400],
      fallbacks: ['cursive'],
    },
  ],

  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },

  integrations: [react()],
  adapter: netlify(),
  experimental: {
    svgOptimizer: svgoOptimizer(),
  },
});
