import React, { useState, useEffect, useMemo } from 'react';
import type { TradeRow, TradeMetrics } from '../types/evaluation.types';
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
import { getDataMetrics, getDataRows, INIT_CAPITAL } from '../services/demoData';
import { useDataset } from '../lib/dataset.context';
import { computeMetrics } from '../utils/evaluation-metrics';
import '../styles/journal-notebook.css';

export default function AiEvaluationPage() {
  const { dataset, useDatabase, isInitialized } = useDataset();
  const [dataRows, setDataRows] = useState<TradeRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isInitialized) return;

    setLoading(true);
    (async () => {
      try {
        const rows = await getDataRows(useDatabase, dataset);
        setDataRows(rows);
      } catch (err) {
        console.error('データ取得エラー:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [dataset, useDatabase, isInitialized]);

  const baseMetrics = useMemo<TradeMetrics>(() => {
    if (dataRows.length === 0) {
      return {
        trades: 0,
        winrate: 0,
        pf: 0,
        pipsSum: 0,
        equity: [],
        maxdd: 0,
        pnls: [],
        pipsArr: [],
      };
    }
    return computeMetrics(dataRows);
  }, [dataRows]);

  const scoreData = useMemo(() => {
    return scoreFromMetrics(baseMetrics, 'capital', INIT_CAPITAL);
  }, [baseMetrics]);

  if (!isInitialized || loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '400px',
        fontSize: 16,
        color: 'var(--muted)'
      }}>
        データを読み込んでいます...
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <style>{`
        .eval-grid-2col {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          min-width: 0;
        }

        @media (min-width: 768px) {
          .eval-grid-2col {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
        }

        .panel {
          min-width: 0;
        }

        .panel > div {
          min-width: 0;
        }
      `}</style>

      <div style={{ display: 'grid', gap: 24, minWidth: 0 }}>
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
              <div style={{ fontSize: 18, fontWeight: 700 }}>総合スコア & レーダーチャート</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
                取引データから総合点とバランス（5指標）を自動評価
              </div>
            </div>
          </div>
          <div style={{ padding: '20px 16px', minWidth: 0 }}>
            <div className="eval-grid-2col">
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
              <div style={{ fontSize: 18, fontWeight: 700 }}>評価まとめ</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
                全体の評価と、最初にやると良いこと
              </div>
            </div>
            <div className="badge ok">分析の信頼度: 高め</div>
          </div>
          <div style={{ padding: '20px 16px', minWidth: 0 }} className="eval-grid-2col">
            <div className="panel" style={{ padding: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 'bold', color: 'var(--muted)', marginBottom: 12 }}>サマリー</div>
              {baseMetrics.equity && baseMetrics.equity.length > 1 && (
                <Sparkline data={baseMetrics.equity} />
              )}
              <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
                <div className="badge ok">改善見込み: PF +0.18</div>
                <div className="badge warn">DD -12%（見込み）</div>
                <div className="badge">得意パターン: EURUSD × LDN × ブレイク</div>
              </div>
            </div>
            <div className="panel" style={{ padding: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 'bold', color: 'var(--muted)', marginBottom: 12 }}>
                まずやると良いこと（3つ）
              </div>
              <ol style={{ margin: '0 0 8px 18px', lineHeight: 1.7, fontSize: 13, color: 'var(--ink)' }}>
                <li>利確/損切りの比率 1.2 → 1.6（PF +0.18）</li>
                <li>NY開始前30分は取引を控える（DD -8%）</li>
                <li>1回のリスク上限を 1.8% → 1.2% に見直す（連敗に強く）</li>
              </ol>
              <a href="#sec4" style={{ color: 'var(--accent)', fontSize: 13 }}>
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
              <div style={{ fontSize: 18, fontWeight: 700 }}>大事な数字（KPI）</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
                成績をざっくりつかむための指標
              </div>
            </div>
          </div>
          <div style={{ padding: '20px 16px' }}>
            <KPICards metrics={baseMetrics} ddBasis="capital" initCap={INIT_CAPITAL} />
            {baseMetrics.equity && baseMetrics.equity.length > 1 && (
              <div style={{ marginTop: 16 }}>
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
              <div style={{ fontSize: 18, fontWeight: 700 }}>シミュレーション（利確/損切り）</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
                比率やルールを変えたら、成績はどう変わる？
              </div>
            </div>
          </div>
          <div style={{ padding: '20px 16px' }}>
            <WhatIfSimulator baseMetrics={baseMetrics} ddBasis="capital" initCap={INIT_CAPITAL} />
          </div>
        </section>

        <AiInsightsSection />
        <TimingQualitySection trades={dataRows} />
        <RiskAnalysisSection trades={dataRows} initialCapital={INIT_CAPITAL} />
        <StrengthWeaknessSection trades={dataRows} />
        <TPSLEvaluationSection metrics={baseMetrics} />
        <RecommendedActionsSection metrics={baseMetrics} />
        <AlertsRulesSection metrics={baseMetrics} />
        <DataStatusSection metrics={baseMetrics} />
        <NotesReflectionSection />
      </div>
    </div>
  );
}
