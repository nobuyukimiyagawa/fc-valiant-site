#!/usr/bin/env python3
"""公開URLを各ページに反映し、robots.txt と sitemap.xml を作り直す。

    python3 tools/set-site-url.py https://fcvaliant.vercel.app

ドメインを取ったら、同じコマンドを新しいURLで打ち直すだけでよい。
og:image は相対パスだとSNSに出ないので、必ず絶対URLにする。
"""
import re, sys, pathlib, datetime

root = pathlib.Path(__file__).resolve().parent.parent
base = (sys.argv[1] if len(sys.argv) > 1 else "").rstrip("/")
if not base.startswith("http"):
    sys.exit(__doc__)

pages = sorted(p.name for p in root.glob("*.html"))
today = datetime.date.today().isoformat()

def url_of(name):
    return f"{base}/" if name == "index.html" else f"{base}/{name}"

def upsert(html, pattern, line, after):
    """あれば置き換え、無ければ after の直後に入れる"""
    if re.search(pattern, html):
        return re.sub(pattern, line.replace("\\", "\\\\"), html, count=1)
    i = html.index(after) + len(after)
    return html[:i] + "\n" + line + html[i:]

for name in pages:
    f = root / name
    s = f.read_text(encoding="utf-8")
    u = url_of(name)
    img = f"{base}/assets/img/ogp.jpg"

    s = re.sub(r'<meta property="og:image" content="[^"]*"\s*/?>',
               f'<meta property="og:image" content="{img}" />', s, count=1)
    anchor = re.search(r'<meta property="og:type"[^>]*>', s).group(0)
    s = upsert(s, r'<link rel="canonical"[^>]*>',
               f'<link rel="canonical" href="{u}" />', anchor)
    s = upsert(s, r'<meta property="og:url"[^>]*>',
               f'<meta property="og:url" content="{u}" />', anchor)
    s = upsert(s, r'<meta property="og:site_name"[^>]*>',
               '<meta property="og:site_name" content="FC VALIANT" />', anchor)
    s = upsert(s, r'<meta property="og:locale"[^>]*>',
               '<meta property="og:locale" content="ja_JP" />', anchor)
    s = upsert(s, r'<meta name="twitter:card"[^>]*>',
               '<meta name="twitter:card" content="summary_large_image" />', anchor)
    f.write_text(s, encoding="utf-8")

(root / "robots.txt").write_text(
    f"User-agent: *\nAllow: /\n\nSitemap: {base}/sitemap.xml\n", encoding="utf-8")

items = "\n".join(
    f'  <url><loc>{url_of(n)}</loc><lastmod>{today}</lastmod></url>' for n in pages)
(root / "sitemap.xml").write_text(
    '<?xml version="1.0" encoding="UTF-8"?>\n'
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    f"{items}\n</urlset>\n", encoding="utf-8")

print(f"公開URL: {base}")
for n in pages:
    print(f"  {n:14s} → {url_of(n)}")
print(f"  robots.txt / sitemap.xml を更新")
