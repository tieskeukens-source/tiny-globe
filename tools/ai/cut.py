# Make the white page behind a ChatGPT drawing transparent, keeping white INSIDE the character
# (tank top, teeth, apron, trainers). Flood-fills near-white from the border, then softens the edge.
# usage: python3 tools/ai/cut.py assets/ai/lou_wide.png [more.png ...]
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

for path in sys.argv[1:]:
    im = Image.open(path).convert('RGB')
    a = np.array(im).astype(int)
    near_white = (a.min(2) > 228) & (a.max(2) - a.min(2) < 26)
    lab, n = ndimage.label(near_white)
    edge = set(lab[0, :]) | set(lab[-1, :]) | set(lab[:, 0]) | set(lab[:, -1])
    edge.discard(0)
    page = np.isin(lab, list(edge))
    page = ndimage.binary_dilation(page, iterations=1)      # eat the pale halo around the ink
    alpha = Image.fromarray(((~page) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6))
    out = Image.fromarray(np.dstack([a.astype(np.uint8), np.array(alpha)]), 'RGBA')
    out.save(path)
    print(path, 'cut out ->', round(100 * page.mean()), '% transparent')
