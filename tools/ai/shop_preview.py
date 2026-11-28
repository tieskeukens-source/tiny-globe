# Quick PIL preview of the episode-2 shop stage, so placement can be judged without a Remotion render.
# usage: python3 tools/ai/shop_preview.py [out.png]
import sys
from PIL import Image, ImageDraw

W, H = 1080, 1920
BG = {'x': -228, 'y': -230, 'w': 1536, 'h': 2304}          # bg_shop.png at 1.5x
# pose placement: feet x/y on the 1080x1920 frame, scale  (feet = where pose y=1530 lands)
P = {
    'lou_wide':  {'x': 272, 'y': 1812, 's': 0.60},
    'lou_sweat': {'x': 272, 'y': 1812, 's': 0.60},
    'fast_menu': {'x': 838, 'y': 1816, 's': 0.60},
    'dre_cross': {'x': 556, 'y': 1790, 's': 0.57},
    'boss_talk': {'x': 596, 'y': 975, 's': 0.45, 'anchor': 1330},   # anchor = pose y that lands on y
    'boss_cross': {'x': 596, 'y': 975, 's': 0.45, 'anchor': 1270},
}


def place(canvas, name, p, img=None):
    im = img or Image.open(f'public/ai/{name}_X.png').convert('RGBA')
    s = p['s']
    w, h = int(im.width * s), int(im.height * s)
    im = im.resize((w, h), Image.LANCZOS)
    anchor = p.get('anchor', 1530)
    canvas.alpha_composite(im, (int(p['x'] - w / 2), int(p['y'] - anchor * s)))


def build(out='/tmp/shop_preview.png', guides=True):
    c = Image.new('RGBA', (W, H), (20, 16, 30, 255))
    bg = Image.open('public/ai/bg_shop.png').convert('RGBA').resize((BG['w'], BG['h']), Image.LANCZOS)
    c.alpha_composite(bg, (BG['x'], BG['y']))
    place(c, 'boss_talk', P['boss_talk'])
    fg = Image.open('public/ai/shop_counter.png').convert('RGBA').resize((BG['w'], BG['h']), Image.LANCZOS)
    c.alpha_composite(fg, (BG['x'], BG['y']))
    for n in ('dre_cross', 'lou_wide', 'fast_menu'):
        place(c, n, P[n])
    if guides:
        d = ImageDraw.Draw(c)
        for y in range(0, H, 100):
            d.line([(0, y), (W, y)], fill=(255, 0, 180, 120)); d.text((4, y + 2), str(y), fill=(255, 80, 200))
        for x in range(0, W, 100):
            d.line([(x, 0), (x, H)], fill=(0, 200, 255, 120)); d.text((x + 3, 4), str(x), fill=(0, 160, 255))
    c.convert('RGB').save(out)
    print('wrote', out)


if __name__ == '__main__':
    build(sys.argv[1] if len(sys.argv) > 1 else '/tmp/shop_preview.png', guides='--clean' not in sys.argv)
