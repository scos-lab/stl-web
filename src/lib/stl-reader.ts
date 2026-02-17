/**
 * Lightweight TypeScript STL reader for build-time content extraction.
 * NOT a full parser — handles the well-formed subset of STL used in our content files.
 * Full validation is done at build time by Python stl_parser.
 */

export interface STLAnchor {
  name: string;
  namespace?: string;
  raw: string;
}

export interface STLModifiers {
  [key: string]: string | number | boolean;
}

export interface STLStatement {
  source: STLAnchor;
  target: STLAnchor;
  modifiers: STLModifiers;
}

export interface STLDocument {
  statements: STLStatement[];
  comments: string[];
}

function parseAnchor(raw: string): STLAnchor {
  const trimmed = raw.trim();
  if (trimmed.includes(':')) {
    const colonIdx = trimmed.indexOf(':');
    return {
      namespace: trimmed.slice(0, colonIdx),
      name: trimmed.slice(colonIdx + 1),
      raw: trimmed,
    };
  }
  return { name: trimmed, raw: trimmed };
}

function parseModifierValue(val: string): string | number | boolean {
  const trimmed = val.trim();
  // Boolean
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  // Number
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return parseFloat(trimmed);
  // Quoted string — remove quotes
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseModifiers(modStr: string): STLModifiers {
  const result: STLModifiers = {};
  // Match key=value pairs, handling quoted strings with commas inside
  const regex = /(\w+)\s*=\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|[^,)]+)/g;
  let match;
  while ((match = regex.exec(modStr)) !== null) {
    const key = match[1];
    const rawVal = match[2];
    result[key] = parseModifierValue(rawVal);
  }
  return result;
}

export function parseSTL(text: string): STLDocument {
  const lines = text.split('\n');
  const statements: STLStatement[] = [];
  const comments: string[] = [];

  // Join multiline statements (lines that start with whitespace followed by ::mod or key=)
  const joinedLines: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '' || trimmed.startsWith('#')) {
      if (trimmed.startsWith('#')) comments.push(trimmed.slice(1).trim());
      joinedLines.push(''); // preserve blank lines as separators
      continue;
    }
    // If line starts with ::mod or looks like a continuation (no anchor)
    if (joinedLines.length > 0 && !trimmed.startsWith('[') && joinedLines[joinedLines.length - 1] !== '') {
      joinedLines[joinedLines.length - 1] += ' ' + trimmed;
    } else {
      joinedLines.push(trimmed);
    }
  }

  // Parse each joined line
  const stmtRegex = /\[([^\]]+)\]\s*(?:->|→)\s*\[([^\]]+)\]/;

  for (const line of joinedLines) {
    if (!line) continue;
    const stmtMatch = stmtRegex.exec(line);
    if (!stmtMatch) continue;

    const source = parseAnchor(stmtMatch[1]);
    const target = parseAnchor(stmtMatch[2]);

    // Extract all ::mod(...) blocks and merge
    let modifiers: STLModifiers = {};
    const modRegex = /::mod\(([^)]*(?:\([^)]*\)[^)]*)*)\)/g;
    let modMatch;
    while ((modMatch = modRegex.exec(line)) !== null) {
      const parsed = parseModifiers(modMatch[1]);
      modifiers = { ...modifiers, ...parsed };
    }

    statements.push({ source, target, modifiers });
  }

  return { statements, comments };
}

// Utility: filter statements by source or target namespace
export function filterByNamespace(doc: STLDocument, ns: string, field: 'source' | 'target' | 'either' = 'either'): STLStatement[] {
  return doc.statements.filter(s => {
    if (field === 'source') return s.source.namespace === ns;
    if (field === 'target') return s.target.namespace === ns;
    return s.source.namespace === ns || s.target.namespace === ns;
  });
}

// Utility: get modifier value with default
export function getMod(stmt: STLStatement, key: string, defaultValue?: any): any {
  return stmt.modifiers[key] ?? defaultValue;
}

// Utility: sort statements by 'order' modifier
export function sortByOrder(stmts: STLStatement[]): STLStatement[] {
  return [...stmts].sort((a, b) => {
    const orderA = typeof a.modifiers.order === 'number' ? a.modifiers.order : 999;
    const orderB = typeof b.modifiers.order === 'number' ? b.modifiers.order : 999;
    return orderA - orderB;
  });
}
