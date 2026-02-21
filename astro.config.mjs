import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import remarkDocLinks from './src/lib/remark-doc-links.mjs';
import stlLang from './src/lib/stl-lang.mjs';

export default defineConfig({
  integrations: [tailwind(), mdx()],
  output: 'static',
  markdown: {
    remarkPlugins: [remarkDocLinks],
    shikiConfig: {
      theme: 'one-dark-pro',
      langs: [stlLang],
    },
  },
});
