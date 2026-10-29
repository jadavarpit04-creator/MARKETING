"""Generate Zerthik dedicated pages (how-it-works, shortcuts, ai, mcp, pricing, api).
Run: python3 scripts/build_pages.py  — writes *.html next to index.html.
Pages share styles.css + pages.css and the light runtime pages.js."""
import html
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent

NAV = [
    ("how", "How it works", "how-it-works.html"),
    ("shortcuts", "Shortcuts", "shortcuts.html"),
    ("ai", "AI", "ai.html"),
    ("mcp", "MCP", "mcp.html"),
    ("pricing", "Pricing", "pricing.html"),
    ("api", "API", "api.html"),
]
LOGO = '<img class="brand-mark" src="assets/zerthik-logo.png" alt="" aria-hidden="true" />'
LOGO_FLAT = LOGO


def header(active):
    links = "".join(
        f'<a href="{f}"{" class=\"page-active\"" if slug == active else ""}>{label}</a>'
        for slug, label, f in NAV)
    mobile = "".join(f'<a href="{f}">{label}</a>' for slug, label, f in NAV) + '<a href="index.html#download">Download</a>'
    return f"""<header class="nav-wrap" id="navbar">
  <nav class="nav glass">
    <a class="brand" href="index.html" aria-label="Zerthik home">{LOGO}<span class="brand-name">Zerthik</span></a>
    <div class="nav-links" id="navLinks">{links}</div>
    <div class="nav-actions">
      <a class="btn btn-white btn-sm" href="index.html#download">Download</a>
      <button class="hamburger" id="hamburger" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button>
    </div>
  </nav>
  <div class="mobile-menu glass" id="mobileMenu">{mobile}</div>
</header>"""


def footer():
    return f"""<footer class="footer">
  <div class="container footer-grid">
    <div class="footer-brand">
      <a class="brand" href="index.html">{LOGO_FLAT}<span class="brand-name">Zerthik</span></a>
      <h5>Subscribe to our newsletter.</h5>
      <p class="muted">Product updates, new Shortcuts and workflow ideas. Monthly, no spam.</p>
      <form class="newsletter" id="newsletterForm">
        <input type="email" required placeholder="you@company.com" aria-label="Email address" />
        <button class="btn btn-white btn-sm" type="submit">Subscribe</button>
      </form>
      <p class="newsletter-msg mono" id="newsletterMsg" role="status"></p>
      <p class="tiny muted">By subscribing you agree to receive our monthly newsletter. Read our <a href="#" data-dead>privacy policy</a>. Unsubscribe anytime.</p>
    </div>
    <nav class="footer-col"><h6>Product</h6><a href="how-it-works.html">How it works</a><a href="shortcuts.html">Shortcuts</a><a href="ai.html">AI engine</a><a href="mcp.html">MCP</a><a href="pricing.html">Pricing</a><a href="api.html">Developer API</a><a href="index.html#download">Download</a></nav>
    <nav class="footer-col"><h6>Core Features</h6><a href="index.html#demo">Live demo</a><a href="index.html#how">How it works</a><a href="index.html#context">Context &amp; privacy</a><a href="index.html#ai">Output formats</a><a href="index.html#insert">Universal insertion</a><a href="index.html#whatelse">What else</a><a href="shortcuts.html">Shortcut library</a></nav>
    <nav class="footer-col"><h6>Top Shortcuts</h6><a href="shortcuts.html">Issue from Error</a><a href="shortcuts.html">The Polite Nudge</a><a href="shortcuts.html">Metrics Table</a><a href="shortcuts.html">Reply in Our Voice</a><a href="shortcuts.html">Summarise Article</a><a href="shortcuts.html">Create your own</a></nav>
    <nav class="footer-col"><h6>Company</h6><a href="#" data-dead>About</a><a href="#" data-dead>Blog</a><a href="#" data-dead>Careers</a><a href="#" data-dead>Press Kit</a><a href="#" data-dead>Contact</a><a href="#" data-dead>Terms</a><a href="#" data-dead>Privacy</a></nav>
    <nav class="footer-col"><h6>Community</h6><a href="index.html#community">Guides</a><a href="api.html">Developers</a><a href="#" data-dead>API Docs</a><a href="#" data-dead>Support</a></nav>
  </div>
  <div class="container footer-bottom mono">
    <span>© 2026 Zerthik. Turn any context into the output you need.</span>
    <span class="footer-hotkey">Press <span class="kbd">Ctrl</span><span class="kbd">Space</span> anywhere. That's the whole trick.</span>
  </div>
  <div class="footer-streak" aria-hidden="true"></div>
</footer>"""


def layout(title, desc, active, body):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>{title} — Zerthik</title>
<meta name="description" content="{desc}" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="styles.css" />
<link rel="stylesheet" href="pages.css" />
<link rel="icon" type="image/png" sizes="512x512" href="assets/zerthik-favicon.png" />
<link rel="apple-touch-icon" href="assets/zerthik-favicon.png" />
</head>
<body class="page-{active}">
{header(active)}
<main class="page-main" id="main" tabindex="-1">
{body}
</main>
{footer()}
<div class="toast mono" id="toast" role="status"></div>
<script src="icons.js"></script>
<script src="lucide-icons.js"></script>
<script src="pages.js"></script>
</body>
</html>
"""


def hero(crumb, icon, eyebrow, h1, lead, actions="", metas=()):
    meta = "".join(f'<span class="pill">{m}</span>' for m in metas)
    return f"""<section class="page-hero"><div class="container">
  <span class="eyebrow"><span class="ui-ic" data-ui="{icon}"></span> {eyebrow}</span>
  <h1>{h1}</h1>
  <p class="lead">{lead}</p>
  <div class="page-actions">{actions}</div>
  <div class="page-meta">{meta}</div>
