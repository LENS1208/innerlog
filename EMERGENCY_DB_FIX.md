# 緊急時対応：データベース接続エラー

## 🚨 症状

以下のエラーが表示される場合：

```
❌ CRITICAL ERROR: Connected to OLD database!
Current URL: https://zcflpkmxeupharqbaymc.supabase.co
This database should NOT be used.
Error: Invalid database connection detected.
```

または、アプリが起動しない、データが表示されない、など。

---

## 📋 Claude Codeへの指示プロンプト（コピー＆ペースト用）

### パターン1: 開発環境でエラーが出る場合

```
.envファイルが古いデータベース(zcflpkmxeupharqbaymc)を参照しています。
正しいデータベース(xvqpsnrcmkvngxrinjyf)に修正してください。

以下を実行してください：
1. .envファイルのVITE_SUPABASE_URLを確認
2. 古いDB(zcflpkmxeupharqbaymc)になっている場合、.env.productionから正しい値をコピー
3. check-db.shを実行して検証
4. npm run buildで動作確認
```

### パターン2: 本番環境でエラーが出る場合

```
本番環境のデータベース接続エラーを修正してください。

プラットフォーム: [Vercel/Netlify/その他]

以下を確認・修正してください：
1. 本番環境の環境変数設定を確認
2. VITE_SUPABASE_URLが正しいか(xvqpsnrcmkvngxrinjyf)
3. VITE_SUPABASE_ANON_KEYが正しいか
4. DEPLOYMENT.mdの手順に従って再設定
```

### パターン3: どちらのDBが正しいか不明な場合

```
現在2つのSupabaseデータベースがあります。どちらが正しいか判断してください。

データベースA: zcflpkmxeupharqbaymc
データベースB: xvqpsnrcmkvngxrinjyf

以下を実行してください：
1. 両方のデータベースに接続してテーブル一覧を取得
2. データ件数を確認
3. 最新のデータがある方を正しいDBとして特定
4. 正しいDBに接続するよう.envとenv-validator.tsを更新
```

### パターン4: .envファイルが自動的に上書きされる問題

```
.envファイルが自動的に古い値に戻ってしまいます。根本的な解決をしてください。

以下を調査・実行してください：
1. .envがgitで管理されているか確認
2. システムやエディタの自動同期機能を確認
3. .envファイルにファイル保護を設定
4. 環境変数を.envファイル以外から読み込む方法を実装
5. 代替案として、環境変数をシステム環境変数で管理する方法を提案
```

---

## 🔧 自分で直す場合の手順

### ステップ1: 現在の状況確認

```bash
# どのDBに接続しているか確認
cat .env | grep VITE_SUPABASE_URL

# データベースチェックスクリプトを実行
./check-db.sh
```

### ステップ2: 正しいDBに修正

```bash
# 正しい設定を.envにコピー
cp .env.production .env

# 再度確認
./check-db.sh
```

### ステップ3: 動作確認

```bash
# ビルドテスト
npm run build

# 開発サーバー起動（自動で起動している場合は不要）
# npm run dev
```

---

## 📝 正しいデータベース情報（参照用）

### ✅ 正しいデータベース

```
Database ID: xvqpsnrcmkvngxrinjyf
URL: https://xvqpsnrcmkvngxrinjyf.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cXBzbnJjbWt2bmd4cmluanlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3OTAzNTEsImV4cCI6MjA3ODM2NjM1MX0.1Mp4Do6fX_7Q_WsKipbDkxHbeNCVGWB6fqiWVForBfc
```

### ❌ 古いデータベース（使用禁止）

```
Database ID: zcflpkmxeupharqbaymc
URL: https://zcflpkmxeupharqbaymc.supabase.co
Status: DEPRECATED - DO NOT USE
```

---

## 🌐 本番環境での設定方法

### Vercel

1. プロジェクトダッシュボードを開く
2. Settings → Environment Variables
3. 以下を設定（既存の値を上書き）：
   - `VITE_SUPABASE_URL` = `https://xvqpsnrcmkvngxrinjyf.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = （上記の正しいAnon Key）
4. 再デプロイ（Deployments → ... → Redeploy）

### Netlify

1. サイトダッシュボードを開く
2. Site settings → Environment variables
3. 上記と同じ環境変数を設定
4. Deploys → Trigger deploy → Clear cache and deploy

---

## 🆘 それでも解決しない場合

以下の情報と共にClaude Codeに相談：

```
データベース接続エラーが解決しません。以下の情報を確認してください：

1. 現在の.envファイルの内容（機密情報は一部マスク可）
2. ブラウザコンソールのエラーメッセージ（スクリーンショット可）
3. npm run buildの実行結果
4. check-db.shの実行結果
5. 環境（開発/本番、プラットフォーム名）

これらの情報を基に、根本的な解決策を提案してください。
```

---

**このファイルを保存しておき、問題が発生したらすぐに参照してください。**
