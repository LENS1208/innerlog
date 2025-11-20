import React from 'react';
import type { Playbook } from '../../services/ai-coaching/types';
import { TradeExampleCard } from './TradeExampleCard';
import { CoachBubble } from './CoachBubble';

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
        .strategy-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          margin-left: 8px;
        }
        .strategy-badge-main {
          background: var(--profit-bg);
          color: var(--profit);
        }
        .strategy-badge-sub {
          background: var(--chip);
          color: var(--muted);
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

      <CoachBubble message="あなたの取引データから、2つの戦略パターンを分析しました。「トレンド順張り」は実績があり積極的に使える戦略、「逆張り」は慎重に研究しながら活用する戦略です。" />

      <div className="playbook-strategies-grid">

      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          borderRadius: '12px',
          padding: '16px',
        }}
      >
        <h3 style={{ margin: '0 0 8px 0', fontSize: '17px', fontWeight: 700, color: 'var(--ink)', display: 'flex', alignItems: 'center' }}>
          トレンド順張り
          <span className="strategy-badge strategy-badge-main">推奨</span>
        </h3>
        <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--ink)', lineHeight: 1.6 }}>
          トレンドの流れに乗って利益を狙う戦略。あなたの勝率が高い得意パターンです。
        </p>
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
            <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: 'var(--ink)' }}>参考となる取引例：</div>
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
        <h3 style={{ margin: '0 0 8px 0', fontSize: '17px', fontWeight: 700, color: 'var(--ink)', display: 'flex', alignItems: 'center' }}>
          逆張り
          <span className="strategy-badge strategy-badge-sub">少額で検証</span>
        </h3>
        <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--ink)', lineHeight: 1.6 }}>
          価格の反発を狙う戦略。小さなロットで慎重に取り組むことを推奨します。
        </p>
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
            <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: 'var(--ink)' }}>参考となる取引例：</div>
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
