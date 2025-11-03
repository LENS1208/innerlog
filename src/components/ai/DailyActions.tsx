import React from 'react';
import Card from '../common/Card';
import SectionTag from '../common/SectionTag';
import type { DailyActions as DailyActionsType } from '../../types/ai-proposal.types';

type DailyActionsProps = {
  daily: DailyActionsType;
};

export default function DailyActions({ daily }: DailyActionsProps) {
  return (
    <Card data-testid="daily-actions">
      <SectionTag>本日のアクション</SectionTag>
      <h4>まずはここを見て判断</h4>
      <div className="kpi-quick">
        <div className="mini">
          <div className="label">想定方針</div>
          <div className="value">{daily.stance}</div>
        </div>
        <div className="mini">
          <div className="label">主戦場</div>
          <div className="value">{daily.session}</div>
        </div>
        <div className="mini">
          <div className="label">基準価格</div>
          <div className="value">{daily.anchor}</div>
        </div>
        <div className="mini">
          <div className="label">注意フラグ</div>
          <div className="value">{daily.riskNote}</div>
        </div>
      </div>
    </Card>
  );
}
