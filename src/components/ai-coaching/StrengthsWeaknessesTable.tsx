import React from 'react';
import type { StrengthWeaknessRow, EvaluationScore } from '../../services/ai-coaching/types';

interface StrengthsWeaknessesTableProps {
  rows: StrengthWeaknessRow[];
  evaluationScore?: EvaluationScore;
}

export function StrengthsWeaknessesTable({ rows, evaluationScore }: StrengthsWeaknessesTableProps) {
  const scoreMap: Record<string, number | undefined> = {
    'エントリータイミング': evaluationScore?.entryTiming,
    'リスク管理': evaluationScore?.riskManagement,
    '損切り・利確': evaluationScore?.exitStrategy,
    '感情コントロール': evaluationScore?.emotionalControl,
    '一貫性・再現性': evaluationScore?.consistency,
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--line)' }}>
            <th style={{ padding: '10px', textAlign: 'left', fontWeight: 600, color: 'var(--muted)' }}>
              項目
            </th>
            <th style={{ padding: '10px', textAlign: 'center', fontWeight: 600, color: 'var(--muted)', width: '80px' }}>
              点数
            </th>
            <th style={{ padding: '10px', textAlign: 'left', fontWeight: 600, color: 'var(--muted)' }}>
              強み
            </th>
            <th style={{ padding: '10px', textAlign: 'left', fontWeight: 600, color: 'var(--muted)' }}>
              改善案
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const score = scoreMap[row.item];
            return (
              <tr key={i} style={{ borderBottom: '1px solid var(--line)' }}>
                <td style={{ padding: '10px', fontWeight: 600 }}>{row.item}</td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  {score !== undefined ? (
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontWeight: 600,
                        fontSize: '14px',
                        background:
                          score >= 80
                            ? 'rgba(34, 197, 94, 0.1)'
                            : score >= 60
                            ? 'rgba(59, 130, 246, 0.1)'
                            : score >= 40
                            ? 'rgba(251, 191, 36, 0.1)'
                            : 'rgba(239, 68, 68, 0.1)',
                        color:
                          score >= 80
                            ? '#22c55e'
                            : score >= 60
                            ? '#3b82f6'
                            : score >= 40
                            ? '#fbbf24'
                            : '#ef4444',
                      }}
                    >
                      {score}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--muted)' }}>-</span>
                  )}
                </td>
                <td style={{ padding: '10px' }}>{row.strength}</td>
                <td style={{ padding: '10px', color: 'var(--accent)' }}>{row.improvement}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
