import React from 'react';
import HeroSummary from '../components/ai/HeroSummary';
import PromptBar from '../components/ai/PromptBar';
import DailyActions from '../components/ai/DailyActions';
import TodaysPlanCard from '../components/ai/TodaysPlanCard';
import ScenarioCard from '../components/ai/ScenarioCard';
import TradeIdeasTable from '../components/ai/TradeIdeasTable';
import RiskNotes from '../components/ai/RiskNotes';
import FactorsCard from '../components/ai/FactorsCard';
import LinkedNotes from '../components/ai/LinkedNotes';
import AiAdvice from '../components/ai/AiAdvice';
import type { AiProposalData, AiProposalHandlers } from '../types/ai-proposal.types';
import '../styles/journal-notebook.css';

type AiProposalPageProps = AiProposalData & AiProposalHandlers;

export default function AiProposalPage({
  hero,
  daily,
  scenario,
  ideas,
  factors,
  notes,
  onGenerate,
  onRegenerate,
  onFix,
  onLinkToDaily,
  onCreateTradeNote,
}: AiProposalPageProps) {
  const todaysPlan = [
    '<b>戻り売り優先</b>（147.00 上で陽線包みなら短期買いも）',
    '時間帯：10:00–12:00 / 16:00–17:30 を主戦場に',
    'イベント：パウエル発言・雇用関連は一時撤退',
  ];

  const risks = ['ボラ急拡大', '介入ヘッドライン', '要人発言', '地政学'];

  return (
    <div style={{ width: '100%', padding: 16 }}>
      <HeroSummary hero={hero} />
      <PromptBar onGenerate={onGenerate} onRegenerate={onRegenerate} onFix={onFix} />

      <section className="grid-ai" style={{ marginTop: 12 }}>
        <div className="list">
          <DailyActions daily={daily} />
          <TodaysPlanCard plan={todaysPlan} />
          <ScenarioCard scenario={scenario} />
          <TradeIdeasTable
            ideas={ideas}
            hero={hero}
            onLinkToDaily={onLinkToDaily}
            onCreateTradeNote={onCreateTradeNote}
          />
          <RiskNotes risks={risks} />
        </div>

        <div className="list">
          <FactorsCard factors={factors} />
          <LinkedNotes notes={notes} />
          <AiAdvice />
        </div>
      </section>
    </div>
  );
}
