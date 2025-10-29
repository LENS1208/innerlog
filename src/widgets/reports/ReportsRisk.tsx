import React, { useEffect, useMemo, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import { useDataset } from "../../lib/dataset.context";
import { parseCsvText } from "../../lib/csv";
import type { Trade } from "../../lib/types";
import { filterTrades, getTradeProfit, getTradePair } from "../../lib/filterTrades";
import { supabase } from "../../lib/supabase";

type UnitType = "yen" | "r";

export default function ReportsRisk() {
  const { dataset, filters, useDatabase } = useDataset();
  const [trades, setTrades] = useState<Trade[]>([]);
  const unit: UnitType = "yen";

  useEffect(() => {
    (async () => {
      try {
        if (useDatabase) {
          const { data, error } = await supabase
            .from('trades')
            .select('*')
            .order('close_time', { ascending: true });

          if (error) {
            console.error('Error loading trades from database:', error);
            setTrades([]);
            return;
          }

          const mapped: Trade[] = (data || []).map((t: any) => ({
            id: t.ticket,
            datetime: t.close_time,
            pair: t.item,
            side: t.side as any,
            volume: Number(t.size),
            profitYen: Number(t.profit),
            pips: Number(t.pips),
            openTime: t.open_time,
            openPrice: Number(t.open_price),
            closePrice: Number(t.close_price),
            stopPrice: t.sl ? Number(t.sl) : undefined,
            targetPrice: t.tp ? Number(t.tp) : undefined,
            commission: Number(t.commission),
            swap: Number(t.swap),
            symbol: t.item,
            action: t.side as any,
            profit: Number(t.profit),
            comment: '',
            memo: '',
          }));
          setTrades(mapped);
        } else {
          const res = await fetch(`/demo/${dataset}.csv?t=${Date.now()}`, { cache: "no-store" });
          if (!res.ok) return;
          const text = await res.text();
          const parsed = parseCsvText(text);
          setTrades(parsed);
        }
      } catch (err) {
        console.error("Failed to load trades:", err);
      }
    })();
  }, [dataset, useDatabase]);

  const filteredTrades = useMemo(() => filterTrades(trades, filters), [trades, filters]);

  const extractSetup = (t: Trade): string => {
    const text = (t.comment || t.memo || "").toLowerCase();
    if (text.includes("breakout") || text.includes("ブレイクアウト")) return "Breakout";
    if (text.includes("pullback") || text.includes("プルバック")) return "Pullback";
    if (text.includes("reversal") || text.includes("反転")) return "Reversal";
    if (text.includes("trend") || text.includes("トレンド")) return "Trend";
    if (text.includes("range") || text.includes("レンジ")) return "Range";
    if (text.includes("scalp") || text.includes("スキャルプ")) return "Scalp";
    return "Other";
  };

  const sortedTrades = useMemo(() => {
    return [...filteredTrades].sort((a, b) => a.openTime.localeCompare(b.openTime));
  }, [filteredTrades]);

  const drawdownData = useMemo(() => {
    let peak = 0;
    let cumulative = 0;
    let maxDD = 0;
    let maxDDStart = "";
    let maxDDBottom = "";
    const ddSeries: number[] = [];

    sortedTrades.forEach((t) => {
      cumulative += getTradeProfit(t);
      if (cumulative > peak) {
        peak = cumulative;
      }
      const dd = peak - cumulative;
      if (dd > maxDD) {
        maxDD = dd;
        maxDDBottom = t.openTime;
      }
      ddSeries.push(dd);
    });

    return { maxDD, series: ddSeries, maxDDStart, maxDDBottom };
  }, [sortedTrades]);

  const streakData = useMemo(() => {
    let currentWinStreak = 0;
    let currentLossStreak = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;
    let maxWinStreakDate = "";
    let maxLossStreakDate = "";

    sortedTrades.forEach((t) => {
      const profit = getTradeProfit(t);
      if (profit > 0) {
        currentWinStreak++;
        currentLossStreak = 0;
        if (currentWinStreak > maxWinStreak) {
          maxWinStreak = currentWinStreak;
          maxWinStreakDate = t.openTime;
        }
      } else if (profit < 0) {
        currentLossStreak++;
        currentWinStreak = 0;
        if (currentLossStreak > maxLossStreak) {
          maxLossStreak = currentLossStreak;
          maxLossStreakDate = t.openTime;
        }
      }
    });

    return { maxWinStreak, maxLossStreak, maxWinStreakDate, maxLossStreakDate };
  }, [sortedTrades]);

  const riskMetrics = useMemo(() => {
    const profits = filteredTrades.map((t) => getTradeProfit(t));
    if (profits.length === 0) return { maxProfit: 0, maxLoss: 0, avgWin: 0, avgLoss: 0, rMultipleAvg: 0, maxProfitTrade: null, maxLossTrade: null };

    const winTrades = filteredTrades.filter((t) => getTradeProfit(t) > 0);
    const lossTrades = filteredTrades.filter((t) => getTradeProfit(t) < 0);

    const maxProfit = Math.max(...profits);
    const maxLoss = Math.min(...profits);
    const avgWin = winTrades.length > 0 ? winTrades.reduce((sum, t) => sum + getTradeProfit(t), 0) / winTrades.length : 0;
    const avgLoss = lossTrades.length > 0 ? lossTrades.reduce((sum, t) => sum + getTradeProfit(t), 0) / lossTrades.length : 0;

    const maxProfitTrade = filteredTrades.find((t) => getTradeProfit(t) === maxProfit) || null;
    const maxLossTrade = filteredTrades.find((t) => getTradeProfit(t) === maxLoss) || null;

    const avgRisk = Math.abs(avgLoss);
    const rMultipleAvg = avgRisk > 0 ? (profits.reduce((sum, p) => sum + p, 0) / profits.length) / avgRisk : 0;

    return { maxProfit, maxLoss, avgWin, avgLoss, rMultipleAvg, maxProfitTrade, maxLossTrade };
  }, [filteredTrades]);

  const profitDistribution = useMemo(() => {
    const ranges = [
      { label: "-20k以下", min: -Infinity, max: -20000 },
      { label: "-20k~-10k", min: -20000, max: -10000 },
      { label: "-10k~-5k", min: -10000, max: -5000 },
      { label: "-5k~0", min: -5000, max: 0 },
      { label: "0~5k", min: 0, max: 5000 },
      { label: "5k~10k", min: 5000, max: 10000 },
      { label: "10k~20k", min: 10000, max: 20000 },
      { label: "20k以上", min: 20000, max: Infinity },
    ];

    const counts = ranges.map((range) => {
      return filteredTrades.filter((t) => {
        const profit = getTradeProfit(t);
        return profit >= range.min && profit < range.max;
      }).length;
    });

    return { labels: ranges.map((r) => r.label), counts };
  }, [filteredTrades]);

  const rMultipleDistribution = useMemo(() => {
    const avgRisk = Math.abs(riskMetrics.avgLoss);
    if (avgRisk === 0) return { labels: [], counts: [] };

    const ranges = [
      { label: "-3R以下", min: -Infinity, max: -3 },
      { label: "-3R~-2R", min: -3, max: -2 },
      { label: "-2R~-1R", min: -2, max: -1 },
      { label: "-1R~0R", min: -1, max: 0 },
      { label: "0R~1R", min: 0, max: 1 },
      { label: "1R~2R", min: 1, max: 2 },
      { label: "2R~3R", min: 2, max: 3 },
      { label: "3R以上", min: 3, max: Infinity },
    ];

    const counts = ranges.map((range) => {
      return filteredTrades.filter((t) => {
        const profit = getTradeProfit(t);
        const r = profit / avgRisk;
        return r >= range.min && r < range.max;
      }).length;
    });

    return { labels: ranges.map((r) => r.label), counts };
  }, [filteredTrades, riskMetrics.avgLoss]);

  const ddContributionByDay = useMemo(() => {
    const dayMap = new Map<string, number>();
    filteredTrades.forEach((t) => {
      const profit = getTradeProfit(t);
      if (profit < 0) {
        try {
          const date = new Date(t.openTime);
          const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          const day = dayNames[date.getDay()];
          dayMap.set(day, (dayMap.get(day) || 0) + Math.abs(profit));
        } catch (err) {
          console.error("Date parse error:", err);
        }
      }
    });
    return Array.from(dayMap.entries())
      .map(([day, loss]) => ({ day, loss }))
      .sort((a, b) => b.loss - a.loss);
  }, [filteredTrades]);

  const ddContributionByPair = useMemo(() => {
    const pairMap = new Map<string, number>();
    filteredTrades.forEach((t) => {
      const profit = getTradeProfit(t);
      if (profit < 0) {
        const pair = getTradePair(t);
        pairMap.set(pair, (pairMap.get(pair) || 0) + Math.abs(profit));
      }
    });
    return Array.from(pairMap.entries())
      .map(([pair, loss]) => ({ pair, loss }))
      .sort((a, b) => b.loss - a.loss);
  }, [filteredTrades]);

  const ddContributionBySetup = useMemo(() => {
    const setupMap = new Map<string, number>();
    filteredTrades.forEach((t) => {
      const profit = getTradeProfit(t);
      if (profit < 0) {
        const setup = extractSetup(t);
        setupMap.set(setup, (setupMap.get(setup) || 0) + Math.abs(profit));
      }
    });
    return Array.from(setupMap.entries())
      .map(([setup, loss]) => ({ setup, loss }))
      .sort((a, b) => b.loss - a.loss);
  }, [filteredTrades]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return dateStr.substring(0, 10);
      }
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return dateStr.substring(0, 10);
    }
  };

  if (filteredTrades.length === 0) {
    return (
      <div style={{ width: "100%", padding: 40, textAlign: "center" }}>
        <p style={{ fontSize: 16, color: "var(--muted)" }}>データがありません。フィルター条件を変更してください。</p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%" }}>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "normal", color: "var(--muted)" }}>最大ドローダウン</h3>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--loss)" }}>
            最大DD：{Math.round(drawdownData.maxDD).toLocaleString("ja-JP")}円
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>ピーク→ボトムの最大下落</div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "normal", color: "var(--muted)" }}>連敗（最大）</h3>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--loss)" }}>
            連敗：{streakData.maxLossStreak}回
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>連続での負け数</div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "normal", color: "var(--muted)" }}>連勝（最大）</h3>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--gain)" }}>
            連勝：{streakData.maxWinStreak}回
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>連続での勝ち数</div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "normal", color: "var(--muted)" }}>単取引の最大損失</h3>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--loss)" }}>
            最大損失：{Math.round(riskMetrics.maxLoss).toLocaleString("ja-JP")}円
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>最悪1件の損失</div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "normal", color: "var(--muted)" }}>単取引の最大利益</h3>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--gain)" }}>
            最大利益：+{Math.round(riskMetrics.maxProfit).toLocaleString("ja-JP")}円
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>最高1件の利益</div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "normal", color: "var(--muted)" }}>平均勝ち / 平均負け</h3>
          <div style={{ fontSize: 14, fontWeight: 600 }}>
            <span style={{ color: "var(--gain)" }}>+{Math.round(riskMetrics.avgWin).toLocaleString()}円</span>
            {" / "}
            <span style={{ color: "var(--loss)" }}>{Math.round(riskMetrics.avgLoss).toLocaleString()}円</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>分布の歪み把握</div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "normal", color: "var(--muted)" }}>R-multiple 平均</h3>
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            {riskMetrics.rMultipleAvg.toFixed(2)} R/件
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>損益をRで正規化</div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "normal", color: "var(--muted)" }}>取引数</h3>
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            {filteredTrades.length} 件
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>フィルター適用後</div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "normal", color: "var(--muted)" }}>損益分布（ヒストグラム）</h3>
          <div style={{ height: 180 }}>
            <Bar
              data={{
                labels: profitDistribution.labels,
                datasets: [
                  {
                    data: profitDistribution.counts,
                    backgroundColor: profitDistribution.labels.map((label) =>
                      label.includes("~0") || label.includes("以下") || label.startsWith("-")
                        ? "rgba(239, 68, 68, 0.8)"
                        : "rgba(34, 197, 94, 0.8)"
                    ),
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 },
                  },
                },
              }}
            />
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "normal", color: "var(--muted)" }}>R-multiple 分布</h3>
          <div style={{ height: 180 }}>
            <Bar
              data={{
                labels: rMultipleDistribution.labels,
                datasets: [
                  {
                    data: rMultipleDistribution.counts,
                    backgroundColor: rMultipleDistribution.labels.map((label) =>
                      label.includes("~0R") || label.includes("以下") || label.startsWith("-")
                        ? "rgba(239, 68, 68, 0.8)"
                        : "rgba(34, 197, 94, 0.8)"
                    ),
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 },
                  },
                },
              }}
            />
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "normal", color: "var(--muted)" }}>ドローダウン推移（小）</h3>
          <div style={{ height: 180 }}>
            <Line
              data={{
                labels: drawdownData.series.map((_, i) => `${i + 1}`),
                datasets: [
                  {
                    data: drawdownData.series.map((v) => -v),
                    borderColor: "rgba(239, 68, 68, 1)",
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    fill: true,
                    tension: 0.3,
                    pointRadius: 0,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: {
                    ticks: { callback: (value) => `${(value as number).toLocaleString()}円` },
                  },
                  x: {
                    display: false,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "normal", color: "var(--muted)" }}>DD寄与：曜日</h3>
          <div style={{ height: 180 }}>
            <Bar
              data={{
                labels: ddContributionByDay.slice(0, 7).map((d) => d.day),
                datasets: [
                  {
                    data: ddContributionByDay.slice(0, 7).map((d) => d.loss),
                    backgroundColor: "rgba(239, 68, 68, 0.8)",
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { callback: (value) => `${(value as number).toLocaleString()}円` },
                  },
                },
              }}
            />
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "normal", color: "var(--muted)" }}>DD寄与：通貨ペア</h3>
          <div style={{ height: 180 }}>
            <Bar
              data={{
                labels: ddContributionByPair.slice(0, 6).map((d) => d.pair),
                datasets: [
                  {
                    data: ddContributionByPair.slice(0, 6).map((d) => d.loss),
                    backgroundColor: "rgba(239, 68, 68, 0.8)",
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { callback: (value) => `${(value as number).toLocaleString()}円` },
                  },
                },
              }}
            />
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "normal", color: "var(--muted)" }}>DD寄与：セットアップ</h3>
          <div style={{ height: 180 }}>
            <Bar
              data={{
                labels: ddContributionBySetup.slice(0, 6).map((d) => d.setup),
                datasets: [
                  {
                    data: ddContributionBySetup.slice(0, 6).map((d) => d.loss),
                    backgroundColor: "rgba(239, 68, 68, 0.8)",
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { callback: (value) => `${(value as number).toLocaleString()}円` },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12, marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "normal", color: "var(--muted)" }}>テールイベント（Top/Bottom）</h3>
        <div style={{ maxHeight: "40vh", overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--line)" }}>
                <th style={{ padding: 10, textAlign: "left", fontSize: 12 }}>タイプ</th>
                <th style={{ padding: 10, textAlign: "left", fontSize: 12 }}>日付</th>
                <th style={{ padding: 10, textAlign: "left", fontSize: 12 }}>通貨</th>
                <th style={{ padding: 10, textAlign: "left", fontSize: 12 }}>セットアップ</th>
                <th style={{ padding: 10, textAlign: "right", fontSize: 12 }}>R</th>
                <th style={{ padding: 10, textAlign: "right", fontSize: 12 }}>損益</th>
              </tr>
            </thead>
            <tbody>
              {riskMetrics.maxLossTrade && (
                <tr
                  style={{
                    borderBottom: "1px solid var(--line)",
                    height: 44,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--chip)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: 10, fontSize: 13 }}>最大損失</td>
                  <td style={{ padding: 10, fontSize: 13 }}>{formatDate(riskMetrics.maxLossTrade.openTime)}</td>
                  <td style={{ padding: 10, fontSize: 13 }}>{getTradePair(riskMetrics.maxLossTrade)}</td>
                  <td style={{ padding: 10, fontSize: 13 }}>{extractSetup(riskMetrics.maxLossTrade)}</td>
                  <td style={{ padding: 10, textAlign: "right", fontSize: 13 }}>
                    {(riskMetrics.maxLoss / Math.abs(riskMetrics.avgLoss)).toFixed(1)} R
                  </td>
                  <td
                    style={{
                      padding: 10,
                      textAlign: "right",
                      fontSize: 13,
                      color: "var(--loss)",
                    }}
                  >
                    {Math.round(riskMetrics.maxLoss).toLocaleString("ja-JP")}円
                  </td>
                </tr>
              )}
              {riskMetrics.maxProfitTrade && (
                <tr
                  style={{
                    borderBottom: "1px solid var(--line)",
                    height: 44,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--chip)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: 10, fontSize: 13 }}>最大利益</td>
                  <td style={{ padding: 10, fontSize: 13 }}>{formatDate(riskMetrics.maxProfitTrade.openTime)}</td>
                  <td style={{ padding: 10, fontSize: 13 }}>{getTradePair(riskMetrics.maxProfitTrade)}</td>
                  <td style={{ padding: 10, fontSize: 13 }}>{extractSetup(riskMetrics.maxProfitTrade)}</td>
                  <td style={{ padding: 10, textAlign: "right", fontSize: 13 }}>
                    +{(riskMetrics.maxProfit / Math.abs(riskMetrics.avgLoss)).toFixed(1)} R
                  </td>
                  <td
                    style={{
                      padding: 10,
                      textAlign: "right",
                      fontSize: 13,
                      color: "var(--gain)",
                    }}
                  >
                    +{Math.round(riskMetrics.maxProfit).toLocaleString("ja-JP")}円
                  </td>
                </tr>
              )}
              {streakData.maxLossStreakDate && (
                <tr
                  style={{
                    borderBottom: "1px solid var(--line)",
                    height: 44,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--chip)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: 10, fontSize: 13 }}>連敗ピーク</td>
                  <td style={{ padding: 10, fontSize: 13 }}>{formatDate(streakData.maxLossStreakDate)}</td>
                  <td style={{ padding: 10, fontSize: 13 }}>—</td>
                  <td style={{ padding: 10, fontSize: 13 }}>—</td>
                  <td style={{ padding: 10, textAlign: "right", fontSize: 13 }}>—</td>
                  <td
                    style={{
                      padding: 10,
                      textAlign: "right",
                      fontSize: 13,
                      color: "var(--loss)",
                    }}
                  >
                    {streakData.maxLossStreak}連敗
                  </td>
                </tr>
              )}
              {streakData.maxWinStreakDate && (
                <tr
                  style={{
                    borderBottom: "1px solid var(--line)",
                    height: 44,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--chip)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: 10, fontSize: 13 }}>連勝ピーク</td>
                  <td style={{ padding: 10, fontSize: 13 }}>{formatDate(streakData.maxWinStreakDate)}</td>
                  <td style={{ padding: 10, fontSize: 13 }}>—</td>
                  <td style={{ padding: 10, fontSize: 13 }}>—</td>
                  <td style={{ padding: 10, textAlign: "right", fontSize: 13 }}>—</td>
                  <td
                    style={{
                      padding: 10,
                      textAlign: "right",
                      fontSize: 13,
                      color: "var(--gain)",
                    }}
                  >
                    {streakData.maxWinStreak}連勝
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "2px 8px",
              borderRadius: 999,
              background: "var(--chip)",
              border: "1px solid var(--line)",
              fontSize: 12,
              color: "var(--muted)",
            }}
          >
            極端な損益イベントの追跡
          </span>
        </div>
      </div>
    </div>
  );
}
