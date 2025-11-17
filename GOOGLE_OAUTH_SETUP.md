# Google OAuth 設定手順書

**作成日**: 2025-11-17
**対象**: Googleログイン機能を有効化するための設定手順

---

## 📋 概要

このドキュメントは、アプリケーションで Google ログインを有効にするための3ステップの設定手順を説明します。

### 必要な作業
1. Google Cloud Console で OAuth クライアント作成
2. Supabase Dashboard で Google プロバイダー設定
3. フロントエンドに Google ログインボタン実装

---

## ステップ1: Google Cloud Console での設定

### 1-1. Google Cloud Console にアクセス

**URL**: https://console.cloud.google.com/

1. Googleアカウントでログイン
2. 既存のプロジェクトを選択、または新規プロジェクト作成

### 1-2. OAuth 同意画面の設定

1. 左側メニュー → **APIとサービス** → **OAuth 同意画面**
2. User Type を選択：
   - **外部** を選択（一般ユーザーが使用する場合）
   - **内部** を選択（組織内のみ使用する場合）
3. **作成** をクリック

#### 基本情報の入力

| 項目 | 入力内容 |
|------|---------|
| アプリ名 | `Trading Journal` （または任意の名前） |
| ユーザーサポートメール | 管理者のメールアドレス |
| デベロッパーの連絡先情報 | 管理者のメールアドレス |

4. **保存して次へ** をクリック
5. スコープ設定画面では何も追加せず **保存して次へ**
6. テストユーザー設定（外部の場合）では必要に応じて追加
7. **保存して次へ** → 完了

### 1-3. OAuth 2.0 クライアント ID の作成

1. 左側メニュー → **APIとサービス** → **認証情報**
2. 上部の **+ 認証情報を作成** → **OAuth クライアント ID**
3. アプリケーションの種類: **ウェブ アプリケーション**

#### 設定項目

| 項目 | 入力内容 |
|------|---------|
| 名前 | `Trading Journal Web Client` （任意） |
| 承認済みの JavaScript 生成元 | `http://localhost:5173` （開発環境用）<br>`https://your-production-domain.com` （本番環境） |
| 承認済みのリダイレクト URI | **重要**: 以下を正確に入力<br>`https://xvqpsnrcmkvngxrinjyf.supabase.co/auth/v1/callback` |

4. **作成** をクリック

#### 認証情報の保存

作成完了後、以下の情報が表示されます：

```
クライアント ID: XXXXX.apps.googleusercontent.com
クライアント シークレット: GOCSPX-XXXXX
```

**⚠️ この情報を安全な場所に保存してください（次のステップで使用）**

---

## ステップ2: Supabase Dashboard での設定

### 2-1. Supabase Dashboard にアクセス

**URL**: https://supabase.com/dashboard/project/xvqpsnrcmkvngxrinjyf

1. Supabase アカウントでログイン
2. プロジェクト `xvqpsnrcmkvngxrinjyf` を選択

### 2-2. Google プロバイダーを有効化

1. 左側メニュー → **Authentication** → **Providers**
2. プロバイダー一覧から **Google** を探してクリック
3. 以下を設定：

| 項目 | 設定値 |
|------|--------|
| Enable Sign in with Google | **ON** に切り替え |
| Client ID (for OAuth) | ステップ1で取得した `クライアント ID` をペースト |
| Client Secret (for OAuth) | ステップ1で取得した `クライアント シークレット` をペースト |

4. **Save** をクリック

### 2-3. 設定の確認

Redirect URLs セクションに以下が表示されていることを確認：
```
https://xvqpsnrcmkvngxrinjyf.supabase.co/auth/v1/callback
```

この URL が Google Cloud Console の「承認済みのリダイレクト URI」と一致していることを確認してください。

---

## ステップ3: フロントエンドへの実装

### 3-1. LoginPage に Google ログインボタンを追加

`src/pages/LoginPage.tsx` を編集して、Google ログインボタンを追加します。

#### 実装コード例

```typescript
// Google ログインハンドラーを追加
const handleGoogleLogin = async () => {
  setLoading(true);
  setMessage('');

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/#/dashboard`,
      },
    });

    if (error) {
      console.error('Google login error:', error);
      throw error;
    }

    // OAuth フローが開始されます（リダイレクトされます）
  } catch (error: any) {
    console.error('Google login exception:', error);
    setMessage(`Googleログインに失敗しました: ${error.message}`);
    setLoading(false);
  }
};
```

#### ボタンUI の追加

```tsx
{/* Google ログインボタン */}
<button
  type="button"
  onClick={handleGoogleLogin}
  disabled={loading}
  style={{
    width: '100%',
    padding: '12px',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '16px',
  }}
