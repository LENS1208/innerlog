import React from 'react';
import type { StrengthWeaknessRow, EvaluationScore } from '../../services/ai-coaching/types';

interface StrengthsWeaknessesTableProps {
  rows: StrengthWeaknessRow[];
  evaluationScore?: EvaluationScore;
}

export function StrengthsWeaknessesTable({ rows, evaluationScore }: StrengthsWeaknessesTableProps) {
  const fixedItems = [
    { key: 'entryTiming', label: 'エントリータイミング', aliases: ['エントリー精度', 'エントリー'] },
    { key: 'riskManagement', label: 'リスク管理', aliases: ['ロット管理', '資金管理'] },
    { key: 'exitStrategy', label: '損切り・利確', aliases: ['出口戦略', 'SL/TP'] },
    { key: 'emotionalControl', label: '感情コントロール', aliases: ['感情制御', 'メンタル管理'] },
    { key: 'consistency', label: '一貫性・再現性', aliases: ['一貫性', '再現性'] },
  ];

  const rowMap = new Map<string, StrengthWeaknessRow>();
  rows.forEach(r => {
    rowMap.set(r.item, r);
  });

  const findRow = (label: string, aliases: string[]) => {
    if (rowMap.has(label)) return rowMap.get(label);
    for (const alias of aliases) {
      if (rowMap.has(alias)) return rowMap.get(alias);
    }
    for (const [key, value] of rowMap.entries()) {
      if (key.includes(label) || label.includes(key)) return value;
      for (const alias of aliases) {
        if (key.includes(alias) || alias.includes(key)) return value;
      }
    }
    return undefined;
  };

  const displayRows = fixedItems.map(({ key, label, aliases }) => {
    const existingRow = findRow(label, aliases);
    const score = evaluationScore ? evaluationScore[key as keyof typeof evaluationScore] as number : undefined;

    return {
      item: label,
      score,
      strength: existingRow?.strength || 'データを取得できませんでした',
      improvement: existingRow?.improvement || 'データを取得できませんでした',
    };
  });

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
          {displayRows.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--line)' }}>
              <td style={{ padding: '10px', fontWeight: 600 }}>{row.item}</td>
              <td style={{ padding: '10px', textAlign: 'center' }}>
                {row.score !== undefined ? (
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontWeight: 600,
                      fontSize: '14px',
                      background:
                        row.score >= 80
                          ? 'rgba(34, 197, 94, 0.1)'
                          : row.score >= 60
                          ? 'rgba(59, 130, 246, 0.1)'
                          : row.score >= 40
                          ? 'rgba(251, 191, 36, 0.1)'
                          : 'rgba(239, 68, 68, 0.1)',
                      color:
                        row.score >= 80
                          ? '#22c55e'
                          : row.score >= 60
                          ? '#3b82f6'
                          : row.score >= 40
                          ? '#fbbf24'
                          : '#ef4444',
                    }}
                  >
                    {row.score}
                  </span>
                ) : (
                  <span style={{ color: 'var(--muted)' }}>-</span>
                )}
              </td>
              <td style={{ padding: '10px' }}>{row.strength}</td>
              <td style={{ padding: '10px', color: 'var(--accent)' }}>{row.improvement}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
