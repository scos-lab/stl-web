/**
 * Remark plugin: rewrite relative .md links to /docs/ URLs.
 *
 * Transforms:
 *   getting-started/installation.md  →  /docs/getting-started/installation
 *   ../spec/stl-core-spec-v1.0.md    →  GitHub raw link
 *   PROJECT_INDEX.md                  →  GitHub raw link (not uploaded)
 *   https://...                       →  unchanged (absolute URLs)
 */
import { visit } from 'unist-util-visit';

const GITHUB_BASE = 'https://github.com/scos-lab/semantic-tension-language/blob/main';

// Files/paths that exist on the docs site
const SITE_DIRS = ['getting-started', 'tutorials', 'guides', 'reference', 'schemas'];

export default function remarkDocLinks() {
  return (tree, file) => {
    visit(tree, 'link', (node) => {
      const url = node.url;
      if (!url || url.startsWith('http://') || url.startsWith('https://') || url.startsWith('#')) {
        return;
      }

      // Handle relative .md links
      if (url.endsWith('.md') || url.includes('.md#')) {
        const [path, hash] = url.split('#');
        const cleanPath = path.replace(/\.md$/, '');

        // ../spec/ references → GitHub
        if (cleanPath.startsWith('../spec/')) {
          const specPath = cleanPath.replace('../', '');
          node.url = `${GITHUB_BASE}/${specPath}.md${hash ? '#' + hash : ''}`;
          return;
        }

        // Root-level docs not on site (PROJECT_INDEX, etc.) → GitHub
        if (!cleanPath.includes('/') && cleanPath !== 'index') {
          node.url = `${GITHUB_BASE}/docs/${cleanPath}.md${hash ? '#' + hash : ''}`;
          return;
        }

        // Docs that exist on site → /docs/ URL
        const firstDir = cleanPath.split('/')[0];
        if (SITE_DIRS.includes(firstDir) || cleanPath === 'index') {
          node.url = `/docs/${cleanPath}${hash ? '#' + hash : ''}`;
          return;
        }

        // Fallback: GitHub
        node.url = `${GITHUB_BASE}/docs/${cleanPath}.md${hash ? '#' + hash : ''}`;
      }

      // Bare directory references like "reference/" or "schemas/"
      if (url.endsWith('/') && !url.includes('.')) {
        const dir = url.replace(/\/$/, '');
        if (SITE_DIRS.includes(dir)) {
          node.url = `/docs/${dir}`;
          return;
        }
      }
    });
  };
}
