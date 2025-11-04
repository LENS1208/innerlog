import React from 'react';

export default function RiskAnalysisSection() {
  return (
    <section className="panel" id="sec6">
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
          <div style={{ fontSize: 16, fontWeight: 700 }}>6. リスクのようす（DD/連敗）</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            エクイティカーブ、ドローダウン、連敗確率
          </div>
        </div>
      </div>
      <div style={{ padding: 16, textAlign: 'center', color: 'var(--muted)' }}>
        データ結線予定（PHASE 3）
      </div>
    </section>
  );
}
