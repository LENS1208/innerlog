import React from 'react';
import type { DayTradeRow } from './types';

type DayTradesTableProps = {
  trades: DayTradeRow[];
};

export default function DayTradesTable({ trades }: DayTradesTableProps) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ textAlign: 'left', padding: '6px' }}>決済時間</th>
          <th style={{ textAlign: 'left', padding: '6px' }}>銘柄</th>
          <th style={{ textAlign: 'left', padding: '6px' }}>方向</th>
          <th style={{ textAlign: 'right', padding: '6px' }}>損益</th>
        </tr>
      </thead>
      <tbody>
        {trades.map((trade, idx) => (
          <tr key={idx}>
            <td style={{ padding: '6px' }}>{trade.time}</td>
            <td style={{ padding: '6px' }}>{trade.symbol}</td>
            <td style={{ padding: '6px' }}>{trade.sideJp}</td>
            <td
              style={{ textAlign: 'right', padding: '6px' }}
              className={trade.pnlYen >= 0 ? 'good' : 'bad'}
            >
              {trade.pnlYen >= 0 ? '+' : ''}
              {trade.pnlYen.toLocaleString('ja-JP')}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
