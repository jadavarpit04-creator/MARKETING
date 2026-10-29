/* Zerthik dedicated pages — shared light runtime (icons, nav, reveals, pricing) */
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const delay = ms => new Promise(r => setTimeout(r, ms));

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
document.addEventListener('error', event => {
  const img = event.target;
  if (!(img instanceof HTMLImageElement)) return;
  const host = img.closest('[data-logo-slug]');
  if (!host || host.dataset.logoFallback === 'svg') return;
  const slug = canonicalBrandSlug(host.dataset.logoSlug);
  if (!brandSVG(slug, 'currentColor')) return;
  host.dataset.logoFallback = 'svg';
  host.classList.remove('has-png');
  host.classList.add('logo-svg');
  host.style.color = brandDisplayColor(slug);
  host.innerHTML = brandSVG(slug, 'currentColor');
}, true);
function brandTile(slug){
  slug = canonicalBrandSlug(slug);
  if (slug === 'github') return `<span class="app-icon logo-svg" data-logo-slug="${slug}" style="color:#ffffff">${brandSVG(slug, 'currentColor')}</span>`;
  if (slug === 'linear') return `<span class="app-icon logo-svg" data-logo-slug="${slug}" style="color:#5E6AD2">${brandSVG(slug, 'currentColor')}</span>`;
  const png = (window.APP_PNG || {})[slug];
  if (png) return `<span class="app-icon has-png" data-logo-slug="${slug}"><img src="${png.src}" alt="" loading="eager" decoding="async"></span>`;
  const ic = (window.BRAND_ICONS || {})[slug] || { hex:'#ffffff' };
  return `<span class="app-icon logo-svg" data-logo-slug="${slug}" style="color:${brandDisplayColor(slug, ic.hex)}">${brandSVG(slug, 'currentColor')}</span>`;
}
function brandPlain(slug){
  slug = canonicalBrandSlug(slug);
  return `<span class="app-icon plain" data-logo-slug="${slug}">${brandSVG(slug, 'currentColor')}</span>`;
}
function uiIcon(name){
  const inner = (window.LUCIDE_ICONS || {})[name] || (window.UI_ICONS || {})[name] || (window.LUCIDE_ICONS || {})['info'] || '';
  return `<svg class="lucide lucide-${name}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
}
$$('[data-brand]').forEach(el => el.innerHTML = brandTile(el.dataset.brand));
$$('[data-brand-plain]').forEach(el => el.innerHTML = brandPlain(el.dataset.brandPlain));
$$('[data-ui]').forEach(el => el.innerHTML = uiIcon(el.dataset.ui));

/* Toast + coming-soon links */
let toastTimer;
function toast(msg){
  const t = $('#toast'); if (!t) return;
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}
document.addEventListener('click', e => {
  const a = e.target.closest('[data-dead]');
  if (a){ e.preventDefault(); toast('Coming soon in the live Zerthik app.'); }
});

/* Navbar */
const navWrap = $('#navbar');
let ticking = false;
function onScroll(){
  navWrap?.classList.toggle('scrolled', scrollY > 24);
  ticking = false;
}
addEventListener('scroll', () => { if (!ticking){ ticking = true; requestAnimationFrame(onScroll); } }, { passive:true });
onScroll();
$('#hamburger')?.addEventListener('click', () => $('#mobileMenu').classList.toggle('open'));
$$('#mobileMenu a').forEach(a => a.addEventListener('click', () => $('#mobileMenu')?.classList.remove('open')));

/* Reveal on scroll (BlurFade CSS shared with landing) */
const revealIO = new IntersectionObserver(es => es.forEach(en => {
  if (en.isIntersecting){ en.target.classList.add('in'); revealIO.unobserve(en.target); }
}), { threshold:.12, rootMargin:'0px 0px -6% 0px' });
const groups = new Map();
$$('.reveal').forEach(el => {
  const i = groups.get(el.parentElement) || 0;
  el.style.transitionDelay = `${Math.min(i, 5) * 70}ms`;
  groups.set(el.parentElement, i + 1);
  revealIO.observe(el);
});

/* Developer API blueprint — same Raycast-style scroll choreography as home. */
const devBlueprints = $$('.dev-blueprint');
const devMotionItems = $$('.dev-blueprint .dev-hero, .dev-blueprint .dev-row');
const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
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
    /* Paint the displaced starting state for two frames before observing,
       so an already-visible FIG still performs its settle animation. */
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

/* Toggle switches (MCP page) */
$$('.switch').forEach(sw => sw.addEventListener('click', () => {
  const on = sw.classList.toggle('on'); sw.setAttribute('aria-checked', on);
}));

/* Newsletter (shared footer) */
$('#newsletterForm')?.addEventListener('submit', function(e){
  e.preventDefault();
  const msg = $('#newsletterMsg'); if (msg) msg.textContent = 'You are in! The next issue lands in your inbox soon.';
  this.reset(); toast('Subscribed');
});

/* Pricing page */
if ($('#pricingGrid')){
  const PLANS = [
    { name:'Free', monthly:0, annual:0, cta:'Download free', href:'index.html#download',
      feats:[['50 AI actions / month',1],['Command card · voice & text',1],['Universal insertion',1],['Personal Shortcuts',1],['MCP connections',0],['API access',0]] },
    { name:'Pro', monthly:10, annual:96, cta:'Start free trial', href:'index.html#download', popular:true,
      feats:[['1,000 AI actions / month',1],['Screenshot context',1],['2 personal MCP servers',1],['Personal API key · 60 req/min',1],['Everything in Free',1],['Team workspaces',0]] },
    { name:'Team', monthly:16, annual:154, cta:'Start Team', href:'index.html#download',
      feats:[['2,500 actions / user / month',1],['10 shared MCP servers',1],['Shared Shortcuts',1],['Team workspaces & roles',1],['Team API keys · 120 req/min',1],['Minimum 3 seats',0]] },
    { name:'Business', monthly:28, annual:269, cta:'Start Business', href:'index.html#download',
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
  renderPricing('monthly');
  $$('.bill-tab').forEach(t => t.addEventListener('click', () => {
    $$('.bill-tab').forEach(x => x.classList.toggle('active', x === t));
    renderPricing(t.dataset.bill);
  }));
}

/* Shortcuts page — Store category filter */
$$('.store-filter').forEach(btn => btn.addEventListener('click', () => {
  $$('.store-filter').forEach(b => b.classList.toggle('active', b === btn));
  const f = btn.dataset.filter;
  $$('.gallery-card').forEach(card => {
    card.style.display = (f === 'all' || card.dataset.cat === f) ? '' : 'none';
  });
  $$('.gallery-group').forEach(g => {
    g.style.display = $$('.gallery-card', g).some(c => c.style.display !== 'none') ? '' : 'none';
  });
}));

