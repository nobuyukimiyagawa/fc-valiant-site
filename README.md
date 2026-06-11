# FC VALIANT 公式サイト（改修版）

熊本県社会人サッカーチーム **FC VALIANT** のホームページ。
参考サイト（fukuoka-city24.com）のモノクロ・エディトリアル様式を、
FC VALIANT のブランドカラー（ネイビー × ゴールド）に落とし込んで制作。

## 構成

```
fc-valiant-site/
├── index.html            # 本体（1ページ構成）
├── assets/
│   ├── css/style.css     # スタイル
│   ├── js/main.js        # JSアクション
│   └── img/              # 画像素材（既存サイトから取得）
│       ├── hero.webp         # ヒーロー（夜・ボール・シールド）
│       ├── team-group.webp   # チーム集合写真
│       ├── logo.webp / logo.png
│       └── favicon-64.png
└── README.md
```

## セクション
ABOUT（マニフェスト）/ TEAM / 活動内容 / VISION（大切にしていること）/
SPONSOR（料金プラン4段階）/ STAFF（代表）/ CONTACT（フォーム）

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
