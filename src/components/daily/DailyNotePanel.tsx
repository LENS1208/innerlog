import React from 'react';
import KpiGrid, { type KpiItem } from '../common/KpiGrid';
import Card from '../common/Card';
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
  const kpiItems: KpiItem[] = [
    { label: '勝率', value: `${kpi.winRate.toFixed(1)}%` },
    {
      label: '取引件数',
      value: `${kpi.trades}件`,
      sub: `勝ち：${kpi.wins}｜負け：${kpi.losses}`,
    },
    {
      label: '平均損益（1取引あたり）',
      value: `+${kpi.avgYenPerTrade.toLocaleString('ja-JP')}円`,
      positive: true,
    },
    { label: 'PF', value: kpi.pf.toFixed(2) },
    { label: '総pips数', value: `+${kpi.totalPips.toFixed(1)} pips`, positive: true },
  ];

  return (
    <section className="pane">
      <div className="head">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div className="row" style={{ gap: '12px' }}>
            <div className="brand">日次ノート（表示）</div>
          </div>
          <div className="row">
            <button className="btn" onClick={onPrevDay}>
              前日
            </button>
            <button className="btn" onClick={onNextDay}>
              翌日
            </button>
          </div>
        </div>
      </div>
      <div className="body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <KpiGrid items={kpiItems} />

        <Card style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 700 }}>当日の推移</div>
            <button className="btn" onClick={onSave}>
              保存
            </button>
          </div>
          <div
            style={{
              height: '180px',
              border: '1px dashed var(--border)',
              borderRadius: '12px',
            }}
          />
          <TextareaGroup values={values} onChange={onChangeValues} />
        </Card>

        <Card style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontWeight: 700 }}>この日の取引</div>
          <DayTradesTable trades={trades} />
        </Card>

        <Card style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontWeight: 700 }}>リンク済みノート</div>
          <LinkedNotesTable notes={linkedNotes} onOpenNote={onOpenLinkedNote} />
        </Card>

        <Card style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <AiAdviceBlock
            advice={advice}
            onGenerate={onGenerateAdvice}
            onRegenerate={onRegenerateAdvice}
            onPin={onPinAdvice}
          />
        </Card>
      </div>
    </section>
  );
}
