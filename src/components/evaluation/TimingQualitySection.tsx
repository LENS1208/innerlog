import React from 'react';

export default function TimingQualitySection() {
  return (
    <section className="panel" id="sec5">
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
          <div style={{ fontSize: 16, fontWeight: 700 }}>5. タイミングの質（エントリー/エグジット）</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            MFE/MAE分析、利確・損切りのタイミング評価
          </div>
        </div>
      </div>
      <div style={{ padding: 16, textAlign: 'center', color: 'var(--muted)' }}>
        データ結線予定（PHASE 3）
      </div>
    </section>
  );
}
