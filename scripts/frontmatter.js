// frontmatter.js — the article front-matter parser and source-list helpers,
// shared by scripts/build.js and scripts/build-site.js.
// Handles plain `key: value` AND YAML block scalars (`key: >` or `key: |`,
// with optional chomping modifier as produced by Decap CMS).

'use strict';

function parseFrontMatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };

  const data  = {};
  const lines = match[1].split(/\r?\n/);
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip indented lines (they belong to a block scalar already consumed)
    if (line.startsWith(' ') || line.startsWith('\t')) { i++; continue; }

    const colon = line.indexOf(':');
    if (colon === -1) { i++; continue; }

    const key  = line.slice(0, colon).trim();
    const rest = line.slice(colon + 1).trim();

    if (/^[>|][+-]?$/.test(rest)) {
      const blockLines = [];
      i++;
      while (i < lines.length) {
        const bl = lines[i];
        if (bl === '' || bl.startsWith('  ') || bl.startsWith('\t')) {
          blockLines.push(bl.startsWith('  ') ? bl.slice(2) : (bl.startsWith('\t') ? bl.slice(1) : ''));
          i++;
        } else {
          break; // Un-indented line signals end of block
        }
      }
      while (blockLines.length && blockLines[blockLines.length - 1] === '') blockLines.pop();
      data[key] = blockLines.join('\n');
    } else {
      data[key] = rest.replace(/^["']|["']$/g, '');
      i++;
    }
  }

  return { data, body: match[2] };
}

// The article body ends with "---" and a "**Sources:** [label](url) · …" line
const SOURCES_RE = /\n-{3,}\s*\n+\s*\*\*(Sources|Quellen):\*\*([\s\S]*)$/;

// Same split as the article page script: body without the list, and the list itself
function splitSources(md) {
  md = md || '';
  const m = md.match(SOURCES_RE);
  if (!m) return { body: md, sources: [] };
  const list = [], lr = /\[([^\]]+)\]\(([^)\s]+(?:\([^)]*\)[^)\s]*)*)\)/g;
  let x;
  while ((x = lr.exec(m[2]))) list.push({ label: x[1], url: x[2] });
  return { body: md.slice(0, m.index), sources: list };
}

module.exports = { parseFrontMatter, SOURCES_RE, splitSources };
