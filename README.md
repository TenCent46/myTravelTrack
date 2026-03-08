# 旅費トラッカー — 畑中健司 2026

2026年 春〜夏 欧州・シアトル留学の財務トラッカー。
スマホから出費を記録 → ダッシュボードで予算対比をリアルタイム確認。

## セットアップ

### 1. Neon DB を準備

1. [Neon Console](https://console.neon.tech) でプロジェクト作成
2. Connection string をコピー

### 2. 環境変数を設定

```bash
cp .env.example .env
# .env を開いて DATABASE_URL を貼り付け
```

### 3. 依存関係インストール + DB 初期化

```bash
npm install
npm run db:init   # スキーマ + 予算マスタを投入
```

### 4. 開発サーバー起動

```bash
npm run dev
# → http://localhost:3000
```

### 5. Vercel にデプロイ（推奨）

```bash
npx vercel
# → 環境変数 DATABASE_URL を Vercel のダッシュボードで設定
```

## 機能

| 機能 | 説明 |
|------|------|
| 📊 ダッシュボード | 予算 vs 実績をリアルタイム表示 |
| 💰 出費入力 | 現地通貨で入力 → 即座にJPY換算 |
| 🔄 為替レート | USD/EUR/GBP/HKD/CNY に対応、手動で更新可能 |
| 📍 フェーズ別追跡 | A(欧州旅行)/B(シアトル)/C(帰国) |
| 📱 モバイル対応 | スマホからサクッと記録 |

## 技術スタック

- **Next.js 14** (App Router)
- **Neon PostgreSQL** (Serverless)
- **Tailwind CSS** (Mobile-first)
- **TypeScript**
# myTravelTrack