</div></section>"""


def shead(h2, p=""):
    return f'<div class="page-section-head reveal"><h2>{h2}</h2>{f"<p>{p}</p>" if p else ""}</div>'


def cards(items, cols=3):
    inner = "".join(
        f'<article class="page-card reveal"><span class="ic-badge" data-ui="{i}"></span><h4>{t}</h4><p>{d}</p>'
        f'{f"<div class=\"foot mono\">{f}</div>" if f else ""}</article>'
        for i, t, d, f in items)
    return f'<div class="page-grid-{cols}">{inner}</div>'


def faq(items):
    inner = "".join(f"<details><summary>{q}<span class=\"ui-ic\" data-ui=\"chevron-down\"></span></summary><p>{a}</p></details>" for q, a in items)
    return f'<div class="faq-list reveal">{inner}</div>'


def cta(h2="Take the shortcut.", p="Download Zerthik for Windows and macOS. Every new account starts with 14 days of Pro free — no card required, then 50 actions a month on Free."):
    return f"""<section class="container"><div class="page-cta reveal">
  <h2>{h2}</h2><p>{p}</p>
  <div class="page-actions" style="justify-content:center">
    <a class="btn btn-white btn-lg" href="index.html#download"><span class="ui-ic" data-ui="download"></span> Download Zerthik</a>
    <a class="btn btn-dark btn-lg" href="pricing.html">See pricing</a>
  </div></div></section>"""


DL = '<a class="btn btn-white btn-lg" href="index.html#download"><span class="ui-ic" data-ui="download"></span> Download free</a>'

# ---------------------------------------------------------------- HOW IT WORKS
how_body = hero("How it works", "mouse-pointer-click", "How it works",
    "One shortcut. Any app.<br/>Finished output.",
    "Zerthik is a thin layer over your whole desktop. You stay in the app you were using; "
    "it borrows just enough context, does the writing, and puts the result back where your cursor already is.",
    DL + '<a class="btn btn-dark btn-lg" href="shortcuts.html">Explore Shortcuts</a>',
    ('Ctrl + Space on Windows', 'Option + Space on macOS', 'Opens in under 300 ms'))
how_steps = "".join(
    f'<div class="step-row"><span class="num">STEP {n}</span><h3>{t}</h3><p>{d}</p></div>' for n, t, d in [
        ("01", "Select anything, anywhere", "Text in a doc, an error in a terminal, a table in a screenshot, a thread in your inbox. If you can select it — or point a screenshot at it — it can become context."),
        ("02", "Press the global shortcut", "Ctrl + Space on Windows, Option + Space on macOS. The floating command card appears over your current app in under 300 ms. Nothing to open, nothing to switch to."),
        ("03", "Check your context chips", "Selected text, clipboard, the active app, a screenshot and any MCP context arrive as removable chips. You see exactly what will be sent — and can remove any of it before running."),
        ("04", "Say it, or type it", "Dictate or type the instruction in plain words: “turn this into a polite follow-up”, “make this a table”, “file this as an issue”. Or run a saved Shortcut by name."),
        ("05", "It lands where you work", "The validated result is inserted straight into the focused field — accessibility insert first, with clipboard and typing fallbacks. Most simple transforms finish in under 5 seconds."),
    ])
how_body += f"""<section class="page-section"><div class="container">{shead("The five-second workflow", "No new workspace to learn. No prompt tab to keep open. Just this loop, hundreds of times a day.")}
<div class="steps-rows reveal">{how_steps}</div></div></section>
<section class="page-section"><div class="container">{shead("What the command card sees", "Context is explicit and removable. Sensitive apps are blocked by default, and screenshots are only ever taken when you ask.")}
<div class="desktop-frame reveal">
  <div class="desktop-bar"><span class="dots"><i></i><i></i><i></i></span><span>Visual Studio Code — checkout.ts</span><span class="right mono">Zerthik · ready</span></div>
  <div class="desktop-body"><div class="mini-demo glass-window">
    <div class="chips"><span class="ctx-chip">Selected text · Terminal</span><span class="ctx-chip">Clipboard</span><span class="ctx-chip">Active app · VS Code</span><span class="ctx-chip ctx-mcp">MCP · GitHub (read)</span></div>
    <div class="mini-cmd"><span class="ui-ic" data-ui="mic"></span> “Create an issue draft from this error, with repro steps.”</div>
    <div class="mini-out"><strong>### Bug: Checkout crashes for guest users</strong><br/>Steps to reproduce, expected vs actual, and the captured stack trace — written and validated for the issue form.</div>
  </div></div>
</div></div></section>
<section class="page-section"><div class="container">
  <div class="showcase reveal"><div class="showcase-copy"><h3>Always one shortcut away</h3><p>No dock icon to hunt, no tab to keep alive. The same two keys summon Zerthik over every app you own — and dismiss it just as fast.</p></div>
    <div class="showcase-visual"><div class="key-visual"><span class="kbd">Ctrl</span>+<span class="kbd space">Space</span></div><div class="key-visual" style="min-height:64px"><span class="kbd"><span class="ui-ic kbd-ic" data-ui="option"></span> Option</span>+<span class="kbd space">Space</span></div></div></div>
  <div class="showcase flip reveal"><div class="showcase-copy"><h3>Context you can audit</h3><p>Everything Zerthik is about to use sits in front of you as chips. Remove one and it is gone from the request — before anything runs.</p></div>
    <div class="showcase-visual"><div class="command-list">
      <div class="list-label">Attached context</div>
      <div class="command-row hot"><span class="ui-ic" data-ui="scan-text"></span> Selected text <small>Terminal</small></div>
      <div class="command-row"><span class="ui-ic" data-ui="clipboard"></span> Clipboard <small>1 item</small></div>
      <div class="command-row"><span class="ui-ic" data-ui="camera"></span> Screenshot <small>off</small></div>
      <div class="command-row"><span class="ui-ic" data-ui="plug"></span> MCP · GitHub <small>read-only</small></div>
    </div></div></div>
</div></section>
<section class="page-section"><div class="container">{shead("Built for speed, honest about limits")}
{cards([
    ("timer", "Under 300 ms to open", "The command card is a native overlay, not a web page waking up. It is there before your hands leave the keyboard.", "TARGET · COMMAND CARD"),
    ("scan-text", "Screenshots in under 10 s", "Point Zerthik at a table, dashboard or error dialog. It reads the pixels and returns structured text, a table or code.", "TARGET · SCREENSHOT CONTEXT"),
    ("shield-check", "Private by construction", "Password managers, banking and other sensitive apps are blocked by default. Context is shown as chips before anything runs.", "BLOCKED BY DEFAULT"),
])}</div></section>"""

how_body += f"""<section class="page-section"><div class="container">{shead("Under the hood, in plain English", "The details people ask about after the first demo.")}
<dl class="spec-table reveal">
  <div class="spec-row"><dt>trigger</dt><dd>Ctrl + Space on Windows · Option + Space on macOS — rebindable in Settings. Command card target: under 300 ms.</dd></div>
  <div class="spec-row"><dt>context sources</dt><dd>Selected text, clipboard, active app &amp; window, optional screenshot, and MCP context you explicitly connected. Every source arrives as a removable chip.</dd></div>
  <div class="spec-row"><dt>command input</dt><dd>Voice dictation or typed text. Saved Shortcuts run by name with a fixed tone and output format.</dd></div>
  <div class="spec-row"><dt>output</dt><dd>Validated text, Markdown, table, CSV/TSV or code. Simple transforms target under 5 seconds; screenshots under 10.</dd></div>
  <div class="spec-row"><dt>insertion</dt><dd>Accessibility insert, then clipboard paste, then keyboard simulation — target under 500 ms — with a safe copy-to-clipboard fallback.</dd></div>
  <div class="spec-row"><dt>blocked by default</dt><dd>Password managers, banking and finance apps, and private windows never provide context unless you change the rules yourself.</dd></div>
