import React from 'react';
import Card from '../common/Card';
import SectionTag from '../common/SectionTag';
import { HelpIcon } from '../common/HelpIcon';
import type { TradeIdea, HeroData } from '../../types/ai-proposal.types';

type TradeIdeasTableProps = {
  ideas: TradeIdea[];
  hero: HeroData;
  onLinkToDaily?: (ideaId: string) => void;
  onCreateTradeNote?: (ideaId: string) => void;
};

export default function TradeIdeasTable({ ideas, hero, onLinkToDaily, onCreateTradeNote }: TradeIdeasTableProps) {
  const sortedIdeas = [...ideas].sort((a, b) => {
    if (hero.bias === 'BUY') {
      if (a.side === '買い' && b.side !== '買い') return -1;
      if (a.side !== '買い' && b.side === '買い') return 1;
    } else if (hero.bias === 'SELL') {
      if (a.side === '売り' && b.side !== '売り') return -1;
      if (a.side !== '売り' && b.side === '売り') return 1;
    }
    return 0;
  });

  return (
    <Card data-testid="trade-ideas">
      <SectionTag>エントリープラン</SectionTag>
      <h4 style={{ display: 'flex', alignItems: 'center' }}>
        エントリープラン？
        <HelpIcon text="セットアップ（最大3件）を表示します。各プランのエントリーポイント、損切り・利確、期待リターン、信頼度を確認できます。" />
      </h4>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>方向</th>
            <th style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>エントリー</th>
            <th style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>損切り/利確</th>
            <th style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>期待リターン</th>
            <th style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>信頼度</th>
            <th style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {sortedIdeas.map((idea) => (
            <tr key={idea.id}>
              <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>{idea.side}</td>
              <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>{idea.entry}</td>
              <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>
                {idea.slPips > 0 ? '+' : ''}{idea.slPips} / {idea.tpPips > 0 ? '+' : ''}{idea.tpPips} pips
              </td>
              <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)' }} className={idea.expected > 0 ? 'good' : 'bad'}>
                {idea.expected > 0 ? '+' : ''}{idea.expected.toFixed(2)}
              </td>
              <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>{idea.confidence}</td>
              <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>
                <button className="btn" style={{ marginRight: 4 }} onClick={() => onLinkToDaily?.(idea.id)}>
                  日次ノートへ
                </button>
                <button className="btn" onClick={() => onCreateTradeNote?.(idea.id)}>
                  取引ノートを作成
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
