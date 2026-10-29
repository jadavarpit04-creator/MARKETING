/* ============================================================
   Zerthik landing — real-icon engine + saari interactivity
   Icons: icons.js (Simple Icons brand paths + Lucide UI)
   ============================================================ */
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const delay = ms => new Promise(r => setTimeout(r, ms));

/* ---------- Real icon helpers ---------- */
function luminance(hex){
  const h = hex.replace('#','');
  const n = h.length === 3 ? h.split('').map(c=>c+c).join('') : h;
  const [r,g,b] = [0,2,4].map(i => parseInt(n.slice(i,i+2),16)/255);
  return 0.2126*r + 0.7152*g + 0.0722*b;
}
const BRAND_ALIASES = {
  gmail:'Gmail', whatsapp:'WhatsApp', vscode:'visualstudiocode', 'vs-code':'visualstudiocode',
  'visual-studio-code':'visualstudiocode', excel:'microsoftexcel', word:'microsoftword',
  outlook:'microsoftoutlook', windows:'windows11', mac:'apple', macos:'apple'
};
function canonicalBrandSlug(slug){
  if (!slug) return '';
  const raw = String(slug).trim();
  const brands = window.BRAND_ICONS || {}, pngs = window.APP_PNG || {};
  if (brands[raw] || pngs[raw]) return raw;
  const key = raw.toLowerCase().replace(/[\s_]+/g, '-');
  if (BRAND_ALIASES[key]) return BRAND_ALIASES[key];
  return Object.keys({ ...brands, ...pngs }).find(name => name.toLowerCase() === key) || raw;
}
function brandDisplayColor(slug, fallback = '#ffffff'){
  const ic = (window.BRAND_ICONS || {})[canonicalBrandSlug(slug)] || {};
  if (slug === 'github') return '#ffffff';
  if (slug === 'linear') return '#5E6AD2';
  return ['#000000', '#181717'].includes((ic.hex || '').toLowerCase()) ? '#ffffff' : (ic.hex || fallback);
}
function brandSVG(slug, fill){
  const canonical = canonicalBrandSlug(slug);
  const ic = (window.BRAND_ICONS || {})[canonical];
  if (!ic) return '';
  return `<svg viewBox="0 0 24 24" fill="${fill}" aria-hidden="true">${ic.paths.map(d=>`<path d="${d}"/>`).join('')}</svg>`;
}
/* Agar kisi deployment me PNG request fail ho jaye, blank jagah ke bajaye
   usi brand ka official SVG glyph turant use karo. */
document.addEventListener('error', event => {
  const img = event.target;
  if (!(img instanceof HTMLImageElement)) return;
  const host = img.closest('[data-logo-slug]');
  if (!host || host.dataset.logoFallback === 'svg') return;
  const slug = canonicalBrandSlug(host.dataset.logoSlug);
  if (!brandSVG(slug, 'currentColor')) return;
  host.dataset.logoFallback = 'svg';
  host.classList.remove('has-png');
  host.classList.toggle('logo-svg', host.classList.contains('app-icon'));
  host.classList.toggle('mq-svg', host.classList.contains('mq-logo'));
  host.style.color = brandDisplayColor(slug);
  host.innerHTML = brandSVG(slug, 'currentColor');
}, true);
/* Company/app logo — poori site par TRANSPARENT background (koi tile nahi).
   GitHub/Linear ke PNG poore kaale hain, isliye unka official SVG glyph
   light/brand color me; baki sab full-color PNG seedha transparent par. */
function brandTile(slug){
  slug = canonicalBrandSlug(slug);
  if (slug === 'github') return `<span class="app-icon logo-svg" data-logo-slug="${slug}" style="color:#ffffff">${brandSVG(slug, 'currentColor')}</span>`;
  if (slug === 'linear') return `<span class="app-icon logo-svg" data-logo-slug="${slug}" style="color:#5E6AD2">${brandSVG(slug, 'currentColor')}</span>`;
  const png = (window.APP_PNG || {})[slug];
  if (png) return `<span class="app-icon has-png" data-logo-slug="${slug}"><img src="${png.src}" alt="" loading="eager" decoding="async"></span>`;
  const ic = (window.BRAND_ICONS || {})[slug] || { hex:'#ffffff' };
  return `<span class="app-icon logo-svg" data-logo-slug="${slug}" style="color:${brandDisplayColor(slug, ic.hex)}">${brandSVG(slug, 'currentColor')}</span>`;
}
/* Plain brand glyph that follows the button/text color */
function brandPlain(slug){
  slug = canonicalBrandSlug(slug);
  return `<span class="app-icon plain" data-logo-slug="${slug}">${brandSVG(slug, 'currentColor')}</span>`;
}
/* Marquee ke liye transparent logo: koi tile/bg nahi, logo seedha page par.
   GitHub/Linear ke PNG poore kaale hain (dark bg par gayab ho jate), isliye
   unka official SVG glyph light/brand color me; Excel ka PNG hai hi nahi. */
function marqueeLogo(slug){
  slug = canonicalBrandSlug(slug);
  if (slug === 'github') return `<span class="mq-logo mq-svg" data-logo-slug="${slug}" style="color:#ffffff">${brandSVG(slug, 'currentColor')}</span>`;
  if (slug === 'linear') return `<span class="mq-logo mq-svg" data-logo-slug="${slug}" style="color:#5E6AD2">${brandSVG(slug, 'currentColor')}</span>`;
  const png = (window.APP_PNG || {})[slug];
  if (png) return `<span class="mq-logo" data-logo-slug="${slug}"><img src="${png.src}" alt="" loading="eager" decoding="async"></span>`;
  const ic = (window.BRAND_ICONS || {})[slug] || { hex:'#ffffff' };
  return `<span class="mq-logo mq-svg" data-logo-slug="${slug}" style="color:${brandDisplayColor(slug, ic.hex)}">${brandSVG(slug, 'currentColor')}</span>`;
}
/* UI icon = Lucide SVG fetched via the mcp-universal-icons MCP server
   (window.LUCIDE_ICONS, generated by scripts/fetch-icons-via-mcp.mjs).
   The older local Lucide copy in icons.js stays as a safety fallback. */