</dl></div></section>"""
how_body += cta()

# ---------------------------------------------------------------- SHORTCUTS (gallery parsed from app.js)
app_js = (ROOT / "app.js").read_text()
block = app_js[app_js.index("const SHORTCUTS = {"):app_js.index("/* Har Shortcut")]
groups, cat = {}, None
CAT_TITLES = {"developer": "For developers", "founder": "For founders & builders", "support": "For support & ops", "research": "For students & researchers"}
for line in block.splitlines():
    m = re.match(r"\s*(\w+): \[", line)
    if m:
        cat = m.group(1); groups[cat] = []
    m = re.search(r"\['([^']+)','([^']+)','([^']+)','([^']+)',(true|false)\]", line)
    if m and cat:
        groups[cat].append(m.groups())
gallery = ""
for cat_name, entries in groups.items():
    cards_html = "".join(
        f'<article class="gallery-card reveal" data-cat="{cat_name}"><div class="card-top"><span class="ic-badge" data-ui="{icon}"></span>'
        f'<div><h4>{html.escape(name)}</h4><div class="by">by Zerthik · {fmt} output</div></div><span class="arrow ui-ic" data-ui="arrow-up-right"></span></div>'
        f'<div class="cmd" style="margin-top:14px">“{html.escape(cmd)}”</div><div class="tags"><span class="tag">{fmt}</span>'
        f'<span class="tag tag-ghost">{"Workspace · shared" if shared == "true" else "Personal"}</span></div></article>'
        for icon, name, cmd, fmt, shared in entries)
    gallery += f'<div class="gallery-group" data-group="{cat_name}"><h3>{CAT_TITLES.get(cat_name, cat_name.title())}</h3><div class="gallery-grid">{cards_html}</div></div>'
STORE_FILTERS = ('<div class="store-toolbar reveal"><button class="store-filter active" data-filter="all">All</button>'
                 + "".join(f'<button class="store-filter" data-filter="{c}">{t}</button>' for c, t in CAT_TITLES.items())
                 + '</div>')

shortcuts_body = hero("Shortcuts", "command", "Shortcuts library",
    "Say it once.<br/>Run it forever.",
    "Any command can become a reusable Shortcut — with its own name, tone and output format. "
    "Keep them personal, or share them with your whole workspace so the team writes the same way.",
    DL + '<a class="btn btn-dark btn-lg" href="how-it-works.html">How Zerthik works</a>',
    ('Personal & team Shortcuts', 'Run by name, in any app', 'Text · Markdown · Table · CSV · Code'))
shortcuts_body += f"""<section class="page-section"><div class="container">{shead("Start from the library", "A few of the Shortcuts people steal first. Every one runs from the command card, in whatever app is focused.")}
{STORE_FILTERS}
{gallery}</div></section>
<section class="page-section"><div class="container">{shead("Make your own in seconds")}
{cards([
    ("plus", "Save any command", "Ran something useful? Save it with a name, a tone and a fixed output format. Next time it is one word from the command card.", ""),
    ("users", "Share with the workspace", "Team plans can publish Shortcuts to the whole workspace — one support voice, one issue format, one update style.", "TEAM AND UP"),
    ("keyboard", "Run it from anywhere", "Shortcuts work in every app Zerthik works in. No per-app setup, no plugins to maintain.", ""),
])}</div></section>"""

shortcuts_body += f"""<section class="page-section"><div class="container">{shead("Anatomy of a Shortcut", "Four small parts turn a sentence you keep typing into a command the whole team can run.")}
<dl class="spec-table reveal">
  <div class="spec-row"><dt>name</dt><dd>What you say or type to run it — “Issue from Error”, “The Polite Nudge”. Short names win.</dd></div>
  <div class="spec-row"><dt>instruction</dt><dd>The saved prompt in plain words, including what to keep, what to drop, and what never to invent.</dd></div>
  <div class="spec-row"><dt>tone</dt><dd>A reusable voice — calm support, crisp founder, formal legal — stored with the Shortcut, not re-typed every run.</dd></div>
  <div class="spec-row"><dt>output format</dt><dd>Locked to text, Markdown, table, CSV/TSV or code, so the result lands ready for its destination app.</dd></div>
  <div class="spec-row"><dt>sharing</dt><dd>Personal by default. On Team and Business, publish it to the workspace so everyone writes the same way.</dd></div>
  <div class="spec-row"><dt>runs in</dt><dd>Every app via the command card — select context, run the Shortcut by name, insert the result.</dd></div>
</dl></div></section>"""
shortcuts_body += cta()

# ---------------------------------------------------------------- AI
ai_body = hero("AI", "brain", "The AI engine",
    "An assistant that lives<br/>in every app.",
    "Zerthik routes every command to its primary AI model first. If that model times out, gets busy "
    "or returns something malformed, a backup model takes over automatically — you just see the result.",
    DL + '<a class="btn btn-dark btn-lg" href="how-it-works.html">See the workflow</a>',
    ("Automatic backup model", "Validated output", "Simple transforms under 5 s"))
ai_body += f"""<section class="page-section"><div class="container">
<div class="desktop-frame reveal">
  <div class="desktop-bar"><span class="dots"><i></i><i></i><i></i></span><span>Gmail — Re: Proposal for Q3</span><span class="right mono">Quick AI · in place</span></div>
  <div class="desktop-body"><div class="mini-demo glass-window">
    <div class="chips"><span class="ctx-chip">Clipboard · call notes</span><span class="ctx-chip">Active app · Gmail</span></div>
    <div class="list-label">Ask Zerthik</div>
    <div class="mini-cmd"><span class="ui-ic" data-ui="mic"></span> “Reply politely, confirm Friday, ask for the signed copy.”</div>
    <div class="list-label">Zerthik</div>
    <div class="mini-out">Hi Sarah — thanks for the call. Friday works for us. Could you send the signed copy once legal has finished? We can lock onboarding right after.</div>
  </div></div>
