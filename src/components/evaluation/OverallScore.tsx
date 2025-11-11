import React from 'react';

type OverallScoreProps = {
  score: number;
  rank: string;
};

export default function OverallScore({ score, rank }: OverallScoreProps) {
  return (
    <div style={{ textAlign: 'center', padding: '12px 0' }}>
      <div
        style={{
          fontSize: 13,
          fontWeight: 'bold',
          color: 'var(--muted)',
          marginBottom: 8,
        }}
      >
        総合スコア（全期間）
      </div>
      <div
        style={{
          fontSize: 56,
          fontWeight: 900,
          lineHeight: 1,
        }}
      >
        {score.toFixed(1)}
      </div>
      <div
        style={{
          marginTop: 4,
          fontSize: 12,
          color: 'var(--muted, #6b7280)',
        }}
      >
        {rank}
      </div>
    </div>
  );
}