function uiIcon(name){
  const inner = (window.LUCIDE_ICONS || {})[name] || (window.UI_ICONS || {})[name] || (window.LUCIDE_ICONS || {})['info'] || '';
  return `<svg class="lucide lucide-${name}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
}
/* Static HTML placeholders ko real icons se bharo */
$$('[data-brand]').forEach(el => el.innerHTML = brandTile(el.dataset.brand));
$$('[data-brand-plain]').forEach(el => el.innerHTML = brandPlain(el.dataset.brandPlain));
$$('[data-ui]').forEach(el => el.innerHTML = uiIcon(el.dataset.ui));

/* Context-chip remove buttons announce the exact source being removed. */
function syncContextChipLabels(root = document){
  $$('.ctx-chip', root).forEach(chip => {
    const button = $('.chip-x', chip); if (!button) return;
    const clone = chip.cloneNode(true);
    clone.querySelector('button')?.remove();
    const label = clone.textContent.trim().replace(/\s+/g, ' ') || 'context';
    button.setAttribute('aria-label', `Remove ${label}`);
  });
}
syncContextChipLabels();

/* ---------- Toast + placeholder links ---------- */
let toastTimer;
function toast(msg){
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}
document.addEventListener('click', e => {
  const a = e.target.closest('[data-dead]');
  if (a){ e.preventDefault(); toast('Coming soon — this opens in the live product.'); }
});

/* ---------- Navbar ---------- */
const navWrap = $('#navbar');
const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const heroEl = $('.hero');
let scrollTicking = false;
function updateScrollMotion(){
  navWrap.classList.toggle('scrolled', scrollY > 24);
  if (heroEl && !prefersReducedMotion && scrollY < heroEl.offsetHeight * 1.25){
    heroEl.style.setProperty('--hero-p', Math.min(scrollY / Math.max(heroEl.offsetHeight, 1), 1).toFixed(3));
  }
  scrollTicking = false;
}
addEventListener('scroll', () => { if (!scrollTicking){ scrollTicking = true; requestAnimationFrame(updateScrollMotion); } }, { passive:true });
updateScrollMotion();
if (heroEl) new IntersectionObserver(es => es.forEach(en => heroEl.classList.toggle('inview', en.isIntersecting)), { threshold:.02 }).observe(heroEl);

/* Off-screen loops ko pause karne ke liye shared visibility gate.
   Ek samay par screen par jo section hai, motion ka focus wahi rehta hai. */
const autoplayVisibility = new Map();
const autoplayIO = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
  entries.forEach(entry => autoplayVisibility.set(entry.target, entry.isIntersecting));
}, { threshold:.16 }) : null;
function watchAutoplay(el){
  if (!el) return;
  autoplayVisibility.set(el, !autoplayIO);
  if (autoplayIO) autoplayIO.observe(el);
}
function autoplayReady(el){
  return !prefersReducedMotion && !document.hidden && (!el || autoplayVisibility.get(el) !== false);
}
if ('IntersectionObserver' in window){
  const sectionVisibilityIO = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.target.classList.toggle('ux-inview', entry.isIntersecting));
  }, { threshold:.06 });
  $$('main > section').forEach(section => sectionVisibilityIO.observe(section));
} else {
  $$('main > section').forEach(section => section.classList.add('ux-inview'));
}
$('#hamburger').addEventListener('click', function(){
  const open = $('#mobileMenu').classList.toggle('open');
  this.setAttribute('aria-expanded', String(open));
  this.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});
$$('#mobileMenu a').forEach(a => a.addEventListener('click', () => {
  $('#mobileMenu').classList.remove('open');
  const button = $('#hamburger');
  button?.setAttribute('aria-expanded', 'false');
  button?.setAttribute('aria-label', 'Open menu');
}));

/* Fixed section rail + back-to-top */
const backTop = $('#backTop');
function syncBackTop(){ backTop?.classList.toggle('show', scrollY > 700); }
addEventListener('scroll', syncBackTop, { passive:true }); syncBackTop();
backTop?.addEventListener('click', () => scrollTo({ top:0, behavior:prefersReducedMotion ? 'auto' : 'smooth' }));
const railLinks = $$('.section-rail a[data-rail]');
if (railLinks.length && 'IntersectionObserver' in window){
  const railIO = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    railLinks.forEach(link => link.classList.toggle('active', link.dataset.rail === entry.target.id));
  }), { rootMargin:'-42% 0px -52% 0px' });
  railLinks.forEach(link => { const sec = document.getElementById(link.dataset.rail); if (sec) railIO.observe(sec); });
}

/* ---------- OS detect ---------- */
const IS_MAC = /Mac/i.test(navigator.platform || '') || /Mac OS X/i.test(navigator.userAgent);
if (IS_MAC){
  $('#downloadLabel').textContent = 'Download for macOS';
  $('#heroOsIcon').innerHTML = brandPlain('apple');
}

/* ---------- Reveal on scroll ---------- */
const revealIO = new IntersectionObserver(es => es.forEach(en => {
  if (en.isIntersecting){ en.target.classList.add('in'); revealIO.unobserve(en.target); }
}), { threshold:.12, rootMargin:'0px 0px -6% 0px' });
const revealGroups = new Map();
$$('.reveal').forEach(el => {
  const i = revealGroups.get(el.parentElement) || 0;
  el.style.transitionDelay = `${Math.min(i, 5) * 70}ms`;
  revealGroups.set(el.parentElement, i + 1);
  revealIO.observe(el);
});

/* Developer API blueprint — Raycast-style scroll choreography.
   Har FIG pehle displaced layers/labels ke saath settle hota hai; uske baad
   --dev-drift / --dev-focus se stack aur artwork scroll ke saath react karte hain. */
const devBlueprints = $$('.dev-blueprint');
const devMotionItems = $$('.dev-blueprint .dev-hero, .dev-blueprint .dev-row');
if (devBlueprints.length && devMotionItems.length){
  const clampDev = (value, min, max) => Math.min(max, Math.max(min, value));
  let devMotionTicking = false;
  function updateDevBlueprintMotion(){
    const viewportH = innerHeight || document.documentElement.clientHeight || 1;
    devBlueprints.forEach(blueprint => {
      const rect = blueprint.getBoundingClientRect();
      if (rect.bottom < -80 || rect.top > viewportH + 80) return;
      const progress = clampDev((viewportH - rect.top) / Math.max(rect.height + viewportH, 1), 0, 1);
      blueprint.style.setProperty('--dev-p', progress.toFixed(3));
    });
    devMotionItems.forEach(item => {
      const rect = item.getBoundingClientRect();
      const centerDelta = ((rect.top + rect.height / 2) - viewportH / 2) / Math.max(viewportH / 2, 1);
      const drift = clampDev(centerDelta, -1, 1);
      if (rect.bottom < -40 || rect.top > viewportH + 40){
        item.style.setProperty('--dev-drift', drift.toFixed(3));
        item.style.setProperty('--dev-focus', '0.000');
        item.classList.remove('dev-focused');
        return;
      }
      const focus = clampDev(1 - Math.abs(centerDelta) / .82, 0, 1);
      item.style.setProperty('--dev-drift', drift.toFixed(3));
      item.style.setProperty('--dev-focus', focus.toFixed(3));
      item.classList.toggle('dev-focused', focus > .7);
    });
    devMotionTicking = false;
  }
  function requestDevBlueprintMotion(){
    if (!devMotionTicking){ devMotionTicking = true; requestAnimationFrame(updateDevBlueprintMotion); }
  }
  if (!prefersReducedMotion && 'IntersectionObserver' in window){
    devBlueprints.forEach(blueprint => blueprint.classList.add('dev-scroll-ready', 'dev-scroll-priming'));
    const devIO = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const item = entry.target;
      item.classList.add('dev-inview');
      setTimeout(() => item.classList.add('dev-settled'), item.classList.contains('dev-hero') ? 1650 : 1350);
      devIO.unobserve(item);
    }), { threshold:.28, rootMargin:'0px 0px -10% 0px' });
    /* Do frames tak displaced starting state paint hone do; phir observer
       active hoga, warna page-load par dikhne wala FIG bina settle hue final
       state me jump kar sakta hai. */
    requestAnimationFrame(() => requestAnimationFrame(() => {
      devBlueprints.forEach(blueprint => blueprint.classList.remove('dev-scroll-priming'));
      devMotionItems.forEach(item => devIO.observe(item));
    }));
    addEventListener('scroll', requestDevBlueprintMotion, { passive:true });
    addEventListener('resize', requestDevBlueprintMotion, { passive:true });
    requestDevBlueprintMotion();
  } else {
    devMotionItems.forEach(item => item.classList.add('dev-inview', 'dev-settled', 'dev-focused'));
  }
}

/* Hero demo tilt + card spotlight (fine pointers only) */
if (matchMedia('(pointer:fine)').matches && !prefersReducedMotion){
  const scene = $('#paletteScene'), palette = $('#palette');
  if (scene && palette){
    scene.addEventListener('pointermove', e => {
      const r = palette.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      palette.style.transform = `perspective(1150px) rotateX(${(-y * 2.4).toFixed(2)}deg) rotateY(${(x * 3).toFixed(2)}deg)`;
    });
    scene.addEventListener('pointerleave', () => { palette.style.transform = ''; });
  }
  document.addEventListener('pointermove', e => {
    const card = e.target.closest('.card,.social-card,.ext-card');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, { passive:true });
}

/* Platform modifier keys (⌘ on Mac, Ctrl elsewhere) */
function syncPlatformKeys(os){
  const mac = os ? os === 'macos' : IS_MAC;
  $$('.platform-mod').forEach(el => {
    el.innerHTML = mac ? uiIcon('command') : 'Ctrl';
    el.classList.toggle('is-mac', mac);
    el.setAttribute('aria-label', mac ? 'Command' : 'Control');
  });
}

/* Removable context chips (demo card + privacy demo, delegation) */
document.addEventListener('click', e => {
  const x = e.target.closest('.chip-x'); if (!x) return;
  const chipEl = x.closest('.ctx-chip'); if (!chipEl) return;
  chipEl.classList.add('removing');
  setTimeout(() => {
    chipEl.style.display = 'none'; chipEl.classList.remove('removing'); updateChipsStatus();
  }, 220);
});
/* ---------- Works-everywhere marquee — Magic UI Marquee (marquee-logos) ka vanilla port: repeat-group + --duration/--gap ---------- */
(function(){
  const apps = [['Gmail','Gmail'],['notion','Notion'],['visualstudiocode','VS Code'],['slack','Slack'],
    ['github','GitHub'],['googlechrome','Chrome'],['figma','Figma'],['microsoftexcel','Excel'],
    ['microsoftword','Word'],['googledrive','Google Drive'],['linear','Linear'],['jira','Jira'],
    ['obsidian','Obsidian'],['zoom','Zoom'],['discord','Discord'],['todoist','Todoist'],
    ['microsoftoutlook','Outlook'],['gitlab','GitLab']];
  const group = `<div class="marquee-group">${apps.map(([s,n]) => `<span class="mq-item">${marqueeLogo(s)}${n}</span>`).join('')}</div>`;
  $('#marquee').innerHTML = group + group; /* Magic UI repeat pattern — 18 logos ka ek group hi viewport se wide hai, isliye repeat = 2 */
})();

/* ============================================================
   KEYBOARD + OS shortcut combo
   ============================================================ */
const K = (t, o = {}) => ({ t, ...o });
function keyboardRows(os){
  const letters = ['Z','X','C','V','B','N','M'].map(c => K(c, { key:c.toLowerCase() }));
  const bottomLetters = [K('Shift', { w:2.2, key:'shift' }), ...letters, K(',', { sub:'<', key:',' }), K('.', { sub:'>', key:'.' }), K('/', { sub:'?', key:'/' }), K('Shift', { w:2.2, key:'shift' })];
  const arrows = [K('', { icon:'chevron-left', key:'arrowleft' }), K('', { icon:'chevron-down', key:'arrowdown' }), K('', { icon:'chevron-right', key:'arrowright' })];
  const mods = os === 'macos'
    ? [K('fn', { key:'fn' }), K('control', { icon:'chevron-up', key:'control' }), K('option', { icon:'option', w:1.35, key:'alt' }), K('command', { icon:'command', w:1.55, key:'command' }), K('', { w:5.4, key:'space' }), K('command', { icon:'command', w:1.55, key:'command' }), K('option', { icon:'option', w:1.35, key:'alt' }), ...arrows]
    : [K('Ctrl', { w:1.35, key:'control' }), K('Win', { brand:'windows11', w:1.25, key:'command' }), K('Alt', { w:1.25, key:'alt' }), K('', { w:5.4, key:'space' }), K('Alt', { w:1.25, key:'alt' }), K('Menu', { icon:'menu', w:1.3, key:'contextmenu' }), K('Ctrl', { w:1.35, key:'control' }), ...arrows];
  return [bottomLetters, mods];
}
function buildKeyboard(el, os){
  if (!el) return;
  el.dataset.os = os;
  el.innerHTML = keyboardRows(os).map(row =>
    `<div class="kb-row">${row.map(k => `<div class="key" style="--w:${k.w || 1}" ${k.key ? `data-key="${k.key}"` : ''}>${k.brand ? brandPlain(k.brand) : k.icon ? `<span class="glyph glyph-ic">${uiIcon(k.icon)}</span>` : ''}<span>${k.t || ''}</span>${k.sub ? `<small>${k.sub}</small>` : ''}</div>`).join('')}</div>`).join('');
}
function applyCombo(os){
  buildKeyboard($('#keyboardMain'), os);
  const mod = os === 'macos' ? 'alt' : 'control';
  $$(`#keyboardMain [data-key="${mod}"]`).forEach(k => k.classList.add('combo'));
  $('#keyboardMain [data-key="space"]')?.classList.add('combo');
  $$('.tab[data-os]').forEach(t => {
    const active = t.dataset.os === os;
    t.classList.toggle('active', active);
    t.setAttribute('aria-selected', String(active));
    t.tabIndex = active ? 0 : -1;
  });
  const title = $('#shortcutPreviewTitle');
  if (title) title.textContent = os === 'macos' ? 'Option + Space' : 'Ctrl + Space';
  const hint = $('#osHint');
  if (hint) hint.textContent = os === 'macos' ? 'Only the keys that matter — press Option + Space and watch them respond.' : 'Only the keys that matter — press Ctrl + Space and watch them respond.';
  syncPlatformKeys(os);
}
$$('.tab[data-os]').forEach(t => t.addEventListener('click', () => applyCombo(t.dataset.os)));
applyCombo(IS_MAC ? 'macos' : 'windows');

