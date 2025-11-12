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
}

export function CoachingSheetView({ sheet }: CoachingSheetViewProps) {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
      <div style={{ display: 'grid', gap: '16px' }}>
        <Section title="1️⃣ 現状サマリー">
          <ul style={{ margin: '0 0 0 20px', padding: 0, lineHeight: 1.6 }}>
            {sheet.summary.map((s, i) => (
              <li key={i} style={{ fontSize: '14px' }}>{s}</li>
            ))}
          </ul>
        </Section>

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

        <Section title="2️⃣ 強みと課題">
          <StrengthsWeaknessesTable rows={sheet.strengthsWeaknesses} />
        </Section>

        <Section title="3️⃣ 改善のための5ルール">
          <RulesTable rules={sheet.rules} />
        </Section>

        <Section title="4️⃣ プレイブック（戦略型）">
          <PlaybookView playbook={sheet.playbook} />
        </Section>

        <Section title="5️⃣ オンライン日記の活用法">
          <DiaryGuideTable rows={sheet.diaryGuide.rows} />
        </Section>

        <Section title="6️⃣ KPI（数値で見る改善指標）">
          <KPITable kpis={sheet.kpis} />
        </Section>

        <Section title="7️⃣ 4週間リセットプラン">
          <FourWeekPlanTable weeks={sheet.fourWeekPlan} />
        </Section>

        <Section title="8️⃣ コーチングメッセージ">
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
    </div>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
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
      {children}
    </section>
  );
}
