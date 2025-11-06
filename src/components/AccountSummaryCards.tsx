import React, { useEffect, useState } from 'react';
import { getAccountSummary, type DbAccountSummary } from '../lib/db.service';

export default function AccountSummaryCards() {
  const [summary, setSummary] = useState<DbAccountSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const data = await getAccountSummary();
      console.log('📊 Account summary loaded:', data);
      setSummary(data);
      setError(null);
    } catch (error) {
      console.error('❌ Failed to load account summary:', error);
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        padding: 'var(--space-4)',
        textAlign: 'center',
        color: 'var(--muted)'
      }}>
        読み込み中...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: 'var(--space-4)',
        textAlign: 'center',
        color: 'var(--danger)',
        fontSize: 14,
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        borderRadius: 12,
        marginBottom: 'var(--space-4)',
      }}>
        エラー: {error}
      </div>
    );
  }

  if (!summary) {
    return (
      <div style={{
        padding: 'var(--space-4)',
        textAlign: 'center',
        color: 'var(--muted)',
        fontSize: 14,
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        borderRadius: 12,
        marginBottom: 'var(--space-4)',
      }}>
        📊 サマリー情報を表示するには、HTML形式の取引履歴をアップロードしてください
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const cards = [
    {
      label: '総入金額',
      value: summary.total_deposits,
      color: '#10b981',
      icon: '💰',
    },
    {
      label: '総出金額',
      value: summary.total_withdrawals,
      color: '#ef4444',
      icon: '💸',
    },
    {
      label: 'XMポイント獲得',
      value: summary.xm_points_earned,
      color: '#3b82f6',
      icon: '🎁',
    },
    {
      label: 'XMポイント利用',
      value: summary.xm_points_used,
      color: '#8b5cf6',
      icon: '✨',
    },
    {
      label: 'スワップ損益',
      value: summary.total_swap,
      color: summary.total_swap >= 0 ? '#10b981' : '#ef4444',
      icon: '📊',
    },
    {
      label: '純損益 (Closed P/L)',
      value: summary.closed_pl,
      color: summary.closed_pl >= 0 ? '#10b981' : '#ef4444',
      icon: '💵',
    },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: 'var(--space-3)',
      marginBottom: 'var(--space-4)',
    }}>
      {cards.map((card, index) => (
        <div
          key={index}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 12,
            padding: 'var(--space-3)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              {card.label}
            </span>
            <span style={{ fontSize: 20 }}>{card.icon}</span>
          </div>
          <div style={{
            fontSize: 28,
            fontWeight: 700,
            color: card.color,
            fontVariantNumeric: 'tabular-nums',
          }}>
            {formatCurrency(card.value)}
          </div>
        </div>
      ))}
    </div>
  );
}
