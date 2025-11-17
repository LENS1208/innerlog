# データベース統合作業ガイド

## 現状の問題

### 2つのSupabaseデータベースが存在

1. **古いデータベース（削除対象）**
   - URL: `https://zcflpkmxeupharqbaymc.supabase.co`
   - プロジェクトID: `zcflpkmxeupharqbaymc`
   - 状態: 使用されていない（Bolt環境で過去に使用）

2. **現在のデータベース（保持）**
   - URL: `https://xvqpsnrcmkvngxrinjyf.supabase.co`
   - プロジェクトID: `xvqpsnrcmkvngxrinjyf`
   - 状態: 現在使用中（全環境で統一済み）

### 現在の設定状況

- `.env`: `xvqpsnrcmkvngxrinjyf` ✅ 修正済み
- `.env.production`: `xvqpsnrcmkvngxrinjyf` ✅
- Vercel環境変数: `xvqpsnrcmkvngxrinjyf` と想定

---

## 作業手順（明日実施）

### 事前準備

#### 1. データバックアップの確認

```bash
# 既存のバックアップを確認
ls -la backups/

# 最新のバックアップディレクトリを確認
ls -la backups/20251117_020034/
```

バックアップ内容：
- `account_summary.json`
- `account_transactions.json`
- `ai_coaching_jobs.json`
- `ai_proposals.json`
- `daily_notes.json`
- `import_history.json`
- `trade_notes.json`
- `trades.json`
- `user_settings.json`

#### 2. 現在のデータベースの状態確認

以下の情報を記録してください：

```bash
# ユーザー数
SELECT COUNT(*) FROM auth.users;

# トレード数
SELECT COUNT(*) FROM trades;

# 各テーブルのレコード数
SELECT
  'trades' as table_name, COUNT(*) as count FROM trades
UNION ALL
SELECT 'daily_notes', COUNT(*) FROM daily_notes
UNION ALL
SELECT 'trade_notes', COUNT(*) FROM trade_notes
UNION ALL
SELECT 'ai_proposals', COUNT(*) FROM ai_proposals
UNION ALL
SELECT 'user_settings', COUNT(*) FROM user_settings
UNION ALL
SELECT 'account_summary', COUNT(*) FROM account_summary
UNION ALL
SELECT 'account_transactions', COUNT(*) FROM account_transactions;
```

---

### 統合作業の手順

#### Step 1: 古いデータベースの確認（削除前）

1. **Supabaseダッシュボードにログイン**
   - https://supabase.com/dashboard

2. **古いプロジェクト（zcflpkmxeupharqbaymc）を確認**
   - プロジェクト設定を開く
   - データベース内容を確認
   - **重要データがないことを確認**

#### Step 2: 環境変数の最終確認

**確認箇所：**

1. **ローカル環境（Bolt）**
   - ファイル: `.env`
   - 確認内容: `VITE_SUPABASE_URL=https://xvqpsnrcmkvngxrinjyf.supabase.co`

2. **本番環境（Vercel）**
   - Vercelダッシュボード → プロジェクト設定 → Environment Variables
   - 確認項目:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - 両方が `xvqpsnrcmkvngxrinjyf` を指していることを確認

3. **Git管理ファイル**
   - `.env.production`
   - `.env.example`

#### Step 3: 古いデータベースの削除

1. **Supabaseダッシュボード**で古いプロジェクト（`zcflpkmxeupharqbaymc`）を開く

2. **Settings → General**に移動

3. **Delete Project**セクションまでスクロール

4. プロジェクト名を入力して削除を確認

5. **削除完了を確認**

#### Step 4: 現在のデータベース設定の確認と調整

##### 4-1. 認証設定の確認

1. **Authentication → Providers → Email**
2. 以下を確認：
   - ✅ "Enable Email provider" がON
   - ❌ "Confirm email" がOFF（即座にログイン可能）
   - ✅ "Enable Email Signup" がON

##### 4-2. RLS（Row Level Security）の確認

すべてのテーブルでRLSが有効化されていることを確認：