</div></div></section>
<section class="page-section"><div class="container">{shead("How a command becomes output", "Two models, one promise: an answer you can paste — sorry, insert — without cleaning it up first.")}
{cards([
    ("brain", "Primary model answers first", "Your context and instruction go to the primary model with the output format you asked for. Most commands end here, in a couple of seconds.", "FIRST TO ANSWER"),
    ("refresh-cw", "Backup model, automatically", "Timeouts, busy signals and malformed replies trigger an instant handover to the backup model. The fallback is logged in your usage and never eats extra allowance.", "AUTOMATIC FALLBACK"),
    ("circle-check", "Validated before it lands", "Output is checked against the requested format and the facts in your context — names, numbers and dates are preserved, never invented.", "FACTS PRESERVED"),
])}</div></section>
<section class="page-section"><div class="container">{shead("Output in the shape the job needs", "Ask in words; receive in structure. The same context can come back five different ways.")}
<dl class="spec-table reveal">
  <div class="spec-row"><dt>text</dt><dd>Clean prose for messages, emails and replies — ready to send as-is.</dd></div>
  <div class="spec-row"><dt>markdown</dt><dd>Headings, lists and checklists for docs, issues and notes.</dd></div>
  <div class="spec-row"><dt>table</dt><dd>Messy lists, expenses and metrics as aligned rows and columns.</dd></div>
  <div class="spec-row"><dt>csv / tsv</dt><dd>Spreadsheet-ready data you can paste straight into Sheets or Excel.</dd></div>
  <div class="spec-row"><dt>code</dt><dd>Snippets, regexes, SQL and type definitions — formatted for your editor.</dd></div>
</dl></div></section>
<section class="page-section"><div class="container">{shead("Works inside your tools", "No integrations to install per app. If it has a text field, Zerthik is already there.")}
<div class="icon-cloud reveal" aria-hidden="true">
  <div class="row"><span data-brand="slack"></span><span data-brand="Gmail"></span><span data-brand="notion"></span><span data-brand="visualstudiocode"></span><span data-brand="github"></span><span data-brand="googlechrome"></span></div>
  <div class="row"><span data-brand="figma"></span><span data-brand="microsoftexcel"></span><span data-brand="microsoftword"></span><span data-brand="googledrive"></span><span data-brand="linear"></span><span data-brand="zoom"></span></div>
</div></div></section>
<section class="page-section"><div class="container">{shead("Guardrails you can read")}
{cards([
    ("eye-off", "Sensitive apps stay dark", "Password managers, banking apps and anything you blocklist are excluded by default. Zerthik cannot read what it cannot see.", ""),
    ("scan-text", "Screenshots only on request", "Screen context is captured per-command, shown as a chip, and removable. There is no always-on recording.", ""),
    ("history", "Every action is logged", "Commands, fallbacks and insertions appear in your activity and usage — for personal accounts and team admins alike.", ""),
])}</div></section>"""

ai_body += f"""<section class="page-section"><div class="container">{shead("The latency & validation budget", "Numbers we design around — and what “validated” actually checks before anything touches your document.")}
<div class="page-grid-2">
  <dl class="spec-table reveal">
    <div class="spec-row"><dt>command card</dt><dd>Opens in under 300 ms</dd></div>
    <div class="spec-row"><dt>simple transform</dt><dd>Under 5 seconds end to end</dd></div>
    <div class="spec-row"><dt>screenshot context</dt><dd>Under 10 seconds, pixels to structured output</dd></div>
    <div class="spec-row"><dt>insertion</dt><dd>Under 500 ms into the focused field</dd></div>
  </dl>
  <dl class="spec-table reveal">
    <div class="spec-row"><dt>format check</dt><dd>Output must match the requested type — text, Markdown, table, CSV/TSV or code — or the backup model retries.</dd></div>
    <div class="spec-row"><dt>fact check</dt><dd>Names, numbers, dates and amounts from your context are carried across exactly; gaps are flagged, not filled with inventions.</dd></div>
    <div class="spec-row"><dt>fallback</dt><dd>Timeouts and malformed replies hand over to the backup model automatically — still counted as one action, and logged.</dd></div>
    <div class="spec-row"><dt>final say</dt><dd>You preview before inserting. Edit, regenerate, or copy instead — nothing is sent or inserted behind your back.</dd></div>
  </dl>
</div></div></section>"""
ai_body += cta()

# ---------------------------------------------------------------- MCP
def perm(brand, tool, note, control):
    return (f'<div class="perm-row"><span data-brand="{brand}" class="chip-brand"></span>'
            f'<div class="perm-info"><strong>{tool}</strong><small>{note}</small></div>{control}</div>')
SW_ON = '<button class="switch on" type="button" role="switch" aria-checked="true" aria-label="GitHub issue search"><i></i></button>'
LOCK = '<span class="perm-lock"><span class="ui-ic" data-ui="lock"></span> Approval</span>'
BLOCK = '<span class="perm-lock blocked"><span class="ui-ic" data-ui="ban"></span> Blocked</span>'
mcp_body = hero("MCP", "plug", "MCP — off by default",
    "Zerthik sees your screen.<br/>MCP lets it act — with permission.",
    "Connect your own MCP servers when you are ready. Every tool gets explicit permissions, "
    "writes wait for your approval, and destructive actions stay blocked. Nothing is connected until you connect it.",
    DL + '<a class="btn btn-dark btn-lg" href="api.html">Developer API</a>',
    ("Off by default", "Approval for every write", "Full action log"))
def server_row(brand, name, note):
    return (f'<div class="server-row"><span data-brand="{brand}"></span><div class="info"><strong>{name}</strong><small>{note}</small></div>'
            f'<a class="btn btn-dark btn-sm" href="#" data-dead>Connect</a></div>')

mcp_steps = "".join(
    f'<div class="step-row"><span class="num">STEP {n}</span><h3>{t}</h3><p>{d}</p></div>' for n, t, d in [
        ("01", "You add a server", "Nothing is pre-connected. You (or your workspace admin) add an MCP server explicitly and authenticate if it needs it."),
        ("02", "Tools are discovered, not granted", "Zerthik lists every tool the server exposes. Discovery changes nothing — each tool still needs a permission from you."),
        ("03", "You set the rules per tool", "Reads can be allowed after connection. Writes always require approval. Destructive tools start blocked and stay blocked until an admin decides otherwise."),
        ("04", "Every use is on the record", "When Zerthik uses a tool, the action log captures the server, tool, payload summary, result — and who approved it, if approval was needed."),
    ])
mcp_body += f"""<section class="page-section"><div class="container">{shead("Popular servers", "Connect the tools you already use. Zerthik discovers each server's tools — permissions stay with you.")}
<div class="server-list reveal">
  {server_row("github", "GitHub", "Issues, pull requests and code search")}
  {server_row("linear", "Linear", "Issues, projects and cycles")}
  {server_row("notion", "Notion", "Pages, databases and search")}
  {server_row("googledrive", "Google Drive", "Files and documents")}
  {server_row("slack", "Slack", "Channels, threads and search")}
