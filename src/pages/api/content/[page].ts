import type { APIRoute } from 'astro';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { parseSTL } from '@lib/stl-reader';

const CONTENT_DIR = resolve(process.cwd(), 'src/content/stl');

const VALID_PAGES = ['homepage', 'about', 'tools', 'spec', 'aso', 'nav', 'docs-nav', 'site'];

export const prerender = false;

export const GET: APIRoute = ({ params }) => {
  const page = params.page;

  if (!page || !VALID_PAGES.includes(page)) {
    return new Response(JSON.stringify({
      error: 'Not found',
      valid_pages: VALID_PAGES,
    }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    const filepath = resolve(CONTENT_DIR, `${page}.stl`);
    const text = readFileSync(filepath, 'utf-8');
    const doc = parseSTL(text);

    return new Response(JSON.stringify({
      page,
      statements: doc.statements,
      comments: doc.comments,
      statement_count: doc.statements.length,
      raw_stl_url: `/api/content/${page}/raw`,
      timestamp: new Date().toISOString(),
    }, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: `Failed to load page: ${page}` }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};
