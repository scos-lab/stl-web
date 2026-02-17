// Copy STL source files to public/ for AI agent consumption
// Also creates .stl.md copies for models that can't read .stl extension
import { cpSync, mkdirSync, readdirSync, readFileSync, writeFileSync, copyFileSync } from 'fs';
import { resolve, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const src = resolve(root, 'src/content/stl');
const pubContent = resolve(root, 'public/content');
const pubWellKnown = resolve(root, 'public/.well-known');

mkdirSync(pubContent, { recursive: true });
mkdirSync(pubWellKnown, { recursive: true });

// Copy all .stl files to public/content/
cpSync(src, pubContent, { recursive: true });

// Copy site.stl to .well-known/
cpSync(resolve(src, 'site.stl'), resolve(pubWellKnown, 'site.stl'));

// --- Create .stl.md copies for format accessibility ---

// Copy each .stl file as .stl.md in public/content/
const stlFiles = readdirSync(src).filter(f => f.endsWith('.stl'));
for (const file of stlFiles) {
  copyFileSync(resolve(pubContent, file), resolve(pubContent, file + '.md'));
}

// Create site.stl.md in .well-known/ with updated content map paths
let siteContent = readFileSync(resolve(src, 'site.stl'), 'utf-8');
// Update all /content/*.stl paths to /content/*.stl.md
siteContent = siteContent.replace(/path="\/content\/(\w+)\.stl"/g, 'path="/content/$1.stl.md"');
writeFileSync(resolve(pubWellKnown, 'site.stl.md'), siteContent);

console.log('STL files copied to public/content/ and public/.well-known/');
console.log('.stl.md copies created for format accessibility testing');