</div>
<p class="tiny muted center" style="text-align:center;margin-top:14px">Any MCP server works — these are simply the ones people connect first.</p>
</div></section>
<section class="page-section"><div class="container">{shead("Permissions, per tool", "Connecting a server discovers its tools — it does not grant them. You decide what each tool may do, and you can change your mind anytime.")}
<article class="card reveal" style="max-width:820px;margin-inline:auto">
  <h3 style="margin-top:0"><span class="ui-ic" data-ui="shield-check"></span> Tool permissions</h3>
  {perm("github", "github.search_issues", "Read · no approval needed", SW_ON)}
  {perm("linear", "linear.create_issue", "Write · approval always required", LOCK)}
  {perm("notion", "notion.create_page", "Write · approval always required", LOCK)}
  {perm("googledrive", "drive.delete_file", "Destructive · blocked by default", BLOCK)}
  <p class="tiny muted" style="margin-top:14px">Reads can be switched off anytime. Writes are never toggles — they always stop for approval; destructive tools stay blocked.</p>
</article></div></section>
<section class="page-section"><div class="container">{shead("The rules never bend")}
{cards([
    ("plug", "Off until you turn it on", "A fresh Zerthik install has zero MCP connections. Servers are added explicitly, one at a time, by you or your admin.", "DEFAULT · OFF"),
    ("lock", "Writes wait for a human", "Any tool that creates, edits or sends anything shows you the exact payload first. Approve it, edit it, or cancel — nothing runs silently.", "APPROVAL REQUIRED"),
    ("ban", "Destructive means blocked", "Delete-style tools are blocked by default at every plan level. Unblocking is an explicit, logged admin decision.", "BLOCKED BY DEFAULT"),
    ("history", "Every action, on the record", "Reads, approvals, cancellations and blocks land in the MCP action log — who, what, when, and with whose approval.", "AUDIT LOG"),
    ("users", "Shared servers for teams", "Team and Business workspaces share approved MCP servers with role-based permissions, so the whole team automates the same safe way.", "10–25 SHARED SERVERS"),
    ("terminal", "Same rules over the API", "Workflows triggered through the Developer API follow identical permissions. The API cannot talk its way around an approval.", ""),
], cols=3)}</div></section>
<section class="page-section"><div class="container">{shead("Questions, answered")}
{faq([
    ("Is MCP included in every plan?", "Personal MCP connections start on Pro (2 servers). Team includes 10 shared servers and Business 25, with admin controls and audit logs."),
    ("Can Zerthik ever write without asking me?", "No. Write tools always require an explicit approval showing the exact payload. Read tools run only after you have connected the server and allowed them."),
    ("Which MCP servers work?", "Any server that speaks the Model Context Protocol. Connect it, review its discovered tools, set permissions — done."),
])}</div></section>
<section class="page-section"><div class="container">{shead("How a connection is set up", "Four deliberate steps between “interesting” and “allowed”.")}
<div class="steps-rows reveal">{mcp_steps}</div></div></section>"""

mcp_body += cta()

# ---------------------------------------------------------------- PRICING
pricing_body = hero("Pricing", "credit-card", "Pricing",
    "Start free. Scale when<br/>keystrokes become currency.",
    "Every plan includes the desktop app for Windows and macOS, universal insertion and personal Shortcuts. "
    "Paid plans add more actions, MCP connections and API access — no separate MCP credits, ever. "
    "Every new account starts with 14 days of Pro free — no card required. Upgrades and billing are managed inside the app.",
    DL + '<a class="btn btn-dark btn-lg" href="how-it-works.html">How it works</a>',
    ("14-day Pro trial · No card required", "Free plan · 50 actions/mo", "Cancel anytime"))
pricing_body += f"""<section class="page-section"><div class="container">
<div class="page-section-head reveal"><h2>Plans</h2>
<div class="billing-toggle" style="margin-top:18px">
  <button class="tab bill-tab active" data-bill="monthly">Monthly</button>
  <button class="tab bill-tab" data-bill="annual">Annual <span class="save-tag">−20%</span></button>
</div></div>
<div class="pricing-grid" id="pricingGrid"></div>
<div class="enterprise-strip reveal">
  <div><strong>Enterprise</strong><span>Custom actions, custom MCP, advanced compliance and private gateways.</span></div>
  <a class="btn btn-dark" href="#" data-dead>Talk to sales</a>
</div>
<p class="pricing-note mono reveal">Add-ons: +500 AI actions $9/mo · Higher API limit $19/mo · Plans & billing managed in the app · Cancel anytime</p>
</div></section>
<section class="page-section"><div class="container">{shead("What counts as an action?")}
{cards([
    ("mouse-pointer-click", "One command, one action", "Each completed transform — typed, dictated or via API — counts once. Regenerating a result counts as a new action.", ""),
    ("refresh-cw", "Fallbacks are free", "If the primary model fails and the backup answers, that is still one action. Reliability never eats your allowance twice.", ""),
    ("history", "Watch it in real time", "Usage is visible per user and per workspace, so a busy month is never a surprise invoice.", ""),
])}</div></section>
<section class="page-section"><div class="container">{shead("Included in paid plans", "The parts people upgrade for.")}
<div class="plan-highlights reveal">
  <div class="plan-highlight"><span class="ic-badge" data-ui="brain"></span><div><h4>The full AI engine</h4><p>Primary model with automatic backup, validated output in five formats. <a href="ai.html">Explore the AI engine</a></p></div></div>
  <div class="plan-highlight"><span class="ic-badge" data-ui="camera"></span><div><h4>Screenshot context</h4><p>Tables, dashboards and error dialogs become structured output in under 10 seconds.</p></div></div>
  <div class="plan-highlight"><span class="ic-badge" data-ui="plug"></span><div><h4>MCP connections</h4><p>Personal servers on Pro, shared servers with role-based permissions on Team and Business. <a href="mcp.html">How MCP stays safe</a></p></div></div>
  <div class="plan-highlight"><span class="ic-badge" data-ui="terminal"></span><div><h4>Developer API</h4><p>Personal and team keys for POST /v1/transform, with plan-based rate limits. <a href="api.html">Read the API overview</a></p></div></div>
  <div class="plan-highlight"><span class="ic-badge" data-ui="users"></span><div><h4>Shared Shortcuts</h4><p>Publish one support voice, one issue format, one update style to the whole workspace.</p></div></div>
  <div class="plan-highlight"><span class="ic-badge" data-ui="history"></span><div><h4>Usage & audit logs</h4><p>Every action, fallback and approval on the record — per user and per workspace.</p></div></div>
