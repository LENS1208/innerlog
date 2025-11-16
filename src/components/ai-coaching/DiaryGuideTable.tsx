import React from 'react';
import type { DiaryGuideRow } from '../../services/ai-coaching/types';

interface DiaryGuideTableProps {
  rows: DiaryGuideRow[];
}

export function DiaryGuideTable({ rows }: DiaryGuideTableProps) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--line)' }}>
            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: 'var(--ink)', fontSize: '14px' }}>
              記録項目
            </th>
            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: 'var(--ink)', fontSize: '14px' }}>
              記録内容
            </th>
            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: 'var(--ink)', fontSize: '14px' }}>
              活用法
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--line)' }}>
              <td style={{ padding: '12px', fontWeight: 600, color: 'var(--ink)' }}>{row.item}</td>
              <td style={{ padding: '12px', color: 'var(--ink)', lineHeight: 1.6 }}>{row.content}</td>
              <td style={{ padding: '12px', color: 'var(--ink)', lineHeight: 1.6 }}>{row.coachNote}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
