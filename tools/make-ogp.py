#!/usr/bin/env python3
"""SNSで共有されたときのカード画像（1200x630）を作る。

og:image に webp を指定すると出さないSNSがあるので jpg で書き出す。
"""
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import pathlib

root = pathlib.Path(__file__).resolve().parent.parent
W, H = 1200, 630

hero = Image.open(root / "assets/img/hero.webp").convert("RGB")
s = max(W / hero.width, H / hero.height)
hero = hero.resize((round(hero.width * s), round(hero.height * s)), Image.LANCZOS)
x = (hero.width - W) // 2
y = int((hero.height - H) * 0.35)
im = hero.crop((x, y, x + W, y + H))

# サイトのFVと同じ考えで、文字が乗る左側だけ落とす
a = np.asarray(im).astype(np.float32)
navy = np.array([13, 28, 58], np.float32)
xs = np.linspace(0, 1, W, dtype=np.float32)[None, :, None]
al = np.clip(np.interp(xs, [0, .38, .78, 1], [.90, .74, .22, .10]), 0, 1)
a = a * (1 - al) + navy * al
im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))

d = ImageDraw.Draw(im)
# サイトと同じ書体（Anton／ヒラギノ）で組む
FONTS = pathlib.Path(__file__).resolve().parent / "fonts"
big  = ImageFont.truetype(str(FONTS / "Anton-Regular.ttf"), 74)
mid  = ImageFont.truetype(str(FONTS / "Anton-Regular.ttf"), 52)
ja   = ImageFont.truetype("/System/Library/Fonts/Hiragino Sans GB.ttc", 32)
sm   = ImageFont.truetype("/System/Library/Fonts/Hiragino Sans GB.ttc", 23)

L = 76
logo = Image.open(root / "assets/img/logo.webp").convert("RGBA")
lh = 78
logo = logo.resize((round(logo.width * lh / logo.height), lh), Image.LANCZOS)
im.paste(logo, (L, 150), logo)
d.text((L + logo.width + 26, 158), "FC VALIANT", font=big, fill=(255, 255, 255))

d.text((L, 300), "まちと、仲間と。", font=ja, fill=(255, 255, 255))
d.text((L - 2, 348), "Be VALIANT.", font=mid, fill=(230, 193, 92))

d.line([(L, 450), (L, 500)], fill=(230, 193, 92), width=3)
d.text((L + 22, 452), "熊本県社会人サッカーチーム", font=sm, fill=(206, 214, 230))
d.text((L + 22, 484), "KUMAMOTO, JAPAN", font=sm, fill=(150, 161, 184))

im.save(root / "assets/img/ogp.jpg", quality=88, optimize=True)
print(f"assets/img/ogp.jpg {im.size} "
      f"{(root / 'assets/img/ogp.jpg').stat().st_size:,} bytes")