</div></div></section>
<section class="page-section" id="compare"><div class="container">{shead("Compare all features")}
<div class="compare-table reveal">
  <div class="compare-row head"><div>Feature</div><div>Free</div><div>Pro</div><div>Team</div><div>Business</div></div>
  <div class="compare-row"><div>AI actions included</div><div>50 / mo</div><div>1,000 / mo</div><div>2,500 / user</div><div>6,000 / user</div></div>
  <div class="compare-row"><div>Command card · voice & text</div><div class="yes"><span class="ui-ic" data-ui="check"></span></div><div class="yes"><span class="ui-ic" data-ui="check"></span></div><div class="yes"><span class="ui-ic" data-ui="check"></span></div><div class="yes"><span class="ui-ic" data-ui="check"></span></div></div>
  <div class="compare-row"><div>Universal insertion</div><div class="yes"><span class="ui-ic" data-ui="check"></span></div><div class="yes"><span class="ui-ic" data-ui="check"></span></div><div class="yes"><span class="ui-ic" data-ui="check"></span></div><div class="yes"><span class="ui-ic" data-ui="check"></span></div></div>
  <div class="compare-row"><div>Screenshot context</div><div class="no"><span class="ui-ic" data-ui="x"></span></div><div class="yes"><span class="ui-ic" data-ui="check"></span></div><div class="yes"><span class="ui-ic" data-ui="check"></span></div><div class="yes"><span class="ui-ic" data-ui="check"></span></div></div>
  <div class="compare-row"><div>MCP servers</div><div class="no"><span class="ui-ic" data-ui="x"></span></div><div>2 personal</div><div>10 shared</div><div>25 shared</div></div>
  <div class="compare-row"><div>Developer API</div><div class="no"><span class="ui-ic" data-ui="x"></span></div><div>60 req/min</div><div>120 req/min</div><div>300 req/min</div></div>
  <div class="compare-row"><div>Shared Shortcuts & workspaces</div><div class="no"><span class="ui-ic" data-ui="x"></span></div><div class="no"><span class="ui-ic" data-ui="x"></span></div><div class="yes"><span class="ui-ic" data-ui="check"></span></div><div class="yes"><span class="ui-ic" data-ui="check"></span></div></div>
  <div class="compare-row"><div>Admin controls & audit logs</div><div class="no"><span class="ui-ic" data-ui="x"></span></div><div class="no"><span class="ui-ic" data-ui="x"></span></div><div class="no"><span class="ui-ic" data-ui="x"></span></div><div class="yes"><span class="ui-ic" data-ui="check"></span></div></div>
  <div class="compare-row"><div>Minimum seats</div><div>1</div><div>1</div><div>3</div><div>5</div></div>
</div></div></section>
<section class="page-section"><div class="container">{shead("Pricing questions")}
{faq([
    ("How does the 14-day trial work?", "Download the app and sign in — Pro switches on automatically for 14 days with the full allowance, MCP and API access, and no card is asked. If you do not upgrade, you move to the Free plan automatically and keep all your Shortcuts and settings."),
    ("What happens when I run out of actions?", "Zerthik tells you before you hit the wall. Add the +500 actions add-on, upgrade, or wait for the monthly reset — your Shortcuts and settings stay put."),
    ("Do team plans pool actions?", "Allowances are per user (2,500 on Team, 6,000 on Business), with minimum seats of 3 and 5. Admins see usage across the workspace."),
    ("Is MCP really included?", "Yes — MCP connections are part of paid plans, not a separate meter. Server counts differ by plan; approvals and blocks apply everywhere."),
    ("Can I pay annually?", "Yes — annual billing is roughly 20% less: Pro $96/yr, Team $154/yr per user, Business $269/yr per user."),
])}</div></section>"""

pricing_body += f"""<section class="page-section"><div class="container">{shead("Choosing a plan", "Rule of thumb from real usage patterns.")}
{cards([
    ("mouse-pointer-click", "Trying it out? Start with the trial", "Your first 14 days are full Pro — 1,000 actions, MCP and API included, no card asked. Stay on Free afterwards and 50 actions a month still cover the everyday workflow.", "14 DAYS FREE"),
    ("brain", "Heavy individual use? Pro", "1,000 actions, screenshot context, 2 personal MCP servers and your own API key. The plan most solo professionals land on.", "PRO · $10/MO"),
    ("users", "A team that writes together? Team or Business", "Shared Shortcuts and MCP servers, team API keys and per-user allowances. Business adds admin controls, audit logs and role-based permissions.", "TEAM $16 · BUSINESS $28"),
])}
<dl class="spec-table reveal" style="margin-top:16px">
  <div class="spec-row"><dt>billing</dt><dd>Monthly, or annual at roughly 20% less (Pro $96/yr · Team $154/yr per user · Business $269/yr per user). Checkout and invoices are handled from Plans & Billing inside the app; cancel anytime.</dd></div>
  <div class="spec-row"><dt>add-ons</dt><dd>+500 AI actions for $9/mo · Higher API limit for $19/mo — stack them without changing plans.</dd></div>
  <div class="spec-row"><dt>seats</dt><dd>Team starts at 3 seats, Business at 5. Allowances are per user; admins see workspace-wide usage.</dd></div>
  <div class="spec-row"><dt>enterprise</dt><dd>Custom action volumes, custom MCP allowances and private gateways — talk to sales from the plans above.</dd></div>
</dl></div></section>"""
pricing_body += cta()

# ---------------------------------------------------------------- API
API_INITIAL_CODE = """curl https://api.zerthik.app/v1/transform \\
  -H "Authorization: Bearer $ZERTHIK_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "command": "Create a GitHub issue draft from this error",
    "outputType": "markdown",
    "context": {
      "selectedText": "TypeError: Cannot read properties of undefined",
      "activeApp": "Terminal"
    }
  }'"""
API_RESPONSE = """{
  "id": "act_demo_123",
  "status": "success",
  "outputType": "markdown",
  "output": "### Bug: Checkout API fails\\n\\n**Steps to reproduce**…"
}"""
api_body = hero("API", "terminal", "Developer API",
    "Build with the<br/>Zerthik API.",
    "One endpoint for the same context-to-output engine that powers the desktop app. "
    "Send a command with its context; receive clean, validated output your product can use immediately.",
    DL + '<a class="btn btn-dark btn-lg" href="#flow">See the flow</a>',
    ("Base URL · api.zerthik.app/v1", "Bearer authentication", "From the Pro plan"))
