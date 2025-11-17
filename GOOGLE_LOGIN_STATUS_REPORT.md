# Googleログイン設定状況レポート

**作成日**: 2025-11-17
**対象**: エンジニアチーム
**重要度**: 🔴 HIGH - ログイン機能が動作していません

---

## 📋 現状サマリー

現在、Googleログイン機能の実装は**完了していません**。ユーザーはログインできない状態が続いています。

### 主要な問題
1. **環境変数が自動的に古い設定に戻る**（原因不明）
2. 手動で修正しても数分後に上書きされる
3. ブラウザキャッシュクリアでは解決しない

---

## ✅ 完了している設定

### 1. Supabase データベース
- **データベースID**: `xvqpsnrcmkvngxrinjyf`
- **URL**: `https://xvqpsnrcmkvngxrinjyf.supabase.co`
- **ステータス**: 正常稼働
- **テーブル構成**: 全テーブル作成済み（trades, users, daily_notes等）

### 2. テストユーザーアカウント
```
Email: takuan_1000@yahoo.co.jp
Password: test2025
User ID: 4e4b6842-84ea-45a4-a8d0-e31a133bf054
```

- ✅ auth.users テーブルに登録済み
- ✅ auth.identities テーブルに登録済み
- ✅ 48件のデモトレードデータ紐付け済み
- ✅ user_settings, daily_notes 等も作成済み

### 3. RLSポリシー
- ✅ 全テーブルでRow Level Security有効化済み
- ✅ ユーザー認証ベースのアクセス制御設定済み

### 4. ソースコード
- ✅ `src/lib/supabase.ts` - 環境変数から読み込み（ハードコーディングなし）
- ✅ `src/pages/LoginPage.tsx` - Supabase認証実装済み
- ✅ `src/pages/SignupPage.tsx` - ユーザー登録機能実装済み

---

## ❌ 未解決の問題

### 問題1: 環境変数が自動的にリセットされる

#### 症状
`.env`ファイルを正しい設定に更新しても、数分後に古い設定に戻る。

**期待される設定**:
```env
VITE_SUPABASE_URL=https://xvqpsnrcmkvngxrinjyf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...（正しいキー）
```

**実際の状態（自動的に戻る）**:
```env
VITE_SUPABASE_URL=https://zcflpkmxeupharqbaymc.supabase.co  # ❌ 古い廃止されたDB
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...（古いキー）
```

#### 影響
- ログインフォームで認証すると「Invalid database connection」エラー
- 古いデータベース（`zcflpkmxeupharqbaymc`）に接続しようとして失敗
- ユーザーはログインできない

#### 試行した対策（すべて無効）
1. ✅ `.env`, `.env.production`, `.env.example` を手動更新 → 数分後に元に戻る
2. ✅ `npm run build` で再ビルド → 変化なし
3. ✅ ブラウザキャッシュクリア（Hard Reload） → 変化なし
4. ✅ Viteキャッシュ削除（`rm -rf dist node_modules/.vite .vite`） → 変化なし
5. ✅ 開発者ツールで Application → Clear site data → 変化なし

### 問題2: 原因不明のファイル上書き

**可能性のある原因**:
1. Claude Code環境の自動同期機能
2. 別のプロセスによる`.env`ファイル管理
3. Git関連の自動リストア
4. システムレベルの環境変数管理機能

---

## 🔧 エンジニアが確認すべき事項

### 優先度: HIGH

1. **環境変数の永続化**
   - `.env`ファイルがなぜ自動的に上書きされるのか調査
   - Claude Code環境の設定確認
   - プロジェクトのビルドプロセス確認

2. **現在のブラウザで実際に接続されているURL確認**
   ```
   開発者ツール → Console → 以下を実行:
   console.log(import.meta.env.VITE_SUPABASE_URL)
   ```
   期待値: `https://xvqpsnrcmkvngxrinjyf.supabase.co`

3. **ビルド成果物の確認**
   ```bash
   grep -o "xvqpsnrcmkvngxrinjyf\|zcflpkmxeupharqbaymc" dist/assets/*.js | head -10
   ```
   `xvqpsnrcmkvngxrinjyf`のみが含まれるべき

4. **開発サーバーの再起動**
   - 現在の開発サーバーが古い環境変数でキャッシュされている可能性
   - 完全停止 → `.env`修正 → 再起動が必要かもしれない

---

## 📝 正しい設定（参照用）

### .env ファイルの正解
```env
VITE_SUPABASE_URL=https://xvqpsnrcmkvngxrinjyf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cXBzbnJjbWt2bmd4cmluanlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3OTAzNTEsImV4cCI6MjA3ODM2NjM1MX0.1Mp4Do6fX_7Q_WsKipbDkxHbeNCVGWB6fqiWVForBfc
```

### Supabase認証確認コマンド
```bash
# 正しいデータベースでユーザー確認
curl -X POST 'https://xvqpsnrcmkvngxrinjyf.supabase.co/auth/v1/token?grant_type=password' \
-H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cXBzbnJjbWt2bmd4cmluanlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3OTAzNTEsImV4cCI6MjA3ODM2NjM1MX0.1Mp4Do6fX_7Q_WsKipbDkxHbeNCVGWB6fqiWVForBfc" \
-H "Content-Type: application/json" \
-d '{"email":"takuan_1000@yahoo.co.jp","password":"test2025"}'
```

---

## 🎯 次のアクション

### すぐに実行すべきこと
1. `.env`ファイルが上書きされる根本原因の特定
2. 開発サーバーの完全再起動（環境変数の再読み込み）
3. ブラウザでの接続URL確認（Console経由）

### 長期的な対策
1. 環境変数の永続化メカニズムの見直し
2. CI/CD パイプラインでの環境変数管理
3. 本番環境デプロイ時の設定ファイル管理手順の確立

---

## 📚 関連ドキュメント

- `DATABASE_CONFIG.md` - データベース設定詳細
- `src/lib/supabase.ts` - Supabase クライアント初期化
- `src/lib/env-validator.ts` - 環境変数バリデーション

---

## ⚠️ 重要な注意事項

### 廃止されたデータベース（使用禁止）
```
❌ Database ID: zcflpkmxeupharqbaymc
❌ URL: https://zcflpkmxeupharqbaymc.supabase.co
⚠️ このデータベースへの接続は全て失敗します
```

### 現在使用すべきデータベース
```
✅ Database ID: xvqpsnrcmkvngxrinjyf
✅ URL: https://xvqpsnrcmkvngxrinjyf.supabase.co
✅ テストユーザー: takuan_1000@yahoo.co.jp / test2025
```

---

**このレポートに関する質問**: プロジェクトリーダーまで
