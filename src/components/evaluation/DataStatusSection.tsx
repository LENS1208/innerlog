import React from 'react';

export default function DataStatusSection() {
  return (
    <section className="panel" id="sec11">
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
          <div style={{ fontSize: 16, fontWeight: 700 }}>11. データの状態</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            入力健全性、検証ステータス
          </div>
        </div>
      </div>
      <div style={{ padding: 16, textAlign: 'center', color: 'var(--muted)' }}>
        データ結線予定（PHASE 3）
      </div>
    </section>
  );
}
