#!/usr/bin/env python3
"""現行トークンから主要テキストの実効コントラスト表を出す。外部依存なし。

    python3 tools/check-contrast.py

写真上の文字は不透明な下地を使用。黒〜白画素の全範囲で下地色に一致する。
MEMBERの承認済みポスターは背景ノイズと帯の縞を含めて評価する。
ブラウザのレイアウト・写真との位置関係やAA全体の監査を代替しない。
"""
from pathlib import Path
import re

CSS = (Path(__file__).resolve().parent.parent / 'assets/css/style.css').read_text()
TOKENS = dict(re.findall(r'--([\w-]+):\s*(#[\da-fA-F]{6})', CSS.split('/* ---------- Base')[0]))

def rgb(value):
    value = TOKENS.get(value, value)
    return tuple(int(value[i:i + 2], 16) / 255 for i in (1, 3, 5))

def composite(fg, bg, alpha):
    return tuple(alpha * f + (1 - alpha) * b for f, b in zip(fg, bg))

def luminance(color):
    def linear(c):
        return c / 12.92 if c <= .04045 else ((c + .055) / 1.055) ** 2.4
    return sum(w * linear(c) for w, c in zip((.2126, .7152, .0722), color))

def contrast(fg, bg):
    a, b = sorted((luminance(fg), luminance(bg)))
    return (b + .05) / (a + .05)

def hex_color(color):
    return '#' + ''.join(f'{round(c * 255):02x}' for c in color)

def white_overlay(base, alpha):
    # mix-blend-mode:overlay の白画素。その後 source-over の透明度を適用。
    blended = tuple(2 * c if c <= .5 else 1 for c in base)
    return composite(blended, base, alpha)

ROWS = []
def row(name, foreground, background, note='', opacity=1, grain=0, both=False):
    fg, bg = rgb(foreground), rgb(background)
    candidates=[]
    # feTurbulence の alpha を0〜上限まで評価。文字がノイズより前面なら背景のみ。
    for i in range(1001 if grain else 1):
        alpha = grain * i / 1000
        paper = white_overlay(bg, alpha)
        ink = composite(fg, bg, opacity)
        if both:
            ink = white_overlay(ink, alpha)
        candidates.append((contrast(ink, paper), ink, paper))
    ratio, ink, paper = min(candidates, key=lambda x: x[0])
    ROWS.append((name, hex_color(ink), hex_color(paper), ratio, note))

row('紙面の本文・見出し', 'ink', 'paper')
row('紙面の金文字・リンク', 'gold-ink', 'paper')
row('紙面の補助文字・過去試合', 'grey-ink', 'paper')
row('白い箱の本文・DMテンプレート', 'ink', 'paper-2')
row('白い箱のプラン名', 'gold-ink', 'paper-2')
row('白い箱の注記・単位', 'grey-ink', 'paper-2')
row('ヘッダー・フッター・次戦の本文', 'paper', 'navy-deep')
row('暗部の金見出し', 'gold', 'navy-deep')
row('暗部の補助文字', 'grey', 'navy-deep')
row('次戦帯・3D欄の本文', 'paper', 'navy')
row('次戦帯・3D欄の補助文字', 'grey', 'navy')
row('写真上の署名・金ボタン', 'navy-deep', 'gold', '下地α=1。写真の黒〜白全画素で同値')
row('写真に隣接する日本語見出し', 'paper', 'navy-deep', '紺の下地α=1。写真の黒〜白全画素で同値')
row('グレイン上の入団案内', 'paper', 'navy', '白ノイズ上限 .12×.55、背景だけに合成', grain=.12*.55)
row('グレイン上の入団案内・補助', 'grey', 'navy', '同上。最も明るいノイズ位置', grain=.12*.55)
row('グレイン上の紙面見出し', 'ink', 'paper', '最悪値はノイズ無し', grain=.12*.55)
row('MEMBER 名鑑の名前', 'navy-deep', 'gold', '白ノイズ上限 .22×.55、文字・背景双方に合成', grain=.22*.55, both=True)
# 帯の8%の紺の縞 + 全面ノイズ。文字は縞より前、ノイズより後ろ。
stripe = composite(rgb('navy-deep'), rgb('gold'), .08)
TOKENS['member-stripe'] = hex_color(stripe)
row('MEMBER 名鑑の名前（縞の上）', 'navy-deep', 'member-stripe', '紺8%の縞＋白ノイズ .22×.55', grain=.22*.55, both=True)
row('MEMBER 名鑑のかな', '#d6dced', 'navy-deep', '白ノイズ上限 .22×.55、双方に合成', grain=.22*.55, both=True)
row('MEMBER 名鑑のBORN', 'gold', 'navy-deep', '同上', grain=.22*.55, both=True)
row('MEMBER ポスターのかな', '#d6dced', 'navy-2', '写真と重ならない紺背景の明端。ノイズ .26×.55', grain=.26*.55)
row('MEMBER ポスターのBORN', 'gold', 'navy-2', '同上', grain=.26*.55)
row('MEMBER 選択中フィルター人数（現行）', 'navy-deep', 'gold', '既存 opacity:.65。ポスター変更禁止の範囲について確認中', opacity=.65)

print('| テキスト・状態 | 実効文字色 | 実効背景色 | 比率 | 条件・判定 |')
print('|---|---|---|---:|---|')
for name, ink, paper, ratio, note in ROWS:
    status = 'AA' if ratio >= 4.5 else '未達'
    print(f'| {name} | `{ink}` | `{paper}` | {ratio:.2f}:1 | {status}。{note} |')
