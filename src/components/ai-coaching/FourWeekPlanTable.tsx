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
            <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--ink)' }}>{week.theme}</div>
          </div>
          <div style={{ fontSize: '14px', color: 'var(--ink)', marginBottom: '8px', lineHeight: 1.6 }}>
            {week.content}
          </div>
          {week.coachNote && (
            <div style={{ fontSize: '13px', color: 'var(--muted)', fontStyle: 'italic', lineHeight: 1.5 }}>
              💡 {week.coachNote}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
