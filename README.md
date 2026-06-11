# FC VALIANT 公式サイト（改修版）

熊本県社会人サッカーチーム **FC VALIANT** のホームページ。
参考サイト（fukuoka-city24.com）のモノクロ・エディトリアル様式を、
FC VALIANT のブランドカラー（ネイビー × ゴールド）に落とし込んで制作。

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
