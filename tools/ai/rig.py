# Build lip-sync frames from ChatGPT art: for each pose, paste each mouth from the 3x3 head sheet onto the pose's face
# (scaled, rotated, mirrored if needed, colour-matched and clipped to the face), plus a blink overlay per pose.
# usage: python3 tools/ai/rig.py   (reads assets/ai, writes public/ai)
import json, numpy as np
from PIL import Image, ImageFilter, ImageDraw
from scipy import ndimage
A = 'assets/ai'; O = 'public/ai'
VIS = {'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5, 'G': 6, 'H': 7}
# mouth sheets: column starts, row starts, cell size, closed-mouth centre/width/angle inside a cell
SHEETS = {
  'fast': ([85, 477, 868], [21, 439, 858], (296, 382), (126, 258), 187.0, 0.0),
  'dre': ([117, 491, 870], [13, 426, 842], (292, 392), (173, 253), 154.0, -7.0),
  'lou': ([67, 452, 838], [4, 425, 843], (356, 406), (161, 283), 134.0, -2.6),
}
# poses: character, mouth centre, mouth width, angle (deg), mirror the mouths
POSES = {
  'fast_hype': ('fast', (487, 338), 240, -11.8, True), 'fast_talk': ('fast', (517, 309), 200, 8.6, False), 'fast_point': ('fast', (461, 370), 225, -8.5, False),
  'dre_sit': ('dre', (544, 377), 211, -9.8, False), 'dre_cross': ('dre', (544, 294), 175, -11.8, False), 'dre_ask': ('dre', (524, 312), 212, -3.0, False),
  'lou_lean': ('lou', (426, 397), 161, -7.8, False), 'lou_phone': ('lou', (458, 450), 202, -4.8, False), 'lou_smell': ('lou', (510, 458), 151, 7.5, False),
}
CELLS = {}
for who, (cs, rs, (cw, ch), *_r) in SHEETS.items():
    sh = Image.open(f'{A}/{who}_mouths.png').convert('RGBA')
    CELLS[who] = [sh.crop((c, r, c + cw, r + ch)) for r in rs for c in cs]

def skin_median(img, box):
    a = np.array(img.crop(box).convert('RGBA')).reshape(-1, 4).astype(float)
    a = a[(a[:, 3] > 200) & (a[:, :3].sum(1) > 120) & (a[:, :3].sum(1) < 420) & (a[:, 0] > a[:, 2] + 20)]
    return np.median(a[:, :3], 0)

def patch(who, k):
    c = np.array(CELLS[who][k]).astype(float)
    (cx0, cy0), H, W = SHEETS[who][3], c.shape[0], c.shape[1]
    y0, y1, x0, x1 = max(0, cy0 - 62), min(H, cy0 + 94), max(0, cx0 - 122), min(W, cx0 + 126)
    p = c[y0:y1, x0:x1].copy()
    yy, xx = np.mgrid[y0:y1, x0:x1]
    e = ((xx - cx0) / 120) ** 2 + ((yy - (cy0 + 22)) / 74) ** 2
    p[:, :, 3] = p[:, :, 3] * np.clip((1.0 - e) / 0.18, 0, 1)
    return p, (cx0 - x0, cy0 - y0)

meta = {}
for name, (who, mc, mw, ang, mirror) in POSES.items():
    pose = Image.open(f'{A}/{name}.png').convert('RGBA')
    SRC_W, src_ang = SHEETS[who][4], SHEETS[who][5]
    sheet_skin = skin_median(CELLS[who][0], (SHEETS[who][3][0] - 70, SHEETS[who][3][1] + 15, SHEETS[who][3][0] + 70, SHEETS[who][3][1] + 60))
    P = np.array(pose).astype(float)
    pskin = skin_median(pose, (mc[0] - 80, mc[1] + 15, mc[0] + 80, mc[1] + 60))
    # face mask: flood fill of non-outline pixels from above and below the mouth line, inside the head
    lum = P[:, :, :3].mean(2)
    free = (lum > 45) & (P[:, :, 3] > 200)
    lab, _ = ndimage.label(free)
    seeds = [(mc[1] - 25, mc[0]), (mc[1] + 30, mc[0]), (mc[1] - 25, mc[0] - 50), (mc[1] + 30, mc[0] + 50)]
    face = np.zeros_like(free)
    for sy, sx in seeds:
        if lab[sy, sx]: face |= lab == lab[sy, sx]
    face = ndimage.binary_dilation(face, iterations=6) & (P[:, :, 3] > 200)
    face = ndimage.binary_erosion(face, iterations=2)
    fmask = Image.fromarray((face * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.5))
    s = mw / SRC_W
    for v, k in VIS.items():
        p, (cx, cy) = patch(who, k)
        p[:, :, :3] = np.clip(p[:, :, :3] + (pskin - sheet_skin) * (p[:, :, :3].mean(2, keepdims=True) > 60), 0, 255)
        im = Image.fromarray(p.astype(np.uint8), 'RGBA')
        if mirror: im = im.transpose(Image.FLIP_LEFT_RIGHT); cx = im.width - cx
        im = im.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS); cx *= s; cy *= s
        big = Image.new('RGBA', (im.width * 3, im.height * 3), (0, 0, 0, 0)); big.paste(im, (im.width, im.height))
        big = big.rotate(-(ang - (-src_ang if mirror else src_ang)), resample=Image.BICUBIC, center=(im.width + cx, im.height + cy))
        layer = Image.new('RGBA', pose.size, (0, 0, 0, 0))
        layer.paste(big, (int(mc[0] - (im.width + cx)), int(mc[1] - (im.height + cy))), big)
        la = np.array(layer).astype(float); la[:, :, 3] *= np.array(fmask).astype(float) / 255
        out = pose.copy(); out.alpha_composite(Image.fromarray(la.astype(np.uint8)))
        out.save(f'{O}/{name}_{v}.png', optimize=True)
    # blink: fill the eye whites above the mouth with skin and draw a closed-lid line
    white = (P[:, :, :3].min(2) > 205) & (P[:, :, 3] > 200)
    white[mc[1] - 40:, :] = False; white[:max(0, mc[1] - 260), :] = False
    lab, n = ndimage.label(white)
    sizes = ndimage.sum(white, lab, range(1, n + 1))
    keep = [i + 1 for i in np.argsort(sizes)[::-1][:2] if sizes[i] > 400]
    bl = Image.new('RGBA', pose.size, (0, 0, 0, 0)); d = ImageDraw.Draw(bl)
    m = np.isin(lab, keep); m = ndimage.binary_dilation(m, iterations=3)
    arr = np.array(bl); arr[m] = list(pskin.astype(int)) + [255]; bl = Image.fromarray(arr); d = ImageDraw.Draw(bl)
    for i in keep:
        ys, xs = np.where(lab == i)
        y = int(np.median(ys)) + 6
        d.line([(xs.min() + 4, y - 4), ((xs.min() + xs.max()) // 2, y + 6), (xs.max() - 4, y - 4)], fill=(20, 18, 16, 255), width=9, joint='curve')
    bl.save(f'{O}/{name}_blink.png', optimize=True)
    pose.save(f'{O}/{name}_X.png', optimize=True)
    meta[name] = {'mouth': mc, 'eyes': len(keep)}
    print(name, 'skin', pskin.round(), 'eyes', len(keep), flush=True)
json.dump(meta, open(f'{O}/meta.json', 'w'))
