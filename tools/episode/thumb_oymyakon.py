from PIL import Image, ImageDraw, ImageFont, ImageFilter
import random
im = Image.open('c130.jpg').convert('RGB'); W, H = im.size
z = 1.45; cw, ch = int(W / z), int(H / z); cx, cy = 560, 1134
box = (cx - cw // 2, cy - ch // 2, cx + cw // 2, cy + ch // 2)
im = im.crop(box).resize((W, H), Image.LANCZOS)
# dark gradient at the bottom for the text
grad = Image.new('L', (1, H)); [grad.putpixel((0, y), int(max(0, (y - H * 0.52) / (H * 0.48)) ** 1.3 * 175)) for y in range(H)]
im = Image.composite(Image.new('RGB', (W, H), (16, 24, 52)), im, grad.resize((W, H)))
d = ImageDraw.Draw(im)
# snow flakes
random.seed(4)
for i in range(90):
    x, y, r = random.randint(0, W), random.randint(0, H), random.choice([3, 5, 7, 10])
    d.ellipse((x - r, y - r, x + r, y + r), fill=(255, 255, 255))
F = lambda s: ImageFont.truetype('/home/claude/lilita.ttf', s)
INK = (27, 27, 31)
def txt(t, y, size, col, stroke=16):
    f = F(size); w = d.textlength(t, font=f)
    while w > W - 70: size -= 6; f = F(size); w = d.textlength(t, font=f)
    x = (W - w) / 2
    d.text((x, y + 12), t, font=f, fill=INK, stroke_width=stroke, stroke_fill=INK)
    d.text((x, y), t, font=f, fill=col, stroke_width=stroke, stroke_fill=INK)
txt("SCHOOL AT", 1170, 170, (255, 255, 255))
txt('−50 °C!', 1335, 230, (120, 200, 255), 18)
txt('(the coldest village on Earth)', 1610, 66, (255, 255, 255), 8)
# Russian flag chip, top right
fx, fy, fw = 230, 200, 200; fh = fw * 2 // 3
d.rounded_rectangle((fx - 10, fy - 10, fx + fw + 10, fy + fh + 10), 22, fill=INK)
for k, c in enumerate([(255, 255, 255), (0, 57, 166), (213, 43, 30)]): d.rectangle((fx, fy + k * fh // 3, fx + fw, fy + (k + 1) * fh // 3), fill=c)
# thermometer chip, top left
tx, ty = 90, 160
d.rounded_rectangle((tx, ty, tx + 64, ty + 230), 32, fill=(238, 243, 248), outline=INK, width=10)
d.ellipse((tx - 22, ty + 190, tx + 86, ty + 298), fill=(47, 134, 232), outline=INK, width=10)
d.rectangle((tx + 20, ty + 90, tx + 44, ty + 205), fill=(47, 134, 232))
im.save('oymyakon_thumbnail.jpg', quality=92); print(im.size)
