import React, { useEffect, useState } from 'react';
import { getAccountSummary, type DbAccountSummary } from '../lib/db.service';

export default function AccountSummaryCards() {
  const [summary, setSummary] = useState<DbAccountSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const data = await getAccountSummary();
      console.log('📊 Account summary loaded:', data);
      setSummary(data);
      setError(null);
    } catch (error) {
      console.error('❌ Failed to load account summary:', error);
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  if (error) {
    return null;
  }

  if (!summary) {
    return null;
  }

  const hasXmPoints = summary.xm_points_earned > 0 || summary.xm_points_used > 0;

  return (
    <>
      <div className="kpi-card">
        <div className="kpi-title" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 'bold', color: 'var(--muted)', margin: '0 0 8px' }}>総入金額</div>
        <div className="kpi-value" style={{ color: '#10b981' }}>
          {summary.total_deposits.toLocaleString('ja-JP')} <span className="kpi-unit">円</span>
        </div>
        <div className="kpi-desc">累計入金額の合計</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-title" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 'bold', color: 'var(--muted)', margin: '0 0 8px' }}>総出金額</div>
        <div className="kpi-value" style={{ color: '#ef4444' }}>
          {summary.total_withdrawals.toLocaleString('ja-JP')} <span className="kpi-unit">円</span>
        </div>
        <div className="kpi-desc">累計出金額の合計</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-title" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 'bold', color: 'var(--muted)', margin: '0 0 8px' }}>スワップ損益</div>
        <div className="kpi-value" style={{ color: summary.total_swap >= 0 ? '#10b981' : '#ef4444' }}>
          {summary.total_swap.toLocaleString('ja-JP')} <span className="kpi-unit">円</span>
        </div>
        <div className="kpi-desc">スワップポイントの累計</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-title" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 'bold', color: 'var(--muted)', margin: '0 0 8px' }}>純損益 (CLOSED P/L)</div>
        <div className="kpi-value" style={{ color: summary.closed_pl >= 0 ? '#10b981' : '#ef4444' }}>
          {summary.closed_pl >= 0 ? '' : '-'}
          {Math.abs(summary.closed_pl).toLocaleString('ja-JP')} <span className="kpi-unit">円</span>
        </div>
        <div className="kpi-desc">確定損益の総額</div>
      </div>

      {hasXmPoints && (
        <>
          <div className="kpi-card">
            <div className="kpi-title" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 'bold', color: 'var(--muted)', margin: '0 0 8px' }}>XMポイント獲得</div>
            <div className="kpi-value" style={{ color: '#3b82f6' }}>
              {summary.xm_points_earned.toLocaleString('ja-JP')} <span className="kpi-unit">円</span>
            </div>
            <div className="kpi-desc">XMPで獲得した金額</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-title" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 'bold', color: 'var(--muted)', margin: '0 0 8px' }}>XMポイント利用</div>
            <div className="kpi-value" style={{ color: '#8b5cf6' }}>
              {summary.xm_points_used.toLocaleString('ja-JP')} <span className="kpi-unit">円</span>
            </div>
            <div className="kpi-desc">XMPから使用した金額</div>
          </div>
        </>
      )}
    </>
  );
}