```sql
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

すべて `rowsecurity = true` であることを確認。

##### 4-3. ユーザーの確認

```sql
SELECT
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;
```

主要ユーザー：
- `kan.yamaji@gmail.com`
- `takuan_1000@yahoo.co.jp`

#### Step 5: 動作確認

##### 5-1. Bolt環境でのテスト

1. アプリケーションを再起動
2. ログイン機能をテスト
3. データの読み込みを確認
4. データの保存をテスト

##### 5-2. Vercel環境でのテスト

1. 最新のコードをデプロイ
2. 本番環境でログインテスト
3. データの表示確認
4. 新規データの作成テスト

---

## 影響範囲

### 影響がある箇所

1. **認証関連**
   - ログイン機能
   - サインアップ機能
   - セッション管理

2. **データ取得**
   - トレードデータの表示
   - ダッシュボードのKPI
   - カレンダービュー
   - レポート機能

3. **データ保存**
   - トレードの追加・編集
   - ノートの保存
   - 設定の更新
   - AIプロポーザルの生成

### 影響がない箇所

1. **フロントエンドのUI/UX**
   - レイアウト
   - スタイリング
   - ナビゲーション

2. **静的ファイル**
   - 画像
   - アイコン
   - デモデータファイル（CSV/JSON）

3. **クライアントサイドのロジック**
   - 計算処理
   - フィルタリング
   - ソート

---

## 注意点とリスク

### 🚨 重大な注意点

#### 1. データの永久損失リスク

**問題**: 古いデータベースを削除すると、そのデータは完全に失われます。

**対策**:
- ✅ 削除前に必ずバックアップを取得
- ✅ 重要データが古いDBにないことを確認
- ✅ バックアップファイルを外部に保存（ダウンロード）

#### 2. 環境変数の不一致

**問題**: Vercelの環境変数が古いDBを指している可能性

**対策**:
```
Vercelダッシュボード確認手順：
1. プロジェクト選択
2. Settings → Environment Variables
3. VITE_SUPABASE_URL を確認
4. 必要に応じて更新し、Redeploy
```

#### 3. Edge Functionsの設定

**問題**: Supabase Edge Functionsが古いDBの環境変数を使用している可能性

**確認箇所**:
- `supabase/functions/generate-ai-proposal/index.ts`
- `supabase/functions/generate-coaching-job/index.ts`
- `supabase/functions/generate-coaching/index.ts`

これらは環境変数 `SUPABASE_URL` を使用しています。
Supabaseが自動的に正しいURLを設定するため、通常は問題ありませんが、念のため動作確認が必要。

#### 4. キャッシュとセッションの問題

**問題**: ブラウザに古いDB情報がキャッシュされている可能性

**対策**:
- ブラウザのキャッシュをクリア
- ローカルストレージをクリア
- シークレットモードでテスト

#### 5. マイグレーションの再適用

**問題**: 新規にDBを作成する場合、すべてのマイグレーションを再適用する必要がある

**対策**:
- 現在のDB（`xvqpsnrcmkvngxrinjyf`）を継続使用するため、この問題は発生しない
- ただし、万が一の場合に備えて `supabase/migrations/` を保持

---

## トラブルシューティング

### 問題1: ログインできない

**症状**: "Email not confirmed" エラー

**解決方法**:
```sql
-- SQLエディタで実行
UPDATE auth.users
SET
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  confirmation_token = '',
  updated_at = now()
WHERE email_confirmed_at IS NULL;
```

または、Supabaseダッシュボードで:
- Authentication → Providers → Email
- "Confirm email" をOFF

### 問題2: データが表示されない

**症状**: ダッシュボードが空

**原因**:
- RLSポリシーの問題
- データが別のuser_idに紐付いている

**解決方法**:
```sql
-- 現在のuser_idを確認
SELECT auth.uid();

-- 自分のデータを確認
SELECT COUNT(*) FROM trades WHERE user_id = auth.uid();

