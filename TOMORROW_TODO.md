# 🌅 明日やること - データベース統合作業

## ⏰ 作業開始前

1. **このファイルを開く**
   - `docs/DATABASE_CONSOLIDATION_GUIDE.md` - 詳細手順
   - `docs/QUICK_REFERENCE.md` - クイックガイド
   - `docs/DATABASE_CURRENT_STATE.md` - 現状確認

2. **コーヒーを飲む** ☕

---

## ✅ 作業チェックリスト（30分）

### Phase 1: 事前確認（5分）

```bash
# バックアップ確認
ls -la backups/20251117_020034/

# 設定ファイル確認
cat .env | grep SUPABASE
cat .env.production | grep SUPABASE

# 両方が xvqpsnrcmkvngxrinjyf を指していることを確認
```

- [ ] バックアップファイルが存在する
- [ ] .env が正しいDB（xvqpsnrcmkvngxrinjyf）を指している
- [ ] .env.production が正しいDB（xvqpsnrcmkvngxrinjyf）を指している

---

### Phase 2: 古いデータベースの削除（5分）

**URL**: https://supabase.com/dashboard

1. [ ] Supabaseダッシュボードにログイン
2. [ ] プロジェクト一覧で `zcflpkmxeupharqbaymc` を見つける
3. [ ] プロジェクトを開く
4. [ ] Settings → General に移動
5. [ ] 一番下の "Delete Project" セクションまでスクロール
6. [ ] プロジェクト名を入力して削除
7. [ ] 削除完了を確認

---

### Phase 3: 認証設定の最適化（3分）

**URL**: https://supabase.com/dashboard

1. [ ] プロジェクト `xvqpsnrcmkvngxrinjyf` を開く
2. [ ] 左メニューから "Authentication" を選択
3. [ ] "Providers" タブをクリック
4. [ ] "Email" を選択
5. [ ] **"Confirm email" をOFF**にする
6. [ ] "Save" をクリック

---

### Phase 4: Vercel設定の確認（5分）

**URL**: https://vercel.com/dashboard

1. [ ] Vercelダッシュボードにログイン
2. [ ] プロジェクトを選択
3. [ ] Settings → Environment Variables に移動
4. [ ] `VITE_SUPABASE_URL` を確認
   - 期待値: `https://xvqpsnrcmkvngxrinjyf.supabase.co`
5. [ ] `VITE_SUPABASE_ANON_KEY` を確認
   - 期待値: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`（.env.productionと同じ）
6. [ ] 違っていたら修正して "Save"
7. [ ] Deployments → 最新デプロイ → "Redeploy" をクリック

---

### Phase 5: 動作確認（12分）

#### Bolt環境（6分）

```bash
# アプリケーションを開く（既に起動している場合はリロード）
```

1. [ ] アプリケーションを開く
2. [ ] ログインページで `kan.yamaji@gmail.com` / `test2025` でログイン
3. [ ] ログイン成功を確認
4. [ ] ダッシュボードでトレードデータが表示されることを確認
5. [ ] カレンダーページを開いて動作を確認
6. [ ] 設定ページを開いて動作を確認

#### Vercel環境（6分）

1. [ ] Vercelのデプロイが完了したらURLを開く
2. [ ] ログインページで `kan.yamaji@gmail.com` / `test2025` でログイン
3. [ ] ログイン成功を確認
4. [ ] ダッシュボードでトレードデータが表示されることを確認
5. [ ] カレンダーページを開いて動作を確認
6. [ ] 設定ページを開いて動作を確認

---

## 🚨 問題が発生したら

### エラー: "Email not confirmed"

```sql
-- Supabase SQLエディタで実行
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE email_confirmed_at IS NULL;
```

### エラー: "Invalid API key"

- `.env` ファイルの `VITE_SUPABASE_ANON_KEY` を確認
- Vercelの環境変数を確認

### エラー: データが表示されない

```sql
-- Supabase SQLエディタで実行
SELECT COUNT(*) FROM trades WHERE user_id = auth.uid();
```

結果が 0 の場合:
- データソースが "demo" になっているか確認（設定ページ）

---

## ✅ 完了後

すべてのチェックが完了したら：

1. [ ] このファイルに完了日時を記録
2. [ ] スクリーンショットを撮る（証拠として）
3. [ ] 深呼吸する 😌

---

## 📝 作業メモ

作業中に気づいたことをメモ：

```
開始時刻: ___:___
終了時刻: ___:___

問題点:


解決方法:


```

---

## 🎉 完了

お疲れ様でした！

データベースが1つに統合され、Bolt/Vercel両方で正しく動作しています。

**完了日時**: _______________
