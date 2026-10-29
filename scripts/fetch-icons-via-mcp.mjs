#!/usr/bin/env node
/*
 * Zerthik — fetch Lucide icons THROUGH the mcp-universal-icons MCP server.
 *
 * Spawns the exact server from .mcp.json  (npx -y mcp-universal-icons),
 * speaks MCP JSON-RPC over stdio (initialize -> tools/list -> tools/call),
 * calls `health_check`, `search_icons` and `get_icon` (collection: "lucide")
 * for every UI icon name the landing page uses, then writes:
 *
 *   ../assets/lucide/<name>.svg   standalone SVG per icon
 *   ../lucide-icons.js            window.LUCIDE_ICONS = { name: "<inner SVG>" }
 *   ./mcp-fetch-log.json          proof log (tools, health, per-icon result)
 *
 * Run:  node scripts/fetch-icons-via-mcp.mjs
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/* ---------- 1. Work out which icon names the page needs ---------- */
globalThis.window = {};
eval(fs.readFileSync(path.join(root, 'icons.js'), 'utf8'));
const appJs = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const names = new Set(Object.keys(window.UI_ICONS || {}));
for (const m of indexHtml.matchAll(/data-ui="([^"]+)"/g)) names.add(m[1]);
for (const m of appJs.matchAll(/uiIcon\(['"]([^'"]+)['"]\)/g)) names.add(m[1]);
for (const m of appJs.matchAll(/(?:icon|ui)\s*:\s*['"]([^'"]+)['"]/g)) names.add(m[1]);
names.add('check'); names.add('x');
const onlyIdx = process.argv.indexOf('--only');
const only = onlyIdx >= 0 ? process.argv[onlyIdx + 1].split(',').map(s => s.trim()).filter(Boolean) : null;
const ICON_NAMES = only || [...names].sort();
console.log(`Icons to fetch via MCP (lucide): ${ICON_NAMES.length}${only ? ' (retry mode)' : ''}`);

/* Merge into any previously generated registry instead of overwriting it */
let existingRegistry = {};
try {
  eval(fs.readFileSync(path.join(root, 'lucide-icons.js'), 'utf8'));
  existingRegistry = window.LUCIDE_ICONS || {};
} catch { /* first run */ }

/* If a name was renamed in newer Lucide, try these before giving up */
const ALIASES = {
  'external-link': 'square-arrow-out-up-right',
  'circle-check': 'check-circle-2',
  'triangle-alert': 'alert-triangle',
  'code-xml': 'code',
  'wand-sparkles': 'wand-2',
  'scan-text': 'text-search',
};

/* ---------- 2. Minimal MCP stdio client (NDJSON JSON-RPC) ---------- */
const child = spawn('npx', ['-y', 'mcp-universal-icons'], { stdio: ['pipe', 'pipe', 'pipe'] });
child.stderr.on('data', d => process.stderr.write(`[mcp stderr] ${d}`));

let buf = '';
let nextId = 1;
const pending = new Map();
child.stdout.on('data', d => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i).trim();
    buf = buf.slice(i + 1);
    if (!line) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.id !== undefined && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
    }
  }
});
child.on('error', e => { console.error('Failed to spawn MCP server:', e); process.exit(1); });

function request(method, params = {}, timeoutMs = 30000) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
    setTimeout(() => {
      if (pending.has(id)) { pending.delete(id); reject(new Error(`Timeout calling ${method}`)); }
    }, timeoutMs);
  });
}
function notify(method, params = {}) {
  child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method, params }) + '\n');
}
async function callTool(name, args) {
  const res = await request('tools/call', { name, arguments: args });
  return (res?.content || []).filter(c => c.type === 'text').map(c => c.text).join('\n');
}
function extractSvg(text) {
  const m = text.match(/<svg[\s\S]*?<\/svg>/);
  return m ? m[0] : null;
}
function innerOf(svg) {
  const start = svg.indexOf('>') + 1;
  const end = svg.lastIndexOf('</svg>');
  return svg.slice(start, end).trim();
}

