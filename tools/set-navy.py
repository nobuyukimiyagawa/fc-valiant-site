#!/usr/bin/env python3
"""紺の明るさを5段階で切り替える。

  python3 tools/set-navy.py 2      # レベル2を適用
  python3 tools/set-navy.py        # 一覧と現在値を表示

--navy-deep / --navy / --navy-2 / --ink とその RGB トークンを一括で書き換える。
ゴールド(--gold)と紙面(--paper)は変更しない。
"""
import re,sys,pathlib

# level: (navy-deep, navy, navy-2, ink, 説明)   ink = 紙面上の本文色
LEVELS={
 0:("#060f24","#0a162f","#0e1d3f","#101c33","最暗。黒に近い紺"),
 1:("#0a1730","#0f2143","#152b55","#13223d","やや明るい"),
 2:("#0d1c3a","#142a52","#1b3766","#16294a","明るい（既定）"),
 3:("#112445","#1a3563","#23447a","#1b3158","さらに明るい"),
 4:("#162c52","#204074","#2b5190","#203a68","かなり明るい。ロイヤルブルー寄り"),
}
CSS=pathlib.Path(__file__).resolve().parent.parent/"assets/css/style.css"

def rgb(h): return ",".join(str(int(h[i:i+2],16)) for i in (1,3,5))

def current():
    s=CSS.read_text(encoding="utf-8")
    got={n:re.search(rf"--{n}:(#[0-9a-fA-F]{{6}})",s).group(1) for n in ("navy-deep","navy","navy-2","ink")}
    for lv,(d,n,n2,i,_) in LEVELS.items():
        if [d,n,n2,i]==[got["navy-deep"],got["navy"],got["navy-2"],got["ink"]]: return lv,got
    return None,got

if len(sys.argv)<2:
    cur,got=current()
    print("紺の明るさレベル:")
    for lv,(d,n,n2,i,desc) in LEVELS.items():
        print(f"  {lv}{' ←現在' if lv==cur else '     '}  {desc:<22} deep={d} navy={n}")
    if cur is None: print(f"\n現在値はどのレベルにも一致しません: {got}")
    sys.exit(0)

lv=int(sys.argv[1])
if lv not in LEVELS: sys.exit(f"レベルは 0〜4 です（指定: {lv}）")
deep,navy,navy2,ink,desc=LEVELS[lv]
s=CSS.read_text(encoding="utf-8")
for name,val in (("navy-deep",deep),("navy",navy),("navy-2",navy2),("ink",ink)):
    s,n=re.subn(rf"(--{name}:)#[0-9a-fA-F]{{6}}", rf"\g<1>{val}", s, count=1)
    assert n==1, f"--{name} が見つからない"
for name,val in (("navy-deep-rgb",rgb(deep)),("navy-rgb",rgb(navy))):
    s,n=re.subn(rf"(--{name}:)[\d, ]+;", rf"\g<1>{val};", s, count=1)
    assert n==1, f"--{name} が見つからない"
CSS.write_text(s,encoding="utf-8")
print(f"レベル{lv}（{desc}）を適用")
print(f"  --navy-deep {deep} / --navy {navy} / --navy-2 {navy2} / --ink {ink}")
