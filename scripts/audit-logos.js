#!/usr/bin/env node
/* Sitewide logo audit: static + dynamically rendered brand logos on every page. */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const exists = src => /^https?:|^data:/.test(src || '') || fs.existsSync(path.join(root, src || ''));

async function load(file) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const dom = new JSDOM(html, {
    runScripts: 'outside-only',
    url: `http://localhost/${file}`,
    pretendToBeVisual: true,
  });
  const { window } = dom;
  const errors = [];
  window.addEventListener('error', event => errors.push(event.message));
  window.IntersectionObserver = class {
    constructor(callback) { this.callback = callback; }
    observe(element) { this.callback([{ isIntersecting: true, target: element }]); }
    unobserve() {}
    disconnect() {}
  };
  window.matchMedia = query => ({
    matches: false, media: query,
    addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {},
  });
  window.requestAnimationFrame = callback => setTimeout(() => callback(Date.now()), 0);
  window.cancelAnimationFrame = id => clearTimeout(id);
  window.CSS = { escape: value => String(value).replace(/[^a-zA-Z0-9_-]/g, '\\$&') };
  window.Element.prototype.scrollTo = function scrollTo() {};
  window.Element.prototype.scrollBy = function scrollBy() {};
  window.scrollTo = function scrollTo() {};
  Object.defineProperty(window.navigator, 'clipboard', {
    value: { writeText: async () => {} }, configurable: true,
  });

  for (const src of [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(match => match[1])) {
    try { window.eval(fs.readFileSync(path.join(root, src), 'utf8')); }
    catch (error) { errors.push(`${src}: ${error.message}`); }
  }
  await sleep(40);
  return { window, errors };
}

function auditWindow(window, file, phase, report) {
  const document = window.document;
  const validSlugs = new Set([
    ...Object.keys(window.BRAND_ICONS || {}),
    ...Object.keys(window.APP_PNG || {}),
  ]);

  document.querySelectorAll('[data-logo-slug]').forEach(host => {
    const slug = host.dataset.logoSlug;
    const img = host.querySelector(':scope > img');
    const svg = host.querySelector(':scope > svg');
    const item = { file, phase, slug, type: img ? 'png' : svg ? 'svg' : 'empty', src: img?.getAttribute('src') || '' };
    report.total += 1;
    if (!validSlugs.has(slug)) report.bad.push({ ...item, reason: 'unknown canonical slug' });
    else if (img && !exists(item.src)) report.bad.push({ ...item, reason: 'image file missing' });
    else if (svg && svg.innerHTML.trim().length < 10) report.bad.push({ ...item, reason: 'empty svg' });
    else if (!img && !svg) report.bad.push({ ...item, reason: 'no img/svg rendered' });
    else report.ok += 1;
  });

  document.querySelectorAll('[data-brand], [data-brand-plain]').forEach(wrapper => {
    if (!wrapper.querySelector('[data-logo-slug]')) {
      report.bad.push({
        file, phase, slug: wrapper.dataset.brand || wrapper.dataset.brandPlain,
        type: 'empty', src: '', reason: 'static logo slot was not hydrated',
      });
    }
  });

  document.querySelectorAll('[data-ui]').forEach(host => {
    report.uiTotal += 1;
    const svg = host.querySelector(':scope > svg.lucide');
    if (svg && svg.innerHTML.trim().length >= 5) report.uiOk += 1;
    else report.bad.push({ file, phase, slug: host.dataset.ui, type: 'lucide', src: '', reason: 'empty lucide icon' });
  });
}

(async () => {
  const report = { total: 0, ok: 0, uiTotal: 0, uiOk: 0, bad: [] };
  const files = ['index.html', 'ai.html', 'mcp.html', 'how-it-works.html', 'shortcuts.html', 'pricing.html', 'api.html'];

  for (const file of files) {
    const { window, errors } = await load(file);
    const document = window.document;
    if (errors.length) report.bad.push({ file, phase: 'load', slug: '', type: 'runtime', src: '', reason: errors.join(' | ') });
    auditWindow(window, file, 'initial', report);

    if (file === 'index.html') {
      if (window.canonicalBrandSlug('gmail') !== 'Gmail' || window.canonicalBrandSlug('whatsapp') !== 'WhatsApp') {
        report.bad.push({ file, phase: 'canonicalization', slug: 'gmail/whatsapp', type: 'slug', src: '', reason: 'case-insensitive slug resolver failed' });
      }
      const fallbackImage = document.querySelector('[data-logo-slug="notion"] img');
      if (fallbackImage) {
        const host = fallbackImage.closest('[data-logo-slug]');
        fallbackImage.dispatchEvent(new window.Event('error', { bubbles: false }));
        if (!host?.querySelector(':scope > svg')) {
          report.bad.push({ file, phase: 'png-fallback', slug: 'notion', type: 'png', src: '', reason: 'image error did not swap to SVG' });
        }
      }
      for (const tab of document.querySelectorAll('.sc-tab')) {
        tab.click(); await sleep(5); auditWindow(window, file, `shortcuts:${tab.dataset.cat}`, report);
      }
      for (const [index, button] of [...document.querySelectorAll('.person')].entries()) {
        button.click(); await sleep(5); auditWindow(window, file, `persona:${index}`, report);
      }
      for (const item of document.querySelectorAll('#rotatorList li[data-i]')) {
        item.click(); await sleep(5); auditWindow(window, file, `rotator:${item.dataset.i}`, report);
      }
    }
    console.log(`${file}: runtime errors ${errors.length}`);
    window.close();
  }

  console.log(`Brand-logo renders checked: ${report.total} (OK ${report.ok})`);
  console.log(`Lucide slots checked: ${report.uiTotal} (OK ${report.uiOk})`);
  if (report.bad.length) {
    console.error('Logo audit failures:');
    console.error(JSON.stringify(report.bad, null, 2));
    process.exit(1);
  }
  console.log('Logo audit: PASS — no missing/blank logos found.');
  process.exit(0);
})();
