import React from 'react';
import type { RuleRow } from '../../services/ai-coaching/types';

interface RulesTableProps {
  rules: RuleRow[];
}

export function RulesTable({ rules }: RulesTableProps) {
  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      {rules.map((rule, i) => (
        <div
          key={i}
          style={{
            background: 'var(--chip)',
            border: '1px solid var(--line)',
            borderRadius: '8px',
            padding: '16px',
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
            <div style={{ fontWeight: 700, fontSize: '17px', color: 'var(--ink)' }}>{rule.title}</div>
          </div>
          <div style={{ fontSize: '16px', color: 'var(--ink)', marginBottom: '10px', lineHeight: 1.8, fontWeight: 500 }}>
            {rule.content}
          </div>
          {rule.coachNote && (
            <div style={{ fontSize: '15px', color: 'var(--ink)', fontStyle: 'italic', lineHeight: 1.6, opacity: 0.8 }}>
              💡 {rule.coachNote}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
