import React, { useEffect, useState } from 'react';
import { getAllProposals, deleteProposal, saveProposal, type AiProposal } from '../services/aiProposal.service';
import { showToast } from '../lib/toast';
import type { AiProposalData } from '../types/ai-proposal.types';

type AiProposalListPageProps = {
  onSelectProposal: (id: string) => void;
};

const MOCK_PROPOSAL_DATA: AiProposalData = {
  hero: {
    pair: 'USD/JPY',
    bias: 'SELL',
    confidence: 72,
    nowYen: 147.25,
    buyEntry: '148.00',
    sellEntry: '147.00',
  },
  daily: {
    stance: '戻り売り優先',
    session: '東京・欧州前場',
    anchor: '147.00',
    riskNote: 'イベント待機',
  },
  scenario: {
    strong: '146.50 → 145.80 → 145.00（雇用統計ネガティブなら）',
    base: '147.20 → 146.80 → 146.20（様子見継続）',
    weak: '147.80 → 148.20 → 148.80（サプライズ高なら損切り）',
  },
  ideas: [
    {
      id: 'idea-1',
      side: '売り',
      entry: '147.00–147.20',
      slPips: -30,
      tpPips: 50,
      expected: 1.67,
      confidence: '◎',
    },
    {
      id: 'idea-2',
      side: '売り',
      entry: '147.50–147.70',
      slPips: -25,
      tpPips: 40,
      expected: 1.60,
      confidence: '○',
    },
  ],
  factors: {
    technical: [
      '4H足：147.50 レジスタンス反応',
      '日足：陰線継続、下降トレンド維持',
      'RSI：55 → やや過熱感',
    ],
    fundamental: [
      '米雇用統計・金曜発表控え',
      'FRB タカ派後退観測',
      '日銀：据え置き濃厚',
    ],
    sentiment: [
      'ポジション：円売り過多（巻き戻しリスク）',
      'ドル高一服感、材料待ち',
    ],
  },
  notes: {
    memo: [
      '147.00 で 4H足陰線確定なら売り増し検討',
      '148.00 超えは損切りライン',
      'イベント前は玉を軽めに',
    ],
  },
};