const KEYMAP = { ' ':'space','escape':'esc','meta':'command','backspace':'backspace','enter':'enter','shift':'shift','control':'control','alt':'alt','capslock':'capslock','tab':'tab' };
function pressKey(e, down){
  let k = (e.key || '').toLowerCase(); k = KEYMAP[k] || k;
  try { $$(`#keyboardMain [data-key="${CSS.escape(k)}"]`).forEach(el => { el.classList.toggle('pressed', down); if (down) setTimeout(() => el.classList.remove('pressed'), 220); }); } catch {}
}
addEventListener('keydown', e => pressKey(e, true));
addEventListener('keyup',   e => pressKey(e, false));
$('#keyboardMain').addEventListener('click', e => {
  const key = e.target.closest('.key:not(.feature)'); if (!key) return;
  key.classList.add('pressed'); setTimeout(() => key.classList.remove('pressed'), 200);
});

/* ============================================================
   CONTEXT & PRIVACY demos
   ============================================================ */
const DEMO_CHIPS = [
  { ui:'scan-text', label:'Selected text · 2 lines', short:'Selected text' },
  { ui:'clipboard', label:'Clipboard · 1 link', short:'Clipboard' },
  { brand:'Gmail', label:'Active app · Gmail', short:'Active app Gmail' },
  { ui:'camera', label:'Screenshot · 1440 × 900', short:'Screenshot' },
  { ui:'plug', label:'MCP context', short:'MCP context', mcp:true }
];
function renderDemoChips(){
  $('#chipsDemo').innerHTML = DEMO_CHIPS.map(c =>
    `<span class="ctx-chip ${c.mcp ? 'ctx-mcp' : ''}">${c.brand ? brandTile(c.brand) : `<span class="ui-ic">${uiIcon(c.ui)}</span>`} ${c.label} <button class="chip-x" type="button" aria-label="Remove ${c.short}">${uiIcon('x')}</button></span>`).join('');
  $$('#chipsDemo .app-icon').forEach(a => { a.style.width = '16px'; a.style.height = '16px'; a.style.flexBasis = '16px'; a.style.borderRadius = '4px'; });
  updateChipsStatus();
}
function updateChipsStatus(){
  const s = $('#chipsStatus'); if (!s) return;
  const left = $$('#chipsDemo .ctx-chip').filter(c => c.style.display !== 'none').length;
  s.textContent = left === 0 ? '0 sources selected — Zerthik will ask before sending anything.' : `${left} of ${DEMO_CHIPS.length} context sources will be sent with your command.`;
}
renderDemoChips();
$('#chipsReset').addEventListener('click', renderDemoChips);

/* Toggle switches (privacy card + MCP read) */
$$('.switch').forEach(sw => sw.addEventListener('click', () => {
  const on = sw.classList.toggle('on'); sw.setAttribute('aria-checked', String(on));
}));

/* ============================================================
   OUTPUT FORMATS — tabs demo
   ============================================================ */

