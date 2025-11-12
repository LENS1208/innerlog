import React from 'react';
import type { RuleRow } from '../../services/ai-coaching/types';

interface RulesTableProps {
  rules: RuleRow[];
}

export function RulesTable({ rules }: RulesTableProps) {
  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      {rules.map((rule, i) => (
        <div
          key={i}
          style={{
            background: 'var(--chip)',
            border: '1px solid var(--line)',
            borderRadius: '8px',
            padding: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <div
              style={{
                background: 'var(--accent)',
                color: 'white',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              {i + 1}
            </div>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>{rule.title}</div>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--ink)', marginBottom: '6px' }}>
            {rule.content}
          </div>
          {rule.coachNote && (
            <div style={{ fontSize: '12px', color: 'var(--muted)', fontStyle: 'italic' }}>
              💡 {rule.coachNote}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
