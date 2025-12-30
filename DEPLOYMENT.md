# AWS Amplify デプロイ手順

## 方法1: Amplify Console（推奨・簡単）

### 1. AWS Amplifyコンソールでアプリ作成
1. [AWS Amplify Console](https://console.aws.amazon.com/amplify/)にアクセス
2. 「新しいアプリ」→「ホスティング」→「GitHub」を選択
3. GitHubアカウントを連携
4. リポジトリとブランチ（main）を選択
5. ビルド設定:
   - `amplify.yml`が自動検出される
   - 確認して「次へ」
6. 「保存してデプロイ」

### 2. PWA対応の確認
- デプロイ後、生成されたURLにアクセス
- モバイルブラウザで「ホーム画面に追加」が表示されることを確認

### 3. カスタムドメイン設定（オプション）
- Amplifyコンソール → 「ドメイン管理」
- 独自ドメインを追加可能

---

## 方法2: GitHub Actions + S3 + CloudFront

### 1. S3バケット作成
```bash
aws s3 mb s3://kendama-app-bucket --region ap-northeast-1
aws s3 website s3://kendama-app-bucket --index-document index.html
```

### 2. CloudFront Distribution作成
- S3バケットをオリジンに設定
- HTTPSリダイレクト有効化
- Distribution IDをメモ

### 3. IAMユーザー作成
必要な権限:
- `s3:PutObject`
- `s3:DeleteObject`
- `cloudfront:CreateInvalidation`

### 4. GitHub Secrets設定
リポジトリの Settings → Secrets and variables → Actions で追加:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AMPLIFY_BUCKET` (S3バケット名)
- `CLOUDFRONT_DISTRIBUTION_ID`

### 5. デプロイ
mainブランチにpushすると自動デプロイ

---

## ビルド確認（ローカル）

```bash
npm run build
```

`build/client`ディレクトリが生成されることを確認

---

## トラブルシューティング

### ルーティングが404になる場合
Amplifyコンソールで「リダイレクトとリライト」を設定:
- Source: `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>`
- Target: `/index.html`
- Type: `200 (Rewrite)`

### Service Workerが動作しない場合
- HTTPSで配信されていることを確認
- ブラウザのDevToolsでService Worker登録状況を確認

---

## 推奨設定

- リージョン: `ap-northeast-1` (東京)
- Node.js バージョン: 20
- ビルドコマンド: `npm run build`
- 出力ディレクトリ: `build/client`
