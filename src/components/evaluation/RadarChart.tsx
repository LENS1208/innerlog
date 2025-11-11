import React, { useMemo } from 'react';
import type { ScoreParts } from '../../types/evaluation.types';

type RadarChartProps = {
  parts: ScoreParts;
};

export default function RadarChart({ parts }: RadarChartProps) {
  const labels = ['エントリー技術', 'DD耐性', 'リスクリワード', 'リスク管理', '収益安定'];
  const values = [parts.entry, parts.dd, parts.rr, parts.risk, parts.stability];

  const W = 320;
  const H = 260;
  const cx = W / 2;
  const cy = H / 2;
  const R = 100;
  const axes = values.length;

  const webLevels = useMemo(() => {
    return [1, 2, 3, 4, 5].map((level) => {
      const rr = R * (level / 5);
      let points = '';
      for (let i = 0; i < axes; i++) {
        const ang = -Math.PI / 2 + (i * 2 * Math.PI) / axes;
        const x = cx + rr * Math.cos(ang);
        const y = cy + rr * Math.sin(ang);
        points += `${x},${y} `;
      }
      return points.trim();
    });
  }, [axes]);

  const axisLines = useMemo(() => {
    return values.map((_, i) => {
      const ang = -Math.PI / 2 + (i * 2 * Math.PI) / axes;
      return {
        x1: cx,
        y1: cy,
        x2: cx + R * Math.cos(ang),
        y2: cy + R * Math.sin(ang),
      };
    });
  }, [axes]);

  const labelPositions = useMemo(() => {
    return labels.map((label, i) => {
      const ang = -Math.PI / 2 + (i * 2 * Math.PI) / axes;
      const x = cx + (R + 16) * Math.cos(ang);
      const y = cy + (R + 16) * Math.sin(ang);
      return { label, x, y };
    });
  }, [axes, labels]);

  const dataPoints = useMemo(() => {
    let points = '';
    for (let i = 0; i < axes; i++) {
      const v = Math.max(0, Math.min(10, values[i])) / 10;
      const ang = -Math.PI / 2 + (i * 2 * Math.PI) / axes;
      const x = cx + R * v * Math.cos(ang);
      const y = cy + R * v * Math.sin(ang);
      points += `${x},${y} `;
    }
    return points.trim();
  }, [values, axes]);

  return (
    <div style={{ padding: '12px 0' }}>
      <div style={{ fontSize: 12, fontWeight: 'bold', color: 'var(--muted)', marginBottom: 8, textAlign: 'center' }}>
        レーダーチャート（5項目）
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', maxHeight: 220 }}
        aria-label="評価レーダー"
      >
        {webLevels.map((points, idx) => (
          <polygon
            key={`web-${idx}`}
            points={points}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}
        {axisLines.map((line, idx) => (
          <line
            key={`axis-${idx}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}
        {labelPositions.map((pos, idx) => (
          <text
            key={`label-${idx}`}
            x={pos.x}
            y={pos.y}
            fontSize="11"
            textAnchor="middle"
            fill="#9fb1c1"
          >
            {pos.label}
          </text>
        ))}
        <polygon
          points={dataPoints}
          fill="rgba(107,177,255,0.25)"
          stroke="#6bb1ff"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}
