"""Draws the app icons into public/ (run once; the PNGs are committed). A boule with a jack, on the Academy green, with a small mortarboard-free "A" mark."""
import os
from PIL import Image, ImageDraw
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); out = os.path.join(root, "public")
GREEN, CREAM, JACK, INK = (29, 106, 84), (236, 238, 234), (212, 141, 11), (26, 35, 32)

def draw(size, pad_frac, bg=GREEN, rounded=True):
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    if rounded: d.rounded_rectangle([0, 0, size - 1, size - 1], radius=int(size * 0.22), fill=bg)
    else: d.rectangle([0, 0, size - 1, size - 1], fill=bg)
    s = size * (1 - 2 * pad_frac); o = size * pad_frac
    # boule: a cream disc with two grooves
    cx, cy, r = o + s * 0.42, o + s * 0.56, s * 0.30
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=CREAM)
    # grooves: two gentle curves across the boule, clipped to the disc
    w = max(2, int(s * 0.035)); layer = Image.new("RGBA", (size, size), (0, 0, 0, 0)); ld = ImageDraw.Draw(layer)
    ld.arc([cx - r * 1.1, cy - r * 1.6, cx + r * 1.1, cy - r * 0.05], 25, 155, fill=GREEN, width=w)   # upper groove, bowing down
    ld.arc([cx - r * 1.1, cy + r * 0.05, cx + r * 1.1, cy + r * 1.6], 205, 335, fill=GREEN, width=w)  # lower groove, bowing up
    mask = Image.new("L", (size, size), 0); ImageDraw.Draw(mask).ellipse([cx - r + w, cy - r + w, cx + r - w, cy + r - w], fill=255)
    im.paste(layer, (0, 0), Image.composite(layer.split()[3], Image.new("L", (size, size), 0), mask))
    # jack
    jx, jy, jr = o + s * 0.80, o + s * 0.26, s * 0.11
    d.ellipse([jx - jr, jy - jr, jx + jr, jy + jr], fill=JACK)
    return im

for name, size, pad in [("icon-192.png", 192, 0.08), ("icon-512.png", 512, 0.08), ("apple-touch-icon.png", 180, 0.08), ("favicon-32.png", 32, 0.04)]:
    draw(size, pad).convert("RGBA").save(os.path.join(out, name))
draw(512, 0.2, rounded=False).save(os.path.join(out, "maskable-512.png"))  # maskable: full-bleed background, art inside the safe zone
print("icons written")
