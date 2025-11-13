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
import { getCoachingCache, setCoachingCache, clearCoachingCache } from '../services/coaching-storage';
import '../styles/journal-notebook.css';

export default function AiEvaluationPage() {
  const { dataset, useDatabase, isInitialized } = useDataset();
  const [dataRows, setDataRows] = useState<TradeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [coachingData, setCoachingData] = useState<AIResponse | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isInitialized) return;

    setLoading(true);
    (async () => {
      try {
        const rows = await getDataRows(useDatabase, dataset);
        console.log('📥 取得したトレード件数:', rows.length);
        console.log('📥 最初のトレードデータサンプル:', rows[0]);
        setDataRows(rows);
      } catch (err) {
        console.error('データ取得エラー:', err);
        setError('データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    })();
  }, [dataset, useDatabase, isInitialized]);

  useEffect(() => {
    if (!isInitialized || !dataset) return;

    const cached = getCoachingCache(dataset);
    console.log('💾 キャッシュデータ:', cached);
    console.log('💾 キャッシュのsheet:', cached?.sheet);
    console.log('💾 キャッシュのsummary:', cached?.sheet?.summary);

    if (cached && cached.sheet && cached.sheet.summary) {
      setCoachingData(cached);
      setError(null);
    } else {
      if (cached) {
        console.warn('⚠️ キャッシュデータが不完全です。クリアします。');
      }
      setCoachingData(null);
    }
  }, [dataset, isInitialized]);

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
                {error && (
                  <p style={{ fontSize: '13px', color: 'var(--loss)', marginBottom: '16px', padding: '12px', background: 'var(--loss-bg)', borderRadius: '6px' }}>
                    {error}
                  </p>
                )}
                <button
                  onClick={async () => {
                    setGenerating(true);
                    setError(null);
                    try {
                      const winTrades = dataRows.filter(r => (r.profit || 0) > 0);
                      const lossTrades = dataRows.filter(r => (r.profit || 0) < 0);
                      const avgWin = winTrades.length > 0 ? winTrades.reduce((s, r) => s + (r.profit || 0), 0) / winTrades.length : 0;
                      const avgLoss = lossTrades.length > 0 ? Math.abs(lossTrades.reduce((s, r) => s + (r.profit || 0), 0) / lossTrades.length) : 0;

                      const symbolStats = dataRows.reduce((acc, row) => {
                        const sym = row.symbol || 'UNKNOWN';
                        if (!acc[sym]) acc[sym] = { trades: 0, wins: 0, pnl: 0 };
                        acc[sym].trades++;
                        if ((row.profit || 0) > 0) acc[sym].wins++;
                        acc[sym].pnl += row.profit || 0;
                        return acc;
                      }, {} as Record<string, { trades: number; wins: number; pnl: number }>);

                      const setupStats = dataRows.reduce((acc, row) => {
                        const setup = row.setup || 'unknown';
                        if (!acc[setup]) acc[setup] = { trades: 0, wins: 0, pnl: 0 };
                        acc[setup].trades++;
                        if ((row.profit || 0) > 0) acc[setup].wins++;
                        acc[setup].pnl += row.profit || 0;
                        return acc;
                      }, {} as Record<string, { trades: number; wins: number; pnl: number }>);

                      const timeStats = dataRows.reduce((acc, row) => {
                        if (!row.openDate) return acc;
                        const dt = new Date(row.openDate);
                        const hour = dt.getHours();
                        const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][dt.getDay()];

                        if (!acc.byHour[hour]) acc.byHour[hour] = { trades: 0, wins: 0, pnl: 0 };
                        acc.byHour[hour].trades++;
                        if ((row.profit || 0) > 0) acc.byHour[hour].wins++;
                        acc.byHour[hour].pnl += row.profit || 0;

                        if (!acc.byDayOfWeek[dayOfWeek]) acc.byDayOfWeek[dayOfWeek] = { trades: 0, wins: 0, pnl: 0 };
                        acc.byDayOfWeek[dayOfWeek].trades++;
                        if ((row.profit || 0) > 0) acc.byDayOfWeek[dayOfWeek].wins++;
                        acc.byDayOfWeek[dayOfWeek].pnl += row.profit || 0;

                        return acc;
                      }, { byHour: {}, byDayOfWeek: {} } as { byHour: Record<number, { trades: number; wins: number; pnl: number }>; byDayOfWeek: Record<string, { trades: number; wins: number; pnl: number }> });

                      const streakAnalysis = (() => {
                        let currentStreak = 0;
                        let maxWinStreak = 0;
                        let maxLossStreak = 0;
                        const afterWinStreak: { win: number; loss: number } = { win: 0, loss: 0 };
                        const afterLossStreak: { win: number; loss: number } = { win: 0, loss: 0 };
                        let wasInWinStreak = false;
                        let wasInLossStreak = false;

                        dataRows.forEach((row, idx) => {
                          const isWin = (row.profit || 0) > 0;

                          if (isWin) {
                            currentStreak = currentStreak > 0 ? currentStreak + 1 : 1;
                            maxWinStreak = Math.max(maxWinStreak, currentStreak);
                            if (wasInLossStreak && idx > 0) afterLossStreak.win++;
                            wasInWinStreak = currentStreak >= 2;
                            wasInLossStreak = false;
                          } else {
                            currentStreak = currentStreak < 0 ? currentStreak - 1 : -1;
                            maxLossStreak = Math.max(maxLossStreak, Math.abs(currentStreak));
                            if (wasInWinStreak && idx > 0) afterWinStreak.loss++;
                            wasInLossStreak = Math.abs(currentStreak) >= 2;
                            wasInWinStreak = false;
                          }
                        });

                        return {
                          maxWinStreak,
                          maxLossStreak,
                          afterWinStreak,
                          afterLossStreak,
                        };
                      })();

                      const tradesJson = {
                        trades: dataRows.map(row => ({
                          ticket: row.ticket,
                          openDate: row.openDate,
                          closeDate: row.closeDate,
                          symbol: row.symbol,
                          side: row.side,
                          lots: row.lots,
                          openPrice: row.openPrice,
                          closePrice: row.closePrice,
                          sl: row.sl,
                          tp: row.tp,
                          profit: row.profit,
                          pips: row.pips,
                          swap: row.swap,
                          commission: row.commission,
                          setup: row.setup,
                        })),
                        summary: {
                          totalTrades: dataRows.length,
                          winRate: baseMetrics.winrate,
                          profitFactor: baseMetrics.pf,
                          totalPnL: dataRows.reduce((s, r) => s + (r.profit || 0), 0),
                          totalPips: baseMetrics.pipsSum,
                          maxDrawdown: baseMetrics.maxdd,
                          avgWin,
                          avgLoss,
                          winLossRatio: avgLoss > 0 ? avgWin / avgLoss : 0,
                          largestWin: Math.max(...dataRows.map(r => r.profit || 0)),
                          largestLoss: Math.min(...dataRows.map(r => r.profit || 0)),
                        },
                        bySymbol: symbolStats,
                        bySetup: setupStats,
                        timePatterns: {
                          byHour: timeStats.byHour,
                          byDayOfWeek: timeStats.byDayOfWeek,
                        },
                        streakPatterns: streakAnalysis,
                      };

                      console.log('🎯 送信するトレードデータ（サマリー）:', tradesJson.summary);
                      console.log('🎯 送信するトレードデータ（通貨ペア別）:', tradesJson.bySymbol);
                      console.log('🎯 送信するトレードデータ（セットアップ別）:', tradesJson.bySetup);

                      const result = await callAutoReviewAI(tradesJson, {
                        dateRange: `Dataset ${dataset}`,
                      });

                      console.log('📦 AI結果:', result);
                      console.log('📦 AI結果のsheet:', result?.sheet);
                      console.log('📦 AI結果のsummary:', result?.sheet?.summary);

                      setCoachingData(result);
                      setCoachingCache(dataset, result);
                    } catch (error) {
                      console.error('コーチング生成エラー:', error);
                      setError('AIコーチングの生成中にエラーが発生しました。しばらくしてから再度お試しください。');
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
        ) : coachingData?.sheet ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '12px' }}>
              <button
                onClick={() => {
                  clearCoachingCache(dataset);
                  setCoachingData(null);
                  setError(null);
                }}
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
              scoreComponent={
                coachingData.sheet.evaluationScore ? (
                  <OverallScore
                    score={coachingData.sheet.evaluationScore.overall}
                    rank={
                      coachingData.sheet.evaluationScore.overall >= 80 ? 'S' :
                      coachingData.sheet.evaluationScore.overall >= 70 ? 'A' :
                      coachingData.sheet.evaluationScore.overall >= 60 ? 'B' :
                      coachingData.sheet.evaluationScore.overall >= 50 ? 'C' : 'D'
                    }
                  />
                ) : (
                  <OverallScore score={scoreData.overall} rank={scoreData.rank} />
                )
              }
              radarComponent={
                coachingData.sheet.evaluationScore ? (
                  <RadarChart parts={[
                    { label: 'リスク管理', value: coachingData.sheet.evaluationScore.riskManagement },
                    { label: 'エントリー', value: coachingData.sheet.evaluationScore.entryTiming },
                    { label: '出口戦略', value: coachingData.sheet.evaluationScore.exitStrategy },
                    { label: '感情制御', value: coachingData.sheet.evaluationScore.emotionalControl },
                    { label: '一貫性', value: coachingData.sheet.evaluationScore.consistency },
                  ]} />
                ) : (
                  <RadarChart parts={scoreData.parts} />
                )
              }
            />
          </>
        ) : (
          <section style={{ background: 'var(--card)', padding: '24px', borderRadius: '8px' }}>
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '16px' }}>
                データの読み込み中にエラーが発生しました
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
