import React from 'react';
import { getAccentColor, getLossColor } from '../../lib/chartColors';

type OverallScoreProps = {
  score: number;
  rank: string;
};

export default function OverallScore({ score, rank }: OverallScoreProps) {
  return (
    <div style={{
      width: '100%',
      aspectRatio: '1 / 1',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center'
    }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 'bold',
          color: 'var(--muted)',
          marginBottom: 8,
        }}
      >
        総合スコア（全期間）
      </div>
      <div
        style={{
          fontSize: 48,
          fontWeight: 900,
          lineHeight: 1,
        }}
      >
        {score.toFixed(1)}
      </div>
      <div
        style={{
          marginTop: 4,
          fontSize: 11,
          color: 'var(--muted, #6b7280)',
        }}
      >
        {rank}
      </div>
    </div>
  );
}
