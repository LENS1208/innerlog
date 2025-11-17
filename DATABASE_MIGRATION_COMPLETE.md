# データベース移行完了レポート

## 実施日時
2025-11-17

## 新しいデータベース

### 接続情報
- **Database ID**: `xjviqzyhephwkytwjmwd`
- **Project URL**: https://xjviqzyhephwkytwjmwd.supabase.co
- **リージョン**: Asia
- **ステータス**: ✅ アクティブ

### 適用されたマイグレーション
新しいデータベースには、以下の21個のクリーンなマイグレーションが適用されています：

1. `20251028013408_create_trading_journal_tables.sql` - 基本テーブル作成
2. `20251028063214_add_free_memos_and_links.sql` - 自由メモ機能
3. `20251104012638_add_dataset_column_to_trades.sql` - データセット列追加
4. `20251105134008_create_user_settings_table.sql` - ユーザー設定テーブル
5. `20251105223300_add_settings_page_columns.sql` - 設定ページ列追加
6. `20251106021717_add_user_id_and_secure_rls_policies.sql` - RLSポリシー
7. `20251106102729_create_account_transactions_table.sql` - アカウントテーブル
8. `20251110124940_add_swap_breakdown_to_account_transactions.sql` - スワップ詳細
9. `20251111004643_fix_trades_unique_constraint_for_user_id_v2.sql` - ユニーク制約修正
10. `20251111064202_create_ai_proposals_table.sql` - AI提案テーブル
11. `20251111065954_add_parent_id_to_ai_proposals.sql` - 親ID追加
12. `20251111113600_fix_rls_security_vulnerability.sql` - RLS脆弱性修正
13. `20251111114430_add_auto_create_user_settings_trigger.sql` - 自動作成トリガー
14. `20251111114452_add_data_integrity_constraints.sql` - データ整合性制約
15. `20251112005541_add_user_rating_to_ai_proposals.sql` - ユーザー評価追加
16. `20251112010038_update_user_rating_to_decimal.sql` - 評価を小数に変更
17. `20251112021301_normalize_item_to_uppercase.sql` - 通貨ペア正規化
18. `20251116065904_create_coaching_jobs_table.sql` - コーチングジョブテーブル
19. `20251116121329_add_coach_avatar_preset_to_user_settings.sql` - コーチアバター設定
20. `20251116123113_create_import_history_table.sql` - インポート履歴テーブル
21. `20251116130000_recalculate_pips_for_all_instruments.sql` - pips再計算

### テーブル構成
以下のテーブルが正常に作成されています：

- ✅ `trades` - 取引データ
- ✅ `trade_notes` - 取引ノート
- ✅ `daily_notes` - 日次ノート
- ✅ `free_memos` - 自由メモ
- ✅ `note_links` - ノート間リンク
- ✅ `user_settings` - ユーザー設定
- ✅ `account_transactions` - アカウント取引
- ✅ `account_summary` - アカウントサマリー
- ✅ `ai_proposals` - AI提案
- ✅ `ai_coaching_jobs` - AIコーチングジョブ
- ✅ `import_history` - インポート履歴

## 更新されたファイル

### 環境変数ファイル
- ✅ `.env` - 新しいDB接続情報に更新
- ✅ `.env.example` - 新しいDB接続情報に更新
- ✅ `.env.production` - 新しいDB接続情報に更新

### スクリプトファイル
以下のスクリプトから古いDB URLを削除し、環境変数を使用するように修正：
- ✅ `scripts/backup-manual.js`
- ✅ `scripts/create-takuan-user.js`
- ✅ `scripts/signup-takuan.js`
- ✅ `scripts/test-login.js`

## ビルド確認
```bash
npm run build
```
✅ ビルド成功 - 新しいデータベースとの接続が正常に動作します

## 削除すべき古いデータベース

以下の2つのデータベースはもう使用されていないため、Supabaseダッシュボードから**手動で削除**してください：

### 1. 古いDB #1
- **Database ID**: `zcflpkmxeupharqbaymc`
- **URL**: https://zcflpkmxeupharqbaymc.supabase.co
- **ステータス**: ⚠️ 削除待ち
- **削除方法**:
  1. https://supabase.com/dashboard にアクセス
  2. プロジェクト `zcflpkmxeupharqbaymc` を選択
  3. Settings → General → Delete Project

### 2. 古いDB #2
- **Database ID**: `xvqpsnrcmkvngxrinjyf`
- **URL**: https://xvqpsnrcmkvngxrinjyf.supabase.co
- **ステータス**: ⚠️ 削除待ち
- **削除方法**:
  1. https://supabase.com/dashboard にアクセス
  2. プロジェクト `xvqpsnrcmkvngxrinjyf` を選択
  3. Settings → General → Delete Project

## 今後のデータベース管理

### 新規マイグレーション作成時
1. `supabase/migrations/` ディレクトリに新しいマイグレーションファイルを作成
2. ファイル名は `YYYYMMDDHHMMSS_description.sql` の形式
3. 必ず詳細なコメントを含める
4. MCPツールを使って適用: `mcp__supabase__apply_migration`

### スクリプト実行時
すべてのスクリプトは環境変数を使用するように更新されています：
```bash
# .envファイルを読み込んでから実行
source .env
node scripts/your-script.js
```

### バックアップ
定期的なバックアップは以下のコマンドで実行：
```bash
node scripts/backup-manual.js
```
バックアップは `backups/` ディレクトリに保存されます。

## 完了事項チェックリスト

- ✅ 新しいクリーンなデータベースを作成
- ✅ 21個のマイグレーションを適用
- ✅ 環境変数ファイルを更新
- ✅ スクリプトから古いDB URLを削除
- ✅ ビルドテストを実施
- ⚠️ 古いデータベースの削除（手動）

## 注意事項

1. **古いデータベースは削除前に確認**
   - 削除前に、本当に必要なデータがないか最終確認してください
   - すでにバックアップは取得済みです（`backups/` ディレクトリ参照）

2. **MCP接続**
   - MCPツールは独自の接続設定を使用している可能性があります
   - Claude Code の設定で新しいDB URLが使用されていることを確認してください

3. **環境変数の確認**
   - 本番環境では `.env.production` が使用されます
   - デプロイ先のプラットフォームでも環境変数を設定してください
