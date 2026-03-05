import type { APIRoute } from 'astro';

const PAGES = [
  { name: 'homepage', description: 'Landing page with STL overview and key features' },
  { name: 'about', description: 'STL language overview, design philosophy, anchor system' },
  { name: 'tools', description: 'Tool ecosystem: stl_parser, CLI, MCP tools, schemas' },
  { name: 'spec', description: 'STL specification documents and quick reference' },
  { name: 'aso', description: 'AI Search Optimization: SEO to ASO paradigm shift' },
  { name: 'nav', description: 'Site navigation structure' },
  { name: 'docs-nav', description: 'Documentation sidebar navigation' },
  { name: 'site', description: 'Site semantic manifest for AI agents' },
];

export const prerender = false;

export const GET: APIRoute = () => {
  return new Response(JSON.stringify({
    format: 'stl-lang.org API v1',
    pages: PAGES.map(p => ({
      ...p,
      content_url: `/api/content/${p.name}`,
      raw_stl_url: `/api/content/${p.name}/raw`,
    })),
    manifest_url: '/api/manifest',
    timestamp: new Date().toISOString(),
  }, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