const FORMATS = {
  text:
'Hi Sarah,\n\nThanks for the call earlier — glad the pricing worked for your team.\nWhenever legal has signed off, could you send the signed proposal over\nby Friday? Happy to lock an onboarding date right after.\n\nBest regards',
  markdown:
'### Bug: Checkout crashes for guest users\n\n**What happens** — checkout.ts:142 reads user.id when no user is signed in.\n\n**Expected** — Guest checkout completes or shows a sign-in prompt.\n\n- Steps to reproduce included\n- Environment and stack trace attached',
  table:
'| Item          | Detail        | Amount (₹) |\n|---------------|---------------|------------|\n| Flight        | To Delhi · 3rd | 8,400      |\n| Hotel         | 2 nights       | 11,500     |\n| Client dinner | —              | 3,200      |\n| Taxi          | Airport        | 650        |',
  csv:
'item,detail,amount\nFlight,"To Delhi · 3rd",8400\nHotel,"2 nights",11500\nClient dinner,,3200\nTaxi,Airport,650',
  code:
'{\n  "title": "Bug: Checkout crashes for guest users",\n  "file": "checkout.ts",\n  "line": 142,\n  "labels": ["bug", "checkout"]\n}'
};
function setFormat(f){
  const out = $('#formatOut');
  out.textContent = FORMATS[f];
  out.classList.remove('swap'); void out.offsetWidth; out.classList.add('swap');
  $$('.tab[data-fmt]').forEach(t => { const on = t.dataset.fmt === f; t.classList.toggle('active', on); t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; });
}
$$('.tab[data-fmt]').forEach(t => t.addEventListener('click', () => setFormat(t.dataset.fmt)));
setFormat('text');

/* ============================================================
   INSERTION — live demo
   ============================================================ */
const REGENS = [
  'Hi team — quick update: the release is green across Windows and macOS. All 214 tests pass, so we ship tomorrow at 10 AM. Thanks to everyone who reviewed on short notice!',
  'Release status: GO for tomorrow, 10 AM. Windows and macOS builds both pass the full suite (214/214). Shout-out to the reviewers who jumped in late — this one is yours.',
  'Good news, everyone: we are clear to ship. Both desktop builds are green and every test passes. Launch is locked for tomorrow at 10 AM — thank you all!'
];
let regenIdx = 0, inserting = false;
const buttonRestoreTimers = new WeakMap();
function setInsertStatus(message, success = true){
  const status = $('#insertStatus'); if (!status) return;
  status.textContent = message;
  status.classList.toggle('is-muted', !success);
}
function flashButtonSuccess(button, label){
  if (!button) return;
  if (!button.dataset.originalHtml) button.dataset.originalHtml = button.innerHTML;
  clearTimeout(buttonRestoreTimers.get(button));
  button.innerHTML = `${uiIcon('check')}<span>${label}</span>`;
  button.classList.add('is-success');
  buttonRestoreTimers.set(button, setTimeout(() => {
    button.innerHTML = button.dataset.originalHtml;
    button.classList.remove('is-success');
  }, 1800));
}
function insertOutputText(){
  return ($('#insertText')?.innerText || '').trim();
}
function updateInsertCount(){
  const count = $('#insertCount'); if (!count) return;
  count.textContent = `${insertOutputText().length} characters`;
}
updateInsertCount();
$('#regenBtn').addEventListener('click', async function(){
  if (this.disabled) return;
  this.disabled = true; this.classList.add('is-working');
  setInsertStatus('Regenerating — same facts, fresh wording…', false);
  await delay(prefersReducedMotion ? 0 : 320);
  regenIdx = (regenIdx + 1) % REGENS.length;
  $('#insertText').textContent = REGENS[regenIdx];
  updateInsertCount();
  this.classList.remove('is-working'); this.disabled = false;
  flashButtonSuccess(this, 'Regenerated');
  setInsertStatus('Regenerated — same facts, fresh wording. Edit it before inserting if you like.');
});
$('#copyOutBtn').addEventListener('click', async function(){
  try { await navigator.clipboard.writeText(insertOutputText()); } catch {}
  flashButtonSuccess(this, 'Copied');
  setInsertStatus('Output copied to clipboard.');
  toast('Output copied');
});
$('#insertBtn').addEventListener('click', async function(){
  if (inserting) return; inserting = true; this.disabled = true;
  const originalHtml = this.dataset.originalHtml || this.innerHTML;
  this.dataset.originalHtml = originalHtml;
  this.innerHTML = `${uiIcon('refresh-cw')}<span>Inserting…</span>`;
  this.classList.add('is-working');
  const field = $('#targetField'), text = insertOutputText();
  const steps = $$('.insert-ladder li');
  steps.forEach(li => li.className = '');
  field.innerHTML = '<span class="target-placeholder">Message #releases…</span><span class="caret"></span>';
  steps[0].classList.add('trying'); setInsertStatus('Trying accessibility insert…', false);
  await delay(prefersReducedMotion ? 0 : 650);
  steps[0].classList.replace('trying','done');
  field.innerHTML = '<span id="typedOut"></span><span class="caret"></span>';
  const out = $('#typedOut');
  const step = prefersReducedMotion ? Math.max(text.length, 1) : 3;
  for (let i = 0; i <= text.length; i += step){ out.textContent = text.slice(0, i); await delay(prefersReducedMotion ? 0 : 9); }
  out.textContent = text;
  setInsertStatus('Inserted into the active Slack field.');
  toast('Inserted into Slack (demo)');
  inserting = false; this.disabled = false; this.classList.remove('is-working');
  this.innerHTML = originalHtml;
  flashButtonSuccess(this, 'Inserted');
});

/* ============================================================
   SHORTCUT LIBRARY — tabs + carousel
   ============================================================ */
const GRADS = [['rgba(120, 120, 120,.52)','rgba(18, 18, 18,.96)'],['rgba(115, 115, 115,.46)','rgba(16, 16, 16,.96)'],['rgba(107, 107, 107,.48)','rgba(17, 17, 17,.96)'],['rgba(141, 141, 141,.46)','rgba(22, 22, 22,.96)'],['rgba(102, 102, 102,.42)','rgba(14, 14, 14,.96)'],['rgba(116, 116, 116,.5)','rgba(17, 17, 17,.96)']];
const SHORTCUTS = {
  developer: [
    ['triangle-alert','Issue from Error','Create a GitHub issue draft with repro steps from this error','Markdown',true],
    ['braces','JSON → Types','Generate clean type definitions from this JSON','Code',false],
    ['scan-text','Explain This Diff','Summarise what this diff changes and what could break','Text',true],
    ['database','Log → Test Fixture','Turn this log payload into a clean test fixture','Code',false],
    ['messages-square','Commit Message','Write a conventional commit message for these changes','Text',true],
    ['search','Regex from Examples','Build a regex that matches all of these examples','Code',false]
  ],
  founder: [
    ['rocket','Investor Update','Turn these notes into a crisp monthly investor update','Markdown',true],
    ['mail','The Polite Nudge','Draft a polite follow-up email from these call notes','Text',true],
    ['file-text','Meeting → Notes','Structure this transcript into decisions and action items','Markdown',false],
    ['megaphone','Launch Post, 3 Ways','Write three launch-post variants: bold, calm, playful','Text',false],
    ['table','Metrics Table','Extract every number here into a clean metrics table','Table',true],
    ['mic','Voice Memo → Tasks','Turn this rambling voice note into an ordered task list','Markdown',false]
  ],
  support: [
    ['life-buoy','Reply in Our Voice','Draft a reply to this ticket in our support tone','Text',true],
    ['inbox','Triage Summary','Summarise this thread: problem, urgency, next step','Markdown',true],
    ['list-checks','Extract Order Details','Pull order ID, items and address from this email','Table',false],
    ['globe','Translate & Reply','Translate my reply into the customer language','Text',false],
    ['shield-check','De-escalate','Rewrite this draft to sound calm and confident','Text',true],
    ['copy','Macro from Ticket','Turn this solved ticket into a reusable macro','Markdown',true]
  ],
  research: [
    ['book-open','Summarise Article','Summarise this in five bullets a busy person will read','Markdown',false],
    ['graduation-cap','Flashcards','Make Q&A flashcards from this chapter','Text',false],
    ['layers','Compare Sources','Where do these two texts agree and disagree?','Table',false],
    ['list-checks','Action Items','Extract every commitment and deadline mentioned','Markdown',true],
    ['scan-text','Citation List','Build a clean reference list from these links','Text',false],
    ['table','Data Table','Turn the numbers in this text into a sortable table','CSV',false]
  ]
};