-- データが0の場合、user_settingsでdatasetを確認
SELECT data_source, default_dataset FROM user_settings WHERE user_id = auth.uid();
```

### 問題3: Vercelでのみエラー

**症状**: Boltでは動作するがVercelでエラー

**原因**: 環境変数の不一致

**解決方法**:
1. Vercel → Settings → Environment Variables
2. `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY` を確認
3. 正しい値に更新
4. Deployments → 最新デプロイ → Redeploy

---

## チェックリスト

### 削除前の確認

- [ ] 現在のDBのバックアップが存在する
- [ ] バックアップファイルを外部にダウンロード済み
- [ ] 古いDB（zcflpkmxeupharqbaymc）に重要データがないことを確認
- [ ] `.env` ファイルが正しいDB（xvqpsnrcmkvngxrinjyf）を指している
- [ ] `.env.production` ファイルが正しいDB（xvqpsnrcmkvngxrinjyf）を指している

### 削除作業

- [ ] Supabaseダッシュボードで古いプロジェクトを削除
- [ ] 削除完了の確認

### 削除後の確認

- [ ] Supabaseダッシュボードで認証設定を確認
- [ ] Vercelの環境変数を確認
- [ ] Bolt環境でログインテスト
- [ ] Bolt環境でデータ表示テスト
- [ ] Vercelでログインテスト
- [ ] Vercelでデータ表示テスト
- [ ] 新規データの作成テスト
- [ ] AIコーチング機能のテスト

---

## データベース情報まとめ

### 保持するデータベース

```
プロジェクトID: xvqpsnrcmkvngxrinjyf
URL: https://xvqpsnrcmkvngxrinjyf.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cXBzbnJjbWt2bmd4cmluanlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3OTAzNTEsImV4cCI6MjA3ODM2NjM1MX0.1Mp4Do6fX_7Q_WsKipbDkxHbeNCVGWB6fqiWVForBfc
```

### テーブル一覧

1. `trades` - トレードデータ
2. `trade_notes` - トレードノート
3. `daily_notes` - デイリーノート
4. `free_memos` - フリーメモ
5. `note_links` - ノート間のリンク
6. `user_settings` - ユーザー設定
7. `account_summary` - アカウント集計
8. `account_transactions` - 口座取引履歴
9. `ai_proposals` - AIプロポーザル
10. `ai_coaching_jobs` - AIコーチングジョブ
11. `import_history` - インポート履歴

### 登録ユーザー

1. `kan.yamaji@gmail.com` - メイン
2. `takuan_1000@yahoo.co.jp` - サブ

---

## 緊急時の復旧手順

万が一問題が発生した場合：

### 1. データの復元

```bash
# バックアップディレクトリに移動
cd backups/20251117_020034/

# 各テーブルのJSONファイルを確認
ls -la

# 必要に応じてスクリプトで復元（実装が必要）
```

### 2. 新しいSupabaseプロジェクトの作成

1. Supabaseダッシュボードで新規プロジェクトを作成
2. すべてのマイグレーションファイルを順次適用
3. バックアップデータをインポート
4. 環境変数を更新

### 3. サポートへの連絡

問題が解決しない場合：
- Supabaseサポート: https://supabase.com/support
- Vercelサポート: https://vercel.com/help

---

## 完了後の確認事項

統合作業完了後、以下を確認：

1. **機能テスト**
   - [ ] ログイン/ログアウト
   - [ ] トレードの閲覧
   - [ ] トレードの追加
   - [ ] ノートの編集
   - [ ] カレンダー表示
   - [ ] レポート生成
   - [ ] AI機能

2. **パフォーマンス**
   - [ ] ページ読み込み速度
   - [ ] データ取得速度
   - [ ] エラーログの確認

3. **セキュリティ**
   - [ ] 他人のデータが見えないこと
   - [ ] 未ログイン時のアクセス制限
   - [ ] RLSポリシーの動作確認

---

## 推奨作業タイミング

- **最適な時間帯**: サービス利用が少ない時間（深夜・早朝）
- **所要時間**: 30分〜1時間程度
- **準備**: 事前にこのドキュメントを一読し、手順を把握

---

## 最終チェック

作業開始前に最終確認：

```bash
# 現在の.envファイルを確認
cat .env | grep SUPABASE

# .env.productionファイルを確認
cat .env.production | grep SUPABASE

# 両方が同じDBを指していることを確認
# 期待値: xvqpsnrcmkvngxrinjyf
```

---

## 連絡先

作業中に不明点がある場合は、このドキュメントを参照してください。
必要に応じてSupabaseダッシュボードのログやVercelのデプロイログを確認してください。
