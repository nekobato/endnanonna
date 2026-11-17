# えんどなのんな

7文字の日本語から「のんのんびより」風のアニメーションGIFを生成するWebアプリケーション。

公開URL: <https://endnanonna.nekobato.app/>

Vue 3、Vite 8、VoidのPages機能を使用する。HTMLはビルド時に生成し、Cloudflare Workersで配信する。GIFの分解・文字合成・エンコードはブラウザ内のCanvasとWeb Workerで実行し、入力値や生成結果をサーバーへ送信しない。

## 開発

Node.jsのバージョンは `.node-version`、pnpmのバージョンは `package.json` の `packageManager` に指定している。

```bash
pnpm install --frozen-lockfile
pnpm dev
```

開発サーバーは `http://127.0.0.1:2525/` で起動する。

```bash
pnpm test
pnpm typecheck
pnpm build
pnpm preview
```

`pnpm generate` も同じ静的ビルドを実行する。lintとformatのスクリプトは登録していない。

## 構成

- `pages/index.vue`: 生成画面。
- `pages/layout.vue`: 共通CSSの適用。
- `components/`: 入力、進捗、生成結果の表示。
- `composables/`、`utils/`: 入力検証、フォント、Canvas、GIF処理。
- `public/`: フォント、GIF素材、`gif.worker.js`。
- `void.config.ts`: head情報、静的生成、Cloudflareの配信先。

フォント、GIF素材、Workerは同一originの `/fonts/`、`/animations/`、`/gif.worker.js` から取得する。これらのパスを変更する場合は、ブラウザでのGIF生成と保存まで確認する。

## デプロイ

配信先は `void.config.ts` のCloudflareアカウントとWorker `endnanonna`。Voidと `@void/vue` は同じバージョンに固定する。

Cloudflareへログイン済みの環境で実行する。

```bash
pnpm deploy
```

未認証の場合は `pnpm exec void cloudflare login` で接続する。CIでは `CLOUDFLARE_API_TOKEN` と `CLOUDFLARE_ACCOUNT_ID` を環境変数から渡す。秘密情報を設定ファイルやGitへ保存しない。

Cloudflare Vite pluginが生成するデプロイ成果物は `.cloudflare/output/v1/` にある。静的ファイルは `.cloudflare/output/v1/workers/default/assets/` に出力される。`.void/` と `.cloudflare/` は生成物であり、Gitへ含めない。リソースIDが `void.lock.json` に生成された場合は、そのファイルをコミットする。

独自ドメインの切り替え後は、HTTPSの200応答、フォント・素材の配信、GIF生成、ダウンロードを確認する。移行設計と検証条件は [移行計画](docs/void-cloudflare-migration.md) に記載している。
