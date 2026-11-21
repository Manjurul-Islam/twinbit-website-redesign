#!/usr/bin/env python3
"""Rebuild assets/logo-letters.js (the loader's letter-by-letter logo) from the Twinbit logo SVG.

Usage:
    python3 tools/build-logo-letters.py path/to/Twinbit_logo.svg > assets/logo-letters.js

The SVG is the Illustrator export with 9 paths: red flag (.st0), orange b-counter (.st1) and
7 black glyph paths in reading order (t w i n b i t). Each output glyph gets:
    vb  – viewBox [x, y, w, h], all glyphs share the same y/h so they sit on one baseline
    g   – gap before the glyph, as a fraction of the glyph height (the loader multiplies it by --lh)
    svg – the glyph's <path> markup; black becomes var(--bone) so it follows the theme
Standard library only.
"""
import json, re, sys

def path_bbox(d):
    """Exact bounding box of an SVG path (M L H V C S Z, absolute + relative)."""
    toks = re.findall(r'[MmLlHhVvCcSsZz]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?', d)
    xs, ys = [], []
    x = y = sx = sy = 0.0
    pc = None  # previous cubic control point (for S)
    i, cmd = 0, None

    def num():
        nonlocal i
        v = float(toks[i]); i += 1; return v

    def cubic(p0, p1, p2, p3):
        pts = [p0, p3]
        for k in (0, 1):
            a = -p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]
            b = 2 * (p0[k] - 2 * p1[k] + p2[k])
            c = p1[k] - p0[k]
            roots = []
            if abs(a) < 1e-12:
                if abs(b) > 1e-12: roots = [-c / b]
            else:
                disc = b * b - 4 * a * c
                if disc >= 0:
                    s = disc ** .5
                    roots = [(-b + s) / (2 * a), (-b - s) / (2 * a)]
            for t in roots:
                if 0 < t < 1:
                    mt = 1 - t
                    pts.append(tuple(mt**3 * p0[j] + 3 * mt * mt * t * p1[j] + 3 * mt * t * t * p2[j] + t**3 * p3[j] for j in (0, 1)))
        for px, py in pts: xs.append(px); ys.append(py)

    while i < len(toks):
        if re.match(r'[A-Za-z]', toks[i]): cmd = toks[i]; i += 1
        rel = cmd.islower(); C = cmd.upper()
        ox, oy = (x, y) if rel else (0.0, 0.0)
        if C == 'Z':
            x, y = sx, sy; pc = None; continue
        if C == 'M':
            x, y = ox + num(), oy + num(); sx, sy = x, y; xs.append(x); ys.append(y); pc = None
            cmd = 'l' if rel else 'L'
        elif C == 'L':
            x, y = ox + num(), oy + num(); xs.append(x); ys.append(y); pc = None
        elif C == 'H':
            x = (x if rel else 0) + num(); xs.append(x); ys.append(y); pc = None
        elif C == 'V':
            y = (y if rel else 0) + num(); xs.append(x); ys.append(y); pc = None
        elif C == 'C':
            p1 = (ox + num(), oy + num()); p2 = (ox + num(), oy + num()); p3 = (ox + num(), oy + num())
            cubic((x, y), p1, p2, p3); pc = p2; x, y = p3
        elif C == 'S':
            p1 = (2 * x - pc[0], 2 * y - pc[1]) if pc else (x, y)
            p2 = (ox + num(), oy + num()); p3 = (ox + num(), oy + num())
            cubic((x, y), p1, p2, p3); pc = p2; x, y = p3
        else:
            raise ValueError(f'unsupported path command {cmd}')
    return min(xs), min(ys), max(xs), max(ys)

def main(svg_path):
    svg = open(svg_path, encoding='utf-8').read()
    paths = [(c or 'k', re.sub(r'\s+', ' ', d).strip())
             for c, d in re.findall(r'<path(?: class="(st\d)")? d="([^"]+)"\s*/>', svg, re.S)]
    if len(paths) != 9:
        sys.exit(f'expected 9 paths (flag, b-counter, 7 glyphs), found {len(paths)}')
    fill = {'k': 'style="fill:var(--bone)"', 'st0': 'fill="#DF2328"', 'st1': 'fill="#FAA71C"'}
    # file order: 0 flag, 1 b-counter, 2..8 = t w i n b i t  →  glyph groups (counter drawn under the b)
    groups = [[2, 0], [3], [4], [5], [1, 6], [7], [8]]
    boxes = [path_bbox(d) for _, d in paths]
    y0 = min(b[1] for b in boxes); y1 = max(b[3] for b in boxes); H = y1 - y0
    out, prev_r = [], None
    for g in groups:
        x0 = min(boxes[k][0] for k in g); x1 = max(boxes[k][2] for k in g)
        out.append({
            'vb': [round(x0, 1), round(y0, 1), round(x1 - x0, 1), round(H, 1)],
            'g': 0 if prev_r is None else round((x0 - prev_r) / H, 4),
            'svg': ''.join(f'<path {fill[paths[k][0]]} d="{paths[k][1]}"/>' for k in g),
        })
        prev_r = x1
    sys.stdout.write('window.TB_LOGO=' + json.dumps(out) + ';\n')

if __name__ == '__main__':
    if len(sys.argv) != 2: sys.exit(__doc__)
    main(sys.argv[1])
