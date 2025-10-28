import React from 'react';

type TradeData = {
  ticket: string;
  item: string;
  side: 'BUY' | 'SELL';
  size: number;
  openTime: Date;
  openPrice: number;
  closeTime: Date;
  closePrice: number;
  commission: number;
  swap: number;
  profit: number;
  pips: number;
  sl: number | null;
  tp: number | null;
};

type TradeKpi = {
  net: number;
  pips: number;
  hold: number;
  gross: number;
  cost: number;
  rrr: number | null;
};

export type TradeDetailPanelProps = {
  trade: TradeData;
  kpi: TradeKpi;
  onClose?: () => void;
};

const fmtJPY = (n: number) => `${Math.round(n).toLocaleString('ja-JP')}円`;
const fmtHoldJP = (ms: number) => {
  const m = Math.floor(ms / 60000);
  const h = Math.floor(m / 60);
  return `${h}時間${m % 60}分`;
};

export default function TradeDetailPanel({ trade, kpi, onClose }: TradeDetailPanelProps) {
  return (
    <section className="pane">
      <div className="head">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>取引ノート（表示）</h3>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: 8,
                padding: '8px 14px',
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              閉じる
            </button>
          )}
        </div>
      </div>

      <div className="body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-title">損益（円）</div>
            <div className={`kpi-value ${kpi.net >= 0 ? 'good' : 'bad'}`}>
              {kpi.net >= 0 ? '+' : ''}{fmtJPY(kpi.net)}
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-title">pips</div>
            <div className={`kpi-value ${kpi.pips >= 0 ? 'good' : 'bad'}`}>
              {kpi.pips >= 0 ? '+' : ''}{kpi.pips.toFixed(1)}
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-title">保有時間</div>
            <div className="kpi-value">{fmtHoldJP(kpi.hold)}</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-title">リスクリワード</div>
            <div className="kpi-value">{kpi.rrr ? kpi.rrr.toFixed(2) : '—'}</div>
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: 'var(--space-3)' }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 'var(--space-3)' }}>トレード情報</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)' }}>
            <div>
              <div style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>通貨ペア</div>
              <div style={{ fontWeight: 600 }}>{trade.item}</div>
            </div>
            <div>
              <div style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>方向</div>
              <div style={{ fontWeight: 600 }}>{trade.side === 'BUY' ? '買い' : '売り'}</div>
            </div>
            <div>
              <div style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>サイズ</div>
              <div style={{ fontWeight: 600 }}>{trade.size.toFixed(2)} lot</div>
            </div>
            <div>
              <div style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>指値/逆指値</div>
              <div style={{ fontWeight: 600 }}>{trade.tp ?? '—'} / {trade.sl ?? '—'}</div>
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: 'var(--space-3)' }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 'var(--space-3)' }}>価格と時刻</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)' }}>
            <div>
              <div style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>エントリー価格</div>
              <div style={{ fontWeight: 600, fontSize: 18 }}>{trade.openPrice.toFixed(3)}</div>
              <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>
                {trade.openTime.toLocaleString('ja-JP', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>決済価格</div>
              <div style={{ fontWeight: 600, fontSize: 18 }}>{trade.closePrice.toFixed(3)}</div>
              <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>
                {trade.closeTime.toLocaleString('ja-JP', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: 'var(--space-3)' }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 'var(--space-3)' }}>損益の内訳</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
              <span style={{ color: 'var(--muted)' }}>グロス損益</span>
              <span style={{ fontWeight: 600 }}>{fmtJPY(kpi.gross)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
              <span style={{ color: 'var(--muted)' }}>手数料・スワップ</span>
              <span style={{ fontWeight: 600 }}>{fmtJPY(kpi.cost)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              <span style={{ fontWeight: 600 }}>ネット損益</span>
              <span style={{ fontWeight: 700, fontSize: 16, color: kpi.net >= 0 ? 'var(--accent-2, #22c55e)' : 'var(--danger, #ef4444)' }}>
                {fmtJPY(kpi.net)}
              </span>
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: 'var(--space-3)' }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 'var(--space-2)' }}>取引ノート</h2>
          <div style={{
            padding: 'var(--space-3)',
            background: 'var(--chip, #f3f4f6)',
            borderRadius: 8,
            color: 'var(--muted)',
            fontSize: 13,
            textAlign: 'center'
          }}>
            取引ノートの詳細は準備中です
          </div>
        </div>
      </div>
    </section>
  );
}
