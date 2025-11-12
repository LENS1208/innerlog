import React from 'react';
import type { TradeExample } from '../../services/ai-coaching/types';

interface TradeExampleCardProps {
  ex: TradeExample;
}

export function TradeExampleCard({ ex }: TradeExampleCardProps) {
  const isProfit = ex.pnlJPY >= 0;
  const isGoodExample = ex.note?.includes('良い') || ex.note?.includes('好例') || ex.note?.includes('成功');
  const isOverLotOrCounter = ex.note?.includes('過大') || ex.note?.includes('逆張り');
  const isBadExample = ex.note?.includes('改善') || ex.note?.includes('課題');

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
          {ex.date} · {ex.symbol} · {ex.side}
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
