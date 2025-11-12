import React, { useEffect, useState } from 'react';
import { getAccountSummary, type DbAccountSummary } from '../lib/db.service';
import { useDataset } from '../lib/dataset.context';
import { HelpIcon } from './common/HelpIcon';

export default function AccountSummaryCards() {
  const [summary, setSummary] = useState<DbAccountSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { useDatabase, dataset } = useDataset();

  useEffect(() => {
    loadSummary();

    const handleTradesUpdated = () => {
      console.log('🔄 Trades updated, reloading summary...');
      loadSummary();
    };

    window.addEventListener('fx:tradesUpdated', handleTradesUpdated);
    return () => window.removeEventListener('fx:tradesUpdated', handleTradesUpdated);
  }, [useDatabase, dataset]);

  const loadSummary = async () => {
    try {
      // データベースモードの場合は実際にデータを取得
      if (useDatabase) {
        const data = await getAccountSummary('default');
        console.log('📊 Account summary loaded:', data);
        setSummary(data);
        setError(null);
        setLoading(false);
        return;
      }

      // デモデータを使用している場合は、データセット別のサマリーデータを取得
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/get_demo_account_summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ p_dataset: dataset }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch demo account summary');
      }

      const demoData = await response.json();

      setSummary({
        id: 'demo',
        user_id: 'demo',
        dataset: dataset,
        total_deposits: demoData?.total_deposits || 0,
        total_withdrawals: demoData?.total_withdrawals || 0,
        xm_points_earned: demoData?.xm_points_earned || 0,
        xm_points_used: demoData?.xm_points_used || 0,
        total_swap: demoData?.total_swap || 0,
        swap_positive: demoData?.swap_positive || 0,
        swap_negative: demoData?.swap_negative || 0,
        total_commission: 0,
        total_profit: 0,
        closed_pl: 0,
        updated_at: new Date().toISOString(),
      });
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

  // データがない場合はすべて0として扱う
  const summaryData = summary || {
    total_deposits: 0,
    total_withdrawals: 0,
    xm_points_earned: 0,
    xm_points_used: 0,
    total_swap: 0,
    swap_positive: 0,
    swap_negative: 0,
    closed_pl: 0,
  };

  const hasXmPoints = summaryData.xm_points_earned > 0 || summaryData.xm_points_used > 0;
  const hasSwapBreakdown = (summaryData.swap_positive || 0) > 0 || (summaryData.swap_negative || 0) > 0;

  return (
    <>
      <div className="kpi-card">
        <div className="kpi-title" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 'bold', color: 'var(--muted)', margin: '0 0 8px' }}>
          入金総額
          <HelpIcon text="口座に入金した総額です。取引資金の元手を把握するための指標です。" />
        </div>
        <div className="kpi-value" style={{ color: '#0284c7' }}>
          {summaryData.total_deposits.toLocaleString('ja-JP')} <span className="kpi-unit">円</span>
        </div>
        <div className="kpi-desc">累計入金額の合計</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-title" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 'bold', color: 'var(--muted)', margin: '0 0 8px' }}>
          出金総額
          <HelpIcon text="口座から出金した総額です。利益の引き出しや資金移動の記録です。" />
        </div>
        <div className="kpi-value" style={{ color: '#ef4444' }}>
          {summaryData.total_withdrawals.toLocaleString('ja-JP')} <span className="kpi-unit">円</span>
        </div>
        <div className="kpi-desc">累計出金額の合計</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-title" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 'bold', color: 'var(--muted)', margin: '0 0 8px' }}>
          累計スワップ
          <HelpIcon text="ポジションを保有したことで発生したスワップポイントの総額です。プラスなら収入になります。" />
        </div>
        <div className="kpi-value" style={{ color: summaryData.total_swap >= 0 ? '#0284c7' : '#ef4444' }}>
          {summaryData.total_swap.toLocaleString('ja-JP')} <span className="kpi-unit">円</span>
        </div>
        {hasSwapBreakdown ? (
          <div className="kpi-desc" style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
            <span style={{ color: '#0284c7' }}>+{(summaryData.swap_positive || 0).toLocaleString('ja-JP')}円</span>
            {' / '}
            <span style={{ color: '#ef4444' }}>-{(summaryData.swap_negative || 0).toLocaleString('ja-JP')}円</span>
          </div>
        ) : (
          <div className="kpi-desc">スワップポイントの累計</div>
        )}
      </div>

      {hasXmPoints && (
        <>
          <div className="kpi-card">
            <div className="kpi-title" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 'bold', color: 'var(--muted)', margin: '0 0 8px' }}>
              XMポイント獲得
              <HelpIcon text="XMのロイヤルティプログラムで獲得したポイントを現金化した金額です。取引に応じて貯まります。" />
            </div>
            <div className="kpi-value" style={{ color: '#3b82f6' }}>
              {summaryData.xm_points_earned.toLocaleString('ja-JP')} <span className="kpi-unit">円</span>
            </div>
            <div className="kpi-desc">XMPで獲得した金額</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-title" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 'bold', color: 'var(--muted)', margin: '0 0 8px' }}>
              XMポイント利用
              <HelpIcon text="獲得したXMポイントを取引口座に移して使用した金額です。ボーナスとして活用できます。" />
            </div>
            <div className="kpi-value" style={{ color: '#8b5cf6' }}>
              {summaryData.xm_points_used.toLocaleString('ja-JP')} <span className="kpi-unit">円</span>
            </div>
            <div className="kpi-desc">XMPから使用した金額</div>
          </div>
        </>
      )}
    </>
  );
}
