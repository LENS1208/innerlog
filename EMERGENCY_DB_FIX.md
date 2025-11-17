# 緊急時対応：データベース接続エラー

**最終更新: 2025-11-17**

## 🚨 症状

以下のエラーが表示される場合：

```
❌ CRITICAL ERROR: Connected to OLD database!
Current URL: https://zcflpkmxeupharqbaymc.supabase.co
This database should NOT be used.
Error: Invalid database connection detected.
```

または、アプリが起動しない、データが表示されない、ログインできない、など。

---

## 📋 Claude Codeへの指示プロンプト（コピー＆ペースト用）

### パターン1: 開発環境でエラーが出る場合

```
データベース接続エラーが発生しています。

DATABASE_CONFIG.mdを参照して、以下を実行してください：
1. .envファイルが正しいデータベース(xvqpsnrcmkvngxrinjyf)を指しているか確認
2. 間違っている場合、.env.exampleから正しい設定をコピー
3. check-db.shを実行して検証
4. Viteキャッシュをクリア: rm -rf dist node_modules/.vite .vite
5. npm run buildで動作確認
6. ブラウザのキャッシュもクリアして再テスト
```

### パターン2: 本番環境でエラーが出る場合

```
本番環境でデータベース接続エラーが発生しています。

プラットフォーム: [Vercel/Netlify/その他]

DATABASE_CONFIG.mdとDEPLOYMENT.mdを参照して、以下を実行してください：
1. 本番環境の環境変数設定を確認
2. VITE_SUPABASE_URLが https://xvqpsnrcmkvngxrinjyf.supabase.co になっているか
3. VITE_SUPABASE_ANON_KEYが正しいか（DATABASE_CONFIG.md参照）
4. 環境変数を修正後、キャッシュをクリアして再デプロイ
5. デプロイ後、ブラウザのキャッシュもクリア
```

### パターン3: ログインできない・データが見えない

```
ログインエラーまたはデータ表示エラーが発生しています。

以下を確認・実行してください：
1. DATABASE_CONFIG.mdでテストユーザーアカウント情報を確認
2. ブラウザのDevToolsでコンソールエラーを確認
3. データベース接続先が xvqpsnrcmkvngxrinjyf か確認
4. .envファイルの認証情報が正しいか確認
5. ブラウザのキャッシュを完全にクリア（DevTools → Application → Clear storage）
6. ハードリフレッシュ（Cmd+Shift+R または Ctrl+Shift+R）
```

### パターン4: キャッシュ問題で古いDBに接続し続ける

```
正しい設定のはずなのに、古いデータベースに接続してしまいます。

以下のクリーンアップを実行してください：
1. Viteキャッシュを完全削除: rm -rf dist node_modules/.vite .vite
2. .envファイルを再確認（DATABASE_CONFIG.md参照）
3. クリーンビルド: npm run build
4. ブラウザのキャッシュを完全クリア:
   - DevToolsを開く（F12）
   - Application タブ → Clear storage → Clear site data
5. ブラウザを完全に再起動
6. ハードリフレッシュでページを再読み込み
```

### パターン5: 完全リセットが必要な場合（最終手段）

```
データベース接続を完全にリセットしてください。

以下の手順を実行：
1. DATABASE_CONFIG.mdで正しい認証情報を確認
2. すべての.envファイルを正しい値に更新:
   - .env
   - .env.production
3. src/lib/supabase.tsにハードコーディングがないか確認
4. すべてのキャッシュをクリア:
   - rm -rf dist node_modules/.vite .vite
   - ブラウザのキャッシュもクリア
5. check-db.shで検証
6. npm run buildでクリーンビルド
7. 問題が解決しない場合は、根本原因を調査して報告
```

---

## 🔧 自分で直す場合の手順

### ステップ1: 現在の状況確認

```bash
# どのDBに接続しているか確認
cat .env | grep VITE_SUPABASE_URL

# データベースチェックスクリプトを実行
./check-db.sh

# DATABASE_CONFIG.mdで正しい設定を確認
cat DATABASE_CONFIG.md | grep -A5 "Environment Variables"
```

### ステップ2: 正しいDBに修正

```bash
# 正しい設定を.envにコピー
cp .env.example .env

# 再度確認
./check-db.sh
```

