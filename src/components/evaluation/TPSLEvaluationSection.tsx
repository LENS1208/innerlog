import React from 'react';

export default function TPSLEvaluationSection() {
  return (
    <section className="panel" id="sec8">
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
          <div style={{ fontSize: 16, fontWeight: 700 }}>8. 利確と損切りの見直し（TP/SL評価）</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            ストップ妥当性、利確最適化
          </div>
        </div>
      </div>
      <div style={{ padding: 16, textAlign: 'center', color: 'var(--muted)' }}>
        データ結線予定（PHASE 3）
      </div>
    </section>
  );
}
