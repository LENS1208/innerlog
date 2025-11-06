import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import defaultAvatar from '../assets/image copy copy copy copy copy copy copy.png';

export default function UserMenu() {
  const [user, setUser] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '#/login';
  };

  const handleSettings = () => {
    setShowMenu(false);
    window.location.href = '#/settings';
  };

  if (!user) {
    return null;
  }

  const avatarUrl = user.user_metadata?.avatar_url || defaultAvatar;

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: '2px solid var(--line)',
          background: 'var(--surface)',
          cursor: 'pointer',
          padding: 0,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label="ユーザーメニュー"
      >
        <img
          src={avatarUrl}
          alt="User avatar"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultAvatar;
          }}
        />
      </button>

      {showMenu && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 12,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            minWidth: 180,
            zIndex: 1000,
          }}
        >
          <button
            onClick={handleSettings}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'transparent',
              border: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: 14,
              color: '#111827',
              borderBottom: '1px solid var(--line)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M12 1v6m0 6v6m-9-9h6m6 0h6m-2.636-6.364L16.95 7.05m-9.9 9.9l-1.414 1.414m12.728 0L16.95 16.95m-9.9-9.9L5.636 5.636"></path>
            </svg>
            設定
          </button>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'transparent',
              border: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: 14,
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(220, 38, 38, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            ログアウト
          </button>
        </div>
      )}
    </div>
  );
}
