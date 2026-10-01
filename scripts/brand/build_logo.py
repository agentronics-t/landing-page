#!/usr/bin/env python3
"""Agentronics logo — single geometric source of truth.

Generates every logo asset from the spec below. Pure Python (no deps); run from
the landing_page root:

    python3 scripts/brand/build_logo.py

Outputs public/brand/*.svg, app/icon.svg, and prints the mark path for the
React components (components/ui/Logo.tsx, the dashboard's Logomark.tsx).

The geometry was measured from the brand master (landing_page_UI/logo/
final-light.png) with sub-pixel edge fits, then snapped to its design intent:
  * the indigo leg's two edges are parallel (slope dx/dy = -0.608)
  * the cap's outer edge and both amber sides are parallel (slope 0.5)
  * indigo and amber share one baseline
  * two-radius corners: every obtuse corner R, every acute corner r
Rendered back over the master it matches to a mean colour error of 1.7/255.
"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from ttf import TTF, text_path  # noqa: E402,F401  (used by svg_lockup)

# ---- spec (master pixel units) ---------------------------------------------
S1, S2 = -0.608, 0.5
Y_TOP, Y_CUT, Y_ATOP, Y_BOT = 93.33, 134.47, 156.31, 199.43
A_LEFT, A_IN, A_OUT = 249.124, 284.688, 166.637
A_AL, A_AR = 132.585, 165.621
R_OBTUSE, R_ACUTE = 11.0, 2.75

INDIGO, AMBER = "#5b4fd1", "#e58313"
INK_LIGHT, INK_DARK = "#0e1017", "#f4f5f8"  # --content in light / dark themes
FAVICON_BG = "#1f1c4b"


def _x(a, s, y):
    return a + s * y


INDIGO_POLY = [
    (_x(A_LEFT, S1, Y_TOP), Y_TOP), (_x(A_OUT, S2, Y_TOP), Y_TOP),
    (_x(A_OUT, S2, Y_CUT), Y_CUT), (_x(A_IN, S1, Y_CUT), Y_CUT),
    (_x(A_IN, S1, Y_BOT), Y_BOT), (_x(A_LEFT, S1, Y_BOT), Y_BOT),
]
AMBER_POLY = [
    (_x(A_AL, S2, Y_ATOP), Y_ATOP), (_x(A_AR, S2, Y_ATOP), Y_ATOP),
    (_x(A_AR, S2, Y_BOT), Y_BOT), (_x(A_AL, S2, Y_BOT), Y_BOT),
]

# Normalise: sharp bounding box → origin, mark height = 100 units.
MIN_X = min(p[0] for p in INDIGO_POLY + AMBER_POLY)
MAX_X = max(p[0] for p in INDIGO_POLY + AMBER_POLY)
K = 100 / (Y_BOT - Y_TOP)
MARK_W = round((MAX_X - MIN_X) * K, 2)
MARK_H = 100


def _f(v):
    return f"{round(v, 2):g}"


def rounded_path(poly, ox=0.0, oy=0.0, scale=1.0):
    """Closed path with true circular fillets. `poly` is clockwise (y-down)."""
    n = len(poly)
    corners = []
    for i, p in enumerate(poly):
        a, b = poly[i - 1], poly[(i + 1) % n]
        u1 = (a[0] - p[0], a[1] - p[1]); l1 = math.hypot(*u1); u1 = (u1[0] / l1, u1[1] / l1)
        u2 = (b[0] - p[0], b[1] - p[1]); l2 = math.hypot(*u2); u2 = (u2[0] / l2, u2[1] / l2)
        th = math.acos(max(-1.0, min(1.0, u1[0] * u2[0] + u1[1] * u2[1])))
        convex = (p[0] - a[0]) * (b[1] - p[1]) - (p[1] - a[1]) * (b[0] - p[0]) > 0
        r = R_OBTUSE if th > math.pi / 2 else R_ACUTE
        d = min(r / math.tan(th / 2), 0.45 * min(l1, l2))
        r = d * math.tan(th / 2)
        corners.append(((p[0] + u1[0] * d, p[1] + u1[1] * d), (p[0] + u2[0] * d, p[1] + u2[1] * d), r, 1 if convex else 0))

    def X(pt):
        return _f(ox + (pt[0] - MIN_X) * K * scale)

    def Y(pt):
        return _f(oy + (pt[1] - Y_TOP) * K * scale)

    t1, t2, _, _ = corners[0]
    out = [f"M{X(t2)} {Y(t2)}"]
    for i in range(1, n + 1):
        t1, t2, r, sweep = corners[i % n]
        rr = _f(r * K * scale)
        out.append(f"L{X(t1)} {Y(t1)}A{rr} {rr} 0 0 {sweep} {X(t2)} {Y(t2)}")
    return "".join(out) + "Z"


def mark_paths(ox=0.0, oy=0.0, scale=1.0):
    return rounded_path(INDIGO_POLY, ox, oy, scale), rounded_path(AMBER_POLY, ox, oy, scale)


def svg_mark():
    i, a = mark_paths()
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {_f(MARK_W)} {MARK_H}" role="img" aria-label="Agentronics">'
            f'<path fill="{INDIGO}" d="{i}"/><path fill="{AMBER}" d="{a}"/></svg>\n')


# Lockup proportions match the site navbar (mark 21.7px visible, Geist SemiBold
# 19px, tracking -0.025em, ~8.7px gap), scaled so the mark is 100 units tall.
WORD_SIZE, WORD_GAP, WORD_BASELINE, WORD_TRACKING = 88.0, 40.0, 83.0, -0.025


def svg_lockup(font, ink):
    i, a = mark_paths()
    x0 = MARK_W + WORD_GAP
    d, w = text_path(font, "agentronics", WORD_SIZE, x0, WORD_BASELINE, WORD_TRACKING)
    width = x0 + w
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {_f(width)} {MARK_H}" role="img" aria-label="Agentronics">'
            f'<path fill="{INDIGO}" d="{i}"/><path fill="{AMBER}" d="{a}"/><path fill="{ink}" d="{d}"/></svg>\n')


def svg_favicon():
    size, scale = 180, 1.0
    ox, oy = (size - MARK_W * scale) / 2, (size - MARK_H * scale) / 2
    i, a = mark_paths(ox, oy, scale)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}">'
            f'<rect width="{size}" height="{size}" rx="40" fill="{FAVICON_BG}"/>'
            f'<path fill="{INDIGO}" d="{i}"/><path fill="{AMBER}" d="{a}"/></svg>\n')


def main():
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    out = os.path.join(root, "public", "brand")
    os.makedirs(out, exist_ok=True)
    files = {
        os.path.join(out, "agentronics-mark.svg"): svg_mark(),
        # Full lockups (mark + wordmark) are NOT generated: the brand wordmark
        # uses its own typeface, which we don't have as a font file. Use the
        # original public/logo-{light,dark}.png until it's supplied, then pass
        # its path to svg_lockup() here.
        os.path.join(out, "agentronics-favicon.svg"): svg_favicon(),
        os.path.join(root, "app", "icon.svg"): svg_favicon(),
    }
    for path, body in files.items():
        with open(path, "w") as fh:
            fh.write(body)
        print(f"wrote {os.path.relpath(path, root)} ({len(body)} bytes)")
    i, a = mark_paths()
    print(f"\nMARK_W={MARK_W} MARK_H={MARK_H}\nINDIGO_D={i}\nAMBER_D={a}")


if __name__ == "__main__":
    main()
