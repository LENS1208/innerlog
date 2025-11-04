import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { DatasetKey, DDBasic, TradeRow, TradeMetrics } from '../types/evaluation.types';
import { computeMetrics, demoMetrics } from '../utils/evaluation-metrics';
import { scoreFromMetrics } from '../utils/evaluation-score';
import OverallScore from '../components/evaluation/OverallScore';
import RadarChart from '../components/evaluation/RadarChart';
import KPICards from '../components/evaluation/KPICards';
import WhatIfSimulator from '../components/evaluation/WhatIfSimulator';
import Sparkline from '../components/evaluation/Sparkline';
import AiInsightsSection from '../components/evaluation/AiInsightsSection';
import TimingQualitySection from '../components/evaluation/TimingQualitySection';
import RiskAnalysisSection from '../components/evaluation/RiskAnalysisSection';
import StrengthWeaknessSection from '../components/evaluation/StrengthWeaknessSection';
import TPSLEvaluationSection from '../components/evaluation/TPSLEvaluationSection';
import RecommendedActionsSection from '../components/evaluation/RecommendedActionsSection';
import AlertsRulesSection from '../components/evaluation/AlertsRulesSection';
import DataStatusSection from '../components/evaluation/DataStatusSection';
import NotesReflectionSection from '../components/evaluation/NotesReflectionSection';
import { useDataset } from '../lib/dataset.context';
import { getAllTrades, dbToTrade } from '../lib/db.service';
import { parseCsvText } from '../lib/csv';
import '../styles/journal-notebook.css';

