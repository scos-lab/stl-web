/**
 * Build-time content loading utilities.
 * Reads .stl files from src/content/stl/ and returns typed data for Astro components.
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { parseSTL, filterByNamespace, sortByOrder, getMod, type STLDocument, type STLStatement } from './stl-reader';

const CONTENT_DIR = resolve(process.cwd(), 'src/content/stl');

function loadSTLFile(filename: string): STLDocument {
  const filepath = resolve(CONTENT_DIR, filename);
  const text = readFileSync(filepath, 'utf-8');
  return parseSTL(text);
}

// --- Page Data Types ---

export interface HeroData {
  title: string;
  subtitle: string;
  cta_text?: string;
  cta_href?: string;
}

export interface FeatureData {
  title: string;
  description: string;
  icon?: string;
  order: number;
}

export interface CodeExampleData {
  title: string;
  code: string;
  language: string;
}

export interface ToolData {
  name: string;
  description: string;
  version?: string;
  language?: string;
  tests?: string;
  loc?: string;
  modules?: string;
  install?: string;
  href?: string;
  order: number;
  features: Array<{ capability: string; api: string }>;
  commands?: Array<{ usage: string; description: string }>;
  mcpTools?: Array<{ description: string }>;
  schemas?: Array<{ domain: string; file: string }>;
}

export interface ContentBlock {
  title: string;
  description: string;
  href?: string;
  order: number;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface NavLink {
  label: string;
  href: string;
  order: number;
}

export interface MetaData {
  title: string;
  description: string;
  keywords?: string;
}

export interface ComparisonRow {
  seo: string;
  aso: string;
  order: number;
}

export interface LevelData {
  name: string;
  year: string;
  layer: string;
  description: string;
  order: number;
}

// --- Extractors ---

function extractMeta(doc: STLDocument): MetaData {
  const metaStmts = filterByNamespace(doc, 'Meta', 'source');
  const stmt = metaStmts[0];
  if (!stmt) return { title: 'STL', description: '' };
  return {
    title: getMod(stmt, 'title', 'STL'),
    description: getMod(stmt, 'description', ''),
    keywords: getMod(stmt, 'keywords'),
  };
}

function extractHero(doc: STLDocument): HeroData | null {
  const heroStmts = filterByNamespace(doc, 'Hero', 'target');
  const stmt = heroStmts[0];
  if (!stmt) return null;
  return {
    title: getMod(stmt, 'title', ''),
    subtitle: getMod(stmt, 'subtitle', ''),
    cta_text: getMod(stmt, 'cta_text'),
    cta_href: getMod(stmt, 'cta_href'),
  };
}

function extractFeatures(doc: STLDocument): FeatureData[] {
  const stmts = sortByOrder(filterByNamespace(doc, 'Feature', 'target'));
  return stmts.map(s => ({
    title: getMod(s, 'title', s.target.name),
    description: getMod(s, 'description', ''),
    icon: getMod(s, 'icon'),
    order: getMod(s, 'order', 999),
  }));
}

function extractCodeExamples(doc: STLDocument): CodeExampleData[] {
  const stmts = filterByNamespace(doc, 'CodeExample', 'target');
  return stmts.map(s => ({
    title: getMod(s, 'title', ''),
    code: String(getMod(s, 'code', '')).replace(/\\n/g, '\n'),
    language: getMod(s, 'language', 'stl'),
  }));
}

function extractContent(doc: STLDocument): ContentBlock[] {
  const stmts = sortByOrder(filterByNamespace(doc, 'Content', 'target'));
  return stmts.map(s => ({
    title: getMod(s, 'title', s.target.name),
    description: getMod(s, 'description', ''),
    href: getMod(s, 'href'),
    order: getMod(s, 'order', 999),
  }));
}

function extractFAQ(doc: STLDocument): FAQItem[] {
  const stmts = filterByNamespace(doc, 'FAQ', 'source');
  return stmts.map(s => ({
    question: getMod(s, 'question', s.source.name),
    answer: getMod(s, 'answer', ''),
  }));
}

// --- Public API ---

export function loadPage(filename: string) {
  const doc = loadSTLFile(filename);
  return {
    meta: extractMeta(doc),
    hero: extractHero(doc),
    features: extractFeatures(doc),
    codeExamples: extractCodeExamples(doc),
    content: extractContent(doc),
    faq: extractFAQ(doc),
    doc, // raw document for custom extraction
  };
}

export function loadNav() {
  const doc = loadSTLFile('nav.stl');
  const mainLinks: NavLink[] = sortByOrder(
    doc.statements.filter(s => s.source.raw === 'Nav:Main')
  ).map(s => ({
    label: getMod(s, 'label', s.target.name),
    href: getMod(s, 'href', '/'),
    order: getMod(s, 'order', 999),
  }));

  const footerLinks: NavLink[] = sortByOrder(
    doc.statements.filter(s => s.source.raw === 'Nav:Footer')
  ).map(s => ({
    label: getMod(s, 'label', s.target.name),
    href: getMod(s, 'href', '/'),
    order: getMod(s, 'order', 999),
  }));

  return { mainLinks, footerLinks };
}

export function loadTools() {
  const doc = loadSTLFile('tools.stl');
  const meta = extractMeta(doc);
  const hero = extractHero(doc);

  // Group tool data
  const toolSources = ['Tool:STL_Parser', 'Tool:CLI', 'Tool:MCP', 'Tool:Schemas'];
  const tools: ToolData[] = toolSources.map(toolSource => {
    const descStmt = doc.statements.find(s => s.source.raw === toolSource && s.target.raw === 'Description');
    if (!descStmt) return null;

    const relatedStmts = doc.statements.filter(s => s.source.raw === toolSource && s.target.raw !== 'Description');

    return {
      name: getMod(descStmt, 'name', ''),
      description: getMod(descStmt, 'description', ''),
      version: getMod(descStmt, 'version'),
      language: getMod(descStmt, 'language'),
      tests: getMod(descStmt, 'tests'),
      loc: getMod(descStmt, 'loc'),
      modules: getMod(descStmt, 'modules'),
      install: getMod(descStmt, 'install'),
      href: getMod(descStmt, 'href'),
      order: getMod(descStmt, 'order', 999),
      features: relatedStmts
        .filter(s => s.target.namespace === 'Feature')
        .map(s => ({ capability: getMod(s, 'capability', ''), api: getMod(s, 'api', '') })),
      commands: relatedStmts
        .filter(s => s.target.namespace === 'Command')
        .map(s => ({ usage: getMod(s, 'usage', ''), description: getMod(s, 'description', '') })),
      mcpTools: relatedStmts
        .filter(s => s.target.namespace === 'MCPTool')
        .map(s => ({ description: getMod(s, 'description', '') })),
      schemas: relatedStmts
        .filter(s => s.target.namespace === 'Schema')
        .map(s => ({ domain: getMod(s, 'domain', ''), file: getMod(s, 'file', '') })),
    };
  }).filter(Boolean) as ToolData[];

  return { meta, hero, tools };
}

export interface DocNavLink {
  label: string;
  href: string;
  order: number;
}

export interface DocNavSection {
  label: string;
  order: number;
  links: DocNavLink[];
}

export function loadDocsNav(): DocNavSection[] {
  const doc = loadSTLFile('docs-nav.stl');

  // Each source namespace like "DocsNav:GettingStarted" defines a section.
  // The statement pointing to "Section:*" carries the section label + order.
  // All other statements in that group are links.
  const sectionSources = [...new Set(doc.statements.map(s => s.source.raw))];

  const sections: DocNavSection[] = sectionSources.map(src => {
    const stmts = doc.statements.filter(s => s.source.raw === src);
    const sectionStmt = stmts.find(s => s.target.namespace === 'Section');
    if (!sectionStmt) return null;

    const linkStmts = sortByOrder(stmts.filter(s => s.target.namespace === 'Link'));
    return {
      label: getMod(sectionStmt, 'label', ''),
      order: getMod(sectionStmt, 'order', 999),
      links: linkStmts.map(s => ({
        label: getMod(s, 'label', s.target.name),
        href: getMod(s, 'href', '/docs'),
        order: getMod(s, 'order', 999),
      })),
    };
  }).filter(Boolean) as DocNavSection[];

  return sections.sort((a, b) => a.order - b.order);
}

export function loadASO() {
  const doc = loadSTLFile('aso.stl');
  const meta = extractMeta(doc);
  const hero = extractHero(doc);
  const content = extractContent(doc);
  const faq = extractFAQ(doc);

  // Comparison rows
  const compRows: ComparisonRow[] = sortByOrder(
    doc.statements.filter(s => s.source.raw === 'ASO:Comparison')
  ).map(s => ({
    seo: getMod(s, 'seo', ''),
    aso: getMod(s, 'aso', ''),
    order: getMod(s, 'order', 999),
  }));

  // Level data
  const levels: LevelData[] = sortByOrder(
    doc.statements.filter(s => s.source.namespace === 'ASO' && s.source.name.startsWith('Level_'))
  ).map(s => ({
    name: getMod(s, 'name', ''),
    year: String(getMod(s, 'year', '')),
    layer: getMod(s, 'layer', ''),
    description: getMod(s, 'description', ''),
    order: getMod(s, 'order', 999),
  }));

  return { meta, hero, content, faq, compRows, levels };
}
