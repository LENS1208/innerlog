#!/bin/bash

# Supabaseデータベースバックアップスクリプト
# 使い方: bash scripts/backup-database.sh

BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📦 Supabaseデータベースをバックアップ中..."

# 主要テーブルをJSONでエクスポート
tables=(
  "trades"
  "daily_notes"
  "trade_notes"
  "ai_proposals"
  "account_transactions"
  "account_summary"
  "user_settings"
  "import_history"
  "coaching_jobs"
)

for table in "${tables[@]}"; do
  echo "  - $table をエクスポート中..."

  # Supabase REST APIでデータを取得
  curl -s \
    -H "apikey: $VITE_SUPABASE_ANON_KEY" \
    -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" \
    "$VITE_SUPABASE_URL/rest/v1/$table?select=*" \
    > "$BACKUP_DIR/$table.json"
done

echo "✅ バックアップ完了: $BACKUP_DIR"
echo ""
echo "復元方法:"
echo "  node scripts/restore-database.js $BACKUP_DIR"
