#!/usr/bin/env python3
"""CSS/JS の参照に内容ハッシュを付ける。

GitHub Pages は max-age=600 で配信するため、修正しても10分間は
古いファイルが使われる。スマホだと強制再読み込みも面倒なので、
中身が変わったらURLも変わるようにしておく。

    python3 tools/stamp-assets.py
"""
import hashlib, re, pathlib

root = pathlib.Path(__file__).resolve().parent.parent
targets = ["assets/css/style.css", "assets/js/main.js"]
ver = {t: hashlib.md5((root / t).read_bytes()).hexdigest()[:8] for t in targets}

for html in sorted(root.glob("*.html")):
    s = orig = html.read_text(encoding="utf-8")
    for t, v in ver.items():
        s = re.sub(rf'({re.escape(t)})(\?v=[0-9a-f]+)?"', rf'\1?v={v}"', s)
    if s != orig:
        html.write_text(s, encoding="utf-8")
        print(f"更新 {html.name}")
for t, v in ver.items():
    print(f"  {t} → ?v={v}")
