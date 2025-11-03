import React from 'react';
import Card from '../common/Card';
import SectionTag from '../common/SectionTag';
import type { Factors } from '../../types/ai-proposal.types';

type FactorsCardProps = {
  factors: Factors;
};

export default function FactorsCard({ factors }: FactorsCardProps) {
  return (
    <Card>
      <SectionTag>分析要因（根拠の内訳）</SectionTag>
      <h4>テクニカル / ファンダメンタルズ / センチメント</h4>
      <div className="analysis-vertical">
        <div>
          <h5>テクニカル（チャートの動き）</h5>
          <ul style={{ margin: '0 0 0 18px', padding: 0, lineHeight: 1.8 }}>
            {factors.technical.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h5>ファンダメンタルズ（経済の材料）</h5>
          <ul style={{ margin: '0 0 0 18px', padding: 0, lineHeight: 1.8 }}>
            {factors.fundamental.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h5>センチメント（市場の雰囲気）</h5>
          <ul style={{ margin: '0 0 0 18px', padding: 0, lineHeight: 1.8 }}>
            {factors.sentiment.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
