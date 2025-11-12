import React from 'react';
import type { FourWeekPlanRow } from '../../services/ai-coaching/types';

interface FourWeekPlanTableProps {
  weeks: FourWeekPlanRow[];
}

export function FourWeekPlanTable({ weeks }: FourWeekPlanTableProps) {
  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      {weeks.map((week, i) => (
        <div
          key={i}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: '12px',
            padding: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div
              style={{
                background: 'var(--accent)',
                color: 'white',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              {week.week}
            </div>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>{week.theme}</div>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--ink)', marginBottom: '6px' }}>
            {week.content}
          </div>
          {week.coachNote && (
            <div style={{ fontSize: '12px', color: 'var(--muted)', fontStyle: 'italic' }}>
              💡 {week.coachNote}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
