# クイックリファレンス - データベース統合

## 🚨 最重要ポイント

### 現状
- **2つのSupabaseデータベース**が存在
- **古いDB**: `zcflpkmxeupharqbaymc` → 削除対象
- **現在のDB**: `xvqpsnrcmkvngxrinjyf` → 保持

### 明日の作業目標
古いDBを削除し、1つに統合する

---

## ⚡ 5分でできる作業手順

### 1. 事前確認（2分）

```bash
# バックアップの存在確認
ls backups/20251117_020034/

# 設定ファイル確認
grep SUPABASE .env
grep SUPABASE .env.production

# 両方が xvqpsnrcmkvngxrinjyf を指していればOK
```

### 2. Supabaseで古いDB削除（2分）

1. https://supabase.com/dashboard にアクセス
2. プロジェクト `zcflpkmxeupharqbaymc` を開く
3. Settings → General → Delete Project
4. プロジェクト名を入力して削除

### 3. 認証設定の確認（1分）

1. プロジェクト `xvqpsnrcmkvngxrinjyf` を開く
2. Authentication → Providers → Email
3. **"Confirm email" をOFF**にする
4. Save

---

## 🔍 削除前の必須チェック

```sql
-- 古いDB（zcflpkmxeupharqbaymc）で実行
-- 重要データがないか確認
SELECT COUNT(*) FROM auth.users;
SELECT COUNT(*) FROM trades;
```

両方が 0 または 空なら安全に削除可能。

---

## ⚠️ よくある問題と解決策

### 問題: ログインできない

**エラー**: "Email not confirmed"

**解決**:
```sql
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE email_confirmed_at IS NULL;
```

### 問題: Vercelでエラー

**原因**: 環境変数が古いDB

**解決**:
1. Vercel → Settings → Environment Variables
2. `VITE_SUPABASE_URL` を `https://xvqpsnrcmkvngxrinjyf.supabase.co` に更新
3. Redeploy

### 問題: データが見えない

**確認**:
```sql
-- 自分のuser_idを確認
SELECT auth.uid();

-- データ確認
SELECT COUNT(*) FROM trades WHERE user_id = auth.uid();
```

---

## 📋 完了チェックリスト

削除作業後、以下をテスト：

- [ ] Boltでログイン成功
- [ ] Vercelでログイン成功
- [ ] トレードデータが表示される
- [ ] 新規データを保存できる
- [ ] カレンダーが動作する

---

## 🆘 緊急時

問題が発生したら：

1. **バックアップから復元**
   ```bash
   cd backups/20251117_020034/
   ls -la  # ファイルを確認
   ```

2. **設定を元に戻す**
   - `.env` ファイルの SUPABASE_URL を確認
   - Vercelの環境変数を確認

3. **サポートに連絡**
   - Supabase: https://supabase.com/support

---

## 📞 今夜覚えておくべきこと

**保持するDB**: `xvqpsnrcmkvngxrinjyf`
**削除するDB**: `zcflpkmxeupharqbaymc`

**重要な設定**:
- Authentication → Email → "Confirm email" をOFF

**詳細は**: `docs/DATABASE_CONSOLIDATION_GUIDE.md` 参照