export default function AiEvaluationPage() {
  const { dataset: contextDataset, useDatabase } = useDataset();
  const [datasets, setDatasets] = useState<Record<DatasetKey, TradeRow[] | null>>({
    A: null,
    B: null,
    C: null,
  });
  const [activeDataset, setActiveDataset] = useState<DatasetKey>('A');
  const [ddBasis, setDdBasis] = useState<DDBasic>('capital');
  const [initCap, setInitCap] = useState(1000000);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        if (useDatabase) {
          const dbTrades = await getAllTrades();
          const trades = dbTrades.map(dbToTrade);
          const tradeRows = trades.map(t => ({
            pnl: t.profitYen,
            pips: t.pips,
            win: t.profitYen > 0,
            pair: t.pair,
            side: t.side,
            datetime: t.datetime,
            hour: new Date(t.datetime).getUTCHours(),
            dayOfWeek: new Date(t.datetime).getUTCDay(),
          }));
          setDatasets({ A: tradeRows, B: null, C: null });
        } else {
          const res = await fetch(`/demo/${activeDataset}.csv?t=${Date.now()}`, { cache: 'no-store' });
          if (res.ok) {
            const text = await res.text();
            const trades = parseCsvText(text);
            const tradeRows = trades.map(t => ({
              pnl: t.profitYen,
              pips: t.pips,
              win: t.profitYen > 0,
              pair: t.pair,
              side: t.side,
              datetime: t.datetime,
              hour: new Date(t.datetime || Date.now()).getUTCHours(),
              dayOfWeek: new Date(t.datetime || Date.now()).getUTCDay(),
            }));
            setDatasets(prev => ({ ...prev, [activeDataset]: tradeRows }));
          }
        }
      } catch (err) {
        console.error('データ読み込みエラー:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [activeDataset, useDatabase]);

  const baseMetrics = useMemo<TradeMetrics>(() => {
    const rows = datasets[activeDataset];
    if (!rows || rows.length === 0) {
      return demoMetrics();
    }
    return computeMetrics(rows) || demoMetrics();
  }, [datasets, activeDataset]);

  const scoreData = useMemo(() => {
    return scoreFromMetrics(baseMetrics, ddBasis, initCap);
  }, [baseMetrics, ddBasis, initCap]);

  const handleDatasetChange = useCallback((key: DatasetKey) => {
    setActiveDataset(key);
  }, []);

  const handleDdBasisChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setDdBasis(e.target.value as DDBasic);
  }, []);

  const handleInitCapChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (val > 0) setInitCap(val);
  }, []);

  return (
    <div style={{ width: '100%', padding: 16 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 16,
          padding: '12px 16px',
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          borderRadius: 12,
        }}
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', gap: 6, padding: 4, background: '#f8fafc', borderRadius: 10 }}>
            {(['A', 'B', 'C'] as DatasetKey[]).map((key) => (
              <button
                key={key}
                onClick={() => handleDatasetChange(key)}
                style={{
                  padding: '6px 10px',
                  border: activeDataset === key ? '1px solid var(--line)' : '1px solid transparent',
                  borderRadius: 10,
                  background: activeDataset === key ? '#e5e7eb' : 'transparent',
                  color: activeDataset === key ? '#0b1220' : 'var(--muted)',
                  cursor: 'pointer',
                }}
              >
                デモ{key}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            DD基準
            <select
              value={ddBasis}
              onChange={handleDdBasisChange}
              style={{
                padding: '6px 10px',
                border: '1px solid var(--line)',
                borderRadius: 10,
                background: '#ffffff',
              }}
            >
              <option value="capital">初期資金%</option>
              <option value="r">ロット基準(1R)%</option>
            </select>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            初期資金
            <input
              type="number"
              value={initCap}
              onChange={handleInitCapChange}
              min="1"
              step="1000"
              style={{
                width: 140,
                padding: '6px 10px',
                border: '1px solid var(--line)',
                borderRadius: 10,
                background: '#ffffff',
              }}
            />
          </label>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 16 }}>
        <section className="panel">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              borderBottom: '1px solid var(--line)',
            }}
          >
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>総合スコア & レーダーチャート</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                取引データから総合点とバランス（5指標）を自動評価
              </div>
            </div>
          </div>
          <div
            style={{
              padding: 16,
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: 12,
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
              <OverallScore score={scoreData.overall} rank={scoreData.rank} />
              <RadarChart parts={scoreData.parts} />
            </div>
          </div>
        </section>

        <section className="panel">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              borderBottom: '1px solid var(--line)',
            }}
          >
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>評価まとめ</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                全体の評価と、最初にやると良いこと
              </div>
            </div>
            <div className="badge ok">分析の信頼度: 高め</div>
          </div>
          <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
            <div className="panel" style={{ padding: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>サマリー</div>
              {baseMetrics.equity && baseMetrics.equity.length > 1 && (
                <Sparkline data={baseMetrics.equity} />
              )}
              <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
                <div className="badge ok">改善見込み: PF +0.18</div>
                <div className="badge warn">DD -12%（見込み）</div>
                <div className="badge">得意パターン: EURUSD × LDN × ブレイク</div>
              </div>
            </div>
            <div className="panel" style={{ padding: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
                まずやると良いこと（3つ）
              </div>
              <ol style={{ margin: '0 0 8px 18px', lineHeight: 1.7 }}>
                <li>利確/損切りの比率 1.2 → 1.6（PF +0.18）</li>
                <li>NY開始前30分は取引を控える（DD -8%）</li>
                <li>1回のリスク上限を 1.8% → 1.2% に見直す（連敗に強く）</li>
              </ol>
              <a href="#sec4" style={{ color: 'var(--accent)' }}>
                → シナリオで検証
              </a>
            </div>
          </div>
        </section>

        <section className="panel" id="sec2">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              borderBottom: '1px solid var(--line)',
            }}
          >
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>大事な数字（KPI）</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                成績をざっくりつかむための指標
              </div>
            </div>
          </div>
          <div style={{ padding: 16 }}>
            <KPICards metrics={baseMetrics} ddBasis={ddBasis} initCap={initCap} />
            {baseMetrics.equity && baseMetrics.equity.length > 1 && (
              <div style={{ marginTop: 12 }}>
                <Sparkline data={baseMetrics.equity} />
              </div>
            )}
          </div>
        </section>

        <section className="panel" id="sec4">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              borderBottom: '1px solid var(--line)',
            }}
          >
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>シミュレーション（利確/損切り）</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                比率やルールを変えたら、成績はどう変わる？
              </div>
            </div>
          </div>
          <div style={{ padding: 16 }}>
            <WhatIfSimulator baseMetrics={baseMetrics} ddBasis={ddBasis} initCap={initCap} />
          </div>
        </section>

        <AiInsightsSection />
        <TimingQualitySection trades={datasets[activeDataset] || []} />
        <RiskAnalysisSection trades={datasets[activeDataset] || []} initialCapital={initCap} />
        <StrengthWeaknessSection trades={datasets[activeDataset] || []} />
        <TPSLEvaluationSection metrics={baseMetrics} />
        <RecommendedActionsSection metrics={baseMetrics} />
        <AlertsRulesSection metrics={baseMetrics} />
        <DataStatusSection metrics={baseMetrics} />
        <NotesReflectionSection />
      </div>
    </div>
  );
}