/* Har Shortcut ka output kis app me jata hai — card ke preview ke liye */
const SC_APP = {
  'Issue from Error':'github','JSON → Types':'visualstudiocode','Explain This Diff':'github',
  'Log → Test Fixture':'visualstudiocode','Commit Message':'gitlab','Regex from Examples':'visualstudiocode',
  'Investor Update':'notion','The Polite Nudge':'Gmail','Meeting → Notes':'notion','Launch Post, 3 Ways':'x',
  'Metrics Table':'googlesheets','Voice Memo → Tasks':'todoist','Reply in Our Voice':'slack',
  'Triage Summary':'Gmail','Extract Order Details':'googlesheets','Translate & Reply':'Gmail',
  'De-escalate':'slack','Macro from Ticket':'notion','Summarise Article':'notion','Flashcards':'obsidian',
  'Compare Sources':'googledocs','Action Items':'todoist','Citation List':'googledocs','Data Table':'googlesheets'
};
const SC_W = [[62,88,44],[80,52,70],[46,74,90],[70,40,58],[88,64,38],[54,92,66]];
function renderShortcuts(cat){
  $('#scTrack').innerHTML = SHORTCUTS[cat].map(([icon,name,cmd,fmt,shared],i) => {
    const [c1,c2] = GRADS[i % GRADS.length];
    return `<a class="ext-card sc-card" href="#" data-dead style="--delay:${100 + i*80}ms;background:radial-gradient(95% 80% at 50% 22%,${c1},${c2})">
      <div class="ext-head"><span class="ic-badge" style="width:42px;height:42px">${uiIcon(icon)}</span>
        <div><h4>${name}</h4><p>Run by name from the command card, in any app.</p></div><span class="ext-arrow">${uiIcon('arrow-up-right')}</span></div>
      <div class="sc-cmd">"${cmd}"</div>
      <div class="sc-tags"><span class="tag">${fmt}</span><span class="tag tag-ghost">${shared ? 'Workspace · shared' : 'Personal'}</span></div>
      <div class="ext-mock sc-mock"><div class="mock-head">${brandTile(SC_APP[name] || 'notion')}<span>Inserted output</span><span class="mock-insert">Insert ${uiIcon('corner-down-left')}</span></div>${SC_W[i % SC_W.length].map((w,j)=>`<div class="mock-line ${j===0?'hot':''}" style="width:${w}%"></div>`).join('')}</div>
    </a>`;
  }).join('') + `<a class="ext-card more" href="#" data-dead style="--delay:${100 + SHORTCUTS[cat].length*80}ms"><span class="ic-badge" style="width:48px;height:48px">${uiIcon('plus')}</span><h4>Create your own</h4><p style="min-height:0">Save any command as a Shortcut</p></a>`;
  $('#scTrack').scrollTo({ left:0 });
}
renderShortcuts('developer');
$$('.sc-tab').forEach(t => t.addEventListener('click', () => {
  $$('.sc-tab').forEach(x => x.classList.toggle('active', x === t));
  renderShortcuts(t.dataset.cat);
}));
$('#scPrev').addEventListener('click', () => $('#scTrack').scrollBy({ left:-350, behavior:'smooth' }));
$('#scNext').addEventListener('click', () => $('#scTrack').scrollBy({ left: 350, behavior:'smooth' }));
$$('.ext-track,.video-track').forEach(track => track.addEventListener('keydown', e => {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
  const card = track.querySelector(':scope > *');
  const distance = card ? card.getBoundingClientRect().width + 16 : 320;
  e.preventDefault();
  track.scrollBy({ left:(e.key === 'ArrowRight' ? distance : -distance), behavior:prefersReducedMotion ? 'auto' : 'smooth' });
}));

/* ============================================================
   MCP — orbit (real brand icons) + approval demo
   ============================================================ */
(function(){
  const apps = ['github','linear','notion','slack','googledrive','figma','jira','todoist'];
  $('#orbitRing').innerHTML = apps.map((s,i) => {
    const a = i * 45;
    return `<span class="orbit-chip" style="transform:rotate(${a}deg) translate(94px) rotate(${-a}deg)">${brandTile(s)}</span>`;
  }).join('');
})();
function logMcp(cls, label, rest){
  const li = document.createElement('li');
  li.innerHTML = `<span class="${cls}">${label}</span> ${rest}`;
  const log = $('#mcpLog');
  log.prepend(li);
  while (log.children.length > 5) log.lastChild.remove();
}
$('#mcpTry').addEventListener('click', () => {
  $('#mcpApproval').hidden = false;
  toast('Write action paused — waiting for your approval');
});
$('#mcpApprove').addEventListener('click', () => {
  $('#mcpApproval').hidden = true;
  logMcp('log-ok', uiIcon('circle-check') + ' approved','linear.create_issue · just now');
  toast('Approved — issue created and logged');
});
$('#mcpCancel').addEventListener('click', () => {
  $('#mcpApproval').hidden = true;
  logMcp('log-warn', uiIcon('x') + ' rejected','linear.create_issue · just now');
  toast('Cancelled — nothing ran. Draft preserved.');
});

/* ============================================================
   PERSONAS explorer
   ============================================================ */
