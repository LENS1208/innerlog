# 明日やること - データベース統合

## 📌 やること（簡単バージョン）

### 目的
古いSupabaseのデータベースを削除して、1つにまとめる

---

## ステップ1: Supabaseで古いデータベースを削除（5分）

### 手順

1. ブラウザで https://supabase.com/dashboard を開く

2. ログインする

3. プロジェクト一覧が表示される
   - 2つのプロジェクトがあるはず
   - **削除するプロジェクト**: 名前に `zcflpkmxeupharqbaymc` が含まれているもの
   - **残すプロジェクト**: 名前に `xvqpsnrcmkvngxrinjyf` が含まれているもの

4. 削除するプロジェクト（`zcflpkmxeupharqbaymc`）をクリック

5. 左側のメニューから「Settings」をクリック

6. 「General」タブをクリック

7. ページの一番下までスクロール

8. 「Delete Project」というセクションがある

9. プロジェクト名を入力する欄があるので、プロジェクト名を入力

10. 「Delete Project」ボタンをクリック

11. 完了！

---

## ステップ2: 残ったデータベースの設定を変更（3分）

### 手順

1. Supabaseダッシュボードで、残ったプロジェクト（`xvqpsnrcmkvngxrinjyf`）を開く

2. 左側のメニューから「Authentication」をクリック

3. 上部のタブから「Providers」をクリック

4. 「Email」をクリック

5. 「Confirm email」というトグルスイッチを探す

6. このスイッチを**OFF**にする（グレーになればOK）

7. 「Save」ボタンをクリック

8. 完了！

---

## ステップ3: Vercelの設定を確認（5分）

### 手順

1. ブラウザで https://vercel.com/dashboard を開く

2. ログインする

3. あなたのプロジェクトをクリック

4. 上部のメニューから「Settings」をクリック

5. 左側のメニューから「Environment Variables」をクリック

6. `VITE_SUPABASE_URL` という変数を探す

7. この値が `https://xvqpsnrcmkvngxrinjyf.supabase.co` になっているか確認

8. もし違っていたら：
   - 右側の「Edit」をクリック
   - `https://xvqpsnrcmkvngxrinjyf.supabase.co` に変更
   - 「Save」をクリック

9. `VITE_SUPABASE_ANON_KEY` という変数も確認
   - これが以下と同じか確認:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cXBzbnJjbWt2bmd4cmluanlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3OTAzNTEsImV4cCI6MjA3ODM2NjM1MX0.1Mp4Do6fX_7Q_WsKipbDkxHbeNCVGWB6fqiWVForBfc
   ```
   - 違っていたら同じように編集

10. 変更した場合は再デプロイが必要：
    - 上部のメニューから「Deployments」をクリック
    - 一番上のデプロイメントの右側にある「...」をクリック
    - 「Redeploy」をクリック
    - 「Redeploy」を再度クリックして確認

11. 完了！

---

## ステップ4: 動作確認（10分）

### Bolt（このアプリ）で確認

1. アプリのログイン画面を開く

2. 以下でログイン:
   - メール: `kan.yamaji@gmail.com`
   - パスワード: `test2025`

3. ログインできたらOK

4. ダッシュボードでトレードが表示されるか確認

5. カレンダーを開いて表示されるか確認

### Vercel（本番環境）で確認

1. Vercelのデプロイが完了するまで待つ（5-10分）

2. Vercelのプロジェクトページで「Visit」ボタンをクリック

3. ログイン画面が開く

4. 以下でログイン:
   - メール: `kan.yamaji@gmail.com`
   - パスワード: `test2025`

5. ログインできたらOK

6. ダッシュボードでトレードが表示されるか確認

---

## 🚨 エラーが出たら

### 「Email not confirmed」というエラー

1. Supabaseダッシュボードを開く
2. プロジェクト `xvqpsnrcmkvngxrinjyf` を開く
3. 左メニューから「SQL Editor」をクリック
4. 「New query」をクリック
5. 以下をコピー&ペーストして実行:
```sql
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE email_confirmed_at IS NULL;
```

### データが表示されない

1. 設定ページを開く
2. 「データソース」が「demo」になっているか確認
3. なっていなければ「demo」に変更

### その他のエラー

- `docs/DATABASE_CONSOLIDATION_GUIDE.md` を開いて詳細を確認
- または私に質問してください

---

## ✅ 完了したらここにメモ

```
完了日時: 2025年__月__日 __時__分

問題があった？:
□ なかった
□ あった → 内容:


所要時間: ____分
```

---

## 📚 詳しく知りたい場合

- `docs/DATABASE_CONSOLIDATION_GUIDE.md` - 超詳しい説明
- `docs/QUICK_REFERENCE.md` - クイックリファレンス
- `docs/DATABASE_CURRENT_STATE.md` - 現在の状態

---

## 重要ポイント（覚えておくこと）

**削除するDB**: `zcflpkmxeupharqbaymc`（古い方）
**残すDB**: `xvqpsnrcmkvngxrinjyf`（新しい方）

間違えないように！
