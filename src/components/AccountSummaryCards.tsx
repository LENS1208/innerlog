import React, { useEffect, useState } from 'react';
import { getAccountSummary, type DbAccountSummary } from '../lib/db.service';
import { useDataset } from '../lib/dataset.context';
import { HelpIcon } from './common/HelpIcon';
import { supabase } from '../lib/supabase';

type AccountSummaryCardsProps = {
  peakEquity?: number;
};

export default function AccountSummaryCards({ peakEquity }: AccountSummaryCardsProps = {}) {
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
        console.log('🔍 Swap breakdown:', {
          swap_positive: data?.swap_positive,
          swap_negative: data?.swap_negative,
          hasSwapBreakdown: data?.swap_positive !== undefined && data?.swap_negative !== undefined
        });
        setSummary(data);
        setError(null);
        setLoading(false);
        return;
      }

      // デモデータを使用している場合は、データセット別のサマリーデータを取得
      const { data: demoData, error: rpcError } = await supabase.rpc('get_demo_account_summary', {
        p_dataset: dataset
      });

      console.log('🔍 RPC Response:', { data: demoData, error: rpcError });

      if (rpcError) {
        throw rpcError;
      }

      console.log('📊 Demo account summary loaded:', demoData);

      const summaryData: DbAccountSummary = {
        id: 'demo',
        user_id: 'demo',
        balance: demoData?.balance || 0,
        equity: demoData?.equity || 0,
        profit: demoData?.profit || 0,
        deposit: demoData?.deposit || 0,
        withdraw: demoData?.withdraw || 0,
        commission: demoData?.commission || 0,
        swap: demoData?.swap || 0,
        swap_long: demoData?.swap_long || 0,
        swap_short: demoData?.swap_short || 0,
        swap_positive: demoData?.swap_positive || 0,
        swap_negative: Math.abs(demoData?.swap_negative || 0),
        updated_at: new Date().toISOString(),
      };

      console.log('🔍 Demo swap breakdown:', {
        raw_swap_positive: demoData?.swap_positive,
        raw_swap_negative: demoData?.swap_negative,
        swap_positive: summaryData.swap_positive,
        swap_negative: summaryData.swap_negative,
        hasSwapBreakdown: summaryData.swap_positive !== undefined && summaryData.swap_negative !== undefined
      });

      setSummary(summaryData);
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
    deposit: 0,
    withdraw: 0,
    swap: 0,
    swap_positive: 0,
    swap_negative: 0,
    balance: 0,
    equity: 0,
    profit: 0,
    commission: 0,
  };

  const hasXmPoints = false;
  const hasSwapBreakdown = summaryData.swap_positive !== undefined && summaryData.swap_negative !== undefined;

  return (
    <>
      <div className="kpi-card">
        <div className="kpi-title" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 'bold', color: 'var(--muted)', margin: '0 0 8px' }}>
          入金総額
          <HelpIcon text="口座に入金した総額です。取引資金の元手を把握するための指標です。" />
        </div>
        <div className="kpi-value" style={{ color: 'var(--accent-2)' }}>
          +{summaryData.deposit.toLocaleString('ja-JP')} <span className="kpi-unit" style={{ color: 'var(--accent-2)' }}>円</span>
        </div>
        <div className="kpi-desc">累計入金額の合計</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-title" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 'bold', color: 'var(--muted)', margin: '0 0 8px' }}>
          出金総額
          <HelpIcon text="口座から出金した総額です。利益の引き出しや資金移動の記録です。" />
        </div>
        <div className="kpi-value" style={{ color: 'var(--loss)' }}>
          -{Math.abs(summaryData.withdraw).toLocaleString('ja-JP')} <span className="kpi-unit" style={{ color: 'var(--loss)' }}>円</span>
        </div>
        <div className="kpi-desc">累計出金額の合計</div>
      </div>

      {peakEquity !== undefined && (
        <div className="kpi-card">
          <div className="kpi-title" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 'bold', color: 'var(--muted)', margin: '0 0 8px' }}>
            最高資産
            <HelpIcon text="累積損益の最高到達点です。過去に達成した最大の資産額を示します。" />
          </div>
          <div className="kpi-value" style={{ color: 'var(--accent-2)' }}>
            +{peakEquity.toLocaleString('ja-JP')} <span className="kpi-unit" style={{ color: 'var(--accent-2)' }}>円</span>
          </div>
          <div className="kpi-desc">累積損益のピーク値</div>
        </div>
      )}

    </>
  );
}
