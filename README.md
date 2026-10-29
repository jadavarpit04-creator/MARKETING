# Zerthik — Marketing Landing Page (Raycast-style layout)

PRD (`Zerthik.txt`) ke hisab se bani hui landing page — **layout/order/typography raycast.com jaisa same-to-same** (humare teardown tokens: 1064px container, 56px/400 left headings, sharp ribbon streaks), **content 100% Zerthik PRD ka**:
**Zerthik — Turn any context into the output you need.** (Windows + macOS, global shortcut, context capture, automatic backup-model fallback, universal insertion, Shortcuts, MCP with approvals, API, real PRD pricing.)

## Real icons (important)
- `assets/appicons/` me **29 full-color asli app icons (PNG)** internet se (dashboard-icons repos) download karke local rakhe hain — `brandTile()` inhe **poori site par transparent background** ke saath lagata hai (koi tile/dabba nahi; sirf GitHub/Linear jaise poore-kaale logos ka official SVG glyph light/brand color me aata hai, warna dark bg par dikhte hi nahi).
- **UI icons = Lucide**, `.mcp.json` wale **`mcp-universal-icons` MCP server ke through fetch kiye hue** (neeche wala section dekho): `lucide-icons.js` (runtime registry) + `assets/lucide/` me 89 standalone `.svg` files. Koi CDN runtime dependency nahi — sab local files se render hota hai.
- `icons.js` me **43 asli brand logos** (Simple Icons ke official SVG paths: Gmail, Notion, Slack, VS Code, GitHub, Linear, Excel, Figma, Apple, Windows…) aur ek purani local Lucide copy safety-fallback ke liye rakhi hai. (Note: Lucide me brand logos nahi hote, isiliye brand/app icons full-color PNG/SVG hi rehte hain.)
- Naya icon use karna ho to HTML me bas `<span data-brand="slug"></span>` ya `<span data-ui="icon-name"></span>` likho; `app.js` ka icon engine khud render kar dega. JS se: `brandTile('notion')`, `brandPlain('apple')`, `uiIcon('mic')`.
- Brand slugs ab **case-insensitive canonicalization** se resolve hote hain (`gmail`/`whatsapp` jaise variants bhi sahi logo par map honge), logo PNGs eager-load hoti hain, aur PNG fail hone par official SVG fallback render hota hai. Poori site ke static + dynamic logo slots check karne ke liye: `node scripts/audit-logos.js`.

## Dedicated pages
Navbar ke 6 items ke ab alag pages hain (landing theme `styles.css` + `pages.css`, halka runtime `pages.js`):
`how-it-works.html`, `shortcuts.html` (24 Shortcut cards, app.js ke data se), `ai.html`, `mcp.html`, `pricing.html` (working monthly/annual toggle), `api.html` (Magic UI Animated Beam flow — `scripts/magicui-beam-log.json` evidence, anchors `#keys #limits #usage #workflows`).
Regenerate: `python3 scripts/build_pages.py`. Pages Raycast ke dedicated-page patterns par hain: centered hero + desktop mock/showcases (How, AI), Store-style category filter (Shortcuts), server registry list (MCP), plan highlights + compare-all-features table (Pricing), Developers blueprint + Animated Beam flow (API). Homepage par Insert section Raycast ke Snippets-bento pattern par hai aur Developer API section Raycast Developers blueprint (FIG grid) pattern par — dono apni dedicated detail pages ko link karte hain.

## Motion system (animations)
- Hero: layered **aurora** (4 blurred radial blooms, screen-blend, slow staggered transform/opacity drift) + Raycast-style diagonal ribbon streaks jinke andar light flow karti hai (stars/meteors user ke kehne par hata diye) + aurora-gradient headline word + scroll parallax (`--hero-p`). Hero animations tab pause ho jati hain jab hero screen par nahi hota (IntersectionObserver `inview` class); `prefers-reduced-motion` par sab band.
- Scroll: **ScrollProgress** bar, **BlurFade** reveals (blur + rise + stagger), scrollspy nav.
- Focus elements (hero demo, API code window, popular pricing card) par **Border Beam**; cards par pointer spotlight; hero demo par halka 3D tilt — sab vanilla CSS/JS ports, koi library nahi.
- Cleanup pass: API section ka dotted FIG-grid aur final CTA ka duplicate dim keyboard + cube art hata diye; guide thumbnails ab dark editorial medallions hain; persona icons ab dark-glass Lucide medallions (accent ring ke saath, koi gradient circle nahi).

