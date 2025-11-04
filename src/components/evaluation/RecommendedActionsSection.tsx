import React from 'react';

export default function RecommendedActionsSection() {
  return (
    <section className="panel" id="sec9">
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
          <div style={{ fontSize: 16, fontWeight: 700 }}>9. おすすめ行動（3件＋理由）</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            優先度付き施策リスト
          </div>
        </div>
      </div>
      <div style={{ padding: 16, textAlign: 'center', color: 'var(--muted)' }}>
        データ結線予定（PHASE 3）
      </div>
    </section>
  );
}
