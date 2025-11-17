import { useState, useEffect, ReactNode } from 'react';
import './BasicAuth.css';

interface BasicAuthProps {
  children: ReactNode;
}

const VALID_USERNAME = 'inner';
const VALID_PASSWORD = 'test';
const AUTH_KEY = 'basicAuthToken';

export function BasicAuth({ children }: BasicAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = sessionStorage.getItem(AUTH_KEY);
    if (token === btoa(`${VALID_USERNAME}:${VALID_PASSWORD}`)) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      const token = btoa(`${username}:${password}`);
      sessionStorage.setItem(AUTH_KEY, token);
      setIsAuthenticated(true);
    } else {
      setError('ユーザー名またはパスワードが正しくありません');
      setPassword('');
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="basic-auth-container">
      <div className="basic-auth-box">
        <div className="basic-auth-header">
          <h1>認証が必要です</h1>
          <p>ログインしてください</p>
        </div>

        <form onSubmit={handleSubmit} className="basic-auth-form">
          <div className="form-group">
            <label htmlFor="username">ユーザー名</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ユーザー名を入力"
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">パスワード</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワードを入力"
              autoComplete="current-password"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-button">
            ログイン
          </button>
        </form>
      </div>
    </div>
  );
}
