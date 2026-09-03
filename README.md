# FC VALIANT 公式サイト（改修版）

熊本県社会人サッカーチーム **FC VALIANT** のホームページ。
参考サイト（fukuoka-city24.com）のエディトリアル様式を、
FC VALIANT のブランドカラー（ネイビー × ゴールド）に落とし込んで制作。

## 配色ルール

**黒は使わない。暗部はすべて紺で作る。** グレーも無彩色を避け、青寄りに振ってある。
色を足すときは `assets/css/style.css` の `:root` にあるトークンから選ぶこと。

| トークン | 用途 |
|---|---|
| `--navy-deep` | 最暗部。マニフェスト／スケジュール／ビジョン／コンタクト等の背景 |
| `--navy` | 基調。実績バー／スポンサー／フッター／サブヒーロー等の背景 |
| `--navy-2` | 紺のグラデーション明部 |
| `--ink` | 紙面（`--paper`）上の本文色。純黒ではなく紺寄り |
| `--navy-deep-rgb` / `--navy-rgb` | 上記の RGB。半透明の `rgba()` 用。**必ず本体トークンと揃える** |
| `--gold` / `--gold-deep` | `#e6c15c` / `#caa544` アクセント（明るさ調整の対象外） |
| `--paper` / `--paper-2` | `#f4f2ec` / `#ffffff` 明部の背景 |
| `--grey` / `--grey-ink` | `#9aa4b8` / `#5a6478` 補助文字（暗部用／紙面用）。どちらも青寄り |

### 紺の明るさ 5段階

紺の濃さは 0〜4 のレベルで管理する。**手で色を書き換えず、必ずスクリプトを使うこと**
（`rgba()` 用の RGB トークンも同時に更新する必要があるため）。

```bash
python3 tools/set-navy.py        # 一覧と現在のレベルを表示
python3 tools/set-navy.py 3      # レベル3を適用
```

| Lv | 印象 | `--navy-deep` | `--navy` |
|---|---|---|---|
| 0 | 最暗。黒に近い紺 | `#060f24` | `#0a162f` |
| 1 | やや明るい | `#0a1730` | `#0f2143` |
| 2 | 明るい | `#0d1c3a` | `#142a52` |
| 3 | さらに明るい | `#112445` | `#1a3563` |
| 4 | かなり明るい。ロイヤルブルー寄り（**現在**） | `#162c52` | `#204074` |

5段階すべて WCAG AA 以上（最小 5.32:1）を満たすので、どれを選んでも可読性の問題はない。

### 色決め用プレビュー

URL に `?navy=0`〜`?navy=4` を付けると、その場でレベルを差し替えて表示できる。
左下にレベル番号のバッジが出る。パラメータが無いときは何も起こらない。

```
https://nobuyukimiyagawa.github.io/fc-valiant-site/?navy=3
```

実装は `assets/js/main.js` の先頭 `navyPreview()`。
レベルが確定したら `tools/set-navy.py` で本適用し、この関数は削除してよい。

ヒーロー写真は元画像が灰色寄りのため、`.hero__media::after` で紺のカラーティント
（`mix-blend-mode:color` / `opacity:.45`）を重ねて紺に寄せている。
濃くするとエンブレムの金が死ぬので `.45` より上げないこと。

本文・補助文字はいずれも WCAG AA 以上（最小 5.32:1）を満たしている。

## 構成

トップを短く保ち、情報量の多いブロックは専用ページへ分離した**ハイブリッド構成**（トップ=感情で惹く／詳細=各ページで深掘り）。

```
fc-valiant-site/
├── index.html            # トップ（Hero / ABOUT / TEAM / ACTIVITY / 3ティザー / CONTACT）
├── schedule.html         # 年間試合スケジュール（全日程・成績）
├── recruit.html          # メンバー募集要項（VISION・募集要項・FAQ・代表）
├── sponsor.html          # スポンサープラン（4段階）
├── assets/
│   ├── css/style.css     # スタイル（全ページ共通）
│   ├── js/main.js        # JSアクション（全ページ共通）
│   └── img/              # 画像素材
│       ├── hero.webp / team-group.webp / logo.webp / logo.png / favicon-64.png
└── README.md
```

## ページ構成
- **トップ（index.html）**: ABOUT（マニフェスト）/ TEAM / ACTIVITY / SCHEDULE・RECRUIT・SPONSOR の3ティザー / CONTACT（フォーム）
- **schedule.html**: 年間試合スケジュール（NEXT MATCH 自動判定・シーズン成績自動集計）
- **recruit.html**: VISION（大切にしていること）/ 募集要項 / 体験参加の流れ / FAQ / 代表
- **sponsor.html**: スポンサー4プラン（PLATINUM / GOLD / SILVER / PERSONAL）

ナビ・フッターは全ページ共通。トップ内アンカー（ABOUT/TEAM/ACTIVITY/CONTACT）と
専用ページリンク（SCHEDULE/RECRUIT/SPONSOR）が相互に行き来できます。
詳細ページのCTAは `index.html?topic=...#contact` でフォームの種別を自動選択した状態で着地します。

> **要差し替え（プレースホルダー）**: 試合日程・対戦相手・会場・スコア（schedule.html）、
> 会費・練習日時・募集ポジション・FAQ回答（recruit.html）、金額・返礼内容（sponsor.html）は仮データ。
> 各HTMLの `<!-- ▼ -->` コメント箇所を実情報に更新してください。
> トップの「NEXT MATCH」ティザーは自動同期ではないので schedule.html の直近試合に手動で合わせてください。

## 実装したJSアクション
- プリローダー
- スクロール追従ヘッダー（下スクロールで隠れ、上で出現／スクロールで背景ソリッド化）
- ヒーローのパララックス
- スクロール連動フェードイン（IntersectionObserver・スタッガー）
- 数値カウントアップ（実績ブロック）
- 現在地ナビのアクティブ表示
- 流れるティッカー／巨大FCVマーキー
- モバイルのフルスクリーンハンバーガーメニュー
- スムーズスクロール、トップへ戻るボタン
- お問い合わせフォーム（デモ動作）

## 確認方法（ローカル）
```bash
cd fc-valiant-site
python3 -m http.server 8000
# ブラウザで http://localhost:8000 を開く
```

## 公開（デプロイ）
そのまま静的ホスティングに置くだけで公開できます。
- **Netlify / Vercel / Cloudflare Pages**：このフォルダをドラッグ＆ドロップ
- **GitHub Pages**：リポジトリに push → Pages を有効化

## 差し替えメモ
- **Instagram リンク**：`index.html` 内の `https://www.instagram.com/` を公式アカウントURLに置換
- **お問い合わせフォーム**：現在はデモ（送信されません）。実送信は Formspree / Google フォーム /
  Netlify Forms などに接続してください
- **写真**：`assets/img/` の画像を差し替えれば自動で反映されます
- 文章は既存サイトの情報をもとに再構成しています。事実確認のうえ適宜調整してください
