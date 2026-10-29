#!/usr/bin/env node
/*
 * Zerthik — find Magic UI's Marquee through the Magic UI MCP server.
 *
 * Reads the `magicui` server from ../.mcp.json, spawns it over stdio,
 * speaks MCP JSON-RPC (initialize -> tools/list -> tools/call), then:
 *   - searchRegistryItems  ("marquee", "logo marquee", "logos")
 *   - listRegistryItems    (kind=component, query=marquee)
 *   - getRegistryItem      ("marquee", source + examples + related)
 * and saves everything to ./magicui-marquee-log.json.
 *
 * Note: `@magicuidesign/cli@latest mcp` is NOT a server (the CLI only
 * installs config). The real server package is `@magicuidesign/mcp`.
 *
 * Run:  node scripts/fetch-magicui-marquee.mjs
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mcpConfig = JSON.parse(fs.readFileSync(path.join(root, '.mcp.json'), 'utf8'));
const serverCfg = mcpConfig.mcpServers.magicui;
console.log('Connecting MCP server:', serverCfg.command, serverCfg.args.join(' '));

const child = spawn(serverCfg.command, serverCfg.args, { stdio: ['pipe', 'pipe', 'pipe'] });
child.stderr.on('data', d => process.stderr.write(`[magicui mcp] ${d}`));

let buf = '', nextId = 1;
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
child.on('error', e => { console.error('spawn failed:', e); process.exit(1); });

function request(method, params = {}, timeoutMs = 60000) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
    setTimeout(() => {
      if (pending.has(id)) { pending.delete(id); reject(new Error(`Timeout calling ${method}`)); }
    }, timeoutMs);
  });
}
const notify = (method, params = {}) => child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method, params }) + '\n');

async function callTool(name, args) {
  const res = await request('tools/call', { name, arguments: args });
  const text = (res?.content || []).filter(c => c.type === 'text').map(c => c.text).join('\n');
  try { return JSON.parse(text); } catch { return text; }
}

const log = { server: serverCfg, generatedAt: new Date().toISOString(), tools: [], searches: {}, list: null, marquee: null };
try {
  const init = await request('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'zerthik-magicui-fetch', version: '1.0.0' },
  });
  log.serverInfo = init?.serverInfo || null;
  log.protocolVersion = init?.protocolVersion || null;
  notify('notifications/initialized');

  const tools = await request('tools/list');
  log.tools = (tools?.tools || []).map(t => ({ name: t.name, description: t.description }));
  console.log('MCP tools:', log.tools.map(t => t.name).join(', '));

  for (const q of ['marquee', 'logo marquee', 'logos']) {
    log.searches[q] = await callTool('searchRegistryItems', { query: q, limit: 10 });
    const items = log.searches[q]?.items || [];
    console.log(`search "${q}" -> ${log.searches[q]?.total ?? items.length} hits:`, items.map(i => `${i.name}(${i.kind})`).join(', '));
  }

  log.list = await callTool('listRegistryItems', { kind: 'component', query: 'marquee', limit: 10 });
  console.log('list components query=marquee:', (log.list?.items || []).map(i => i.name).join(', '));

  log.marquee = await callTool('getRegistryItem', {
    name: 'marquee', includeSource: true, includeExamples: true, includeRelated: true,
  });
  console.log('getRegistryItem(marquee):', log.marquee?.title || log.marquee?.name,
    '| install:', log.marquee?.install?.command,
    '| examples:', (log.marquee?.examples || []).map(e => e.name).join(', ') || 'none',
    '| source bytes:', (log.marquee?.source || '').length);

  fs.writeFileSync(path.join(root, 'scripts', 'magicui-marquee-log.json'), JSON.stringify(log, null, 2));
  console.log('saved -> scripts/magicui-marquee-log.json');
} catch (e) {
  console.error('Magic UI MCP fetch failed:', e);
  process.exitCode = 1;
} finally {
  child.stdin.end();
  child.kill();
}
