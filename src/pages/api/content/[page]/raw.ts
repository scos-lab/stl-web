import type { APIRoute } from 'astro';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const CONTENT_DIR = resolve(process.cwd(), 'src/content/stl');

const VALID_PAGES = ['homepage', 'about', 'tools', 'spec', 'aso', 'nav', 'docs-nav', 'site'];

export const prerender = false;

export const GET: APIRoute = ({ params }) => {
  const page = params.page;

  if (!page || !VALID_PAGES.includes(page)) {
    return new Response('Not found', { status: 404 });
  }

  try {
    const filepath = resolve(CONTENT_DIR, `${page}.stl`);
    const text = readFileSync(filepath, 'utf-8');

    return new Response(text, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return new Response('Failed to load', { status: 500 });
  }
};
