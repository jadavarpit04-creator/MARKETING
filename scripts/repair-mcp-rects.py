#!/usr/bin/env python3
r"""
Repair pass for icons fetched through mcp-universal-icons v1.1.0.

Bug in that server (dist/index.js -> processSvg): it globally strips
width=""/height="" to size the outer <svg>. The \s* in its regex can
match zero characters, so it ALSO (1) deletes width/height from INNER
<rect> elements — 14 icons render incompletely (mic, keyboard, lock,
clipboard, mail, ...) — and (2) eats 'width="2"' out of
stroke-width="2", leaving the invalid fragment `stroke->` on 38 icons
(browsers' HTML parser tolerates it inline, but the standalone .svg
files are malformed XML).

This script restores ONLY what was stripped: rect width/height matched
by x/y against the official Lucide copy already kept locally in
icons.js (window.UI_ICONS, sourced from lucide-static), and
`stroke-width="2"` where `stroke->` was left. Everything else in
every MCP-fetched SVG is left byte-for-byte untouched.

Run:  python3 scripts/repair-mcp-rects.py
"""
import json, re, pathlib, urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent

reg_src = (ROOT / 'lucide-icons.js').read_text()
registry = json.loads(re.search(r"window\.LUCIDE_ICONS = (\{.*\});", reg_src, re.S).group(1))

icons_src = (ROOT / 'icons.js').read_text()
old = json.loads(re.search(r"window\.UI_ICONS\s*=\s*(\{.*?\});", icons_src, re.S).group(1))

RECT = re.compile(r"<rect[^>]*?/>")
ATTR = lambda tag, k: (re.search(rf'\b{k}="([^"]*)"', tag) or [None, None])[1]

_official_cache = {}
def rect_source_for(name):
    """Local Lucide copy first; naye icons (cpu etc.) ke liye official lucide-static fallback."""
    if name in old:
        return old[name]
    if name not in _official_cache:
        try:
            with urllib.request.urlopen(
                f'https://unpkg.com/lucide-static@latest/icons/{name}.svg', timeout=20
            ) as r:
                _official_cache[name] = r.read().decode('utf-8')
        except Exception:
            _official_cache[name] = ''
    return _official_cache[name]

log_path = ROOT / 'scripts' / 'mcp-repair-log.json'
log = {"reason": ("mcp-universal-icons 1.1.0 processSvg uses a global width=/height= strip regex: "
                  "(1) it deletes width/height from inner <rect> elements; "
                  "(2) it eats 'width=\"2\"' out of stroke-width=\"2\" leaving invalid 'stroke->'"),
       "dimsSource": "icons.js window.UI_ICONS (official Lucide / lucide-static)",
       "repaired": [], "strokeWidthRepaired": [], "unresolved": []}
if log_path.exists():  # preserve earlier repair evidence across reruns
    prev = json.loads(log_path.read_text())
    log["repaired"] = prev.get("repaired", [])
    log["strokeWidthRepaired"] = prev.get("strokeWidthRepaired", [])

def write_standalone(name, inner):
    (ROOT / 'assets' / 'lucide' / f'{name}.svg').write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">{inner}</svg>\n')

for name, inner in sorted(registry.items()):
    # Fix 2: invalid `stroke-` left behind where stroke-width="2" used to be
    # (appears as `stroke->` on <g>-style icons, `stroke- d=` on <path>-style ones)
    if re.search(r' stroke-(?=[ >])', inner):
        inner = re.sub(r' stroke-(?=[ >])', ' stroke-width="2"', inner)
        registry[name] = inner
        write_standalone(name, inner)
        if name not in log["strokeWidthRepaired"]:
            log["strokeWidthRepaired"].append(name)
    bad = [t for t in RECT.findall(inner) if 'width=' not in t or 'height=' not in t]
    if not bad:
        continue
    old_rects = RECT.findall(rect_source_for(name))
    by_xy = {(ATTR(t, 'x'), ATTR(t, 'y')): t for t in old_rects}
    new_inner = inner
    for tag in bad:
        src = by_xy.get((ATTR(tag, 'x'), ATTR(tag, 'y')))
        if src is None and len(old_rects) == len(RECT.findall(inner)):
            src = old_rects[RECT.findall(inner).index(tag)]
        if src is None or ATTR(src, 'width') is None:
            log["unresolved"].append({"name": name, "tag": tag})
            continue
        fixed = tag[:-2].rstrip() + f' width="{ATTR(src, "width")}" height="{ATTR(src, "height")}"/>'
        new_inner = new_inner.replace(tag, fixed)
        log["repaired"].append({"name": name, "before": tag, "after": fixed})
    if new_inner != inner:
        registry[name] = new_inner
        (ROOT / 'assets' / 'lucide' / f'{name}.svg').write_text(
            f'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">{new_inner}</svg>\n')

header = reg_src[:reg_src.index('window.LUCIDE_ICONS')]
(ROOT / 'lucide-icons.js').write_text(
    header + f"window.LUCIDE_ICONS = {json.dumps(registry)};\n")
(ROOT / 'scripts' / 'mcp-repair-log.json').write_text(json.dumps(log, indent=2))

left = [n for n, i in registry.items()
        for t in RECT.findall(i) if 'width=' not in t or 'height=' not in t]
print(f"repaired rects: {len(log['repaired'])} | unresolved: {len(log['unresolved'])}")
print("still damaged after repair:", sorted(set(left)) or "none ✅")
