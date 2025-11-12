import React, { useMemo } from 'react';
import { getAccentColor, getLossColor } from '../../lib/chartColors';
import type { ScoreParts } from '../../types/evaluation.types';

type RadarChartProps = {
  parts: ScoreParts;
};

export default function RadarChart({ parts }: RadarChartProps) {
  const items = [
    { label: 'エントリー技術', value: parts.entry },
    { label: 'DD耐性', value: parts.dd },
    { label: 'リスクリワード', value: parts.rr },
    { label: 'リスク管理', value: parts.risk },
    { label: '収益安定', value: parts.stability },
  ];

  return (
    <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {items.map((item, idx) => (
        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
              {item.label}
            </span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent)' }}>
              {item.value.toFixed(1)}
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            background: 'var(--chip)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(item.value / 10) * 100}%`,
              height: '100%',
              background: 'var(--accent)',
              borderRadius: '4px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}
