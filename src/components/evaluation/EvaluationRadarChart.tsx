import React, { useMemo } from 'react';

type RadarItem = {
  label: string;
  value: number;
};

type EvaluationRadarChartProps = {
  parts: RadarItem[];
  centerScore?: number;
};

export function EvaluationRadarChart({ parts, centerScore }: EvaluationRadarChartProps) {
  const W = 280;
  const H = 240;
  const cx = W / 2;
  const cy = H / 2;
  const R = 80;
  const axes = parts.length;

  const webLevels = useMemo(() => {
    return [20, 40, 60, 80, 100].map((level) => {
      const rr = R * (level / 100);
      let points = '';
      for (let i = 0; i < axes; i++) {
        const ang = -Math.PI / 2 + (i * 2 * Math.PI) / axes;
        const x = cx + rr * Math.cos(ang);
        const y = cy + rr * Math.sin(ang);
        points += `${x},${y} `;
      }
      return { points: points.trim(), level };
    });
  }, [axes]);

  const axisLines = useMemo(() => {
    return parts.map((_, i) => {
      const ang = -Math.PI / 2 + (i * 2 * Math.PI) / axes;
      return {
        x1: cx,
        y1: cy,
        x2: cx + R * Math.cos(ang),
        y2: cy + R * Math.sin(ang),
      };
    });
  }, [axes, parts]);

  const labelPositions = useMemo(() => {
    return parts.map((item, i) => {
      const ang = -Math.PI / 2 + (i * 2 * Math.PI) / axes;
      const x = cx + (R + 24) * Math.cos(ang);
      const y = cy + (R + 24) * Math.sin(ang);
      return { label: item.label, value: item.value, x, y };
    });
  }, [axes, parts]);

  const dataPoints = useMemo(() => {
    let points = '';
    for (let i = 0; i < axes; i++) {
      const v = Math.max(0, Math.min(100, parts[i].value)) / 100;
      const ang = -Math.PI / 2 + (i * 2 * Math.PI) / axes;
      const x = cx + R * v * Math.cos(ang);
      const y = cy + R * v * Math.sin(ang);
      points += `${x},${y} `;
    }
    return points.trim();
  }, [parts, axes]);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%' }}
        aria-label="評価レーダー"
      >
        {webLevels.map((web, idx) => (
          <polygon
            key={`web-${idx}`}
            points={web.points}
            fill="none"
            stroke={idx === 4 ? "#9ca3af" : "#e5e7eb"}
            strokeWidth={idx === 4 ? "1" : "0.7"}
          />
        ))}
        {axisLines.map((line, idx) => (
          <line
            key={`axis-${idx}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="#d1d5db"
            strokeWidth="1"
          />
        ))}
        {labelPositions.map((pos, idx) => (
          <text
            key={`label-${idx}`}
            x={pos.x}
            y={pos.y}
            fontSize="11"
            fontWeight="600"
            textAnchor="middle"
            fill="var(--ink)"
          >
            {pos.label}
          </text>
        ))}
        <polygon
          points={dataPoints}
          fill="var(--accent)"
          fillOpacity="0.3"
          stroke="var(--accent)"
          strokeWidth="2"
        />
        {parts.map((item, idx) => {
          const v = Math.max(0, Math.min(100, item.value)) / 100;
          const ang = -Math.PI / 2 + (idx * 2 * Math.PI) / axes;
          const x = cx + R * v * Math.cos(ang);
          const y = cy + R * v * Math.sin(ang);
          return (
            <circle
              key={`point-${idx}`}
              cx={x}
              cy={y}
              r="3"
              fill="var(--accent)"
              stroke="#fff"
              strokeWidth="1.5"
            />
          );
        })}
        {centerScore !== undefined && (
          <text
            x={cx}
            y={cy + 6}
            fontSize="32"
            fontWeight="900"
            textAnchor="middle"
            fill="var(--ink)"
          >
            {centerScore.toFixed(1)}
          </text>
        )}
      </svg>
    </div>
  );
}
