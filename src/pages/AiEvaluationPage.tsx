import React, { useState, useEffect, useMemo } from 'react';
import type { TradeRow, TradeMetrics } from '../types/evaluation.types';
import { scoreFromMetrics } from '../utils/evaluation-score';
import OverallScore from '../components/evaluation/OverallScore';
import RadarChart from '../components/evaluation/RadarChart';
import Sparkline from '../components/evaluation/Sparkline';
import { getDataMetrics, getDataRows, INIT_CAPITAL } from '../services/demoData';
import { useDataset } from '../lib/dataset.context';
import { computeMetrics } from '../utils/evaluation-metrics';
import { HelpIcon } from '../components/common/HelpIcon';
import { CoachingSheetView } from '../components/ai-coaching/CoachingSheetView';
import { callAutoReviewAI, generateMockCoachingSheet } from '../services/ai-coaching/callAutoReviewAI';
import type { AIResponse } from '../services/ai-coaching/types';
import '../styles/journal-notebook.css';

export default function AiEvaluationPage() {
  const { dataset, useDatabase, isInitialized } = useDataset();
  const [dataRows, setDataRows] = useState<TradeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [coachingData, setCoachingData] = useState<AIResponse | null>(null);
  const [generating, setGenerating] = useState(false);

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

        .overall-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          align-items: start;
        }

        @media (min-width: 640px) {
          .overall-grid {
            grid-template-columns: 140px 1fr;
          }
        }

        @media (min-width: 1024px) {
          .overall-grid {
            grid-template-columns: 140px 280px 1fr 1fr;
          }
        }

        .overall-section {
          padding-left: 0;
          border-left: none;
        }

        @media (min-width: 1024px) {
          .overall-section {
            padding-left: 16px;
            border-left: 1px solid var(--line);
          }
        }

        @media (max-width: 639px) {
          .overall-grid > div:first-child {
            max-width: 200px;
            margin: 0 auto;
          }
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          border-bottom: 1px solid var(--line);
          gap: 12px;
        }

        @media (max-width: 640px) {
          .panel-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .panel-header .badge {
            align-self: flex-start;
          }
        }
      `}</style>

      <div style={{ display: 'grid', gap: 16, minWidth: 0 }}>
        {!coachingData ? (
          <section className="panel">
            <div className="panel-header">
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 'bold', color: 'var(--muted)', display: 'flex', alignItems: 'center' }}>
                AIコーチング
                <HelpIcon text="取引データを分析し、AIがパーソナライズされたコーチングを提供します。" />
              </h3>
            </div>
            <div style={{ padding: '12px 16px' }}>
              <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '16px' }}>
                  取引データを分析して、パーソナライズされたコーチングシートを生成します。
                </p>
                <button
                  onClick={async () => {
                    setGenerating(true);
                    try {
                      const tradesJson = dataRows.map(row => ({
                        date: row.closeDate,
                        symbol: row.symbol,
                        side: row.profit >= 0 ? 'BUY' : 'SELL',
                        lots: row.lots || 0.1,
                        pnl: row.profit,
                      }));
                      const result = generateMockCoachingSheet();
                      setCoachingData(result);
                    } catch (error) {
                      console.error('コーチング生成エラー:', error);
                    } finally {
                      setGenerating(false);
                    }
                  }}
                  disabled={generating || dataRows.length === 0}
                  style={{
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'white',
                    background: generating || dataRows.length === 0 ? 'var(--muted)' : 'var(--accent)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: generating || dataRows.length === 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  {generating ? '生成中...' : 'AIコーチングを生成'}
                </button>
              </div>
            </div>
          </section>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
              <button
                onClick={() => setCoachingData(null)}
                style={{
                  padding: '8px 16px',
                  fontSize: '13px',
                  color: 'var(--muted)',
                  background: 'var(--chip)',
                  border: '1px solid var(--line)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                再生成
              </button>
            </div>
            <CoachingSheetView
              sheet={coachingData.sheet}
              scoreComponent={<OverallScore score={scoreData.overall} rank={scoreData.rank} />}
              radarComponent={<RadarChart parts={scoreData.parts} />}
            />
          </>
        )}
      </div>
    </div>
  );
}
