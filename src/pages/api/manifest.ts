import type { APIRoute } from 'astro';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { parseSTL } from '@lib/stl-reader';

export const prerender = false;

export const GET: APIRoute = () => {
  try {
    const filepath = resolve(process.cwd(), 'src/content/stl/site.stl');
    const text = readFileSync(filepath, 'utf-8');
    const doc = parseSTL(text);

    return new Response(JSON.stringify({
      format: 'stl-lang.org Manifest v1',
      site: 'https://stl-lang.org',
      statements: doc.statements,
      api: {
        content_list: '/api/content',
        content_page: '/api/content/{page}',
        content_raw: '/api/content/{page}/raw',
        manifest: '/api/manifest',
      },
      discovery: {
        'site.stl': '/.well-known/site.stl',
        'llms.txt': '/llms.txt',
        'robots.txt': '/robots.txt',
        'sitemap': '/sitemap-index.xml',
      },
      timestamp: new Date().toISOString(),
    }, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to load manifest' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