const PERSONAS = [
  { icon:'code-xml', name:'Developer', sub:'Errors → issues', accent:'#57c1ff',
    need:'Turn errors, logs, JSON and diffs into structured work', needDesc:'Without leaving the editor or terminal to go write it up somewhere else.',
    context:'Selected text + active app', contextDesc:'A stack trace selected in the terminal, VS Code detected automatically.',
    app:'github', appName:'GitHub', appDesc:'The finished issue draft, inserted straight into the new-issue field.',
    cmd:'"Create a GitHub issue draft from this error — with repro steps."', out:'A complete Markdown bug report with title, steps, expected vs actual — facts from your selection only.' },
  { icon:'rocket', name:'Founder', sub:'Drafts at voice speed', accent:'#a2a2a2',
    need:'Draft emails, updates and notes without switching apps', needDesc:'Fifty small writing tasks a day, none worth opening a new tab for.',
    context:'Clipboard + voice command', contextDesc:'Call notes on the clipboard; the instruction spoken out loud.',
    app:'Gmail', appName:'Gmail', appDesc:'A polite follow-up email sitting in the reply box, ready to send.',
    cmd:'"Draft a polite follow-up. Ask for the signature by Friday."', out:'A warm, ready-to-send email that uses only what your notes actually said.' },
  { icon:'briefcase', name:'Knowledge Worker', sub:'Messy → structured', accent:'#59d499',
    need:'Summarize, rewrite and extract data from anything', needDesc:'Docs, threads and spreadsheets that arrive in every shape except usable.',
    context:'Selected text', contextDesc:'A paragraph of unstructured expenses selected in a notes app.',
    app:'microsoftexcel', appName:'Excel', appDesc:'Clean rows pasted as a table, amounts exactly as written.',
    cmd:'"Extract these expenses into a table with amounts."', out:'Item, detail and amount columns — organized, never invented.' },
  { icon:'headset', name:'Support & Ops', sub:'Replies in your voice', accent:'#ff8ac2',
    need:'Draft responses and extract structured details fast', needDesc:'High volume, same questions, zero patience for copy-paste ping-pong.',
    context:'Selected text + a saved Shortcut', contextDesc:'The customer ticket, plus your team "Reply in Our Voice" Shortcut.',
    app:'slack', appName:'Slack / your helpdesk', appDesc:'The reply lands in the same thread you were already reading.',
    cmd:'"Run Shortcut: Reply in Our Voice."', out:'A calm, on-brand draft your lead would approve — in about four seconds.' },
  { icon:'graduation-cap', name:'Student / Researcher', sub:'Read less, learn more', accent:'#ffc533',
    need:'Summarize articles and pull out action items', needDesc:'Long reads, short deadlines, and notes scattered across six apps.',
    context:'Screenshot + selected text', contextDesc:'A photographed whiteboard or a dense PDF page.',
    app:'notion', appName:'Notion', appDesc:'A five-bullet summary and checklist, pasted into your study notes.',
    cmd:'"Summarise this in five bullets, then list the action items."', out:'The gist, the deadlines, and nothing the source did not say.' }
];
let personaIdx = 0, personaPaused = false;
const peopleRow = $('#peopleRow');
if (peopleRow){
  peopleRow.innerHTML = PERSONAS.map((p,i) => `
    <button class="person ${i===0?'active':''}" type="button" data-i="${i}" style="--persona-accent:${p.accent}">
      <span class="avatar persona-avatar" style="color:${p.accent}">${uiIcon(p.icon)}</span>
      <span><b>${p.name}</b><small>${p.sub}</small></span>
    </button>`).join('');
  const selectPersona = i => {
    personaIdx = i; const p = PERSONAS[i], panel = $('#personaPanel');
    $$('.person').forEach((el,j) => el.classList.toggle('active', j === i));
    $('#pNeed').textContent = p.need; $('#pNeedDesc').textContent = p.needDesc;
    $('#pContext').textContent = p.context; $('#pContextDesc').textContent = p.contextDesc;
    $('#pAppIcon').innerHTML = brandTile(p.app); $('#pApp').textContent = p.appName; $('#pAppDesc').textContent = p.appDesc;
    $('#pQuote').innerHTML = `${p.cmd}<br/><em>${p.out}</em>`;
    panel.classList.remove('swap'); void panel.offsetWidth; panel.classList.add('swap');
  };
  selectPersona(0);
  $$('.person').forEach(el => el.addEventListener('click', () => selectPersona(+el.dataset.i)));
  const personaSection = $('#personas');
  watchAutoplay(personaSection);
  if (!prefersReducedMotion) setInterval(() => { if (!personaPaused && autoplayReady(personaSection)) selectPersona((personaIdx + 1) % PERSONAS.length); }, 5500);
  ['mouseenter','mouseleave'].forEach(ev => personaSection.addEventListener(ev, () => personaPaused = ev === 'mouseenter'));
  personaSection.addEventListener('focusin', () => personaPaused = true);
  personaSection.addEventListener('focusout', e => { if (!personaSection.contains(e.relatedTarget)) personaPaused = false; });
}

/* ============================================================
   PRICING (from PRD)
   ============================================================ */
const PLANS = [
  { name:'Free', monthly:0, annual:0, cta:'Download free', href:'#download',
    feats:[['50 AI actions / month',1],['Command card · voice & text',1],['Universal insertion',1],['Personal Shortcuts',1],['MCP connections',0],['API access',0]] },
  { name:'Pro', monthly:10, annual:96, cta:'Start free trial', href:'#download', popular:true,
    feats:[['1,000 AI actions / month',1],['Screenshot context',1],['2 personal MCP servers',1],['Personal API key · 60 req/min',1],['Everything in Free',1],['Team workspaces',0]] },
  { name:'Team', monthly:16, annual:154, cta:'Start Team', href:'#download',
    feats:[['2,500 actions / user / month',1],['10 shared MCP servers',1],['Shared Shortcuts',1],['Team workspaces & roles',1],['Team API keys · 120 req/min',1],['Minimum 3 seats',0]] },
  { name:'Business', monthly:28, annual:269, cta:'Start Business', href:'#download',
    feats:[['6,000 actions / user / month',1],['25 shared MCP servers',1],['Admin controls & audit logs',1],['Role-based MCP permissions',1],['API · 300 req/min',1],['Minimum 5 seats',0]] }
];
function renderPricing(mode){
  $('#pricingGrid').innerHTML = PLANS.map(p => {
    const amt = mode === 'annual' && p.annual ? Math.round(p.annual/12) : p.monthly;
    const per = p.monthly === 0 ? 'forever free' : (mode === 'annual' ? `per user/mo · $${p.annual}/yr billed annually` : 'per user/month');
    return `<article class="card price-card reveal in ${p.popular?'popular beam':''}">
      <div class="price-plan"><h3>${p.name}</h3>${p.popular?'<span class="tag">Most popular</span>':''}</div>
      <div class="price-amt"><b>$${amt}</b></div>
      <p class="price-per">${per}</p>
      <ul>${p.feats.map(([f,on])=>`<li class="${on ? '' : 'off'}"><span class="ui-ic ${on ? 'ok' : ''}">${uiIcon(on ? 'check' : 'x')}</span>${f}</li>`).join('')}</ul>
      <a class="btn ${p.popular?'btn-white':'btn-dark'}" href="${p.href || '#'}" ${p.href ? '' : 'data-dead'}>${p.cta}</a>
      ${p.popular?'<p class="price-trial">14 days of Pro free · No card required</p>':''}
    </article>`;
  }).join('');
}
function syncBillingNote(mode){
  const note = $('#billingNote'); if (!note) return;
  note.textContent = mode === 'annual' ? 'You are saving 20% with annual billing.' : 'Switch to Annual to save 20% on every paid plan.';
}
renderPricing('monthly'); syncBillingNote('monthly');
$$('.bill-tab').forEach(t => t.addEventListener('click', () => {
  $$('.bill-tab').forEach(x => { x.classList.toggle('active', x === t); x.setAttribute('aria-selected', String(x === t)); });
  renderPricing(t.dataset.bill); syncBillingNote(t.dataset.bill);
}));

/* ============================================================
   DEVELOPER API — examples, copy + demo run
   ============================================================ */
const API_EXAMPLES = {
  curl:`curl https://api.zerthik.app/v1/transform \\
  -H "Authorization: Bearer $ZERTHIK_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "command": "Create a GitHub issue draft from this error",
    "outputType": "markdown",
    "context": {
      "selectedText": "TypeError: Cannot read properties of undefined",
      "activeApp": "Terminal"
    }
  }'`,
  javascript:`const response = await fetch(
  "https://api.zerthik.app/v1/transform",
  {
    method: "POST",
    headers: {
      Authorization: "Bearer " + process.env.ZERTHIK_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      command: "Create a GitHub issue draft from this error",
      outputType: "markdown",
      context: {
        selectedText: "TypeError: Cannot read properties of undefined",
        activeApp: "Terminal"
      }
    })
  }
);

const result = await response.json();
console.log(result.output);`,
  python:`import os
import requests

response = requests.post(
    "https://api.zerthik.app/v1/transform",
    headers={
        "Authorization": f"Bearer {os.environ['ZERTHIK_API_KEY']}",
        "Content-Type": "application/json",
    },
    json={
        "command": "Create a GitHub issue draft from this error",
        "outputType": "markdown",
        "context": {
            "selectedText": "TypeError: Cannot read properties of undefined",
            "activeApp": "Terminal",
        },
    },
    timeout=10,
)

print(response.json()["output"])`
};
function setApiExample(lang){
  const code = $('#codeBody'); if (!code || !API_EXAMPLES[lang]) return;
  code.textContent = API_EXAMPLES[lang];
  code.classList.remove('swap'); void code.offsetWidth; code.classList.add('swap');
  $$('.api-lang-tab').forEach(tab => {
    const active = tab.dataset.apiLang === lang;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', active);
  });
}
$$('.api-lang-tab').forEach(tab => tab.addEventListener('click', () => setApiExample(tab.dataset.apiLang)));
setApiExample('curl');
$('#copyCode')?.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('#codeBody').textContent); } catch {}
  toast('API example copied');
});
let apiRunning = false;
$('#runApi')?.addEventListener('click', async function(){
  if (apiRunning) return; apiRunning = true; this.disabled = true;
  const pill = $('#apiStatus');
  pill.textContent = 'Sending…'; pill.className = 'api-status-pill mono sending';
  $('#apiStatusCode').textContent = '…'; $('#apiTime').textContent = '…';
  await delay(900);
  const ms = 742 + Math.floor(Math.random() * 390);
  pill.textContent = '200 OK'; pill.className = 'api-status-pill mono success';
  $('#apiStatusCode').textContent = '200 OK'; $('#apiTime').textContent = `${ms} ms`;
  $('#apiResponse').textContent = JSON.stringify({
    id: `act_${Date.now().toString().slice(-6)}`,
    status: 'success',
    outputType: 'markdown',
    output: '### Bug: Checkout API fails\n\n**Steps to reproduce**…'
  }, null, 2);
  toast('Demo API request completed');
  apiRunning = false; this.disabled = false;
});

