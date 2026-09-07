#!/usr/bin/env python3
"""選手写真を切り抜いて assets/img/member/ に入れる。

    ~/Projects/fcv-cutout-venv/bin/python tools/cutout.py <写真> <ファイル名>
    例) ... tools/cutout.py ~/Downloads/S__8888520.jpg nakachi-yuto

試合写真のように背景が入り組んでいると、色で切る方法（塗りつぶし・GrabCut）は
髪や暗い袖が落ちる。人物用の学習済みモデルに任せるのが確実。
写真に相手選手が写り込んでいても、いちばん大きいかたまりだけ残す。
"""
import sys, os
from PIL import Image, ImageFilter
import numpy as np
from scipy import ndimage
from rembg import remove, new_session

if len(sys.argv) != 3:
    sys.exit(__doc__)
src, name = sys.argv[1], sys.argv[2]
dst = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                   "assets/img/member", f"{name}.webp")

im  = Image.open(src).convert("RGB")
cut = remove(im, session=new_session("u2net_human_seg"), post_process_mask=True)

a = np.asarray(cut).copy()
m = a[..., 3] > 40
lab, n = ndimage.label(m)
if n == 0:
    sys.exit("人物が見つかりませんでした")
sizes = ndimage.sum(m, lab, range(1, n + 1))
sel = lab == int(np.argmax(sizes)) + 1          # いちばん大きい人＝本人
if n > 1:
    print(f"人が {n} 人。いちばん大きいかたまりだけ残します")
a[..., 3] = np.where(sel, a[..., 3], 0)

ys, xs = np.where(sel)
out = Image.fromarray(a, "RGBA").crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
al = ndimage.grey_erosion(np.asarray(out)[..., 3], size=(2, 2))
al = np.asarray(Image.fromarray(al).filter(ImageFilter.GaussianBlur(0.6)))
b = np.asarray(out).copy(); b[..., 3] = al
out = Image.fromarray(b, "RGBA")
out.save(dst, quality=92, method=6)

r = out.width / out.height
print(f"{dst}  {out.size}  縦横比 {r:.3f} "
      f"→ {'全身（足元が接地）' if r <= 0.62 else '胸から上（下端をぼかして表示）'}")
print(f"{os.path.getsize(dst):,} bytes")
