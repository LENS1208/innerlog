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
        padding: 16,
        minHeight: 300,
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 'bold',
            color: 'var(--muted)',
            marginBottom: 12,
            textAlign: 'center',
          }}
        >
          総合スコア（全期間）
        </div>
        <div style={{ textAlign: 'center' }}>
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
    </div>
  );
}
