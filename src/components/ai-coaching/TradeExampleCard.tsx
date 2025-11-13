import React from 'react';
import type { TradeExample } from '../../services/ai-coaching/types';

interface TradeExampleCardProps {
  ex: TradeExample;
}

export function TradeExampleCard({ ex }: TradeExampleCardProps) {
  const isProfit = ex.pnlJPY >= 0;
  const note = ex.note || '';

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  };

  const formatSide = (side: string) => {
    if (side === "LONG" || side === "BUY" || side === "買い") return "買い";
    if (side === "SHORT" || side === "SELL" || side === "売り") return "売り";
    return side;
  };

  const isGoodExample =
    note.includes('良い') ||
    note.includes('好例') ||
    note.includes('成功') ||
    note.includes('綺麗') ||
    note.includes('理想') ||
    note.includes('完璧') ||
    note.includes('適切') ||
    (isProfit && (note.includes('利確') || note.includes('勝ち') || note.includes('プラス')));

  const isOverLotOrCounter =
    note.includes('過大') ||
    note.includes('逆張り') ||
    note.includes('大きすぎ') ||
    note.includes('ロット大');

  const isBadExample =
    note.includes('改善') ||
    note.includes('課題') ||
    note.includes('注意') ||
    note.includes('反省') ||
    (!isProfit && (note.includes('損切り') || note.includes('負け') || note.includes('マイナス')));

  let iconType: 'good' | 'warning' | 'bad' | null = null;
  let iconSymbol = '';
  let iconBg = '';
  let iconColor = '';

  if (isGoodExample) {
    iconType = 'good';
    iconSymbol = '✓';
    iconBg = 'var(--gain-bg)';
    iconColor = 'var(--gain)';
  } else if (isOverLotOrCounter) {
    iconType = 'warning';
    iconSymbol = '⚠';
    iconBg = '#FEF3C7';
    iconColor = '#D97706';
  } else if (isBadExample) {
    iconType = 'bad';
    iconSymbol = '!';
    iconBg = 'var(--loss-bg)';
    iconColor = 'var(--loss)';
  } else if (isProfit && ex.pnlJPY > 10000) {
    iconType = 'good';
    iconSymbol = '✓';
    iconBg = 'var(--gain-bg)';
    iconColor = 'var(--gain)';
  } else if (!isProfit && ex.pnlJPY < -10000) {
    iconType = 'bad';
    iconSymbol = '!';
    iconBg = 'var(--loss-bg)';
    iconColor = 'var(--loss)';
  }

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        borderRadius: '12px',
        padding: '12px',
        position: 'relative',
      }}
    >
      {iconType && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            background: iconBg,
            color: iconColor,
            fontWeight: 'bold',
          }}
        >
          {iconSymbol}
        </div>
      )}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
          paddingLeft: iconType ? '32px' : '0',
        }}
      >
        <div style={{ fontWeight: 600, fontSize: '14px' }}>
          {formatDate(ex.date)} · {ex.symbol} · {formatSide(ex.side)}
        </div>
        <div
          style={{
            fontSize: '12px',
            padding: '4px 8px',
            borderRadius: '12px',
            background: isProfit ? 'var(--gain-bg)' : 'var(--loss-bg)',
            color: isProfit ? 'var(--gain)' : 'var(--loss)',
            fontWeight: 600,
          }}
        >
          {ex.pnlJPY.toLocaleString('ja-JP')} 円
        </div>
      </div>
      <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '4px', paddingLeft: iconType ? '32px' : '0' }}>
        {ex.lots} lot / {ex.entry} → {ex.exit}
      </div>
      {ex.note && (
        <p style={{ fontSize: '12px', margin: '8px 0 0 0', color: 'var(--ink)', paddingLeft: iconType ? '32px' : '0' }}>{ex.note}</p>
      )}
    </div>
  );
}
