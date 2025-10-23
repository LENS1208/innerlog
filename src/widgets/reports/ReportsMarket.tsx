import React, { useEffect, useMemo, useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import { useDataset } from "../../lib/dataset.context";
import { parseCsvText } from "../../lib/csv";
import type { Trade } from "../../lib/types";
import { filterTrades, getTradeProfit, getTradePair, getTradeSide } from "../../lib/filterTrades";
import SummaryCard from "../../components/SummaryCard";

type MetricType = "profit" | "winRate" | "pf" | "avgProfit";

export default function ReportsMarket() {
  const { dataset, filters } = useDataset();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [metric, setMetric] = useState<MetricType>("profit");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/demo/${dataset}.csv?t=${Date.now()}`, { cache: "no-store" });
        if (!res.ok) return;
        const text = await res.text();
        const parsed = parseCsvText(text);
        setTrades(parsed);
      } catch (err) {
        console.error("Failed to load trades:", err);
      }
    })();
  }, [dataset]);

  const filteredTrades = useMemo(() => filterTrades(trades, filters), [trades, filters]);

  const symbolData = useMemo(() => {
    const map = new Map<string, { profit: number; count: number; wins: number; losses: number }>();
    filteredTrades.forEach((t) => {
      const symbol = getTradePair(t);
      const profit = getTradeProfit(t);
      const current = map.get(symbol) || { profit: 0, count: 0, wins: 0, losses: 0 };
      map.set(symbol, {
        profit: current.profit + profit,
        count: current.count + 1,
        wins: current.wins + (profit > 0 ? 1 : 0),
        losses: current.losses + (profit < 0 ? 1 : 0),
      });
    });
    return Array.from(map.entries())
      .map(([symbol, data]) => {
        const winRate = data.count > 0 ? (data.wins / data.count) * 100 : 0;
        const avgProfit = data.count > 0 ? data.profit / data.count : 0;
        const grossProfit = filteredTrades
          .filter((t) => getTradePair(t) === symbol && getTradeProfit(t) > 0)
          .reduce((sum, t) => sum + getTradeProfit(t), 0);
        const grossLoss = Math.abs(
          filteredTrades
            .filter((t) => getTradePair(t) === symbol && getTradeProfit(t) < 0)
            .reduce((sum, t) => sum + getTradeProfit(t), 0)
        );
        const pf = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;
        return { symbol, ...data, winRate, avgProfit, pf };
      })
      .sort((a, b) => b.profit - a.profit);
  }, [filteredTrades]);

  const pipsRangeData = useMemo(() => {
    const ranges = [
      { label: "0-10 pips", min: 0, max: 10 },
      { label: "10-20 pips", min: 10, max: 20 },
      { label: "20-40 pips", min: 20, max: 40 },
      { label: "40-60 pips", min: 40, max: 60 },
      { label: "60-100 pips", min: 60, max: 100 },
      { label: "100+ pips", min: 100, max: Infinity },
    ];

    return ranges.map((range) => {
      const rangeTrades = filteredTrades.filter((t) => {
        const pips = Math.abs(t.pips || 0);
        return pips >= range.min && pips < range.max;
      });
      const profit = rangeTrades.reduce((sum, t) => sum + getTradeProfit(t), 0);
      const count = rangeTrades.length;
      const wins = rangeTrades.filter((t) => getTradeProfit(t) > 0).length;
      const winRate = count > 0 ? (wins / count) * 100 : 0;
      const avgProfit = count > 0 ? profit / count : 0;
      const grossProfit = rangeTrades.filter((t) => getTradeProfit(t) > 0).reduce((sum, t) => sum + getTradeProfit(t), 0);
      const grossLoss = Math.abs(rangeTrades.filter((t) => getTradeProfit(t) < 0).reduce((sum, t) => sum + getTradeProfit(t), 0));
      const pf = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;
      return { label: range.label, profit, count, wins, winRate, avgProfit, pf };
    });
  }, [filteredTrades]);

  const currencyData = useMemo(() => {
    const baseMap = new Map<string, number>();
    const quoteMap = new Map<string, number>();

    filteredTrades.forEach((t) => {
      const pair = getTradePair(t);
      const profit = getTradeProfit(t);
      const [base, quote] = pair.split("/");

      if (base) baseMap.set(base, (baseMap.get(base) || 0) + profit);
      if (quote) quoteMap.set(quote, (quoteMap.get(quote) || 0) + profit);
    });

    return {
      base: Array.from(baseMap.entries()).map(([curr, profit]) => ({ curr, profit })).sort((a, b) => b.profit - a.profit),
      quote: Array.from(quoteMap.entries()).map(([curr, profit]) => ({ curr, profit })).sort((a, b) => b.profit - a.profit),
    };
  }, [filteredTrades]);

  const majorVsCrossData = useMemo(() => {
    const majors = ["USD/JPY", "EUR/USD", "GBP/USD", "USD/CHF", "AUD/USD", "NZD/USD", "USD/CAD"];
    const majorTrades = filteredTrades.filter((t) => majors.includes(getTradePair(t)));
    const crossTrades = filteredTrades.filter((t) => !majors.includes(getTradePair(t)));

    const majorProfit = majorTrades.reduce((sum, t) => sum + getTradeProfit(t), 0);
    const crossProfit = crossTrades.reduce((sum, t) => sum + getTradeProfit(t), 0);

    return {
      major: { count: majorTrades.length, profit: majorProfit, winRate: majorTrades.length > 0 ? (majorTrades.filter((t) => getTradeProfit(t) > 0).length / majorTrades.length) * 100 : 0 },
      cross: { count: crossTrades.length, profit: crossProfit, winRate: crossTrades.length > 0 ? (crossTrades.filter((t) => getTradeProfit(t) > 0).length / crossTrades.length) * 100 : 0 },
    };
  }, [filteredTrades]);

  const topSymbol = symbolData[0] || { symbol: "-", profit: 0, winRate: 0, count: 0 };
  const bottomSymbol = symbolData[symbolData.length - 1] || { symbol: "-", profit: 0, winRate: 0, count: 0 };
  const topPipsRange = pipsRangeData.sort((a, b) => b.profit - a.profit)[0] || { label: "-", profit: 0, avgProfit: 0 };
  const topPipsRangeOriginal = pipsRangeData.find((r) => r.label === topPipsRange.label) || topPipsRange;

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

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", border: "1px solid var(--line)", borderRadius: 10, overflow: "hidden" }}>
          {[
            { key: "profit", label: "損益" },
            { key: "winRate", label: "勝率" },
            { key: "pf", label: "PF" },
            { key: "avgProfit", label: "平均損益" },
          ].map((m, idx, arr) => (
            <button
              key={m.key}
              onClick={() => setMetric(m.key as MetricType)}
              style={{
                height: 32,
                padding: "0 12px",
                background: metric === m.key ? "var(--chip)" : "var(--surface)",
                border: "none",
                borderRight: idx < arr.length - 1 ? "1px solid var(--line)" : "none",
                color: "var(--ink)",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "var(--muted)" }}>通貨ペア Top</h3>
          <div style={{ fontSize: 18, fontWeight: 700, color: topSymbol.profit >= 0 ? "var(--gain)" : "var(--loss)" }}>
            {topSymbol.symbol} {formatValue(topSymbol.profit, "profit")}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            勝率 {topSymbol.winRate.toFixed(0)}% / 取引 {topSymbol.count}件
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "var(--muted)" }}>通貨ペア Bottom</h3>
          <div style={{ fontSize: 18, fontWeight: 700, color: bottomSymbol.profit >= 0 ? "var(--gain)" : "var(--loss)" }}>
            {bottomSymbol.symbol} {formatValue(bottomSymbol.profit, "profit")}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            勝率 {bottomSymbol.winRate.toFixed(0)}% / 取引 {bottomSymbol.count}件
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "var(--muted)" }}>価格帯 Top</h3>
          <div style={{ fontSize: 18, fontWeight: 700, color: topPipsRange.profit >= 0 ? "var(--gain)" : "var(--loss)" }}>
            {topPipsRange.label} {formatValue(topPipsRange.profit, "profit")}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            バケット平均 {formatValue(topPipsRange.avgProfit, "avgProfit")}/件
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "var(--muted)" }}>主要通貨 vs クロス</h3>
          <div style={{ fontSize: 14, fontWeight: 600 }}>
            <span style={{ color: majorVsCrossData.major.profit >= 0 ? "var(--gain)" : "var(--loss)" }}>
              主要 {formatValue(majorVsCrossData.major.profit, "profit")}
            </span>
            {" / "}
            <span style={{ color: majorVsCrossData.cross.profit >= 0 ? "var(--gain)" : "var(--loss)" }}>
              クロス {formatValue(majorVsCrossData.cross.profit, "profit")}
            </span>
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            主要 {majorVsCrossData.major.count}件 / クロス {majorVsCrossData.cross.count}件
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
          <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "var(--muted)" }}>通貨ペア別（上位6）</h3>
          <div style={{ height: 180 }}>
            <Bar
              data={{
                labels: symbolData.slice(0, 6).map((s) => s.symbol),
                datasets: [
                  {
                    data: symbolData.slice(0, 6).map(getMetricValue),
                    backgroundColor: symbolData.slice(0, 6).map((s) =>
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
                    ticks: { callback: (value) => formatValue(value as number, metric) },
                  },
                },
              }}
            />
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "var(--muted)" }}>価格帯（pipsビン）</h3>
          <div style={{ height: 180 }}>
            <Bar
              data={{
                labels: pipsRangeData.map((r) => r.label),
                datasets: [
                  {
                    data: pipsRangeData.map(getMetricValue),
                    backgroundColor: pipsRangeData.map((r) =>
                      r.profit >= 0 ? "rgba(34, 197, 94, 0.8)" : "rgba(239, 68, 68, 0.8)"
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
                    ticks: { callback: (value) => formatValue(value as number, metric) },
                  },
                },
              }}
            />
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "var(--muted)" }}>通貨（ベース/クオート別）</h3>
          <div style={{ height: 180 }}>
            <Bar
              data={{
                labels: [...currencyData.base.slice(0, 4).map((c) => `${c.curr}(B)`), ...currencyData.quote.slice(0, 4).map((c) => `${c.curr}(Q)`)],
                datasets: [
                  {
                    data: [...currencyData.base.slice(0, 4).map((c) => c.profit), ...currencyData.quote.slice(0, 4).map((c) => c.profit)],
                    backgroundColor: [...currencyData.base.slice(0, 4), ...currencyData.quote.slice(0, 4)].map((c) =>
                      c.profit >= 0 ? "rgba(34, 197, 94, 0.8)" : "rgba(239, 68, 68, 0.8)"
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
                    ticks: { callback: (value) => `${(value as number).toLocaleString()}円` },
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
          <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "var(--muted)" }}>主要通貨 vs クロス</h3>
          <div style={{ height: 180 }}>
            <Doughnut
              data={{
                labels: ["主要通貨", "クロス"],
                datasets: [
                  {
                    data: [majorVsCrossData.major.count, majorVsCrossData.cross.count],
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
          <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "var(--muted)" }}>相場状態（β）</h3>
          <div
            style={{
              height: 180,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--muted)",
              fontSize: 12,
            }}
          >
            開発中
          </div>
        </div>
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
        <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "var(--muted)" }}>市場・銘柄 明細</h3>
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
              {symbolData.map((s) => (
                <tr
                  key={s.symbol}
                  style={{
                    borderBottom: "1px solid var(--line)",
                    height: 44,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--chip)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: 10, fontSize: 13 }}>通貨ペア</td>
                  <td style={{ padding: 10, fontSize: 13 }}>{s.symbol}</td>
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
              {pipsRangeData.map((r) => (
                <tr
                  key={r.label}
                  style={{
                    borderBottom: "1px solid var(--line)",
                    height: 44,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--chip)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: 10, fontSize: 13 }}>価格帯（pips）</td>
                  <td style={{ padding: 10, fontSize: 13 }}>{r.label}</td>
                  <td style={{ padding: 10, textAlign: "right", fontSize: 13 }}>{r.count}</td>
                  <td
                    style={{
                      padding: 10,
                      textAlign: "right",
                      fontSize: 13,
                      color: r.profit >= 0 ? "var(--gain)" : "var(--loss)",
                    }}
                  >
                    {Math.round(r.profit).toLocaleString("ja-JP")}円
                  </td>
                  <td style={{ padding: 10, textAlign: "right", fontSize: 13 }}>{r.winRate.toFixed(0)}%</td>
                  <td style={{ padding: 10, textAlign: "right", fontSize: 13 }}>{r.pf.toFixed(2)}</td>
                  <td style={{ padding: 10, textAlign: "right", fontSize: 13 }}>
                    {Math.round(r.avgProfit).toLocaleString("ja-JP")}円
                  </td>
                </tr>
              ))}
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
            通貨ペア・価格帯別の詳細統計
          </span>
        </div>
      </div>
    </div>
  );
}