/* ---------- 3. Handshake + fetch ---------- */
const log = {
  server: 'npx -y mcp-universal-icons',
  generatedAt: new Date().toISOString(),
  collection: 'lucide',
  tools: [], health: null, searches: {}, results: [],
};

try {
  const init = await request('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'zerthik-landing-icon-fetch', version: '1.0.0' },
  });
  log.serverInfo = init?.serverInfo || null;
  log.protocolVersion = init?.protocolVersion || null;
  notify('notifications/initialized');

  const tools = await request('tools/list');
  log.tools = (tools?.tools || []).map(t => t.name);
  console.log('MCP tools available:', log.tools.join(', '));

  log.health = await callTool('health_check', {});
  console.log('health_check:', log.health.trim());

  /* Use search too — prove discovery path works for a couple of concepts */
  for (const q of ['microphone', 'shield']) {
    log.searches[q] = await callTool('search_icons', { query: q, collection: 'lucide' });
    console.log(`search_icons("${q}") ->`, log.searches[q].replace(/\n/g, ' ').slice(0, 140));
  }

  const outDir = path.join(root, 'assets', 'lucide');
  fs.mkdirSync(outDir, { recursive: true });
  const registry = { ...existingRegistry };

  let lastRaw = '';
  async function getIcon(name) {
    const text = await callTool('get_icon', { icon_name: name, collection: 'lucide', format: 'svg', fuzzy_match: true });
    lastRaw = text.slice(0, 300);
    await new Promise(r => setTimeout(r, 800)); /* be gentle — Iconify 429s on bursts (retry-after ~186s seen) */
    return extractSvg(text);
  }

  for (const name of ICON_NAMES) {
    let svg = await getIcon(name);
    let resolvedAs = svg ? name : null;

    if (!svg && ALIASES[name]) {
      svg = await getIcon(ALIASES[name]);
      if (svg) resolvedAs = ALIASES[name];
    }
    if (!svg) {
      const s = await callTool('search_icons', { query: name.replace(/-/g, ' '), collection: 'lucide' });
      const candidates = (s.split(':').slice(1).join(':') || '').split(',').map(x => x.trim()).filter(Boolean);
      for (const cand of candidates.slice(0, 3)) {
        svg = await getIcon(cand);
        if (svg) { resolvedAs = cand; break; }
      }
    }

    if (svg) {
      registry[name] = innerOf(svg);
      const standalone = svg.includes('xmlns=') ? svg : svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
      fs.writeFileSync(path.join(outDir, `${name}.svg`), standalone + '\n');
      log.results.push({ name, ok: true, resolvedAs, bytes: svg.length });
      console.log(`  ok   ${name}${resolvedAs !== name ? ` (via ${resolvedAs})` : ''}`);
    } else {
      log.results.push({ name, ok: false, resolvedAs: null, bytes: 0, raw: lastRaw });
      console.log(`  FAIL ${name} :: ${lastRaw.replace(/\n/g, ' ').slice(0, 160)}`);
    }
  }

  fs.writeFileSync(
    path.join(root, 'lucide-icons.js'),
    '/* Lucide icons fetched THROUGH the mcp-universal-icons MCP server\n' +
    '   (tools/call get_icon, collection: "lucide") — standalone files in assets/lucide/*.svg.\n' +
    `   Generated ${log.generatedAt} by scripts/fetch-icons-via-mcp.mjs. Do not edit by hand. */\n` +
    `window.LUCIDE_ICONS = ${JSON.stringify(registry)};\n`
  );
  fs.writeFileSync(path.join(root, 'scripts', only ? 'mcp-fetch-log-retry.json' : 'mcp-fetch-log.json'), JSON.stringify(log, null, 2));

  const ok = log.results.filter(r => r.ok).length;
  console.log(`\nDone via MCP: ${ok}/${ICON_NAMES.length} Lucide icons -> lucide-icons.js + assets/lucide/`);
} catch (e) {
  console.error('MCP fetch failed:', e);
  process.exitCode = 1;
} finally {
  child.stdin.end();
  child.kill();
}
