import React from 'react';
import type { DayTradeRow } from './types';

type DayTradesTableProps = {
  trades: DayTradeRow[];
};

export default function DayTradesTable({ trades }: DayTradesTableProps) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--line)' }}>
            <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>決済時間</th>
            <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>銘柄</th>
            <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>方向</th>
            <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>損益</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade, idx) => (
            <tr
              key={idx}
              className="trade-row"
              style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }}
            >
              <td style={{ padding: '12px 8px', fontSize: 13 }}>{trade.time}</td>
              <td style={{ padding: '12px 8px', fontSize: 13 }}>{trade.symbol}</td>
              <td style={{ padding: '12px 8px', fontSize: 13 }}>{trade.sideJp}</td>
              <td
                style={{
                  padding: '12px 8px',
                  fontSize: 14,
                  fontWeight: 600,
                  textAlign: 'right',
                  color: trade.pnlYen >= 0 ? 'var(--gain)' : 'var(--loss)'
                }}
              >
                {trade.pnlYen >= 0 ? '+' : ''}¥{Math.abs(trade.pnlYen).toLocaleString('ja-JP')}円
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
