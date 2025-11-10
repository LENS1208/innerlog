import React, { useEffect, useMemo, useState } from "react";
import { useDataset } from "../lib/dataset.context";
import { supabase } from "../lib/supabase";
import { filterTrades } from "../lib/filterTrades";
import type { Trade as FilteredTrade } from "../lib/types";
import { parseCsvText } from "../lib/csv";
import DashboardKPI from "./DashboardKPI";
import {
  EquityChart,
  DrawdownChart,
  DailyProfitChart,
  RecentTradesTable,
  MonthCalendar,
  SegmentCharts,
  SetupChart,
  ProfitDistributionChart,
  HoldingTimeDistributionChart
} from "./DashboardSections";
import ProfitBreakdownPanel from "../components/ProfitBreakdownPanel";
import "../lib/dashboard.css";
const EquityCurvePage: React.FC = () => {
  console.log("🔄 EquityCurvePage render");
  const { filters, useDatabase, dataset: contextDataset } = useDataset();

  const [trades, setTrades] = useState<FilteredTrade[]>([]);
  const [breakdownPanel, setBreakdownPanel] = useState<{ rangeLabel: string; trades: any[] } | null>(null);

  useEffect(() => {
    const loadTrades = async () => {
      try {
        if (useDatabase) {
          // データベースから読み込む
          const { getAllTrades } = await import('../lib/db.service');
          const data = await getAllTrades();

          const dbTrades: FilteredTrade[] = (data || []).map((t: any) => ({
            id: String(t.ticket || t.id),
            datetime: t.close_time,
            openTime: t.open_time,
            pair: t.item || t.symbol || 'UNKNOWN',
            symbol: t.item || t.symbol,
            side: (t.side || 'LONG') as 'LONG' | 'SHORT',
            volume: Number(t.size) || 0,
            profitYen: Number(t.profit),
            profit: Number(t.profit),
            pips: 0,
            openPrice: Number(t.open_price),
            closePrice: Number(t.close_price),
            memo: t.memo || '',
            comment: t.comment || '',
          }));

          setTrades(dbTrades);
        } else {
          // CSVから読み込む
          const cacheBuster = `?t=${Date.now()}`;
          const res = await fetch(`/demo/${contextDataset}.csv${cacheBuster}`, { cache: "no-store" });
          if (!res.ok) {
            setTrades([]);
            return;
          }
          const text = await res.text();
          const parsedTrades = parseCsvText(text);
          setTrades(parsedTrades);
        }
      } catch (e) {
        console.error('Exception loading trades:', e);
        setTrades([]);
      }
    };

    loadTrades();
  }, [useDatabase, contextDataset]);
  // フィルタ適用（filterTradesを使用）
  const filteredTrades = useMemo(() => {
    return filterTrades(trades, filters);
  }, [trades, filters]);

  // 累積損益計算は不要（DashboardSectionsコンポーネント内で計算される）

  // ---- UI ----
  return (
    <div style={{ width: "100%", maxWidth: "100%", overflowX: "hidden" }}>
      <div style={{ width: "100%", maxWidth: "100%" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, width: "100%", maxWidth: "100%" }}>
          <div>
            {/* ダッシュボードKPI */}
            <DashboardKPI trades={filteredTrades} />

            {/* 1. 累積損益とドローダウン（最重要：全体のパフォーマンス推移） */}
            <section className="dash-row-2" style={{ marginBottom: 16 }}>
              <div className="dash-card">
                <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 'bold', color: 'var(--muted)' }}>累積損益（Equity）</h3>
                <EquityChart trades={filteredTrades as any} />
              </div>
              <div className="dash-card">
                <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 'bold', color: 'var(--muted)' }}>ドローダウン</h3>
                <DrawdownChart trades={filteredTrades as any} />
              </div>
            </section>

            {/* 2. 日次損益と今月のトレード（時系列パフォーマンス） */}
            <section className="dash-row-2" style={{ marginBottom: 16 }}>
              <div className="dash-card">
                <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 'bold', color: 'var(--muted)' }}>日次損益</h3>
                <DailyProfitChart trades={filteredTrades as any} />
              </div>
              <div className="dash-card">
                <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 'bold', color: 'var(--muted)' }}>今月のトレード</h3>
                <MonthCalendar trades={filteredTrades as any} />
              </div>
            </section>

            {/* 3. 損益分布と保有時間分布（トレードの特性分析） */}
            <section className="dash-row-2" style={{ marginBottom: 16 }}>
              <ProfitDistributionChart
                trades={filteredTrades as any}
                onRangeClick={(rangeLabel, rangeTrades) => {
                  setBreakdownPanel({ rangeLabel, trades: rangeTrades });
                }}
              />
              <HoldingTimeDistributionChart trades={filteredTrades as any} />
            </section>

            {/* 4. セグメント分析（市場条件別の詳細分析） */}
            <section style={{ marginBottom: 16 }}>
              <SegmentCharts trades={filteredTrades as any} />
            </section>

            {/* 5. セットアップ別とベスト/ワーストトレード（戦略分析と個別取引） */}
            <section className="dash-row-2" style={{ marginBottom: 16 }}>
              <SetupChart trades={filteredTrades as any} />
              <div className="dash-card">
                <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 'bold', color: 'var(--muted)' }}>直近の取引（上位/下位）</h3>
                <RecentTradesTable trades={filteredTrades as any} />
              </div>
            </section>
          </div>
        </div>
      </div>

      {breakdownPanel && (
        <ProfitBreakdownPanel
          trades={breakdownPanel.trades}
          rangeLabel={breakdownPanel.rangeLabel}
          onClose={() => setBreakdownPanel(null)}
        />
      )}
    </div>
  );
};

export default EquityCurvePage;
