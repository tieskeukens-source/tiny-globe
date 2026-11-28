# Cut every rigged pose into head / torso / legs so they can be moved apart in the composition
# (head turns and nods, torso leans and shifts weight, hips stay planted).
# Each part is written on the full canvas with alpha, so the layers stack without any offset maths.
# Deeper layers keep an overlap above their joint, so a rotation never opens a gap.
# usage: python3 tools/ai/parts.py [pose ...]     (default: the episode-2 poses)
import json, sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

A, O = 'assets/ai', 'public/ai'
VIS = ['X', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
OVER = 40          # how far a deeper layer reaches above its joint
FEATH = 14         # softness of the cut


def solid(im):
    a = np.array(im)
    return a[:, :, 3] > 110 if a.shape[2] == 4 else a[:, :, :3].min(2) < 238


def row_width(m):
    """widest run of content per row"""
    out = np.zeros(m.shape[0], int)
    for y in range(m.shape[0]):
        xs = np.where(m[y])[0]
        if len(xs): out[y] = xs.max() - xs.min()
    return out


FIX = {'fast_hype': (430, 1010), 'boss_cross': (585, 1060)}   # arms up / crossed break the width scan


def joints(name, mouth_y):
    im = Image.open(f'{A}/{name}.png').convert('RGBA')
    m = solid(im)
    ys = np.where(m.any(1))[0]
    top, bot = int(ys.min()), int(ys.max())
    w = row_width(m)
    # neck: narrowest row between the chin (a bit under the mouth) and the shoulders
    lo, hi = int(mouth_y + 18), int(mouth_y + 0.75 * (bot - mouth_y) * 0.42 + 150)
    hi = min(hi, bot - 40)
    band = w[lo:hi]
    neck = lo + int(np.argmin(band)) if len(band) else lo
    # waist: a fixed share of the way from the neck down to the feet reads right on these builds
    waist = int(neck + 0.47 * (bot - neck))
    if name in FIX: neck, waist = FIX[name]
    return im, int(neck), int(waist), top, bot


def band_mask(h, w, y0, y1, feather=FEATH):
    """1 inside [y0,y1), fading out over `feather` rows at each open end"""
    col = np.zeros(h, np.float32)
    col[max(0, y0):max(0, y1)] = 1.0
    g = np.ones(h, np.float32)
    if y0 > 0:
        for k in range(feather):
            y = y0 + k
            if 0 <= y < h: col[y] = min(col[y], k / feather)
    if y1 < h:
        for k in range(feather):
            y = y1 - 1 - k
            if 0 <= y < h: col[y] = min(col[y], k / feather)
    return np.repeat(col[:, None], w, 1) * g[:, None].repeat(w, 1) * 0 + np.repeat(col[:, None], w, 1)


def cut(img, y0, y1):
    a = np.array(img).astype(np.float32)
    h, w = a.shape[:2]
    a[:, :, 3] *= band_mask(h, w, y0, y1)
    return Image.fromarray(a.astype(np.uint8), 'RGBA')


def run(poses, mouths):
    meta = {}
    for name in poses:
        im, neck, waist, top, bot = joints(name, mouths[name])
        # legs: from a bit above the waist down
        cut(im, waist - OVER, im.height).save(f'{O}/{name}_legs.png', optimize=True)
        # torso: neck -> below the waist (it is drawn over the legs, so it may run long)
        cut(im, neck - 2, waist + OVER + 30).save(f'{O}/{name}_torso.png', optimize=True)
        # head, one per mouth shape, plus the blink overlay
        for v in VIS:
            src = Image.open(f'{O}/{name}_{v}.png').convert('RGBA')
            cut(src, 0, neck + OVER).save(f'{O}/{name}_h{v}.png', optimize=True)
        bl = Image.open(f'{O}/{name}_blink.png').convert('RGBA')
        cut(bl, 0, neck + OVER).save(f'{O}/{name}_hblink.png', optimize=True)
        mm = solid(im)
        cx = lambda y: (lambda xs: int((xs.min() + xs.max()) / 2) if len(xs) else 512)(np.where(mm[min(max(y, 0), mm.shape[0] - 1)])[0])
        meta[name] = {'neck': neck, 'waist': waist, 'top': top, 'bottom': bot, 'neckx': cx(neck), 'waistx': cx(waist)}
        print(f'{name:11s} neck={neck:4d} waist={waist:4d} top={top:4d} bottom={bot:4d}', flush=True)
    old = {}
    try: old = json.load(open(f'{O}/parts.json'))
    except Exception: pass
    old.update(meta); json.dump(old, open(f'{O}/parts.json', 'w'), indent=1)


MOUTH = {'lou_wide': 368, 'lou_sweat': 399, 'fast_menu': 348, 'fast_talk': 309, 'fast_hype': 338,
         'dre_cross': 294, 'dre_ask': 312, 'boss_talk': 590, 'boss_cross': 518, 'lou_lean': 397}
if __name__ == '__main__':
    names = sys.argv[1:] or list(MOUTH)
    run(names, MOUTH)
