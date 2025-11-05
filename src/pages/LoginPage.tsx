import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import logoImg from '../assets/inner-log-logo.png';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      window.location.hash = '#/dashboard';
    } catch (error: any) {
      setMessage(error.message || 'ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'パスワードは8文字以上にしてください';
    }
    if (!/^[a-zA-Z0-9]+$/.test(password)) {
      return 'パスワードは半角英数字のみ使用できます';
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      return 'パスワードは英字と数字を両方含める必要があります';
    }
    return null;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const passwordError = validatePassword(password);
    if (passwordError) {
      setMessage(passwordError);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      setMessage('アカウントを作成しました。ログインしてください。');
      setIsLogin(true);
      setPassword('');
    } catch (error: any) {
      setMessage(error.message || 'アカウント作成に失敗しました');
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

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
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
            {isLogin ? 'ログイン' : '新規登録'}
          </h1>
          <p style={{ fontSize: 15, color: '#718096' }}>
            {isLogin ? (
              <>
                新規ユーザーですか？{' '}
                <button
                  onClick={() => setIsLogin(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#48bb78',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  新規登録
                </button>
              </>
            ) : (
              <>
                アカウントをお持ちですか？{' '}
                <button
                  onClick={() => setIsLogin(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#48bb78',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  ログイン
                </button>
              </>
            )}
          </p>
        </div>

        <form onSubmit={isLogin ? handleLogin : handleSignup}>
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
                e.target.style.borderColor = '#667eea';
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
              pattern="[a-zA-Z0-9]+"
              title="半角英数字8文字以上（英字と数字を両方含む）"
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
                e.target.style.borderColor = '#667eea';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
              }}
            />
          </div>

          {isLogin && (
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
                    accentColor: '#48bb78',
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
                  color: '#48bb78',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                パスワードを忘れた方
              </button>
            </div>
          )}

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
              background: loading ? '#a0aec0' : '#48bb78',
              border: 'none',
              borderRadius: 12,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              marginBottom: 16,
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.background = '#38a169';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.background = '#48bb78';
            }}
          >
            {loading ? '処理中...' : isLogin ? 'ログイン' : '新規登録'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <p style={{ fontSize: 13, color: '#a0aec0', marginBottom: 8 }}>
            テストアカウント
          </p>
          <p style={{ fontSize: 12, color: '#718096' }}>
            kan.yamaji@gmail.com / test2025
          </p>
        </div>
      </div>
    </div>
  );
}
