// Copy documentation .md files from semantic-tension-language/docs/ to src/content/docs/
// Only copies the 5 user-facing directories + index.md (excludes internal reports, security docs, stlc specs)
import { cpSync, mkdirSync, copyFileSync, readdirSync, statSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const docsSource = resolve(root, '..', 'semantic-tension-language', 'docs');
const docsDest = resolve(root, 'src', 'content', 'docs');

// Clean and recreate destination
mkdirSync(docsDest, { recursive: true });

// Directories to copy (user-facing docs only)
const dirs = ['getting-started', 'guides', 'reference', 'tutorials', 'schemas'];

for (const dir of dirs) {
  const src = resolve(docsSource, dir);
  const dest = resolve(docsDest, dir);
  cpSync(src, dest, {
    recursive: true,
    filter: (source) => {
      // Skip .stl.schema files (binary-ish domain schemas, not markdown docs)
      if (source.endsWith('.stl.schema')) return false;
      return true;
    },
  });
}

// Copy index.md as the docs landing page
copyFileSync(resolve(docsSource, 'index.md'), resolve(docsDest, 'index.md'));

// Count copied files
let count = 0;
function countFiles(dir) {
  for (const entry of readdirSync(dir)) {
    const full = resolve(dir, entry);
    if (statSync(full).isDirectory()) countFiles(full);
    else count++;
  }
}
countFiles(docsDest);

console.log(`Copied ${count} doc files to src/content/docs/`);
