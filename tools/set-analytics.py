#!/usr/bin/env python3
"""GA4 と Search Console の設定を全ページに入れる。

    python3 tools/set-analytics.py --ga G-XXXXXXXXXX
    python3 tools/set-analytics.py --sc <確認コード>
    python3 tools/set-analytics.py --ga G-XXXXXXXXXX --sc <確認コード>
    python3 tools/set-analytics.py --off          # どちらも外す

何度実行しても重複しない。値を変えたいときは同じコマンドを打ち直す。
GA は </head> の直前に置く（本文の表示を待たせないため defer 相当の async 読み込み）。
"""
import argparse, pathlib, re

root = pathlib.Path(__file__).resolve().parent.parent
ap = argparse.ArgumentParser()
ap.add_argument("--ga"); ap.add_argument("--sc"); ap.add_argument("--off", action="store_true")
a = ap.parse_args()
if not (a.ga or a.sc or a.off):
    raise SystemExit(__doc__)

GA_START, GA_END = "<!-- GA4 start -->", "<!-- GA4 end -->"
SC_RE = re.compile(r'\s*<meta name="google-site-verification"[^>]*>')
GA_RE = re.compile(re.escape(GA_START) + r".*?" + re.escape(GA_END) + r"\n?", re.S)

def ga_block(mid):
    return f"""{GA_START}
<script async src="https://www.googletagmanager.com/gtag/js?id={mid}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){{dataLayer.push(arguments);}}
  gtag('js', new Date());
  gtag('config', '{mid}');
</script>
{GA_END}"""

for f in sorted(root.glob("*.html")):
    s = f.read_text(encoding="utf-8")
    s = GA_RE.sub("", s)
    s = SC_RE.sub("", s)
    if not a.off:
        if a.sc:
            anchor = '<meta name="viewport"'
            i = s.index(anchor)
            s = s[:i] + f'<meta name="google-site-verification" content="{a.sc}" />\n' + s[i:]
        if a.ga:
            s = s.replace("</head>", ga_block(a.ga) + "\n</head>", 1)
    f.write_text(s, encoding="utf-8")

did = "外しました" if a.off else "入れました"
print(f"{len(list(root.glob('*.html')))}ページに {did}"
      + (f"  GA4={a.ga}" if a.ga else "") + (f"  SC=設定" if a.sc else ""))
