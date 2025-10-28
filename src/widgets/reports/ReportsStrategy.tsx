import React, { useEffect, useMemo, useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import { useDataset } from "../../lib/dataset.context";
import { parseCsvText } from "../../lib/csv";
import type { Trade } from "../../lib/types";
import { filterTrades, getTradeProfit, getTradeSide } from "../../lib/filterTrades";
import { supabase } from "../../lib/supabase";

type MetricType = "profit" | "winRate" | "pf" | "avgProfit";

export default function ReportsStrategy() {
  const { dataset, filters, useDatabase } = useDataset();
  const [trades, setTrades] = useState<Trade[]>([]);
  const metric: MetricType = "profit";

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

  // セットアップ抽出（comment または memo から）
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

  const setupData = useMemo(() => {
    const map = new Map<string, { profit: number; count: number; wins: number; avgHoldTime: number }>();
    filteredTrades.forEach((t) => {
      const setup = extractSetup(t);
      const profit = getTradeProfit(t);
      const current = map.get(setup) || { profit: 0, count: 0, wins: 0, avgHoldTime: 0 };
      map.set(setup, {
        profit: current.profit + profit,
        count: current.count + 1,
        wins: current.wins + (profit > 0 ? 1 : 0),
        avgHoldTime: current.avgHoldTime + (t.holdTimeMin || 0),
      });
    });
    return Array.from(map.entries())
      .map(([setup, data]) => {
        const winRate = data.count > 0 ? (data.wins / data.count) * 100 : 0;
        const avgProfit = data.count > 0 ? data.profit / data.count : 0;
        const avgHoldTime = data.count > 0 ? data.avgHoldTime / data.count : 0;
        const grossProfit = filteredTrades
          .filter((t) => extractSetup(t) === setup && getTradeProfit(t) > 0)
          .reduce((sum, t) => sum + getTradeProfit(t), 0);
        const grossLoss = Math.abs(
          filteredTrades
            .filter((t) => extractSetup(t) === setup && getTradeProfit(t) < 0)
            .reduce((sum, t) => sum + getTradeProfit(t), 0)
        );
        const pf = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;
        return { setup, ...data, winRate, avgProfit, avgHoldTime, pf };
      })
      .sort((a, b) => b.profit - a.profit);
  }, [filteredTrades]);

  const sideData = useMemo(() => {
    const longTrades = filteredTrades.filter((t) => getTradeSide(t) === "LONG");
    const shortTrades = filteredTrades.filter((t) => getTradeSide(t) === "SHORT");

    const calcStats = (trades: Trade[]) => {
      const profit = trades.reduce((sum, t) => sum + getTradeProfit(t), 0);
      const wins = trades.filter((t) => getTradeProfit(t) > 0).length;
      const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0;
      const grossProfit = trades.filter((t) => getTradeProfit(t) > 0).reduce((sum, t) => sum + getTradeProfit(t), 0);
      const grossLoss = Math.abs(trades.filter((t) => getTradeProfit(t) < 0).reduce((sum, t) => sum + getTradeProfit(t), 0));
      const pf = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;
      const avgProfit = trades.length > 0 ? profit / trades.length : 0;
      return { count: trades.length, profit, wins, winRate, pf, avgProfit };
    };

    return {
      long: calcStats(longTrades),
      short: calcStats(shortTrades),
    };
  }, [filteredTrades]);

  const avgWinLoss = useMemo(() => {
    const winTrades = filteredTrades.filter((t) => getTradeProfit(t) > 0);
    const lossTrades = filteredTrades.filter((t) => getTradeProfit(t) < 0);
    const avgWin = winTrades.length > 0 ? winTrades.reduce((sum, t) => sum + getTradeProfit(t), 0) / winTrades.length : 0;
    const avgLoss = lossTrades.length > 0 ? lossTrades.reduce((sum, t) => sum + getTradeProfit(t), 0) / lossTrades.length : 0;
    return { avgWin, avgLoss };
  }, [filteredTrades]);

  const setupCrossData = useMemo(() => {
    const data: { setup: string; long: number; short: number }[] = [];
    setupData.forEach((s) => {
      const longProfit = filteredTrades
        .filter((t) => extractSetup(t) === s.setup && getTradeSide(t) === "LONG")
        .reduce((sum, t) => sum + getTradeProfit(t), 0);
      const shortProfit = filteredTrades
        .filter((t) => extractSetup(t) === s.setup && getTradeSide(t) === "SHORT")
        .reduce((sum, t) => sum + getTradeProfit(t), 0);
      data.push({ setup: s.setup, long: longProfit, short: shortProfit });
    });
    return data;
  }, [setupData, filteredTrades]);

  const topSetup = setupData[0] || { setup: "-", profit: 0, winRate: 0, count: 0 };
  const bottomSetup = setupData[setupData.length - 1] || { setup: "-", profit: 0, winRate: 0, count: 0 };

  const getMetricValue = (item: any) => {
    switch (metric) {
      case "profit": return item.profit;
      case "winRate": return item.winRate;
      case "pf": return item.pf || 0;
      case "avgProfit": return item.avgProfit;
      default: return item.profit;
    }
  };

  const formatValue = (value: number, type: MetricType) => {
    switch (type) {
      case "profit":
      case "avgProfit":
        return `${Math.round(value).toLocaleString("ja-JP")}円`;
      case "winRate":
        return `${value.toFixed(1)}%`;
      case "pf":
        return value.toFixed(2);
      default:
        return value.toString();
    }
  };

  const formatMinutes = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}分`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hours}h${mins}m` : `${hours}h`;
  };

  return (
    <div style={{ width: "100%" }}>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "var(--muted)" }}>セットアップ Top</h3>
          <div style={{ fontSize: 18, fontWeight: 700, color: topSetup.profit >= 0 ? "var(--gain)" : "var(--loss)" }}>
            {topSetup.setup}：{formatValue(topSetup.profit, "profit")}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            勝率 {topSetup.winRate.toFixed(0)}% / 取引 {topSetup.count}件
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "var(--muted)" }}>セットアップ Bottom</h3>
          <div style={{ fontSize: 18, fontWeight: 700, color: bottomSetup.profit >= 0 ? "var(--gain)" : "var(--loss)" }}>
            {bottomSetup.setup}：{formatValue(bottomSetup.profit, "profit")}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            勝率 {bottomSetup.winRate.toFixed(0)}% / 取引 {bottomSetup.count}件
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "var(--muted)" }}>方向比較</h3>
          <div style={{ fontSize: 14, fontWeight: 600 }}>
            <span style={{ color: sideData.long.profit >= 0 ? "var(--gain)" : "var(--loss)" }}>
              買い：{formatValue(sideData.long.profit, "profit")}
            </span>
            {" / "}
            <span style={{ color: sideData.short.profit >= 0 ? "var(--gain)" : "var(--loss)" }}>
              売り：{formatValue(sideData.short.profit, "profit")}
            </span>
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            PF {sideData.long.pf.toFixed(2)} / {sideData.short.pf.toFixed(2)}
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "var(--muted)" }}>平均勝ち / 平均負け</h3>
          <div style={{ fontSize: 14, fontWeight: 600 }}>
            <span style={{ color: "var(--gain)" }}>勝ち：{formatValue(avgWinLoss.avgWin, "profit")}</span>
            {" / "}
            <span style={{ color: "var(--loss)" }}>負け：{formatValue(avgWinLoss.avgLoss, "profit")}</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>各セットアップ横断の平均</div>
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
          <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "var(--muted)" }}>セットアップ別（上位6）</h3>
          <div style={{ height: 180 }}>
            <Bar
              data={{
                labels: setupData.slice(0, 6).map((s) => s.setup),
                datasets: [
                  {
                    data: setupData.slice(0, 6).map(getMetricValue),
                    backgroundColor: setupData.slice(0, 6).map((s) =>
                      s.profit >= 0 ? "rgba(34, 197, 94, 0.8)" : "rgba(239, 68, 68, 0.8)"
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
                    ticks: { callback: (value) => formatValue(value as number, "profit") },
                  },
                },
              }}
            />
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "var(--muted)" }}>方向別（買い・売り）</h3>
          <div style={{ height: 180 }}>
            <Doughnut
              data={{
                labels: ["買い", "売り"],
                datasets: [
                  {
                    data: [sideData.long.count, sideData.short.count],
                    backgroundColor: ["rgba(59, 130, 246, 0.8)", "rgba(168, 85, 247, 0.8)"],
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "bottom" },
                },
              }}
            />
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "var(--muted)" }}>セットアップ別 平均保有時間</h3>
          <div style={{ height: 180 }}>
            <Bar
              data={{
                labels: setupData.slice(0, 6).map((s) => s.setup),
                datasets: [
                  {
                    data: setupData.slice(0, 6).map((s) => s.avgHoldTime),
                    backgroundColor: "rgba(59, 130, 246, 0.8)",
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
                    ticks: { callback: (value) => formatMinutes(value as number) },
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
          <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "var(--muted)" }}>セットアップ別 勝率</h3>
          <div style={{ height: 180 }}>
            <Bar
              data={{
                labels: setupData.slice(0, 6).map((s) => s.setup),
                datasets: [
                  {
                    data: setupData.slice(0, 6).map((s) => s.winRate),
                    backgroundColor: "rgba(34, 197, 94, 0.8)",
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
                    max: 100,
                    ticks: { callback: (value) => `${value}%` },
                  },
                },
              }}
            />
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "var(--muted)" }}>セットアップ別 PF</h3>
          <div style={{ height: 180 }}>
            <Bar
              data={{
                labels: setupData.slice(0, 6).map((s) => s.setup),
                datasets: [
                  {
                    data: setupData.slice(0, 6).map((s) => Math.min(s.pf, 5)),
                    backgroundColor: setupData.slice(0, 6).map((s) =>
                      s.pf >= 1 ? "rgba(34, 197, 94, 0.8)" : "rgba(239, 68, 68, 0.8)"
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
                    ticks: { callback: (value) => (value as number).toFixed(1) },
                  },
                },
              }}
            />
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "var(--muted)" }}>方向×セットアップ（クロス）</h3>
          <div style={{ height: 180 }}>
            <Bar
              data={{
                labels: setupCrossData.slice(0, 5).map((d) => d.setup),
                datasets: [
                  {
                    label: "買い",
                    data: setupCrossData.slice(0, 5).map((d) => d.long),
                    backgroundColor: "rgba(59, 130, 246, 0.8)",
                  },
                  {
                    label: "売り",
                    data: setupCrossData.slice(0, 5).map((d) => d.short),
                    backgroundColor: "rgba(168, 85, 247, 0.8)",
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "bottom" },
                },
                scales: {
                  y: {
                    ticks: { callback: (value) => `${(value as number).toLocaleString()}円` },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
        <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "var(--muted)" }}>戦略・行動 明細</h3>
        <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--line)" }}>
                <th style={{ padding: 10, textAlign: "left", fontSize: 12 }}>セグメント</th>
                <th style={{ padding: 10, textAlign: "left", fontSize: 12 }}>バケット</th>
                <th style={{ padding: 10, textAlign: "right", fontSize: 12 }}>取引</th>
                <th style={{ padding: 10, textAlign: "right", fontSize: 12 }}>Net損益</th>
                <th style={{ padding: 10, textAlign: "right", fontSize: 12 }}>勝率</th>
                <th style={{ padding: 10, textAlign: "right", fontSize: 12 }}>PF</th>
                <th style={{ padding: 10, textAlign: "right", fontSize: 12 }}>平均損益</th>
              </tr>
            </thead>
            <tbody>
              {setupData.map((s) => (
                <tr
                  key={s.setup}
                  style={{
                    borderBottom: "1px solid var(--line)",
                    height: 44,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--chip)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: 10, fontSize: 13 }}>セットアップ</td>
                  <td style={{ padding: 10, fontSize: 13 }}>{s.setup}</td>
                  <td style={{ padding: 10, textAlign: "right", fontSize: 13 }}>{s.count}</td>
                  <td
                    style={{
                      padding: 10,
                      textAlign: "right",
                      fontSize: 13,
                      color: s.profit >= 0 ? "var(--gain)" : "var(--loss)",
                    }}
                  >
                    {Math.round(s.profit).toLocaleString("ja-JP")}円
                  </td>
                  <td style={{ padding: 10, textAlign: "right", fontSize: 13 }}>{s.winRate.toFixed(0)}%</td>
                  <td style={{ padding: 10, textAlign: "right", fontSize: 13 }}>{s.pf.toFixed(2)}</td>
                  <td style={{ padding: 10, textAlign: "right", fontSize: 13 }}>
                    {Math.round(s.avgProfit).toLocaleString("ja-JP")}円
                  </td>
                </tr>
              ))}
              <tr
                style={{
                  borderBottom: "1px solid var(--line)",
                  height: 44,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--chip)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td style={{ padding: 10, fontSize: 13 }}>方向</td>
                <td style={{ padding: 10, fontSize: 13 }}>買い</td>
                <td style={{ padding: 10, textAlign: "right", fontSize: 13 }}>{sideData.long.count}</td>
                <td
                  style={{
                    padding: 10,
                    textAlign: "right",
                    fontSize: 13,
                    color: sideData.long.profit >= 0 ? "var(--gain)" : "var(--loss)",
                  }}
                >
                  {Math.round(sideData.long.profit).toLocaleString("ja-JP")}円
                </td>
                <td style={{ padding: 10, textAlign: "right", fontSize: 13 }}>{sideData.long.winRate.toFixed(0)}%</td>
                <td style={{ padding: 10, textAlign: "right", fontSize: 13 }}>{sideData.long.pf.toFixed(2)}</td>
                <td style={{ padding: 10, textAlign: "right", fontSize: 13 }}>
                  {Math.round(sideData.long.avgProfit).toLocaleString("ja-JP")}円
                </td>
              </tr>
              <tr
                style={{
                  borderBottom: "1px solid var(--line)",
                  height: 44,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--chip)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td style={{ padding: 10, fontSize: 13 }}>方向</td>
                <td style={{ padding: 10, fontSize: 13 }}>売り</td>
                <td style={{ padding: 10, textAlign: "right", fontSize: 13 }}>{sideData.short.count}</td>
                <td
                  style={{
                    padding: 10,
                    textAlign: "right",
                    fontSize: 13,
                    color: sideData.short.profit >= 0 ? "var(--gain)" : "var(--loss)",
                  }}
                >
                  {Math.round(sideData.short.profit).toLocaleString("ja-JP")}円
                </td>
                <td style={{ padding: 10, textAlign: "right", fontSize: 13 }}>{sideData.short.winRate.toFixed(0)}%</td>
                <td style={{ padding: 10, textAlign: "right", fontSize: 13 }}>{sideData.short.pf.toFixed(2)}</td>
                <td style={{ padding: 10, textAlign: "right", fontSize: 13 }}>
                  {Math.round(sideData.short.avgProfit).toLocaleString("ja-JP")}円
                </td>
              </tr>
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
            セットアップ・方向別の詳細統計
          </span>
        </div>
      </div>
    </div>
  );
}