>
  <svg width="18" height="18" viewBox="0 0 18 18">
    {/* Google ロゴ SVG */}
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
    <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.582c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.29C4.672 5.163 6.656 3.582 9 3.582z"/>
  </svg>
  Googleでログイン
</button>

{/* 区切り線 */}
<div style={{
  display: 'flex',
  alignItems: 'center',
  margin: '20px 0',
  color: '#666'
}}>
  <div style={{ flex: 1, height: '1px', backgroundColor: '#ddd' }}></div>
  <span style={{ padding: '0 12px', fontSize: '14px' }}>または</span>
  <div style={{ flex: 1, height: '1px', backgroundColor: '#ddd' }}></div>
</div>

{/* 既存のメール/パスワードフォーム */}
<form onSubmit={handleLogin}>
  {/* ... */}
</form>
```

### 3-2. 認証状態の処理

既存の `AppShell.tsx` で認証状態を監視しているため、追加の変更は不要です。
Google ログイン後、自動的にダッシュボードにリダイレクトされます。

---

## 🧪 テスト手順

### 1. 開発環境でのテスト

1. アプリケーションを起動: `npm run dev`
2. ログイン画面にアクセス: `http://localhost:5173/#/login`
3. **Googleでログイン** ボタンをクリック
4. Google アカウント選択画面が表示される
5. アカウントを選択して認証
6. ダッシュボードにリダイレクトされることを確認

### 2. 初回ログイン時の動作

Google ログインが成功すると：
- `auth.users` テーブルに新規ユーザーが自動作成される
- `auth.identities` テーブルに Google プロバイダー情報が記録される
- `user_settings` テーブルにデフォルト設定が自動作成される（トリガーによる）

### 3. データベース確認

```sql
-- Google でログインしたユーザーを確認
SELECT
  u.id,
  u.email,
  u.created_at,
  i.provider
FROM auth.users u
LEFT JOIN auth.identities i ON u.id = i.user_id
WHERE i.provider = 'google'
ORDER BY u.created_at DESC;
```

---

## ⚠️ トラブルシューティング

### エラー: "Invalid redirect URI"

**原因**: Google Cloud Console の設定と Supabase の Redirect URL が一致していない

**解決策**:
1. Google Cloud Console → 認証情報 → OAuth クライアント
2. 承認済みのリダイレクト URI を確認
3. 以下が正確に登録されているか確認:
   ```
   https://xvqpsnrcmkvngxrinjyf.supabase.co/auth/v1/callback
   ```

### エラー: "Access blocked: This app's request is invalid"

**原因**: OAuth 同意画面の設定が不完全

**解決策**:
1. Google Cloud Console → OAuth 同意画面
2. 公開ステータスが「テスト」の場合、テストユーザーを追加
3. または、公開ステータスを「本番」に変更（審査が必要な場合あり）

### ログイン後にリダイレクトされない

**原因**: `redirectTo` の URL が正しくない

**解決策**:
- 開発環境: `http://localhost:5173/#/dashboard`
- 本番環境: `https://your-domain.com/#/dashboard`

### Google ログインボタンが機能しない

**確認事項**:
1. ブラウザのコンソールでエラーを確認
2. Supabase の Google プロバイダーが有効になっているか確認
3. `.env` ファイルの `VITE_SUPABASE_URL` が正しいか確認

---

## 📝 環境変数

Google OAuth では追加の環境変数は**不要**です。
既存の Supabase 認証情報のみで動作します：

```env
VITE_SUPABASE_URL=https://xvqpsnrcmkvngxrinjyf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...（既存のキー）
```

---

## 🔒 セキュリティのベストプラクティス

1. **Client Secret の管理**
   - Client Secret は Supabase Dashboard にのみ保存
   - フロントエンドコードには**絶対に含めない**
   - Git にコミットしない

2. **リダイレクト URI の制限**
   - 本番環境では本番ドメインのみを登録
   - 開発環境用の URI は別のクライアント ID を使用することを推奨

3. **OAuth 同意画面のスコープ**
   - 最小限のスコープのみ要求
   - デフォルトでは `email` と `profile` のみ

---

## 📚 参考リンク

- [Supabase Auth with Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 設定](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

---

**このドキュメントに関する質問**: プロジェクトリーダーまで
