import React from 'react';
import type { DiaryGuideRow } from '../../services/ai-coaching/types';

interface DiaryGuideTableProps {
  rows: DiaryGuideRow[];
}

export function DiaryGuideTable({ rows }: DiaryGuideTableProps) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--line)' }}>
            <th style={{ padding: '10px', textAlign: 'left', fontWeight: 600, color: 'var(--muted)' }}>
              記録項目
            </th>
            <th style={{ padding: '10px', textAlign: 'left', fontWeight: 600, color: 'var(--muted)' }}>
              記録内容
            </th>
            <th style={{ padding: '10px', textAlign: 'left', fontWeight: 600, color: 'var(--muted)' }}>
              活用法
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--line)' }}>
              <td style={{ padding: '10px', fontWeight: 600 }}>{row.item}</td>
              <td style={{ padding: '10px' }}>{row.content}</td>
              <td style={{ padding: '10px', color: 'var(--muted)' }}>{row.coachNote}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
