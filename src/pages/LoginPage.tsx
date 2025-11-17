import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTheme } from '../lib/theme.context';
import logoImgLight from '../assets/inner-log-logo-l.png';
import logoImgDark from '../assets/inner-log-logo-d.png';

export default function LoginPage() {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const logoImg = theme === 'dark' ? logoImgLight : logoImgDark;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      console.log('Attempting login with:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Login response:', { data, error });

      if (error) {
        console.error('Login error:', error);
        throw error;
      }

      console.log('Login successful, redirecting...');
      window.location.hash = '#/dashboard';
    } catch (error: any) {
      console.error('Login exception:', error);
      const errorMsg = error.message || 'ログインに失敗しました';
      setMessage(`${errorMsg} (詳細: ${JSON.stringify(error)})`);
    } finally {
      setLoading(false);
    }
  };


  const handleResetPassword = async () => {
    if (!email) {
      setMessage('メールアドレスを入力してください');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/#/reset-password`,
      });

      if (error) throw error;

      setMessage('パスワードリセットのメールを送信しました');
    } catch (error: any) {
      setMessage(error.message || 'メール送信に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/#/dashboard`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      setMessage(error.message || 'Googleログインに失敗しました');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        padding: 20,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          background: '#fff',
          borderRadius: 16,
          padding: '48px 40px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img
            src={logoImg}
            alt="inner log"
            style={{ height: 48, marginBottom: 24 }}
          />
          <h1
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: '#1a202c',
              marginBottom: 8,
            }}
          >
            ログイン
          </h1>
          <p style={{ fontSize: 15, color: '#718096' }}>
            新規ユーザーですか？{' '}
            <button
              onClick={() => (window.location.hash = '#/signup')}
              style={{
                background: 'none',
                border: 'none',
                color: '#0084c7',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              新規登録
            </button>
          </p>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: 15,
            fontWeight: 600,
            color: '#1a202c',
            background: '#fff',
            border: '2px solid #e2e8f0',
            borderRadius: 12,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.background = '#f8fafc';
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.background = '#fff';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path
              fill="#4285F4"
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
            />
            <path
              fill="#34A853"
              d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z"
            />
            <path
              fill="#FBBC05"
              d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z"
            />
            <path
              fill="#EA4335"
              d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z"
            />
          </svg>
          Googleでログイン
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          <span style={{ fontSize: 14, color: '#a0aec0' }}>または</span>
          <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 600,
                color: '#4a5568',
                marginBottom: 8,
              }}
            >
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: 16,
                border: '2px solid #e2e8f0',
                borderRadius: 12,
                outline: 'none',
                transition: 'all 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0084c7';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 600,
                color: '#4a5568',
                marginBottom: 8,
              }}
            >
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              title="8文字以上"
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: 16,
                border: '2px solid #e2e8f0',
                borderRadius: 12,
                outline: 'none',
                transition: 'all 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0084c7';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 24,
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                fontSize: 14,
                color: '#4a5568',
              }}
            >
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  width: 18,
                  height: 18,
                  cursor: 'pointer',
                  accentColor: '#0084c7',
                }}
              />
              ログイン状態を保持
            </label>
            <button
              type="button"
              onClick={handleResetPassword}
              style={{
                background: 'none',
                border: 'none',
                color: '#0084c7',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              パスワードを忘れた方
            </button>
          </div>

          {message && (
            <div
              style={{
                padding: 12,
                marginBottom: 20,
                borderRadius: 8,
                fontSize: 14,
                background: message.includes('失敗') ? '#fed7d7' : '#c6f6d5',
                color: message.includes('失敗') ? '#742a2a' : '#22543d',
                border: `1px solid ${message.includes('失敗') ? '#fc8181' : '#9ae6b4'}`,
              }}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              fontSize: 16,
              fontWeight: 700,
              color: '#fff',
              background: loading ? '#a0aec0' : '#0084c7',
              border: 'none',
              borderRadius: 12,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              marginBottom: 16,
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.background = '#006ba3';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.background = '#0084c7';
            }}
          >
            {loading ? '処理中...' : 'ログイン'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, padding: '16px', background: '#f8fafc', borderRadius: 8 }}>
          <p style={{ fontSize: 13, color: '#4a5568', marginBottom: 12, fontWeight: 600 }}>
            テストアカウント
          </p>
          <button
            onClick={() => {
              setEmail('kan.yamaji@gmail.com');
              setPassword('test2025');
            }}
            style={{
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 600,
              color: '#fff',
              background: '#48bb78',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#38a169';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#48bb78';
            }}
          >
            kan.yamaji@gmail.com / test2025
          </button>
          <p style={{ fontSize: 12, color: '#718096', marginTop: 12, lineHeight: '1.6' }}>
            クリックするとテストアカウント情報が自動入力されます
          </p>
        </div>
      </div>
    </div>
  );
}
