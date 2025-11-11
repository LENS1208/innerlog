import React from 'react';
import Card from '../common/Card';
import SectionTag from '../common/SectionTag';
import { HelpIcon } from '../common/HelpIcon';

type ScenarioCardProps = {
  scenario: {
    strong: string;
    base: string;
    weak: string;
  };
};

export default function ScenarioCard({ scenario }: ScenarioCardProps) {
  return (
    <Card>
      <SectionTag>シナリオ（想定パターン）</SectionTag>
      <h4 style={{ display: 'flex', alignItems: 'center' }}>
        シナリオ？
        <HelpIcon text="価格の想定パスを強気・中立・弱気の3パターンで表示します。" />
      </h4>
      <ul style={{ margin: '0 0 0 18px', padding: 0, lineHeight: 1.6 }}>
        <li>強気：{scenario.strong}</li>
        <li>中立：{scenario.base}</li>
        <li>弱気：{scenario.weak}</li>
      </ul>
    </Card>
  );
}
