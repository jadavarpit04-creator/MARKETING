#!/usr/bin/env node
/* Find a Magic UI component to replace the API demo, via the Magic UI MCP server.
   Run: node scripts/fetch-magicui-beam.mjs */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const serverCfg = JSON.parse(fs.readFileSync(path.join(root, '.mcp.json'), 'utf8')).mcpServers.magicui;
const child = spawn(serverCfg.command, serverCfg.args, { stdio: ['pipe', 'pipe', 'pipe'] });
child.stderr.on('data', d => process.stderr.write(`[magicui mcp] ${d}`));

let buf = '', nextId = 1;
const pending = new Map();
child.stdout.on('data', d => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
    if (!line) continue;
    let msg; try { msg = JSON.parse(line); } catch { continue; }
    if (msg.id !== undefined && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id); pending.delete(msg.id);
      msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
    }
  }
});
function request(method, params = {}, timeoutMs = 60000) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
    setTimeout(() => { if (pending.has(id)) { pending.delete(id); reject(new Error(`Timeout ${method}`)); } }, timeoutMs);
  });
}
const notify = (m, p = {}) => child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: m, params: p }) + '\n');
async function callTool(name, args) {
  const res = await request('tools/call', { name, arguments: args });
  const text = (res?.content || []).filter(c => c.type === 'text').map(c => c.text).join('\n');
  try { return JSON.parse(text); } catch { return text; }
}

const log = { server: serverCfg, generatedAt: new Date().toISOString(), tools: [], searches: {}, items: {} };
try {
  await request('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'zerthik-magicui-list', version: '1.0.0' } });
  notify('notifications/initialized');
  const tools = await request('tools/list');
  log.tools = (tools?.tools || []).map(t => t.name);
  console.log('MCP tools:', log.tools.join(', '));
  for (const q of ['animated list', 'list', 'notification', 'avatar circles']) {
    log.searches[q] = await callTool('searchRegistryItems', { query: q, limit: 8 });
    const items = log.searches[q]?.items || [];
    console.log(`search "${q}" ->`, items.map(i => `${i.name}(${i.kind})`).join(', ') || 'none');
  }
  for (const name of ['animated-list']) {
    try {
      log.items[name] = await callTool('getRegistryItem', { name, includeSource: true, includeExamples: true, includeRelated: true });
      const it = log.items[name];
      console.log(`getRegistryItem(${name}):`, it?.title || it?.name, '| examples:', (it?.examples || []).map(e => e.name).join(', ') || 'none', '| source bytes:', (it?.source || '').length);
    } catch (e) { console.log(`getRegistryItem(${name}) failed:`, e.message); }
  }
  fs.writeFileSync(path.join(root, 'scripts', 'magicui-list-log.json'), JSON.stringify(log, null, 2));
  console.log('saved -> scripts/magicui-list-log.json');
} catch (e) {
  console.error('Magic UI MCP fetch failed:', e); process.exitCode = 1;
} finally { child.stdin.end(); child.kill(); }
