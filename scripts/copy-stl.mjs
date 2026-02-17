// Copy STL source files to public/ for AI agent consumption
import { cpSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
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

console.log('STL files copied to public/content/ and public/.well-known/');