## MCP workflow — universal-icons + Magic UI
- `.mcp.json` — project-level MCP config: `universal-icons` (`npx -y mcp-universal-icons`) + `magicui` (`npx -y @magicuidesign/mcp@latest`), Claude Code / Cursor jaise clients me seedha use hote hain.
- `scripts/fetch-icons-via-mcp.mjs` — chhota MCP client jo isi server ko stdio JSON-RPC se chala ke `health_check` → `search_icons` → `get_icon` (collection `lucide`) call karta hai aur `lucide-icons.js` + `assets/lucide/*.svg` + fetch logs (`scripts/mcp-fetch-log*.json`) generate karta hai.
  Dobara chalana ho: `node scripts/fetch-icons-via-mcp.mjs` (kuch icons ke liye: `--only mic,zap`).
- ⚠️ **Us MCP server (v1.1.0) me ek real bug hai**: uska `processSvg` global regex se `width=`/`height=` udata hai, jisse har Lucide SVG ka `stroke-width="2"` toot ke invalid `stroke-` reh jata hai, aur `<rect>` wale 14 icons (mic/keyboard/lock…) ke asli size attributes bhi gayab ho jate hain. `scripts/repair-mcp-rects.py` sirf wahi uda hua hissa wapas lagata hai (evidence: `scripts/mcp-repair-log.json`) — fetch ke baad ise zaroor chalao: `python3 scripts/repair-mcp-rects.py`.
- Iconify (jisse ye MCP peeche se fetch karta hai) burst requests par `429` deta hai (retry-after ~3 min dekha gaya) — script calls ke beech delay rakhta hai; phir bhi fail ho to thodi der ruk ke `--only` se retry karo.
- `scripts/fetch-magicui-marquee.mjs` — Magic UI MCP client: `searchRegistryItems`/`listRegistryItems` se khoj ke `getRegistryItem('marquee')` ka source + saare examples lata hai (log: `scripts/magicui-marquee-log.json`). Works-everywhere strip Magic UI ke **Marquee component + `marquee-logos` example** ka vanilla port hai (repeat-groups, `--duration`/`--gap`, pause-on-hover, transparent logos).
- Note: `@magicuidesign/cli@latest mcp` koi server nahi hai — woh CLI sirf config install karta hai (`error: unknown command 'mcp'` dega); asal Magic UI MCP server package `@magicuidesign/mcp@latest` hai, `.mcp.json` me wahi laga hai.

## Files
| File | Kya hai |
|---|---|
| `index.html` | 13 sections: hero, command-card demo (5 scenes), works-everywhere marquee, how-it-works + interactive keyboard, context & privacy, AI engine (fallback simulator), live insertion demo, Shortcut library, MCP (orbit + permissions + approval demo + log), personas, pricing (monthly/annual), API, guides, final CTA, footer |
| `styles.css` | Raycast-style design system (dark `#07080a`, glass, keycaps) + Zerthik components |
| `app.js` | Saare demos/interaction |
| `icons.js` | Brand icon data + app-PNG map + Lucide safety-fallback |
| `lucide-icons.js` | MCP se fetch kiye 89 Lucide UI icons (generated — haath se edit mat karo) |
| `assets/lucide/` | Unhi 89 icons ki standalone `.svg` files |
| `.mcp.json`, `scripts/` | universal-icons + Magic UI MCP config, fetch/repair/marquee scripts & logs (upar dekho) |

## Abhi placeholder / tumhare input ka wait
- **Brand color violet `#7C5CFF`** aur **Z-wala logo mark** maine banaya hai (PRD me brand color/logo nahi tha) — real color/logo milte hi `styles.css` ke top 3 variables + ek SVG se badal jayega.
- Saare CTA/download/checkout links `#` placeholder hain (click par toast aata hai).
- Pricing/plan details PRD se liye hain (Free 50, Pro $10/1000, Team $16/2500, Business $28/6000).

## Chalane ke liye
`python3 -m http.server 8000 --bind 0.0.0.0 --directory zerthik-landing` — koi build step nahi.