api_body += """<section class="page-section"><div class="container">
<div class="dev-blueprint reveal">
  <div class="dev-hero">
    <div class="dev-hero-copy">
      <span class="fig-caption">FIG_01</span>
      <h2>Build the<br/>perfect tools.</h2>
      <p>Our API is designed to let anyone put the Zerthik context-to-output engine inside their own product.</p>
      <div class="dev-hero-links"><a class="dev-doc-link" href="#flow">See the flow <span class="ui-ic" data-ui="arrow-right"></span></a></div>
    </div>
    <div class="dev-hero-art">
        <div class="dev-flow-demo" aria-hidden="true">
          <svg class="dev-flow-lines" viewBox="0 0 520 280" preserveAspectRatio="none" aria-hidden="true">
            <defs><linearGradient id="devBeamGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#b8b8b8"/><stop offset="55%" stop-color="#a2a2a2"/><stop offset="100%" stop-color="#787878"/></linearGradient></defs>
            <path class="dev-flow-path" d="M132 70 C 168 70, 176 140, 178 140"/><path class="dev-flow-beam b1" d="M132 70 C 168 70, 176 140, 178 140"/>
            <path class="dev-flow-path" d="M132 140 C 152 140, 160 140, 178 140"/><path class="dev-flow-beam b2" d="M132 140 C 152 140, 160 140, 178 140"/>
            <path class="dev-flow-path" d="M132 210 C 168 210, 176 140, 178 140"/><path class="dev-flow-beam b3" d="M132 210 C 168 210, 176 140, 178 140"/>
            <path class="dev-flow-path" d="M342 140 C 362 140, 364 54, 388 54"/><path class="dev-flow-beam b4" d="M342 140 C 362 140, 364 54, 388 54"/>
            <path class="dev-flow-path" d="M342 140 C 362 140, 364 112, 388 112"/><path class="dev-flow-beam b5" d="M342 140 C 362 140, 364 112, 388 112"/>
            <path class="dev-flow-path" d="M342 140 C 362 140, 364 168, 388 168"/><path class="dev-flow-beam b6" d="M342 140 C 362 140, 364 168, 388 168"/>
            <path class="dev-flow-path" d="M342 140 C 362 140, 364 226, 388 226"/><path class="dev-flow-beam b7" d="M342 140 C 362 140, 364 226, 388 226"/>
          </svg>
          <div class="dev-flow-side dev-flow-in">
            <span class="dev-demo-chip"><span class="ui-ic" data-ui="scan-text"></span> Selected text</span>
            <span class="dev-demo-chip"><span class="ui-ic" data-ui="camera"></span> Screenshot</span>
            <span class="dev-demo-chip"><span class="ui-ic" data-ui="clipboard"></span> Clipboard</span>
          </div>
          <div class="dev-flow-core">
            <span class="dev-flow-core-badge"><img src="assets/zerthik-logo.png" alt="" aria-hidden="true" /></span>
            <strong>POST /v1/transform</strong>
            <small>validated by Zerthik</small>
          </div>
          <div class="dev-flow-side dev-flow-out">
            <span class="dev-demo-chip"><span class="ui-ic" data-ui="file-text"></span> Text</span>
            <span class="dev-demo-chip"><span class="ui-ic" data-ui="book-open"></span> Markdown</span>
            <span class="dev-demo-chip"><span class="ui-ic" data-ui="table"></span> Table</span>
            <span class="dev-demo-chip"><span class="ui-ic" data-ui="code-xml"></span> Code</span>
          </div>
          <span class="dev-flow-status mono">200 OK · 742 ms · 1 action</span>
        </div>
    </div>
  </div>
  <a class="dev-row" href="#keys"><div class="dev-cell dev-art-cell"><span class="fig-caption">FIG_02</span><span class="dev-key-demo" aria-hidden="true"><span class="dev-key-top"><span class="ui-ic" data-ui="key-round"></span><strong>Personal key</strong><em>Shown once</em></span><code>zt_live_••••••••••••9f2</code><span class="dev-key-row"><span><span class="ui-ic" data-ui="lock"></span> Stored hashed</span><span><span class="ui-ic" data-ui="ban"></span> Revoke anytime</span></span></span></div><div class="dev-cell dev-text-cell"><span class="dev-arrow ui-ic" data-ui="arrow-up-right"></span><h4>Keys in seconds</h4><p>Personal and team API keys — shown once, stored hashed, revocable anytime.</p></div></a>
  <a class="dev-row flip" href="#limits"><div class="dev-cell dev-text-cell"><span class="dev-arrow ui-ic" data-ui="arrow-up-right"></span><h4>Limits you can plan around</h4><p>60, 120 or 300 requests a minute by plan — written down, never a surprise.</p></div><div class="dev-cell dev-art-cell"><span class="fig-caption">FIG_03</span><span class="dev-limit-demo" aria-hidden="true"><span class="dev-limit-row"><b>Pro</b><span class="dev-limit-track"><i style="--w:24%"></i></span><em>60/min</em></span><span class="dev-limit-row"><b>Team</b><span class="dev-limit-track"><i style="--w:48%"></i></span><em>120/min</em></span><span class="dev-limit-row"><b>Business</b><span class="dev-limit-track"><i style="--w:100%"></i></span><em>300/min</em></span><small>429 responses include a retry hint.</small></span></div></a>
  <div class="dev-get-started"><a href="#flow">Get started <span class="ui-ic" data-ui="arrow-up-right"></span></a></div>
</div></div></section>"""
api_body += f"""<section class="page-section" id="flow"><div class="container">{shead("From context to output, in one flow", "Your product sends what it already has. Zerthik does the thinking in the middle and hands back something finished.")}
<div class="beam-stage reveal" role="img" aria-label="Animated diagram: context sources flow into Zerthik and come out as finished formats">
  <svg class="beam-svg" viewBox="0 0 900 380" preserveAspectRatio="none" aria-hidden="true">
    <defs><linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#8f8f8f"/><stop offset="55%" stop-color="#a2a2a2"/><stop offset="100%" stop-color="#787878"/></linearGradient></defs>
    <path class="beam-path" d="M170 55 C 300 55, 300 190, 408 190"/><path class="beam-light b1" d="M170 55 C 300 55, 300 190, 408 190"/>
    <path class="beam-path" d="M170 190 C 290 190, 300 190, 408 190"/><path class="beam-light b2" d="M170 190 C 290 190, 300 190, 408 190"/>
    <path class="beam-path" d="M170 325 C 300 325, 300 190, 408 190"/><path class="beam-light b3" d="M170 325 C 300 325, 300 190, 408 190"/>
    <path class="beam-path" d="M492 190 C 600 190, 610 45, 730 45"/><path class="beam-light b4" d="M492 190 C 600 190, 610 45, 730 45"/>
    <path class="beam-path" d="M492 190 C 600 190, 610 135, 730 135"/><path class="beam-light b5" d="M492 190 C 600 190, 610 135, 730 135"/>
    <path class="beam-path" d="M492 190 C 600 190, 610 245, 730 245"/><path class="beam-light b6" d="M492 190 C 600 190, 610 245, 730 245"/>
    <path class="beam-path" d="M492 190 C 600 190, 610 335, 730 335"/><path class="beam-light b7" d="M492 190 C 600 190, 610 335, 730 335"/>
  </svg>
  <span class="beam-node" style="left:19%;top:14.5%"><span class="ui-ic" data-ui="scan-text"></span> Selected text</span>
  <span class="beam-node" style="left:19%;top:50%"><span class="ui-ic" data-ui="camera"></span> Screenshot</span>
  <span class="beam-node" style="left:19%;top:85.5%"><span class="ui-ic" data-ui="clipboard"></span> Clipboard</span>
  <div class="beam-core"><span class="core-badge"><img class="core-logo" src="assets/zerthik-logo.png" alt="" aria-hidden="true" /></span><small>Zerthik</small></div>
  <span class="beam-node" style="left:81%;top:11.8%"><span class="ui-ic" data-ui="file-text"></span> Text</span>
  <span class="beam-node" style="left:81%;top:35.5%"><span class="ui-ic" data-ui="book-open"></span> Markdown</span>
  <span class="beam-node" style="left:81%;top:64.5%"><span class="ui-ic" data-ui="table"></span> Table · CSV</span>
  <span class="beam-node" style="left:81%;top:88%"><span class="ui-ic" data-ui="code-xml"></span> Code</span>
</div>
<div class="beam-caption"><span>Your context</span><span>One instruction</span><span>Finished output</span></div>
<div style="margin-top:26px">{cards([
    ("mic", "Say it like you would out loud", "The instruction is a plain sentence — “turn this error into an issue draft” — not a schema to memorise.", ""),
    ("circle-check", "Validated in the middle", "Format and facts are checked before the response leaves, with the backup model on standby.", ""),
    ("clipboard-paste", "Ready where it lands", "Render it, store it, or insert it — the output arrives in the exact shape you asked for.", ""),
])}</div>
</div></section>
<section class="page-section" id="keys"><div class="container">{shead("Keys that behave", "Personal keys on Pro; team keys on Team and Business. Managed from the same place as your usage.")}
{cards([
    ("key-round", "Shown once, stored hashed", "A new key is displayed exactly once and stored only as a hash. Lose it? Revoke and mint another — old keys die instantly.", "PERSONAL & TEAM"),
    ("lock", "Bearer auth, nothing exotic", "Send the key as an Authorization: Bearer header over HTTPS. Keys inherit the plan and workspace of whoever created them.", "HTTPS ONLY"),
    ("ban", "Revoke in one click", "A leaked key is a revoked key. Revocation is immediate and logged, and usage after revocation is rejected.", ""),
])}</div></section>
<section class="page-section" id="limits"><div class="container">{shead("Rate limits & usage", "Limits are per key and reset every minute. Every successful transform counts as one AI action against the plan.")}
<dl class="spec-table reveal">
  <div class="spec-row"><dt>Pro</dt><dd>60 requests / minute · personal key · 1,000 actions a month</dd></div>
  <div class="spec-row"><dt>Team</dt><dd>120 requests / minute · team keys · 2,500 actions per user a month</dd></div>
  <div class="spec-row"><dt>Business</dt><dd>300 requests / minute · team keys · 6,000 actions per user a month</dd></div>
  <div class="spec-row"><dt>429 responses</dt><dd>Include a retry-after hint. Higher API limit add-on available at $19/mo.</dd></div>
</dl></div></section>
<section class="page-section" id="usage"><div class="container">{shead("Everything on the record")}
{cards([
    ("history", "Logged per request", "Status, latency, action ID and which key made the call — visible in usage for users and admins.", ""),
    ("gauge", "No surprise bills", "Actions are prepaid by plan, not metered after the fact. When the allowance ends, requests stop — they do not quietly bill.", ""),
    ("circle-check", "Validated or rejected", "Responses are checked against the requested outputType. Malformed output triggers the backup model, not your error handler.", ""),
], cols=3)}</div></section>
<section class="page-section" id="workflows"><div class="container">{shead("MCP workflows over the API", "The API can trigger the same approval-based MCP workflows as the desktop app — under exactly the same rules.")}
{cards([
    ("shield-check", "Approvals still apply", "A write triggered by API waits for a human approval just like one triggered by keyboard. The payload is shown in full.", ""),
    ("users", "Workspace permissions", "Team keys act with the workspace's MCP permissions and role limits — never with more power than their owner.", ""),
    ("ban", "Destructive stays blocked", "Blocked tools are blocked for API callers too. There is no header, flag or plan that talks around it.", ""),
], cols=3)}</div></section>"""