/* Guides + Newsletter */
const GUIDES = [
  ['keyboard','Your First 5 Minutes with Zerthik','5 min'],
  ['scan-text','Context Chips, Explained','4 min'],
  ['mic','Voice Commands That Actually Work','6 min'],
  ['plug','Connect Your First MCP Server','7 min'],
  ['shield-check','The Privacy Model, In Plain English','4 min'],
  ['command','12 Shortcuts Worth Stealing','8 min'],
  ['key-round','API Keys Without the Footguns','5 min'],
  ['users','Rolling Zerthik Out to a Team','6 min']
];
$('#guideTrack').innerHTML = GUIDES.map(([icon,t,time]) => `
  <a class="video-card" href="#" data-dead><div class="video-thumb guide-thumb"><span class="guide-ic">${uiIcon(icon)}</span><span class="video-dur">${time}</span></div><p>${t}</p></a>`).join('');

$('#newsletterForm').addEventListener('submit', function(e){
  e.preventDefault();
  const button = e.submitter || this.querySelector('button[type="submit"]');
  $('#newsletterMsg').textContent = 'You’re in! The next issue lands in your inbox soon.';
  if (button){
    if (!button.dataset.originalHtml) button.dataset.originalHtml = button.innerHTML;
    clearTimeout(buttonRestoreTimers.get(button));
    button.innerHTML = `${uiIcon('check')}<span>Subscribed</span>`;
    button.classList.add('is-success');
    button.disabled = true;
    buttonRestoreTimers.set(button, setTimeout(() => {
      button.innerHTML = button.dataset.originalHtml;
      button.classList.remove('is-success');
      button.disabled = false;
    }, 2400));
  }
  this.reset(); toast('Subscribed');
});

/* ============================================================
   WHAT ELSE — Raycast-style rotator
   ============================================================ */
const ROT = [
  ['It can draft your replies.','mail','Draft Replies','Select any thread, say the gist out loud — a ready-to-send draft appears in the reply box, in your voice.','Gmail',[['Re: Proposal for Q3','Thread'],['“Follow up politely, ask for Friday”','Voice'],['Draft inserted into reply','Done ✓']]],
  ['It can turn notes into tables.','table','Notes to Tables','Messy lists, expenses and metrics become clean rows and columns — the same numbers, finally usable.','googlesheets',[['Flight — Delhi · ₹8,400','Row'],['Hotel — 2 nights · ₹11,500','Row'],['Taxi — Airport · ₹650','Row']]],
  ['It can summarise anything.','book-open','Summarise','Articles, threads, sprint boards, screenshots — five honest bullets, nothing the source didn’t say.','notion',[['5-bullet summary','Markdown'],['Decisions extracted','3'],['Open questions flagged','2']]],
  ['It can file the bug for you.','triangle-alert','Error to Issue','A stack trace in your terminal becomes a structured issue with repro steps, ready to submit.','github',[['Title written','Bug:'],['Repro steps listed','4'],['Stack trace attached','✓']]],
  ['It can translate in place.','globe','Translate','Read and reply in any language without leaving the app you are already in.','googlechrome',[['Detected: Spanish','Auto'],['Translated to English','✓'],['Reply drafted back in Spanish','✓']]],
  ['It can extract action items.','list-checks','Action Items','Meetings, inboxes and documents go in — an ordered checklist with owners and dates comes out.','todoist',[['Emily — pricing sign-off · Fri','Task'],['You — send onboarding doc','Task'],['Legal — final review','Task']]],
  ['It can convert formats.','layers','Format Conversion','Text, Markdown, tables, CSV/TSV and code — pick the shape, Zerthik reshapes the content.','googledocs',[['Markdown → clean text','✓'],['Notes → CSV rows','✓'],['JSON → readable summary','✓']]],
  ['It can read screenshots.','camera','Screenshot Context','Boards, charts and slides become context too — optional, visible, and off whenever you say so.','googlechrome',[['Screenshot captured','1440 × 900'],['Blocked items found','2'],['Overdue items found','1']]]
];
let rotIdx = 0, rotPaused = false;
const rotListEl = $('#rotatorList');
if (rotListEl){
  rotListEl.innerHTML = ROT.map((r,i)=>`<li data-i="${i}" class="${i===0?'active':''}" tabindex="${i===0?0:-1}" role="button" aria-pressed="${i===0}"><span class="ui-ic rot-marker">${uiIcon('chevron-right')}</span>${r[0]}</li>`).join('') +
    `<li data-dead style="color:var(--brand-light)">And much, much more <span class="ui-ic">${uiIcon('arrow-right')}</span></li>`;
  const selectRot = i => {
    rotIdx = i; const [,icon,title,desc,appSlug,rows] = ROT[i];
    $$('#rotatorList li[data-i]').forEach((li,j)=>{ li.classList.toggle('active', j===i); li.setAttribute('aria-pressed', String(j===i)); li.tabIndex = j===i ? 0 : -1; });
    const panel = $('.rotator-panel');
    $('#rotIcon').innerHTML = uiIcon(icon);
    $('#rotTitle').textContent = title; $('#rotDesc').textContent = desc;
    $('#rotMock').innerHTML = rows.map(([a,b],j)=>`<div class="row slim ${j===0?'selected':''}">${brandTile(appSlug)}<span class="row-title">${a}</span><span class="row-kind">${b}</span></div>`).join('');
    panel.classList.remove('swap'); void panel.offsetWidth; panel.classList.add('swap');
  };
  selectRot(0);
  $$('#rotatorList li[data-i]').forEach(li => li.addEventListener('click', () => selectRot(+li.dataset.i)));
  rotListEl.addEventListener('keydown', e => {
    const current = document.activeElement?.closest('li[data-i]'); if (!current) return;
    const items = $$('#rotatorList li[data-i]');
    const currentIndex = items.indexOf(current); let nextIndex = null;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') nextIndex = (currentIndex + 1) % items.length;
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + items.length) % items.length;
    if (e.key === 'Home') nextIndex = 0;
    if (e.key === 'End') nextIndex = items.length - 1;
    if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); selectRot(currentIndex); return; }
    if (nextIndex === null) return;
    e.preventDefault(); selectRot(nextIndex); items[nextIndex].focus();
  });
  const rotatorEl = $('.rotator');
  watchAutoplay(rotatorEl);
  if (!prefersReducedMotion) setInterval(() => { if (!rotPaused && autoplayReady(rotatorEl)) selectRot((rotIdx + 1) % ROT.length); }, 3300);
  ['mouseenter','mouseleave'].forEach(ev => rotatorEl.addEventListener(ev, () => rotPaused = ev === 'mouseenter'));
  rotatorEl.addEventListener('focusin', () => rotPaused = true);
  rotatorEl.addEventListener('focusout', e => { if (!rotatorEl.contains(e.relatedTarget)) rotPaused = false; });
}

/* Baaki tablists (OS, Shortcut categories, formats, billing) ke liye
   shared arrow-key pattern; hero demo ka richer pattern upar custom hai. */
