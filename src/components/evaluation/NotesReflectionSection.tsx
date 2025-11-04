import React from 'react';

export default function NotesReflectionSection() {
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
          <div style={{ fontSize: 16, fontWeight: 700 }}>12. メモ・ふり返り</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            感情トレンド、行動バイアス
          </div>
        </div>
      </div>
      <div style={{ padding: 16, textAlign: 'center', color: 'var(--muted)' }}>
        データ結線予定（PHASE 3）
      </div>
    </section>
  );
}
