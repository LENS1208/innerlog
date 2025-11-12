import React from 'react';
import type { TradeExample } from '../../services/ai-coaching/types';

interface TradeExampleCardProps {
  ex: TradeExample;
}

export function TradeExampleCard({ ex }: TradeExampleCardProps) {
  const isProfit = ex.pnlJPY >= 0;

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        borderRadius: '12px',
        padding: '12px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
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
      <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '4px' }}>
        {ex.lots} lot / {ex.entry} → {ex.exit}
      </div>
      {ex.note && (
        <p style={{ fontSize: '12px', margin: '8px 0 0 0', color: 'var(--ink)' }}>{ex.note}</p>
      )}
    </div>
  );
}
