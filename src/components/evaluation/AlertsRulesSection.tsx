import React from 'react';

export default function AlertsRulesSection() {
  return (
    <section className="panel" id="sec10">
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
          <div style={{ fontSize: 16, fontWeight: 700 }}>10. 注意・ルール（アラート&目標）</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            アラート、目標進捗
          </div>
        </div>
      </div>
      <div style={{ padding: 16, textAlign: 'center', color: 'var(--muted)' }}>
        データ結線予定（PHASE 3）
      </div>
    </section>
  );
}