api_body += f"""<section class="page-section"><div class="container">{shead("Reference details", "The boring parts, written down — so integrations do not have to guess.")}
<dl class="spec-table reveal">
  <div class="spec-row"><dt>authentication</dt><dd>Authorization: Bearer &lt;API key&gt; over HTTPS. Invalid or revoked keys are rejected; revocation is immediate.</dd></div>
  <div class="spec-row"><dt>request body</dt><dd>JSON with command (string), context (object: selectedText, clipboard, activeApp, screenshot) and outputType (text · markdown · table · csv · code).</dd></div>
  <div class="spec-row"><dt>success response</dt><dd>id, status, outputType and output. One successful transform = one AI action against the key owner's plan.</dd></div>
  <div class="spec-row"><dt>rate limiting</dt><dd>60 / 120 / 300 requests per minute on Pro / Team / Business. Over the limit returns 429 with a retry hint.</dd></div>
  <div class="spec-row"><dt>model fallback</dt><dd>If the primary model times out or returns malformed output, the backup model answers instead — same request, still one action.</dd></div>
  <div class="spec-row"><dt>mcp workflows</dt><dd>API-triggered tool writes follow desktop rules: payload shown, human approval required, destructive tools blocked, everything logged.</dd></div>
</dl></div></section>"""
api_body += cta("Build something with it.", "Get a personal key on Pro, or wire up the whole workspace on Team. The first endpoint is the only one you need to learn.")

PAGES = [
    ("how-it-works.html", "How it works", "How Zerthik works: select anything in any app, press one shortcut, say what you need — validated output lands where you work.", "how", how_body),
    ("shortcuts.html", "Shortcuts", "Reusable personal and team Shortcuts for Zerthik — save any command once, run it by name in any app.", "shortcuts", shortcuts_body),
    ("ai.html", "AI", "The Zerthik AI engine: a primary model, an automatic backup, and validated output in text, Markdown, tables, CSV or code.", "ai", ai_body),
    ("mcp.html", "MCP", "MCP in Zerthik is off by default: explicit connections, per-tool permissions, approval for every write, destructive actions blocked.", "mcp", mcp_body),
    ("pricing.html", "Pricing", "Zerthik pricing: Free, Pro, Team and Business plans for Windows and macOS, with MCP and API access on paid plans.", "pricing", pricing_body),
    ("api.html", "Developer API", "Build with the Zerthik API: turn context plus a command into validated output. Keys, limits, usage and approval-safe workflows.", "api", api_body),
]

for fname, title, desc, active, body in PAGES:
    (ROOT / fname).write_text(layout(title, desc, active, body))
    print("wrote", fname)
print("done")
