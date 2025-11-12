import React from 'react';
import type { CoachingSheet } from '../../services/ai-coaching/types';
import { TradeExampleCard } from './TradeExampleCard';
import { StrengthsWeaknessesTable } from './StrengthsWeaknessesTable';
import { RulesTable } from './RulesTable';
import { PlaybookView } from './PlaybookView';
import { DiaryGuideTable } from './DiaryGuideTable';
import { KPITable } from './KPITable';
import { FourWeekPlanTable } from './FourWeekPlanTable';

interface CoachingSheetViewProps {
  sheet: CoachingSheet;
  scoreComponent?: React.ReactNode;
  radarComponent?: React.ReactNode;
}

export function CoachingSheetView({ sheet, scoreComponent, radarComponent }: CoachingSheetViewProps) {
  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: scoreComponent && radarComponent ? 'repeat(auto-fit, minmax(300px, 1fr))' : '1fr', gap: '16px', alignItems: 'start' }}>
          <Section title="現状サマリー">
            <ul style={{ margin: '0 0 0 20px', padding: 0, lineHeight: 1.6 }}>
              {sheet.summary.map((s, i) => (
                <li key={i} style={{ fontSize: '14px' }}>{s}</li>
              ))}
            </ul>
          </Section>

          {scoreComponent && (
            <Section title="総合スコア">
              {scoreComponent}
            </Section>
          )}

          {radarComponent && (
            <Section title="バランス評価">
              {radarComponent}
            </Section>
          )}
        </div>
      </div>

      {sheet.examples && sheet.examples.length > 0 && (
        <Section title="実例ハイライト">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '12px',
            }}
          >
            {sheet.examples.map((ex, i) => (
              <TradeExampleCard key={i} ex={ex} />
            ))}
          </div>
        </Section>
      )}

      <Section title="強みと課題" comment={sheet.strengthsWeaknessesComment}>
        <StrengthsWeaknessesTable rows={sheet.strengthsWeaknesses} />
      </Section>

      <Section title="改善のための5ルール" comment={sheet.rulesComment}>
        <RulesTable rules={sheet.rules} />
      </Section>

      <Section title="プレイブック（戦略型）" comment={sheet.playbookComment}>
        <PlaybookView playbook={sheet.playbook} />
      </Section>

      <Section title="オンライン日記の活用法" comment={sheet.diaryGuide.comment}>
        <DiaryGuideTable rows={sheet.diaryGuide.rows} />
      </Section>

      <Section title="KPI（数値で見る改善指標）" comment={sheet.kpisComment}>
        <KPITable kpis={sheet.kpis} />
      </Section>

      <Section title="4週間リセットプラン" comment={sheet.fourWeekPlanComment}>
        <FourWeekPlanTable weeks={sheet.fourWeekPlan} />
      </Section>

      <Section title="コーチングメッセージ">
        {sheet.coachingMessage.map((text, i) => (
          <p key={i} style={{ margin: '0 0 12px 0', fontSize: '14px', lineHeight: 1.6 }}>
            {text}
          </p>
        ))}
      </Section>

      <footer
        style={{
          padding: '12px',
          background: 'var(--chip)',
          borderRadius: '8px',
          fontSize: '13px',
          color: 'var(--muted)',
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: '4px' }}>次のステップ提案：</div>
        <div>{sheet.nextSteps.join(' / ')}</div>
      </footer>
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
        padding: '16px',
      }}
    >
      <h2
        style={{
          margin: '0 0 12px 0',
          fontSize: '17px',
          fontWeight: 600,
          color: 'var(--ink)',
        }}
      >
        {title}
      </h2>
      {comment && (
        <p
          style={{
            margin: '0 0 16px 0',
            fontSize: '14px',
            lineHeight: 1.6,
            color: 'var(--ink)',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--line)',
          }}
        >
          {comment}
        </p>
      )}
      {children}
    </section>
  );
}
