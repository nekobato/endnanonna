# Target State / 理想状態

## Decision Summary / 決定概要

Vue 3、Vite 8、Void 1.10のPages機能で画面を生成し、静的出力をCloudflare Workersで配信する。公開URLは `https://endnanonna.nekobato.app/` を維持する。GIF生成は引き続き利用者のブラウザで実行する。

## Outcomes and Scope / 成果と対象範囲

7文字の入力、文字数検証、進捗表示、GIFの表示とダウンロード、既存の表示・配色を維持する。Nuxt固有の実行環境とVercelへの配信依存を解消する。DB、認証、生成結果のサーバー保存は対象に含めない。

## Evidence and Constraint Ledger / 根拠と制約台帳

| 項目 | 分類 | 根拠 | 設計への反映 |
| --- | --- | --- | --- |
| Vue + Voidを採用する | Hard constraint | このチャットのユーザー指定 | Nuxtの実行環境を撤去する |
| 独自ドメインを維持する | Hard constraint | ユーザー指定とVercel Domains画面の `endnanonna.nekobato.app` | 同一ホスト名をCloudflareへ接続する |
| 移行完了後にVercelプロジェクトを削除する | Hard constraint | このチャットのユーザー指定 | 切り替え後の実動作確認を削除の前提にする |
| GIF処理はCanvasとWeb Workerを利用する | Current-state fact | `utils/imageProcessor.ts`、`composables/useGifGenerator.ts` | ブラウザ内の処理と同一originの素材パスを維持する |
| Vue Pagesと静的出力に公式対応がある | Current-state fact | [Pages](https://void.cloud/guide/pages-routing/overview)、[SSG](https://void.cloud/guide/ssg) | Voidの標準アダプターと `output: "static"` を使う |
| Tailwind 3の既存スタイル | Preference | `assets/css/main.scss`、`tailwind.config.js` | 同じTailwind世代を維持して表示差分を抑える |
| CLI認証とドメイン切り替え方法 | Unknown | Cloudflare管理画面にはアクセス可能。ローカルCLIの認証は未確認 | 配信前に公式CLIと管理画面で確認する |

## Steady-State Design / 定常状態の設計

`pages/index.vue` が唯一のアプリ画面を担当し、VoidのルートレイアウトがグローバルCSSを適用する。Vue APIとコンポーネントは明示importとする。head情報はVoidの設定で管理する。フォント、ベースGIF、GIFエンコーダーのWorkerは既存の絶対パスで公開する。

ビルド時にHTMLを生成し、CloudflareがHTML、JavaScript、CSS、素材を配信する。生成したGIFと入力値はブラウザ内にのみ存在し、失敗時は既存のエラー表示へ戻る。Nuxt設定、Nuxt向け型設定、不要なNuxt用依存は最終構成に残さない。

運用はコミット済み設定とロックファイルから再ビルド・デプロイできるものとする。秘密情報はGitへ保存しない。DNS切り替えに失敗した場合、Vercel削除前なら元のCNAMEへ復旧する。Vercel削除後の復旧先はCloudflareの検証済みビルドとする。

## Invariants and Quality Bars / 不変条件と品質基準

| 条件 | 必要な動作 | 不合格の証拠 |
| --- | --- | --- |
| 公開契約 | 同一の独自ドメインとHTTPSでトップ画面が200になる | 別URLへの強制移動、証明書エラー、5xx |
| GIF生成 | 有効な7文字からアニメーションGIFを生成・保存できる | Workerエラー、破損GIF、生成未完了 |
| 入力検証 | 不正文字列では生成せず、再試行可能 | 不正入力から生成開始、状態の固定 |
| 表示 | デスクトップとモバイルで既存UIを維持する | CSS欠落、横方向のはみ出し |
| 配信素材 | フォント、GIF、Workerのパスを維持する | 404、誤ったMIME type |
| 撤去 | Nuxt依存とVercelプロジェクトが残らない | Nuxtの参照、Vercelのプロジェクト残存 |

## Candidate Comparison / 候補比較

| 候補 | 適合性 | 運用・移行上の評価 |
| --- | --- | --- |
| Clean-slate: Vue + Voidの静的生成 | 全制約を満たす | ブラウザ内GIF処理に必要十分。リクエストごとのSSRが不要 |
| Best brownfield: 既存Vueコンポーネントを使う同じ静的構成 | Clean-slateと定常構成が同一 | 既存の表示・生成仕様を再利用できる。採用する |
| Vue + Voidのリクエスト時SSR | 制約は満たす | 動的サーバーデータがなく、常時SSRの運用負担を正当化できない |
| Minimal-change: Nuxt + Void | 同一URLの移行は可能 | Nuxt依存の整理という採用方針を満たさない |

Clean-slateとbrownfieldの違いは移植方法のみであり、定常構成上の譲歩はない。選択した静的構成は他候補に支配されない。

## Concession Register / 譲歩台帳

恒久的な譲歩なし。既存コンポーネントの再利用は、利用者の操作とGIF生成仕様を維持するための選択である。

## Unknowns and Spikes / 未知事項と技術検証

| 未知事項 | 限定した検証 | 採用条件・不合格条件 | 決定への影響 |
| --- | --- | --- | --- |
| 静的ビルドの互換性 | VoidとVueアダプターを同一バージョンに固定し、型検査と本番ビルドを実施 | HTMLと素材が生成され、ブラウザAPIがビルド時に実行されないこと | 失敗時はimport境界を修正。静的構成は維持する |
| 実際のGIF生成 | 独立ブラウザで既存公開版、ローカル版、Cloudflare版を各1回比較 | GIFの生成、プレビュー、保存、フレーム構造が成立すること | 失敗時は切り替えを停止して原因を修正する |
| Cloudflareの配信接続 | 専用Workerを公開し、HTTPSと素材を検証後に独自ドメインを接続 | Cloudflare経由の200とGIF生成が成立すること | 成立前はVercelを維持する |

## Verification Map / 検証対応表

| 対象 | 検証 | 時点 |
| --- | --- | --- |
| 型・既存ロジック | 登録済みtest、typecheck、build | 実装後 |
| 表示・操作・GIF | 独立ブラウザで画面、入力、生成、保存を確認 | ローカルと公開後 |
| URL・TLS・素材 | HTTP応答、DNS、素材URLとContent-Type、管理画面 | 切り替え前後 |
| Nuxt撤去・再現性 | 最終diff、参照検索、固定ロックファイル、README手順 | 最終確認 |
| Vercel撤去 | 同一URLでの検証後に削除し、一覧からの消失を確認 | 最終段階 |

## Gate Decision / ゲート判定

PASS

全てのhard constraintにユーザー指定または実画面の根拠がある。残る未知事項は上記の限定検証で解消し、失敗時も公開契約や設計を無断で変更しない。

# Execution Plan / 実行計画

## Target-State Reference / 理想状態との対応

上記の静的Vue + Void構成を実装する。実装上の都合でSSRや別ドメインへ変更しない。

## Dependency Graph / 依存関係

現行公開版の確認 → Vue + Voidへの移植 → 静的ビルドとローカル検証 → Cloudflare公開 → 独自ドメイン切り替え → 公開後のGIF検証 → Vercel削除。

## Workstreams / 作業系統

1. Nuxtの自動設定をVue/Vite/Voidの明示設定へ移し、既存テスト・型検査・本番ビルドを通す。
2. デスクトップ・モバイル表示、入力検証、GIF生成・ダウンロードを独立ブラウザで検証する。
3. Cloudflareへデプロイし、独自ドメインを接続して同じ検証を実施する。
4. 検証済みのソース・配信設定を保存し、Vercelの対象プロジェクトを削除する。

## Migration and Retirement / 移行と撤去

Vercelとの並行配信は切り替え確認までの一時状態とする。公開URLでのGIF生成確認後に旧プロジェクトを削除する。ローカル検証サーバーは時間制限を設定し、作業完了時に終了する。

## Validation / 検証

`pnpm test`、`pnpm typecheck`、`pnpm build`。lint/formatは既存の登録がないため、不要な検証用依存を追加しない。GIFを保存し、ヘッダー、サイズ、複数フレームを確認する。

## Convergence Review / 収束確認

不変条件と検証対応表を最終状態に照合し、結果をREADMEと実行記録へ反映する。設定・運用・動作の未完了は完了扱いにしない。

## 実施結果（2026-11-17）

- 既存テスト3件、型検査、本番ビルド、`git diff --check` が成功した。Nuxtの実行依存と設定を撤去した。
- 独立したChromeで1280×720と390×844の表示を確認し、モバイル幅で横方向のはみ出しがないことを確認した。英字7文字の入力エラー後、日本語7文字で再生成できた。
- `のんのんびより` から生成・保存したGIFは、Vercel版、ローカル版、Cloudflareの検証用URL、本番独自ドメインの4環境でSHA-256が一致した。GIF89a、640×360、201フレーム、16,890 ms、4,292,184 bytes。SHA-256: `a6e917b92773afbce94bdea7225050df6a31265673bc6b6c17b35fd1174e3bf0`。
- `https://endnanonna.nekobato.app/` をCloudflare Custom Domainへ接続した。元のVercel向けCNAMEのTTLは権威DNSで300秒だった。TTL経過後、1.1.1.1と8.8.8.8でCloudflareのAレコードを確認した。
- 本番独自ドメインでHTTPS 200、`lang="ja"`、`noindex, nofollow`、Voidの生成HTMLを確認した。GIF Worker、ベースGIF、フォント、robots.txtは配信元ファイルのSHA-256とContent-Typeが一致し、存在しないパスは404になった。ブラウザのコンソールエラーは0件だった。
- 上記の確認後、Vercelの `nekobatoken/endnanonna` プロジェクトを削除した。管理画面の削除完了遷移と一覧からの消失を確認した。削除後も独自ドメインはCloudflareから200を返し、旧 `endnanonna.vercel.app` は404になった。
- 独自ドメイン、Worker名、アカウント、公開URL設定は `void.config.ts` と `void.lock.json` に保存した。ローカル検証サーバーは終了した。

実行記録と画面・GIFの成果物は、作業を実行したLocal/macOSの `output/playwright/` に保存した。成果物はGitの対象外。
