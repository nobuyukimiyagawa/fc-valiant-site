#!/usr/bin/env python3
"""背景が透過済みの選手PNGを assets/img/member/<name>.webp に入れる。

    python3 tools/place-cutout.py <透過PNG> <ファイル名>
    例) python3 tools/place-cutout.py ~/Downloads/坂本.png sakamoto-yuya

切り抜き（rembg）は行わない。透過済み画像の余白を詰め、ゴミ片を落として webp 化する。
未切り抜きの写真は tools/cutout.py を使う。
"""
import sys, os
from PIL import Image
import numpy as np
from scipy import ndimage

if len(sys.argv) != 3:
    sys.exit(__doc__)
src, name = sys.argv[1], sys.argv[2]
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
dst = os.path.join(root, "assets/img/member", f"{name}.webp")

im = Image.open(src).convert("RGBA")
a = np.asarray(im).copy()
m = a[..., 3] > 40
lab, n = ndimage.label(m)
if n == 0:
    sys.exit("透過領域しかありません（未切り抜きなら tools/cutout.py を使ってください）")
sizes = ndimage.sum(m, lab, range(1, n + 1))
sel = lab == int(np.argmax(sizes)) + 1
if n > 1:
    print(f"かたまりが {n} 個。いちばん大きいものだけ残します（落とした画素 {int(m.sum()-sel.sum()):,}）")
a[..., 3] = np.where(sel, a[..., 3], 0)
ys, xs = np.where(sel)
out = Image.fromarray(a, "RGBA").crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
out.save(dst, quality=92, method=6)
r = out.width / out.height
print(f"{dst}  {out.size}  縦横比 {r:.3f} → {'全身（足元が接地）' if r <= 0.62 else '胸から上（下端をぼかして表示）'}")
print(f"{os.path.getsize(dst):,} bytes")
