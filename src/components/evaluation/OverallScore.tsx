import React from 'react';

type OverallScoreProps = {
  score: number;
  rank: string;
};

export default function OverallScore({ score, rank }: OverallScoreProps) {
  return (
    <div
      className="panel"
      style={{
        padding: 20,
        minHeight: 300,
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 'bold', color: 'var(--muted)', marginBottom: 12 }}>
        総合スコア（全期間）
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            lineHeight: 1,
          }}
        >
          {score.toFixed(1)}
        </div>
        <div
          style={{
            marginTop: 6,
            fontSize: 12,
            color: 'var(--muted, #6b7280)',
          }}
        >
          {rank}
        </div>
      </div>
    </div>
  );
}
