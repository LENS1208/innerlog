import React from 'react';
import type { Playbook } from '../../services/ai-coaching/types';
import { TradeExampleCard } from './TradeExampleCard';

interface PlaybookViewProps {
  playbook: Playbook;
}

export function PlaybookView({ playbook }: PlaybookViewProps) {
  const trendExamples = Array.isArray(playbook.trendFollowing.example)
    ? playbook.trendFollowing.example
    : playbook.trendFollowing.example
      ? [playbook.trendFollowing.example]
      : [];

  const meanReversionExamples = Array.isArray(playbook.meanReversion.example)
    ? playbook.meanReversion.example
    : playbook.meanReversion.example
      ? [playbook.meanReversion.example]
      : [];

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <style>{`
        .playbook-strategies-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 768px) {
          .playbook-strategies-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .playbook-trade-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        @media (min-width: 640px) {
          .playbook-trade-grid {
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 16px;
          }
        }
      `}</style>

      <div className="playbook-strategies-grid">

      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          borderRadius: '12px',
          padding: '16px',
        }}
      >
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 600, color: 'var(--ink)' }}>
          順張り（メイン戦略）
        </h3>
        <div style={{ fontSize: '14px', marginBottom: '10px' }}>
          <div style={{ fontWeight: 600, marginBottom: '6px', color: 'var(--ink)' }}>エントリー条件：</div>
          <ul style={{ margin: '0 0 8px 20px', padding: 0, lineHeight: 1.6 }}>
            {playbook.trendFollowing.conditions.map((c, i) => (
              <li key={i} style={{ color: 'var(--ink)' }}>{c}</li>
            ))}
          </ul>
        </div>
        <div style={{ fontSize: '14px', marginBottom: '10px' }}>
          <div style={{ fontWeight: 600, marginBottom: '6px', color: 'var(--ink)' }}>エントリー：</div>
          <ul style={{ margin: '0 0 8px 20px', padding: 0, lineHeight: 1.6 }}>
            {playbook.trendFollowing.entry.map((e, i) => (
              <li key={i} style={{ color: 'var(--ink)' }}>{e}</li>
            ))}
          </ul>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
          <div style={{ color: 'var(--ink)' }}>
            <span style={{ fontWeight: 600 }}>SL：</span> {playbook.trendFollowing.sl}
          </div>
          <div style={{ color: 'var(--ink)' }}>
            <span style={{ fontWeight: 600 }}>TP：</span> {playbook.trendFollowing.tp}
          </div>
        </div>
        {trendExamples.length > 0 && (
          <div style={{ marginTop: '12px' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: 'var(--ink)' }}>実例：</div>
            <div className="playbook-trade-grid">
              {trendExamples.map((ex, i) => (
                <TradeExampleCard key={i} ex={ex} />
              ))}
            </div>
          </div>
        )}
        {playbook.trendFollowing.coachNote && (
          <div
            style={{
              marginTop: '12px',
              fontSize: '13px',
              color: 'var(--ink)',
              fontStyle: 'italic',
              padding: '8px',
              background: 'var(--chip)',
              borderRadius: '6px',
            }}
          >
            💡 {playbook.trendFollowing.coachNote}
          </div>
        )}
      </div>

      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          borderRadius: '12px',
          padding: '16px',
        }}
      >
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 600, color: 'var(--ink)' }}>
          逆張り（研究枠）
        </h3>
        <div style={{ fontSize: '14px', marginBottom: '10px' }}>
          <div style={{ fontWeight: 600, marginBottom: '6px', color: 'var(--ink)' }}>条件：</div>
          <ul style={{ margin: '0 0 8px 20px', padding: 0, lineHeight: 1.6 }}>
            {playbook.meanReversion.conditions.map((c, i) => (
              <li key={i} style={{ color: 'var(--ink)' }}>{c}</li>
            ))}
          </ul>
        </div>
        <div style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--ink)' }}>
          <span style={{ fontWeight: 600 }}>ロット管理：</span> {playbook.meanReversion.lotPolicy}
        </div>
        {playbook.meanReversion.timeStop && (
          <div style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--ink)' }}>
            <span style={{ fontWeight: 600 }}>時間制限：</span> {playbook.meanReversion.timeStop}
          </div>
        )}
        {meanReversionExamples.length > 0 && (
          <div style={{ marginTop: '12px' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: 'var(--ink)' }}>実例：</div>
            <div className="playbook-trade-grid">
              {meanReversionExamples.map((ex, i) => (
                <TradeExampleCard key={i} ex={ex} />
              ))}
            </div>
          </div>
        )}
        {playbook.meanReversion.coachNote && (
          <div
            style={{
              marginTop: '12px',
              fontSize: '13px',
              color: 'var(--ink)',
              fontStyle: 'italic',
              padding: '8px',
              background: 'var(--chip)',
              borderRadius: '6px',
            }}
          >
            💡 {playbook.meanReversion.coachNote}
          </div>
        )}
      </div>

      </div>
    </div>
  );
}
