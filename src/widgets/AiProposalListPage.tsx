import React, { useEffect, useState } from 'react';
import { getAllProposals, deleteProposal, type AiProposal } from '../services/aiProposal.service';
import { showToast } from '../lib/toast';

type AiProposalListPageProps = {
  onSelectProposal: (id: string) => void;
  onCreateNew: () => void;
};

export default function AiProposalListPage({ onSelectProposal, onCreateNew }: AiProposalListPageProps) {
  const [proposals, setProposals] = useState<AiProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ pair: 'all', bias: 'all' });

  useEffect(() => {
    loadProposals();
  }, []);

  async function loadProposals() {
    setLoading(true);
    const data = await getAllProposals();
    setProposals(data);
    setLoading(false);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 'bold', color: 'var(--ink)' }}>相場予想一覧</h2>
        <button className="btn" onClick={onCreateNew} style={{ fontSize: 14, fontWeight: 600 }}>
          新規予想を作成
        </button>
      </div>

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
          <p style={{ fontSize: 16, color: 'var(--muted)', marginBottom: 16 }}>
            まだ予想がありません
          </p>
          <button className="btn" onClick={onCreateNew} style={{ fontSize: 14 }}>
            最初の予想を作成
          </button>
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
