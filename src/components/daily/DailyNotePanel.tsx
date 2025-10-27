import React from 'react';
import DayTradesTable from './DayTradesTable';
import LinkedNotesTable from './LinkedNotesTable';
import AiAdviceBlock from './AiAdviceBlock';
import TextareaGroup from './TextareaGroup';
import type {
  DailyKpi,
  DayTradeRow,
  LinkedNoteRow,
  AiAdvice,
  TextareaGroupValue,
} from './types';

export type DailyNotePanelProps = {
  dateJst: string;
  kpi: DailyKpi;
  trades: DayTradeRow[];
  linkedNotes: LinkedNoteRow[];
  advice: AiAdvice;
  values: TextareaGroupValue;
  onPrevDay?: () => void;
  onNextDay?: () => void;
  onOpenTradesList?: () => void;
  onOpenLinkedNote?: (title: string) => void;
  onGenerateAdvice?: () => void;
  onRegenerateAdvice?: () => void;
  onPinAdvice?: () => void;
  onChangeValues?: (v: TextareaGroupValue) => void;
  onSave?: () => void;
};

export default function DailyNotePanel({
  dateJst,
  kpi,
  trades,
  linkedNotes,
  advice,
  values,
  onPrevDay,
  onNextDay,
  onOpenLinkedNote,
  onGenerateAdvice,
  onRegenerateAdvice,
  onPinAdvice,
  onChangeValues,
  onSave,
}: DailyNotePanelProps) {
  const avgYenClass = kpi.avgYenPerTrade >= 0 ? 'good' : 'bad';
  const totalPipsClass = kpi.totalPips >= 0 ? 'good' : 'bad';

  return (
    <section className="pane">
      <div className="head">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>日次ノート（表示）</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onPrevDay}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: 8,
                padding: '8px 14px',
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              ← 前日
            </button>
            <button
              onClick={onNextDay}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: 8,
                padding: '8px 14px',
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              翌日 →
            </button>
          </div>
        </div>
      </div>
      <div className="body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-title">勝率</div>
            <div className="kpi-value">{kpi.winRate.toFixed(1)}%</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-title">取引件数</div>
            <div className="kpi-value">{kpi.trades}件</div>
            <div className="kpi-desc">勝ち：{kpi.wins}｜負け：{kpi.losses}</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-title">平均損益</div>
            <div className={`kpi-value ${avgYenClass}`}>
              {kpi.avgYenPerTrade >= 0 ? '+' : ''}{Math.round(kpi.avgYenPerTrade).toLocaleString('ja-JP')}円
            </div>
            <div className="kpi-desc">1取引あたり</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-title">PF</div>
            <div className="kpi-value">{kpi.pf.toFixed(2)}</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-title">総pips数</div>
            <div className={`kpi-value ${totalPipsClass}`}>
              {kpi.totalPips >= 0 ? '+' : ''}{kpi.totalPips.toFixed(1)} pips
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: 'var(--space-3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>当日の推移</h2>
            <button
              onClick={onSave}
              style={{
                background: 'var(--accent)',
                border: '1px solid var(--accent)',
                borderRadius: 8,
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                color: '#fff',
              }}
            >
              保存
            </button>
          </div>
          <div
            style={{
              height: '180px',
              border: '1px dashed var(--line)',
              borderRadius: '8px',
              marginBottom: 'var(--space-3)',
            }}
          />
          <TextareaGroup values={values} onChange={onChangeValues} />
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: 'var(--space-3)' }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 'var(--space-2)' }}>この日の取引</h2>
          <DayTradesTable trades={trades} />
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: 'var(--space-3)' }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 'var(--space-2)' }}>リンク済みノート</h2>
          <LinkedNotesTable notes={linkedNotes} onOpenNote={onOpenLinkedNote} />
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: 'var(--space-3)' }}>
          <AiAdviceBlock
            advice={advice}
            onGenerate={onGenerateAdvice}
            onRegenerate={onRegenerateAdvice}
            onPin={onPinAdvice}
          />
        </div>
      </div>
    </section>
  );
}