$$('[role="tablist"]').forEach(list => {
  if (list.classList.contains('scene-tabs')) return;
  const tabs = $$('[role="tab"]', list); if (tabs.length < 2) return;
  const syncTabs = () => tabs.forEach(tab => {
    const active = tab.classList.contains('active');
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  syncTabs();
  tabs.forEach(tab => tab.addEventListener('click', () => setTimeout(syncTabs, 0)));
  list.addEventListener('keydown', e => {
    const current = document.activeElement?.closest('[role="tab"]'); if (!current || !list.contains(current)) return;
    const currentIndex = tabs.indexOf(current); let nextIndex = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextIndex = (currentIndex + 1) % tabs.length;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') nextIndex = 0;
    if (e.key === 'End') nextIndex = tabs.length - 1;
    if (nextIndex === null) return;
    e.preventDefault(); tabs[nextIndex].focus(); tabs[nextIndex].click(); syncTabs();
  });
});

/* ============================================================
   LIVE DEMO — the real desktop app as a bare floating window,
   running one full PRD loop (context -> Shortcut -> Generate
   -> Insert, usage recorded) on its own, forever. Showcase
   only: not clickable, not typeable — page scroll passes
   straight over it, and the loop never stops.
   ============================================================ */
(function initLiveDemo(){
  const stage = document.getElementById('liveDemoStage');
  const frame = document.getElementById('liveDemoApp');
  if (!stage || !frame) return;

  const DEMO_W = 916, DEMO_H = 660;
  const statusEl = document.getElementById('liveDemoStatus');
  const segmentsEl = document.getElementById('liveDemoSegments');

  let loaded = false;
  let tourRun = 0, tourRunning = false;
  stage.dataset.tour = 'off';

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const TOUR_ABORT = Symbol('tour-abort');

  function fitDemo(){
    const w = stage.clientWidth || DEMO_W;
    const scale = Math.min(w / DEMO_W, 1);
    const x = Math.max((w - DEMO_W * scale) / 2, 0);
    frame.style.transform = `translate(${x}px, 0) scale(${scale})`;
    stage.style.height = `${Math.round(DEMO_H * scale)}px`;
  }

  function loadDemo(){
    if (!frame.src && frame.dataset.src) frame.src = frame.dataset.src;
  }

  function appDoc(){
    try { return frame.contentWindow && frame.contentWindow.document; }
    catch (e) { return null; }
  }

  function releaseFrameFocus(){
    const d = appDoc();
    if (d && d.activeElement && d.activeElement.blur) d.activeElement.blur();
    if (document.activeElement === frame) frame.blur();
  }

  function setNativeValue(el, value){
    const win = frame.contentWindow;
    const proto = el.tagName === 'TEXTAREA' ? win.HTMLTextAreaElement.prototype : win.HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
    el.dispatchEvent(new win.Event('input', { bubbles:true }));
  }

  function setStatus(step, text){
    if (statusEl && text) statusEl.textContent = text;
    if (segmentsEl) [...segmentsEl.children].forEach((seg, i) => seg.classList.toggle('on', i < step));
  }

  /* One full PRD loop, executed on the app's real controls. */
  async function startTour(){
    if (!loaded || tourRunning) return;
    const runId = ++tourRun;
    tourRunning = true;
    stage.dataset.tour = 'running';
    const doc = () => { const d = appDoc(); if (!d) throw TOUR_ABORT; return d; };
    const waitFor = async (pred, timeout = 6000) => {
      const start = Date.now();
      while (Date.now() - start < timeout){
        if (runId !== tourRun) throw TOUR_ABORT;
        if (pred(doc())) return true;
        await sleep(140);
      }
      return false;
    };

    try {
      /* Normalize to the root command card */
      const d0 = doc();
      const backApp = d0.querySelector('.back-to-app'); if (backApp) backApp.click();
      const homeBtn = d0.querySelector('.brand-lockup'); if (homeBtn) homeBtn.click();
      if (!await waitFor(d => d.querySelector('.palette-home'), 3000)) throw TOUR_ABORT;
      const search0 = doc().querySelector('.search-input');
      if (search0 && search0.value) setNativeValue(search0, '');

      /* 1 — Context is already attached */
      setStatus(1, 'Step 1 · Your screen is the context — selected text, clipboard and the active app are attached. Nothing is sent yet.');
      await sleep(1400);

      /* 2 — Run a saved Shortcut by name */
      setStatus(2, 'Step 2 · Run a saved Shortcut by name — no prompt writing.');
      const input = doc().querySelector('.search-input');
      if (!input) throw TOUR_ABORT;
      let typed = '';
      for (const ch of 'issue'){
        typed += ch;
        setNativeValue(input, typed);
        await sleep(85);
      }
      await sleep(700);
      const row = doc().querySelector('.palette-home .command-row.selected') || doc().querySelector('.palette-home .command-row');
      if (!row) throw TOUR_ABORT;
      row.click();
      if (!await waitFor(d => d.querySelector('.studio-view'))) throw TOUR_ABORT;
      await sleep(650);

      /* Make the example concrete: a real error as the source text */
      const source = doc().querySelector('#source-text');
      if (source && !source.disabled){
        setNativeValue(source, "TypeError: Cannot read properties of undefined (reading 'id')\n  at checkout.ts:142:18 — guest checkout crashes when no user is signed in. Reproduced on staging, Chrome 140.");
      }
      await sleep(800);

      /* 3 — Generate */
      setStatus(3, 'Step 3 · Generate — context leaves the screen only on this click.');
      const gen = doc().querySelector('.studio-generate');
      if (!gen) throw TOUR_ABORT;
      gen.click();
      if (!await waitFor(d => { const o = d.querySelector('.output-editor'); return o && o.value.trim().length > 0; }, 7000)) throw TOUR_ABORT;
      await sleep(1900);

      /* 4 — Insert; the run lands in Usage */
      setStatus(4, 'Step 4 · Review, then Insert — the result lands in the active app and the run is recorded in Usage.');
      const insert = doc().querySelector('.studio-actions .dark-button');
      if (insert && !insert.disabled) insert.click();
      await waitFor(d => (d.querySelector('.toast')?.textContent || '').includes('Inserted into'), 3000);
      await sleep(2600);

      /* Back to root; the watchdog starts the next pass */
      const backBtn = doc().querySelector('.back-button');
      if (backBtn) backBtn.click();
      await waitFor(d => d.querySelector('.palette-home'), 3000);
      const search1 = doc().querySelector('.search-input');
      if (search1 && search1.value) setNativeValue(search1, '');
      setStatus(0, 'One full loop — context, Shortcut, Generate, Insert. It runs again on its own.');
      await sleep(2200);
    } catch (e) {
      /* Any hiccup ends only this pass; the watchdog below restarts the loop. */
    }
    tourRunning = false;
    stage.dataset.tour = 'off';
  }

  /* Watchdog: the showcase never stops, and the frame never holds
     keyboard focus (page scroll keys stay with the page). */
  setInterval(() => {
    releaseFrameFocus();
    if (loaded && !tourRunning) startTour();
  }, 2500);

  frame.addEventListener('load', () => {
    loaded = true;
    stage.classList.add('is-loaded');
    /* The showcase must never move the visitor: inside the frame,
       focus() and scrollIntoView() lose their power to scroll this page. */
    const win = frame.contentWindow;
    if (win && !win.__demoScrollSafe){
      win.__demoScrollSafe = true;
      const origFocus = win.HTMLElement.prototype.focus;
      win.HTMLElement.prototype.focus = function (opts) {
        return origFocus.call(this, { ...(opts || {}), preventScroll: true });
      };
      win.Element.prototype.scrollIntoView = function () {};
    }
    releaseFrameFocus();
    startTour();
  });

  if ('IntersectionObserver' in window){
    const loadIO = new IntersectionObserver(es => {
      if (es.some(x => x.isIntersecting)){ loadDemo(); loadIO.disconnect(); }
    }, { rootMargin: '520px 0px' });
    loadIO.observe(stage);
  }
  setTimeout(loadDemo, 900);

  addEventListener('resize', fitDemo, { passive:true });
  fitDemo();
})();
