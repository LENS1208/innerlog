import React from 'react';
import Card from '../common/Card';
import SectionTag from '../common/SectionTag';

type RiskNotesProps = {
  risks: string[];
};

export default function RiskNotes({ risks }: RiskNotesProps) {
  return (
    <Card>
      <SectionTag>注意点（この条件なら中止）</SectionTag>
      <h4>リスク要因＆無効化条件</h4>
      <div className="subnote">高インパクト前後は玉軽め。サプライズで一時撤退。</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {risks.map((risk, idx) => (
          <span key={idx} className="tag">
            {risk}
          </span>
        ))}
      </div>
    </Card>
  );
}
