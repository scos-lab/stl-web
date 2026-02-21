import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import remarkDocLinks from './src/lib/remark-doc-links.mjs';
import stlLang from './src/lib/stl-lang.mjs';

export default defineConfig({
  site: 'https://stl-lang.org',
  integrations: [tailwind(), mdx(), sitemap()],
  output: 'static',
  markdown: {
    remarkPlugins: [remarkDocLinks],
    shikiConfig: {
      theme: 'one-dark-pro',
      langs: [stlLang],
    },
  },
});
