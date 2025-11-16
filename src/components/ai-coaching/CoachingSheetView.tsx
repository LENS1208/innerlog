import React from 'react';
import type { CoachingSheet } from '../../services/ai-coaching/types';
import { TradeExampleCard } from './TradeExampleCard';
import { StrengthsWeaknessesTable } from './StrengthsWeaknessesTable';
import { RulesTable } from './RulesTable';
import { PlaybookView } from './PlaybookView';
import { DiaryGuideTable } from './DiaryGuideTable';
import { KPITable } from './KPITable';
import { FourWeekPlanTable } from './FourWeekPlanTable';
import { CoachBubble } from './CoachBubble';

interface CoachingSheetViewProps {
  sheet: CoachingSheet;
  scoreComponent?: React.ReactNode;
  radarComponent?: React.ReactNode;
}

export function CoachingSheetView({ sheet, scoreComponent, radarComponent }: CoachingSheetViewProps) {
  if (!sheet || !sheet.summary) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)' }}>
        データの読み込み中にエラーが発生しました
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <style>{`
        .coaching-top-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          align-items: start;
        }
        @media (min-width: 640px) {
          .coaching-top-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .trade-examples-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        @media (min-width: 640px) {
          .trade-examples-grid {
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 16px;
          }
        }
      `}</style>
      <div className="coaching-top-grid">
        {radarComponent && (
          <Section title="総合評価">
            {radarComponent}
          </Section>
        )}

        {sheet.summary && Array.isArray(sheet.summary) && sheet.summary.length > 0 && (
          <Section title="現状サマリー">
            <ul style={{ margin: '0 0 0 20px', padding: 0, lineHeight: 1.7 }}>
              {sheet.summary.map((s, i) => (
                <li key={i} style={{ fontSize: '15px', color: 'var(--ink)', marginBottom: '6px' }}>{s}</li>
              ))}
            </ul>
          </Section>
        )}
      </div>

      {sheet.strengthsWeaknesses && Array.isArray(sheet.strengthsWeaknesses) && sheet.strengthsWeaknesses.length > 0 && (
        <Section title="強みと課題">
          {sheet.strengthsWeaknessesComment && <CoachBubble message={sheet.strengthsWeaknessesComment} />}
          <StrengthsWeaknessesTable
            rows={sheet.strengthsWeaknesses}
            evaluationScore={sheet.evaluationScore}
          />
        </Section>
      )}

      {sheet.examples && Array.isArray(sheet.examples) && sheet.examples.length > 0 && (
        <Section title="あなたの注目トレード">
          <div className="trade-examples-grid">
            {sheet.examples.map((ex, i) => (
              <TradeExampleCard key={i} ex={ex} />
            ))}
          </div>
        </Section>
      )}

      {sheet.rules && Array.isArray(sheet.rules) && sheet.rules.length > 0 && (
        <Section title="改善のための5ルール" comment={sheet.rulesComment}>
          <RulesTable rules={sheet.rules} />
        </Section>
      )}

      {sheet.playbook && typeof sheet.playbook === 'object' && (
        <Section title="プレイブック（戦略型）" comment={sheet.playbookComment}>
          <PlaybookView playbook={sheet.playbook} />
        </Section>
      )}

      {sheet.diaryGuide && sheet.diaryGuide.rows && Array.isArray(sheet.diaryGuide.rows) && sheet.diaryGuide.rows.length > 0 && (
        <Section title="オンライン日記の活用法">
          {sheet.diaryGuide.comment && <CoachBubble message={sheet.diaryGuide.comment} />}
          <DiaryGuideTable rows={sheet.diaryGuide.rows} />
        </Section>
      )}

      {sheet.kpis && Array.isArray(sheet.kpis) && sheet.kpis.length > 0 && (
        <Section title="KPI（数値で見る改善指標）">
          {sheet.kpisComment && <CoachBubble message={sheet.kpisComment} />}
          <KPITable kpis={sheet.kpis} />
        </Section>
      )}

      {sheet.fourWeekPlan && Array.isArray(sheet.fourWeekPlan) && sheet.fourWeekPlan.length > 0 && (
        <Section title="4週間リセットプラン">
          {sheet.fourWeekPlanComment && <CoachBubble message={sheet.fourWeekPlanComment} />}
          <FourWeekPlanTable weeks={sheet.fourWeekPlan} />
        </Section>
      )}

      {sheet.coachingMessage && Array.isArray(sheet.coachingMessage) && sheet.coachingMessage.length > 0 && (
        <Section title="コーチングメッセージ">
          {sheet.coachingMessage.map((text, i) => (
            <p key={i} style={{ margin: '0 0 12px 0', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink)' }}>
              {text}
            </p>
          ))}
        </Section>
      )}

      {sheet.nextSteps && Array.isArray(sheet.nextSteps) && sheet.nextSteps.length > 0 && (
        <footer
          style={{
            padding: '16px',
            background: 'var(--chip)',
            borderRadius: '8px',
            fontSize: '14px',
            color: 'var(--ink)',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: '6px', fontSize: '15px' }}>次のステップ提案：</div>
          <div>{sheet.nextSteps.join(' / ')}</div>
        </footer>
      )}
    </div>
  );
}

interface SectionProps {
  title: string;
  comment?: string;
  children: React.ReactNode;
}

function Section({ title, comment, children }: SectionProps) {
  return (
    <section
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        borderRadius: '12px',
        padding: '12px',
        height: '100%',
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      <h3
        style={{
          margin: '0 0 16px 0',
          fontSize: '18px',
          fontWeight: 700,
          color: 'var(--ink)',
        }}
      >
        {title}
      </h3>
      {comment && (
        <p
          style={{
            margin: '0 0 20px 0',
            fontSize: '16px',
            lineHeight: 1.8,
            color: 'var(--ink)',
            paddingBottom: '16px',
            borderBottom: '1px solid var(--line)',
            fontWeight: 500,
          }}
        >
          {comment}
        </p>
      )}
      {children}
    </section>
  );
}
