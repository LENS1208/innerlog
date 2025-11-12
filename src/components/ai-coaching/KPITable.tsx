import React from 'react';
import type { KPIRow } from '../../services/ai-coaching/types';

interface KPITableProps {
  kpis: KPIRow[];
}

export function KPITable({ kpis }: KPITableProps) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--line)' }}>
            <th style={{ padding: '10px', textAlign: 'left', fontWeight: 600, color: 'var(--muted)' }}>
              指標
            </th>
            <th style={{ padding: '10px', textAlign: 'left', fontWeight: 600, color: 'var(--muted)' }}>
              目標値
            </th>
            <th style={{ padding: '10px', textAlign: 'left', fontWeight: 600, color: 'var(--muted)' }}>
              説明
            </th>
          </tr>
        </thead>
        <tbody>
          {kpis.map((kpi, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--line)' }}>
              <td style={{ padding: '10px', fontWeight: 600 }}>{kpi.metric}</td>
              <td style={{ padding: '10px', color: 'var(--accent)', fontWeight: 600 }}>{kpi.target}</td>
              <td style={{ padding: '10px', color: 'var(--muted)' }}>{kpi.coachNote}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