### ステップ3: キャッシュクリア

```bash
# Viteキャッシュを完全削除
rm -rf dist node_modules/.vite .vite

# ビルドテスト
npm run build
```

### ステップ4: ブラウザキャッシュクリア

1. **DevToolsを開く** (F12 または右クリック → Inspect)
2. **Application タブ** を開く
3. **Clear storage** を選択
4. **Clear site data** をクリック
5. ブラウザを再起動
6. **ハードリフレッシュ** (Mac: Cmd+Shift+R, Windows: Ctrl+Shift+R)

---

## 📝 正しいデータベース情報（参照用）

### ✅ 正しいデータベース

```
Database ID: xvqpsnrcmkvngxrinjyf
URL: https://xvqpsnrcmkvngxrinjyf.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cXBzbnJjbWt2bmd4cmluanlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE4MDQyOTksImV4cCI6MjA0NzM4MDI5OX0.kgzf7yWMwzg9Y1IHpRmYAVD-CJWQQ_yxZTLxzUq_4Jw
```

### ✅ テストユーザーアカウント

```
Email: takuan_1000@yahoo.co.jp
Password: test2025
User ID: 4e4b6842-84ea-45a4-a8d0-e31a133bf054
```

### ❌ 古いデータベース（使用禁止）

```
Database ID: zcflpkmxeupharqbaymc
URL: https://zcflpkmxeupharqbaymc.supabase.co
Status: ⛔ DEPRECATED - DO NOT USE
```

---

## 🌐 本番環境での設定方法

### Vercel

1. プロジェクトダッシュボードを開く
2. Settings → Environment Variables
3. 以下を設定（既存の値を上書き）：
   - `VITE_SUPABASE_URL` = `https://xvqpsnrcmkvngxrinjyf.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = （上記の正しいAnon Key）
4. **重要**: Deployments → ... → Redeploy → **Clear cache and redeploy**

### Netlify

1. サイトダッシュボードを開く
2. Site settings → Environment variables
3. 上記と同じ環境変数を設定
4. **重要**: Deploys → Trigger deploy → **Clear cache and deploy**

### その他のプラットフォーム

1. DATABASE_CONFIG.mdから正しい認証情報をコピー
2. プラットフォームの環境変数設定に追加
3. **必ずキャッシュをクリアして再デプロイ**

---

## 🆘 それでも解決しない場合

以下の情報と共にClaude Codeに相談：

```
データベース接続エラーが解決しません。以下の情報を確認してください：

1. 現在の.envファイルの内容:
   $(cat .env | grep VITE_SUPABASE)

2. ブラウザコンソールのエラーメッセージ（スクリーンショット可）

3. check-db.shの実行結果:
   $(./check-db.sh)

4. ビルドの実行結果:
   $(npm run build 2>&1 | tail -20)

5. 環境: [開発/本番]、プラットフォーム: [ローカル/Vercel/Netlify/その他]

6. 試したこと:
   - [ ] .envファイルの確認・修正
   - [ ] Viteキャッシュのクリア
   - [ ] ブラウザキャッシュのクリア
   - [ ] ハードリフレッシュ
   - [ ] クリーンビルド

これらの情報を基に、根本的な解決策を提案してください。
```

---

## 📚 関連ドキュメント

- **DATABASE_CONFIG.md** - データベース設定の完全ガイド
- **DEPLOYMENT.md** - 本番デプロイ手順
- **check-db.sh** - データベース接続チェックスクリプト
- **.env.example** - 正しい環境変数のテンプレート

---

## 🔒 重要な注意事項

1. **キャッシュは2箇所ある**:
   - Viteのビルドキャッシュ (node_modules/.vite, dist)
   - ブラウザのキャッシュ
   - **両方クリアしないと古い設定が残る**

2. **環境変数はビルド時に埋め込まれる**:
   - .envを変更したら**必ず再ビルド**
   - 本番環境では環境変数変更後**必ず再デプロイ**

3. **ハードコーディングは禁止**:
   - src/lib/supabase.tsで直接URLを書かない
   - 必ず`import.meta.env`から読み込む

---

**このファイルを保存しておき、問題が発生したらすぐに参照してください。**