export default function AiProposalListPage({ onSelectProposal }: AiProposalListPageProps) {
  const [proposals, setProposals] = useState<AiProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filter, setFilter] = useState({ pair: 'all', bias: 'all' });

  const [prompt, setPrompt] = useState('');
  const [pair, setPair] = useState('USD/JPY');
  const [timeframe, setTimeframe] = useState('4H');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadProposals();
  }, []);

  async function loadProposals() {
    setLoading(true);
    const data = await getAllProposals();
    setProposals(data);
    setLoading(false);
  }

  async function handleGenerate() {
    if (!prompt.trim()) {
      showToast('予想内容を入力してください');
      return;
    }

    setGenerating(true);
    try {
      showToast('予想を生成中...');

      await new Promise(resolve => setTimeout(resolve, 1000));

      const newProposal = await saveProposal(MOCK_PROPOSAL_DATA, prompt, pair, timeframe);

      if (newProposal) {
        showToast('予想を生成しました');
        setPrompt('');
        await loadProposals();
        onSelectProposal(newProposal.id);
      } else {
        showToast('予想の生成に失敗しました');
      }
    } catch (error) {
      console.error('Error generating proposal:', error);
      showToast('予想の生成に失敗しました');
    } finally {
      setGenerating(false);
    }
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm('この予想を削除しますか？')) return;

    const success = await deleteProposal(id);
    if (success) {
      showToast('予想を削除しました');
      loadProposals();
    } else {
      showToast('削除に失敗しました');
    }
  }

  const filteredProposals = proposals.filter((p) => {
    if (filter.pair !== 'all' && p.pair !== filter.pair) return false;
    if (filter.bias !== 'all' && p.bias !== filter.bias) return false;
    return true;
  });

  const uniquePairs = Array.from(new Set(proposals.map((p) => p.pair)));

  return (
    <div style={{ width: '100%', padding: 16 }}>
      <h2 style={{ margin: '0 0 16px 0', fontSize: 20, fontWeight: 'bold', color: 'var(--ink)' }}>
        相場予想
      </h2>

      <section
        className="card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          marginBottom: 20,
          padding: 16,
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          borderRadius: 16,
        }}
      >
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 'bold', color: 'var(--ink)' }}>
          新しい予想を生成
        </h3>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', width: '100%' }}>
          <input
            className="btn"
            style={{ flex: 1, minWidth: 220, boxSizing: 'border-box' }}
            placeholder="例）USD/JPY 4H、イベント控え、ややドル高のアイデア"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={generating}
          />
          <select
            className="btn"
            value={pair}
            onChange={(e) => setPair(e.target.value)}
            style={{ boxSizing: 'border-box' }}
            disabled={generating}
          >
            <option>USD/JPY</option>
            <option>EUR/USD</option>
            <option>GBP/JPY</option>
            <option>EUR/JPY</option>
            <option>GBP/USD</option>
          </select>
          <select
            className="btn"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            style={{ boxSizing: 'border-box' }}
            disabled={generating}
          >
            <option>1H</option>
            <option>4H</option>
            <option>1D</option>
          </select>
          <input
            type="date"
            className="btn"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            style={{ boxSizing: 'border-box' }}
            disabled={generating}
          />
          <button
            className="btn"
            onClick={handleGenerate}
            disabled={generating}
            style={{
              background: generating ? 'var(--muted)' : 'var(--accent)',
              color: '#fff',
              fontWeight: 600,
            }}
          >
            {generating ? '生成中...' : '提案を生成'}
          </button>
        </div>
      </section>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <select
          className="btn"
          value={filter.pair}
          onChange={(e) => setFilter({ ...filter, pair: e.target.value })}
          style={{ fontSize: 13 }}
        >
          <option value="all">全通貨ペア</option>
          {uniquePairs.map((pair) => (
            <option key={pair} value={pair}>{pair}</option>
          ))}
        </select>

        <select
          className="btn"
          value={filter.bias}
          onChange={(e) => setFilter({ ...filter, bias: e.target.value })}
          style={{ fontSize: 13 }}
        >
          <option value="all">全バイアス</option>
          <option value="BUY">買い</option>
          <option value="SELL">売り</option>
          <option value="NEUTRAL">中立</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>読み込み中...</div>
      ) : filteredProposals.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: 60,
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          borderRadius: 16
        }}>
          <p style={{ fontSize: 16, color: 'var(--muted)', marginBottom: 0 }}>
            まだ予想がありません。上のフォームから最初の予想を生成してください。
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {filteredProposals.map((proposal) => (
            <div
              key={proposal.id}
              onClick={() => onSelectProposal(proposal.id)}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: 16,
                padding: 16,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--line)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 'bold', color: 'var(--ink)' }}>
                      {proposal.pair} / {proposal.timeframe}
                    </h3>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 600,
                        background: proposal.bias === 'BUY' ? 'rgba(22, 163, 74, 0.1)' :
                                   proposal.bias === 'SELL' ? 'rgba(239, 68, 68, 0.1)' :
                                   'rgba(107, 114, 128, 0.1)',
                        color: proposal.bias === 'BUY' ? 'rgb(22, 163, 74)' :
                               proposal.bias === 'SELL' ? 'rgb(239, 68, 68)' :
                               'rgb(107, 114, 128)',
                      }}
                    >
                      {proposal.bias === 'BUY' ? '買い' : proposal.bias === 'SELL' ? '売り' : '中立'}
                    </span>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 600,
                        background: 'rgba(59, 130, 246, 0.1)',
                        color: 'rgb(59, 130, 246)',
                      }}
                    >
                      信頼度 {proposal.confidence}%
                    </span>
                  </div>
                  <p style={{ margin: '0 0 8px 0', fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
                    {proposal.prompt || '予想を生成しました'}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)' }}>
                    作成日: {new Date(proposal.created_at).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <button
                  className="btn"
                  onClick={(e) => handleDelete(proposal.id, e)}
                  style={{
                    fontSize: 12,
                    padding: '4px 12px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: 'rgb(239, 68, 68)',
                  }}
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
