import React, { useState } from 'react';

type Bias = {
  name: string;
  description: string;
  severity: 'Low' | 'Mid' | 'High';
};

export default function NotesReflectionSection() {
  const [reflection, setReflection] = useState('');

  const emotionTrend = [
    { date: '12/15', emotion: '冷静', score: 8 },
    { date: '12/16', emotion: '焦り', score: 3 },
    { date: '12/17', emotion: '冷静', score: 7 },
    { date: '12/18', emotion: '興奮', score: 5 },
    { date: '12/19', emotion: '冷静', score: 8 },
  ];

  const detectedBiases: Bias[] = [
    {
      name: 'リベンジトレード',
      description: '連敗後に無理なエントリーをする傾向が見られます',
      severity: 'High',
    },
    {
      name: '利小損大',
      description: '勝ちトレードを早く切り、負けトレードを引っ張る傾向',
      severity: 'Mid',
    },
    {
      name: '過信バイアス',
      description: '連勝後にロットサイズを上げる傾向',
      severity: 'Low',
    },
  ];

  const severityColor = (severity: string) => {
    if (severity === 'High') return '#ef4444';
    if (severity === 'Mid') return '#f59e0b';
    return '#3b82f6';
  };

  return (
    <section className="panel" id="sec12">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          borderBottom: '1px solid var(--line)',
        }}
      >
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>メモ・ふり返り</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
            感情トレンド、行動バイアス
          </div>
        </div>
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginBottom: 20, minWidth: 0 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>感情トレンド（直近5日）</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 120 }}>
              {emotionTrend.map((day, idx) => (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div
                    style={{
                      width: '100%',
                      height: `${day.score * 10}%`,
                      background: day.score >= 7 ? '#22c55e' : day.score >= 5 ? '#3b82f6' : '#ef4444',
                      borderRadius: 4,
                    }}
                  />
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{day.date}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)' }}>{day.emotion}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>検出された行動バイアス</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {detectedBiases.map((bias, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 12,
                    border: `1px solid ${severityColor(bias.severity)}`,
                    borderRadius: 8,
                    background: 'var(--surface)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{bias.name}</span>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 10,
                        fontWeight: 700,
                        background: severityColor(bias.severity),
                        color: '#fff',
                      }}
                    >
                      {bias.severity}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{bias.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>ふり返りメモ</div>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="今週の振り返り、気づいたこと、改善点などを記録..."
            style={{
              width: '100%',
              minHeight: 120,
              padding: 12,
              border: '1px solid var(--line)',
              borderRadius: 8,
              fontSize: 13,
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--muted)' }}>
            定期的なふり返りは成長の鍵です。感情、行動パターン、改善点を記録しましょう。
          </div>
        </div>
      </div>
    </section>
  );
}
