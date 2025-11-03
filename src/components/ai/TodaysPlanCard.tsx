import React from 'react';
import Card from '../common/Card';
import SectionTag from '../common/SectionTag';

type TodaysPlanCardProps = {
  plan: string[];
};

export default function TodaysPlanCard({ plan }: TodaysPlanCardProps) {
  return (
    <Card>
      <SectionTag>今日の見立て</SectionTag>
      <h4>今日の見立て</h4>
      <p className="subnote">まず短く「どうするか」。その次に理由を3点。</p>
      <ul style={{ margin: '0 0 0 18px', padding: 0, lineHeight: 1.7 }}>
        {plan.map((item, idx) => (
          <li key={idx} dangerouslySetInnerHTML={{ __html: item }} />
        ))}
      </ul>
    </Card>
  );
}
