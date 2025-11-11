import React, { useEffect, useMemo, useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import { useDataset } from "../../lib/dataset.context";
import { parseCsvText } from "../../lib/csv";
import type { Trade } from "../../lib/types";
import { filterTrades, getTradeProfit, getTradePair, getTradeSide } from "../../lib/filterTrades";
import SummaryCard from "../../components/SummaryCard";
import { supabase } from "../../lib/supabase";
import { analyzeMarketConditions } from "../../lib/marketCondition";

type MetricType = "profit" | "winRate" | "pf" | "avgProfit";

export default function ReportsMarket() {
  const { dataset, filters, useDatabase } = useDataset();
  const [trades, setTrades] = useState<Trade[]>([]);
  const metric: MetricType = "profit";

  useEffect(() => {
    (async () => {
      try {
        if (useDatabase) {
          const { getAllTrades } = await import('../../lib/db.service');
          const data = await getAllTrades();

          const normalizeSide = (side: string): 'LONG' | 'SHORT' => {
            const s = side?.toUpperCase();
            if (s === 'BUY' || s === 'LONG') return 'LONG';
            if (s === 'SELL' || s === 'SHORT') return 'SHORT';
            return 'LONG';
          };

          const mapped: Trade[] = (data || []).map((t: any) => ({
            id: t.ticket,
            datetime: t.close_time,
            pair: t.item,
            side: normalizeSide(t.side),
            volume: Number(t.size),
            profitYen: Number(t.profit),
            pips: Number(t.pips || 0),
            openTime: t.open_time,
            openPrice: Number(t.open_price),
            closePrice: Number(t.close_price),
            stopPrice: t.sl ? Number(t.sl) : undefined,
            targetPrice: t.tp ? Number(t.tp) : undefined,
            commission: Number(t.commission || 0),
            swap: Number(t.swap || 0),
            symbol: t.item,
            action: normalizeSide(t.side),
            profit: Number(t.profit),
            comment: t.comment || '',
            memo: t.memo || '',
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

  const marketConditionData = useMemo(() => {
    return analyzeMarketConditions(filteredTrades);
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
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "bold", color: "var(--muted)", cursor: "help" }} title="最も稼げている通貨ペアです。得意な銘柄を見つけて取引を集中できます。">通貨ペア Top</h3>
          <div style={{ fontSize: 18, fontWeight: 700, color: topSymbol.profit >= 0 ? "var(--gain)" : "var(--loss)" }}>
            {topSymbol.symbol}：{formatValue(topSymbol.profit, "profit")}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            勝率 {topSymbol.winRate.toFixed(0)}% / 取引 {topSymbol.count}件
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "bold", color: "var(--muted)", cursor: "help" }} title="最も損失が出ている通貨ペアです。苦手な銘柄を避ける判断材料になります。">通貨ペア Bottom</h3>
          <div style={{ fontSize: 18, fontWeight: 700, color: bottomSymbol.profit >= 0 ? "var(--gain)" : "var(--loss)" }}>
            {bottomSymbol.symbol}：{formatValue(bottomSymbol.profit, "profit")}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            勝率 {bottomSymbol.winRate.toFixed(0)}% / 取引 {bottomSymbol.count}件
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "bold", color: "var(--muted)", cursor: "help" }} title="最も稼げているpips範囲です。どのくらいの値動きが得意か把握できます。">価格帯 Top</h3>
          <div style={{ fontSize: 18, fontWeight: 700, color: topPipsRange.profit >= 0 ? "var(--gain)" : "var(--loss)" }}>
            {topPipsRange.label}：{formatValue(topPipsRange.profit, "profit")}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            バケット平均 {formatValue(topPipsRange.avgProfit, "avgProfit")}/件
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "bold", color: "var(--muted)", cursor: "help" }} title="メジャー通貨ペアとマイナー通貨ペアの比較です。どちらが得意か確認できます。">主要通貨 vs クロス</h3>
          <div style={{ fontSize: 14, fontWeight: 600 }}>
            <span style={{ color: majorVsCrossData.major.profit >= 0 ? "var(--gain)" : "var(--loss)" }}>
              主要：{formatValue(majorVsCrossData.major.profit, "profit")}
            </span>
            {" / "}
            <span style={{ color: majorVsCrossData.cross.profit >= 0 ? "var(--gain)" : "var(--loss)" }}>
              クロス：{formatValue(majorVsCrossData.cross.profit, "profit")}
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
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "bold", color: "var(--muted)", cursor: "help" }} title="主要6銘柄の損益を比較したグラフです。どの銘柄を優先すべきか見えてきます。">通貨ペア別（上位6）</h3>
          <div style={{ height: 180 }}>
            <Bar
              data={{
                labels: symbolData.slice(0, 6).map((s) => s.symbol),
                datasets: [
                  {
                    data: symbolData.slice(0, 6).map(getMetricValue),
                    backgroundColor: symbolData.slice(0, 6).map((s) =>
                      s.profit >= 0 ? "rgba(22, 163, 74, 0.8)" : "rgba(239, 68, 68, 0.8)"
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
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "bold", color: "var(--muted)", cursor: "help" }} title="値動きの幅ごとの損益分布です。どのくらいのボラティリティが適しているか分かります。">価格帯（pipsビン）</h3>
          <div style={{ height: 180 }}>
            <Bar
              data={{
                labels: pipsRangeData.map((r) => r.label),
                datasets: [
                  {
                    data: pipsRangeData.map(getMetricValue),
                    backgroundColor: pipsRangeData.map((r) =>
                      r.profit >= 0 ? "rgba(22, 163, 74, 0.8)" : "rgba(239, 68, 68, 0.8)"
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
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "bold", color: "var(--muted)", cursor: "help" }} title="基軸通貨と決済通貨ごとの損益です。通貨別の得意不得意を把握できます。">通貨（ベース/クオート別）</h3>
          <div style={{ height: 180 }}>
            <Bar
              data={{
                labels: [...currencyData.base.slice(0, 4).map((c) => `${c.curr}(B)`), ...currencyData.quote.slice(0, 4).map((c) => `${c.curr}(Q)`)],
                datasets: [
                  {
                    data: [...currencyData.base.slice(0, 4).map((c) => c.profit), ...currencyData.quote.slice(0, 4).map((c) => c.profit)],
                    backgroundColor: [...currencyData.base.slice(0, 4), ...currencyData.quote.slice(0, 4)].map((c) =>
                      c.profit >= 0 ? "rgba(22, 163, 74, 0.8)" : "rgba(239, 68, 68, 0.8)"
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
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "bold", color: "var(--muted)", cursor: "help" }} title="メジャーとマイナーの損益を棒グラフで比較します。視覚的に収益性を評価できます。">主要通貨 vs クロス</h3>
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
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "bold", color: "var(--muted)", cursor: "help" }} title="トレンドやレンジなど市場環境別の損益です。どの相場が得意か確認できます。">相場状態（β）</h3>
          <div style={{ height: 180 }}>
            <Bar
              data={{
                labels: marketConditionData.map((m) => m.condition),
                datasets: [
                  {
                    data: marketConditionData.map((m) => m.profit),
                    backgroundColor: marketConditionData.map((m) =>
                      m.profit >= 0 ? "rgba(22, 163, 74, 0.8)" : "rgba(239, 68, 68, 0.8)"
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

      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
        <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "bold", color: "var(--muted)", cursor: "help" }} title="全通貨ペアと価格帯の詳細データテーブルです。細かい数値を確認して戦略を調整できます。">市場・銘柄 明細</h3>
        <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--line)" }}>
                <th style={{ padding: 10, textAlign: "left", fontSize: 15, fontWeight: "bold", color: "var(--muted)" }}>セグメント</th>
                <th style={{ padding: 10, textAlign: "left", fontSize: 15, fontWeight: "bold", color: "var(--muted)" }}>バケット</th>
                <th style={{ padding: 10, textAlign: "right", fontSize: 15, fontWeight: "bold", color: "var(--muted)" }}>取引</th>
                <th style={{ padding: 10, textAlign: "right", fontSize: 15, fontWeight: "bold", color: "var(--muted)" }}>Net損益</th>
                <th style={{ padding: 10, textAlign: "right", fontSize: 15, fontWeight: "bold", color: "var(--muted)" }}>勝率</th>
                <th style={{ padding: 10, textAlign: "right", fontSize: 15, fontWeight: "bold", color: "var(--muted)" }}>PF</th>
                <th style={{ padding: 10, textAlign: "right", fontSize: 15, fontWeight: "bold", color: "var(--muted)" }}>平均損益</th>
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
              {marketConditionData.map((m) => (
                <tr
                  key={m.condition}
                  style={{
                    borderBottom: "1px solid var(--line)",
                    height: 44,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--chip)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: 10, fontSize: 13 }}>相場状態（β）</td>
                  <td style={{ padding: 10, fontSize: 13 }}>{m.condition}</td>
                  <td style={{ padding: 10, textAlign: "right", fontSize: 13 }}>{m.count}</td>
                  <td
                    style={{
                      padding: 10,
                      textAlign: "right",
                      fontSize: 13,
                      color: m.profit >= 0 ? "var(--gain)" : "var(--loss)",
                    }}
                  >
                    {Math.round(m.profit).toLocaleString("ja-JP")}円
                  </td>
                  <td style={{ padding: 10, textAlign: "right", fontSize: 13 }}>{m.winRate.toFixed(0)}%</td>
                  <td style={{ padding: 10, textAlign: "right", fontSize: 13 }}>{m.pf.toFixed(2)}</td>
                  <td style={{ padding: 10, textAlign: "right", fontSize: 13 }}>
                    {Math.round(m.avgProfit).toLocaleString("ja-JP")}円
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
