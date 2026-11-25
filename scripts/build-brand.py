#!/usr/bin/env python3
"""
Ecodemia logo build script
Renders the "ecodemia" wordmark with headless Chrome (or Edge) in the site's own
font, then uses Pillow to export every logo PNG into assets/brand/ and copies
favicon.ico to the site root.

Not part of the deploy build: run it by hand when the logo or colours change.
    pip install pillow
    python scripts/build-brand.py
"""
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "brand"
FONT = ROOT / "assets" / "fonts" / "schibsted-grotesk-normal-400-800-latin.woff2"

BROWSERS = [
    os.environ.get("CHROME_PATH", ""),
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    shutil.which("google-chrome") or "", shutil.which("chromium") or "",
]

# Each mask is the wordmark (or the "e") in black on a transparent page; the
# hidden parts keep their space so "eco" and "demia" line up when recombined.
MASKS = {
    "eco":   '<span>eco</span><span style="color:transparent">demia</span>',
    "demia": '<span style="color:transparent">eco</span><span>demia</span>',
    "e":     '<span>e</span>',
}


def render_masks(tmp):
    browser = next((b for b in BROWSERS if b and Path(b).exists()), None)
    if not browser:
        sys.exit("Chrome or Edge not found; set CHROME_PATH.")
    for name, body in MASKS.items():
        page = tmp / f"{name}.html"
        page.write_text(
            "<!doctype html><meta charset=utf-8><style>"
            f"@font-face{{font-family:SG;font-weight:400 800;src:url({FONT.as_uri()}) format('woff2')}}"
            "html,body{margin:0;background:transparent}"
            "div{position:absolute;left:200px;top:150px;color:#000;font:800 600px/1.3 SG;"
            "letter-spacing:-0.04em;white-space:nowrap}"
            f"</style><div>{body}</div>",
            encoding="utf-8",
        )
        subprocess.run([
            browser, "--headless=new", "--disable-gpu", "--hide-scrollbars",
            f"--user-data-dir={tmp / ('profile-' + name)}",
            "--force-device-scale-factor=1", "--default-background-color=00000000",
            "--virtual-time-budget=4000", "--window-size=3600,1200",
            f"--screenshot={tmp / (name + '.png')}", page.as_uri(),
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


_tmp = Path(tempfile.mkdtemp(prefix="ecodemia-brand-"))
render_masks(_tmp)
SRC = _tmp

FOREST = "#0f5a3f"
FOREST_DEEP = "#0b3d2b"
INK = "#14201a"
MINT = "#9fe0bf"
PAPER = "#fbfcfb"
WHITE = "#ffffff"
BLACK = "#000000"

def alpha(name):
    return Image.open(SRC / f"{name}.png").getchannel("A")

A_ECO, A_DEMIA, A_E = alpha("eco"), alpha("demia"), alpha("e")
WM_BOX = ImageChops.lighter(A_ECO, A_DEMIA).getbbox()
E_BOX = A_E.getbbox()

def fill(mask, color):
    layer = Image.new("RGBA", mask.size, color)
    layer.putalpha(mask)
    return layer

def wordmark_master(c_eco, c_demia):
    img = Image.alpha_composite(fill(A_ECO, c_eco), fill(A_DEMIA, c_demia))
    return img.crop(WM_BOX)

def glyph_master(color):
    return fill(A_E, color).crop(E_BOX)

def scale_to(img, w=None, h=None):
    if w is None:
        w = round(img.width * h / img.height)
    if h is None:
        h = round(img.height * w / img.width)
    return img.resize((w, h), Image.LANCZOS)

def save(img, rel):
    p = OUT / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    img.save(p, optimize=True)
    return p

def place(canvas, art, cx=None, cy=None):
    cx = canvas.width / 2 if cx is None else cx
    cy = canvas.height / 2 if cy is None else cy
    canvas.alpha_composite(art, (round(cx - art.width / 2), round(cy - art.height / 2)))
    return canvas

def rounded(size, color, radius_ratio):
    """Square with rounded corners, drawn at 4x and downsampled for clean edges."""
    big = size * 4
    m = Image.new("L", (big, big), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, big - 1, big - 1), radius=round(big * radius_ratio), fill=255)
    tile = Image.new("RGBA", (big, big), color)
    tile.putalpha(m)
    return tile.resize((size, size), Image.LANCZOS)

# ── Wordmark ───────────────────────────────────────────────────
WORDMARKS = {
    "color":    (FOREST, INK, None),          # light backgrounds
    "reversed": (MINT, WHITE, None),          # dark backgrounds
    "black":    (BLACK, BLACK, None),
    "white":    (WHITE, WHITE, None),
    "forest":   (FOREST, FOREST, None),       # one-colour green
    "color-on-paper":    (FOREST, INK, PAPER),
    "reversed-on-forest": (MINT, WHITE, FOREST_DEEP),
}
PAD = 0.18  # padding on each side, as a share of the wordmark's height
for name, (c1, c2, bg) in WORDMARKS.items():
    master = wordmark_master(c1, c2)
    for width in (400, 800, 1600, 2400):
        art_w = round(width / (1 + 2 * PAD * master.height / master.width))
        art = scale_to(master, w=art_w)
        pad = round(art.height * PAD)
        canvas = Image.new("RGBA", (width, art.height + 2 * pad), bg or (0, 0, 0, 0))
        save(place(canvas, art), f"wordmark/ecodemia-wordmark-{name}-{width}w.png")

# ── Mark (the "e") ─────────────────────────────────────────────
def mark_tile(size, bg, fg, glyph_h, radius):
    tile = rounded(size, bg, radius) if radius else Image.new("RGBA", (size, size), bg)
    g = scale_to(glyph_master(fg), h=round(size * glyph_h))
    return place(tile, g)

MARKS = {
    "forest":        (FOREST, WHITE, 0.22),
    "forest-square": (FOREST, WHITE, 0),
    "dark":          (FOREST_DEEP, MINT, 0.22),
    "dark-square":   (FOREST_DEEP, MINT, 0),
}
for name, (bg, fg, r) in MARKS.items():
    for s in (64, 128, 256, 512, 1024):
        save(mark_tile(s, bg, fg, 0.52, r), f"mark/ecodemia-mark-{name}-{s}.png")

for name, color in {"color": FOREST, "black": BLACK, "white": WHITE, "mint": MINT}.items():
    for s in (64, 128, 256, 512, 1024):
        canvas = Image.new("RGBA", (s, s), (0, 0, 0, 0))
        g = scale_to(glyph_master(color), h=round(s * 0.8))
        save(place(canvas, g), f"mark/ecodemia-glyph-{name}-{s}.png")

# ── Favicons & app icons ───────────────────────────────────────
for s in (16, 32, 48):
    # small sizes: bigger glyph, less rounding so it reads at tab size
    save(mark_tile(s, FOREST, WHITE, 0.66, 0.18), f"favicon/favicon-{s}x{s}.png")
ico_src = mark_tile(256, FOREST, WHITE, 0.66, 0.18)
(OUT / "favicon").mkdir(parents=True, exist_ok=True)
ico_src.save(OUT / "favicon/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
save(mark_tile(180, FOREST, WHITE, 0.52, 0), "favicon/apple-touch-icon.png")  # iOS rounds it itself
for s in (192, 512):
    save(mark_tile(s, FOREST, WHITE, 0.52, 0.22), f"favicon/android-chrome-{s}x{s}.png")
    save(mark_tile(s, FOREST, WHITE, 0.38, 0), f"favicon/maskable-{s}x{s}.png")  # fits the 80% safe zone
save(mark_tile(150, FOREST, WHITE, 0.46, 0), "favicon/mstile-150x150.png")

# ── Social ─────────────────────────────────────────────────────
def banner(w, h, bg, c1, c2, rel_w, cx=None):
    canvas = Image.new("RGBA", (w, h), bg)
    art = scale_to(wordmark_master(c1, c2), w=round(w * rel_w))
    return save(place(canvas, art, cx=cx), rel)

for rel, w, h, bg, c1, c2, rel_w in [
    ("social/og-image-dark-1200x630.png", 1200, 630, FOREST_DEEP, MINT, WHITE, 0.56),
    ("social/og-image-light-1200x630.png", 1200, 630, PAPER, FOREST, INK, 0.56),
    ("social/x-header-1500x500.png", 1500, 500, FOREST_DEEP, MINT, WHITE, 0.42),
    ("social/linkedin-banner-1584x396.png", 1584, 396, FOREST_DEEP, MINT, WHITE, 0.36),
    ("social/youtube-banner-2560x1440.png", 2560, 1440, FOREST_DEEP, MINT, WHITE, 0.36),  # centred in the 1546x423 safe area
]:
    banner(w, h, bg, c1, c2, rel_w)

# Profile pictures get cropped to a circle: keep the glyph well inside it.
for s in (400, 1000):
    save(mark_tile(s, FOREST, WHITE, 0.46, 0), f"social/profile-forest-{s}.png")
    save(mark_tile(s, FOREST_DEEP, MINT, 0.46, 0), f"social/profile-dark-{s}.png")
    # wordmark avatar for platforms where the name should be legible
    canvas = Image.new("RGBA", (s, s), FOREST_DEEP)
    art = scale_to(wordmark_master(MINT, WHITE), w=round(s * 0.66))
    save(place(canvas, art), f"social/profile-wordmark-{s}.png")

# Email signature (2x for retina; display at 160px wide)
canvas_art = scale_to(wordmark_master(FOREST, INK), w=320)
save(canvas_art, "email/ecodemia-email-signature-320w.png")

shutil.copyfile(OUT / "favicon" / "favicon.ico", ROOT / "favicon.ico")  # browsers ask for /favicon.ico
shutil.rmtree(_tmp, ignore_errors=True)
print("done:", sum(1 for _ in OUT.rglob("*.png")), "PNGs in", OUT.relative_to(ROOT))
