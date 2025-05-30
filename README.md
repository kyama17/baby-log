# ベビーログアプリ

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/next-starter-template)

このアプリケーションは、赤ちゃんのトイレ活動（おしっことうんち）を追跡するためのNext.jsアプリケーションです。Cloudflare Workers上で静的サイトとしてデプロイされています。

## 特徴

- 赤ちゃんのおしっことうんちを記録
- 記録されたログを表示
- 日本語対応のユーザーインターフェース
- **ユーザー認証**: Supabaseを利用したメールアドレスとパスワードによるサインアップ・サインイン機能。ユーザーはアカウントを作成して、自分の赤ちゃんの活動記録を管理できます。

## Getting Started

まず、以下のコマンドを実行して必要なパッケージをインストールします：

```bash
npm install
# または
yarn install
# または
pnpm install
# または
bun install
```

### 環境設定 (Environment Setup)

Supabaseとの連携のため、プロジェクトのルートにある `.env.example` ファイルを参考に `.env.local` ファイルを作成し、必要なSupabaseの環境変数（`NEXT_PUBLIC_SUPABASE_URL` および `NEXT_PUBLIC_SUPABASE_ANON_KEY`）を設定してください。

次に、開発サーバーを起動します：

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) にアクセスすると、アプリケーションが表示されます。

`app/page.tsx` ファイルを編集すると、ページが自動的に更新されます。

## デプロイ

プロダクションにデプロイするには、以下のコマンドを実行します：

| コマンド                           | アクション                                       |
| :--------------------------------- | :----------------------------------------------- |
| `npm run build`                   | プロダクションサイトをビルド                   |
| `npm run preview`                 | ローカルでビルドをプレビュー                   |
| `npm run build && npm run deploy` | プロダクションサイトをCloudflareにデプロイ |

## ファイル構成

- `src/app/page.tsx`: メインのベビーログページ
- `src/app/api/baby-log/route.ts`: ベビーログのAPIエンドポイント
- `src/app/layout.tsx`: アプリケーションのレイアウト

## 学ぶためのリソース

- [Next.js ドキュメント](https://nextjs.org/docs) - Next.jsの機能とAPIについて学ぶ
- [Learn Next.js](https://nextjs.org/learn) - インタラクティブなNext.jsチュートリアル

## ライセンス

このプロジェクトはMITライセンスの下で提供されています。
