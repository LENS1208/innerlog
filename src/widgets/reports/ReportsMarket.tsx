import React, { useEffect, useMemo, useState } from "react";
import { getGridLineColor, getAccentColor, getLossColor, getWarningColor, getPurpleColor } from "../../lib/chartColors";
import { Bar, Doughnut } from "react-chartjs-2";
import { useDataset } from "../../lib/dataset.context";
import { parseCsvText } from "../../lib/csv";
import type { Trade } from "../../lib/types";
import { filterTrades, getTradeProfit, getTradePair, getTradeSide } from "../../lib/filterTrades";
import SummaryCard from "../../components/SummaryCard";
import { supabase } from "../../lib/supabase";
import { analyzeMarketConditions } from "../../lib/marketCondition";
import { HelpIcon } from "../../components/common/HelpIcon";
import Card from "../../components/common/Card";

type MetricType = "profit" | "winRate" | "pf" | "avgProfit";

type MarketSegmentTab = "資産クラス" | "通貨ペア" | "価格帯" | "相場状態";

function MarketSegmentTabs({
  assetTypeData,
  symbolData,
  pipsRangeData,
  marketConditionData
}: {
  assetTypeData: any;
  symbolData: any[];
  pipsRangeData: any[];
  marketConditionData: any[];
}) {
  const [activeTab, setActiveTab] = React.useState<MarketSegmentTab>("資産クラス");

  const tabs: MarketSegmentTab[] = ["資産クラス", "通貨ペア", "価格帯", "相場状態"];

  const renderTable = () => {
    let data: any[] = [];
    let segmentLabel = "";

    switch (activeTab) {
      case "資産クラス":
        data = [
          { label: 'JPY関連', data: assetTypeData.jpy },
          { label: 'USD関連', data: assetTypeData.usdMajor },
          { label: '貴金属', data: assetTypeData.metals },
          { label: '仮想通貨', data: assetTypeData.crypto },
          { label: '商品', data: assetTypeData.commodities },
          { label: '新興国通貨', data: assetTypeData.emerging },
          { label: 'その他', data: assetTypeData.other }
        ].filter(item => item.data.count > 0).map(item => ({
          label: item.label,
          count: item.data.count,
          profit: item.data.profit,
          winRate: item.data.winRate,
          pf: '-',
          avgProfit: item.data.count > 0 ? item.data.profit / item.data.count : 0
        }));
        segmentLabel = "資産クラス";
        break;
      case "通貨ペア":
        data = symbolData.map(s => ({
          label: s.symbol,
          count: s.count,
          profit: s.profit,
          winRate: s.winRate,
          pf: s.pf,
          avgProfit: s.avgProfit
        }));
        segmentLabel = "通貨ペア";
        break;
      case "価格帯":
        data = pipsRangeData.map(r => ({
          label: r.label,
          count: r.count,
          profit: r.profit,
          winRate: r.winRate,
          pf: r.pf,
          avgProfit: r.avgProfit
        }));
        segmentLabel = "価格帯（pips）";
        break;
      case "相場状態":
        data = marketConditionData.map(m => ({
          label: m.condition,
          count: m.count,
          profit: m.profit,
          winRate: m.winRate,
          pf: m.pf,
          avgProfit: m.avgProfit
        }));
        segmentLabel = "相場状態（β）";
        break;
    }

    return (
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid var(--line)" }}>
            <th style={{ padding: 10, textAlign: "left", fontSize: 15, fontWeight: "bold", color: "var(--muted)" }}>
              {segmentLabel}
            </th>
            <th style={{ padding: 10, textAlign: "right", fontSize: 15, fontWeight: "bold", color: "var(--muted)" }}>取引回数</th>
            <th style={{ padding: 10, textAlign: "right", fontSize: 15, fontWeight: "bold", color: "var(--muted)" }}>平均損益</th>
            <th style={{ padding: 10, textAlign: "right", fontSize: 15, fontWeight: "bold", color: "var(--muted)" }}>勝率</th>
            <th style={{ padding: 10, textAlign: "right", fontSize: 15, fontWeight: "bold", color: "var(--muted)" }}>PF</th>
            <th style={{ padding: 10, textAlign: "right", fontSize: 15, fontWeight: "bold", color: "var(--muted)" }}>合計損益</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={index}
              style={{
                borderBottom: "1px solid var(--line)",
                height: 44,
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--chip)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <td style={{ padding: 10, fontSize: 13 }}>{item.label}</td>
              <td style={{ padding: 10, textAlign: "right", fontSize: 13, color: "var(--muted)" }}>{item.count}回</td>
              <td
                style={{
                  padding: 10,
                  textAlign: "right",
                  fontSize: 13,
                  fontWeight: 600,
                  color: item.avgProfit >= 0 ? "var(--gain)" : "var(--loss)",
                }}
              >
                {item.avgProfit >= 0 ? '+' : ''}{Math.round(item.avgProfit).toLocaleString("ja-JP")}円
              </td>
              <td style={{ padding: 10, textAlign: "right", fontSize: 13, color: "var(--muted)" }}>{item.winRate.toFixed(0)}%</td>
              <td style={{ padding: 10, textAlign: "right", fontSize: 13, color: "var(--muted)" }}>{typeof item.pf === 'number' ? item.pf.toFixed(2) : item.pf}</td>
              <td
                style={{
                  padding: 10,
                  textAlign: "right",
                  fontSize: 18,
                  fontWeight: 600,
                  color: item.profit >= 0 ? "var(--gain)" : "var(--loss)",
                }}
              >
                {item.profit >= 0 ? '+' : ''}{Math.round(item.profit).toLocaleString("ja-JP")}円
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, borderBottom: "1px solid var(--line)" }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? "var(--fg)" : "var(--muted)",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === tab ? "2px solid var(--accent)" : "2px solid transparent",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {tab}
          </button>
        ))}
      </div>
      <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
        {renderTable()}
      </div>
    </div>
  );
}

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

  const categorizeAssetType = (pair: string): string => {
    const p = pair.toUpperCase();

    if (p.includes('JPY')) return 'jpy';
    if (p.includes('XAU') || p.includes('XAG') || p.includes('GOLD') || p.includes('SILVER')) return 'metals';
    if (p.includes('BTC') || p.includes('ETH') || p.includes('XRP') || p.includes('CRYPTO')) return 'crypto';
    if (p.includes('WTI') || p.includes('BRENT') || p.includes('OIL') || p.includes('CORN') || p.includes('WHEAT') || p.includes('SOYBEAN')) return 'commodities';
    if ((p.includes('USD') || p.includes('EUR') || p.includes('GBP') || p.includes('AUD') || p.includes('CAD') || p.includes('CHF') || p.includes('NZD')) &&
        p.match(/^(EUR|GBP|AUD|CAD|CHF|NZD)\/(USD|EUR|GBP|AUD|CAD|CHF|NZD)$/)) return 'usdMajor';
    if (p.includes('TRY') || p.includes('ZAR') || p.includes('MXN') || p.includes('BRL') || p.includes('INR') || p.includes('CNH')) return 'emerging';

    return 'other';
  };

  const assetTypeData = useMemo(() => {
    const categories = ['jpy', 'usdMajor', 'metals', 'crypto', 'commodities', 'emerging', 'other'];
    const result: Record<string, { count: number; profit: number; winRate: number }> = {};

    categories.forEach(cat => {
      const trades = filteredTrades.filter(t => categorizeAssetType(getTradePair(t)) === cat);
      const profit = trades.reduce((sum, t) => sum + getTradeProfit(t), 0);
      const wins = trades.filter(t => getTradeProfit(t) > 0).length;

      result[cat] = {
        count: trades.length,
        profit,
        winRate: trades.length > 0 ? (wins / trades.length) * 100 : 0
      };
    });

    return result;
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
        const sign = value >= 0 ? "+" : "";
        return `${sign}${Math.round(value).toLocaleString("ja-JP")}円`;
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
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "bold", color: "var(--muted)", display: "flex", alignItems: "center" }}>
            通貨ペア ベスト
            <HelpIcon text="最も稼げている通貨ペアです。得意な銘柄を見つけて取引を集中できます。" />
          </h3>
          <div style={{ fontSize: 18, fontWeight: 700, color: topSymbol.profit >= 0 ? "var(--gain)" : "var(--loss)" }}>
            {topSymbol.symbol}：{formatValue(topSymbol.profit, "profit")}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            勝率 {topSymbol.winRate.toFixed(0)}% / 取引 {topSymbol.count}件
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "bold", color: "var(--muted)", display: "flex", alignItems: "center" }}>
            通貨ペア ワースト
            <HelpIcon text="最も損失が出ている通貨ペアです。苦手な銘柄を避ける判断材料になります。" />
          </h3>
          <div style={{ fontSize: 18, fontWeight: 700, color: bottomSymbol.profit >= 0 ? "var(--gain)" : "var(--loss)" }}>
            {bottomSymbol.symbol}：{formatValue(bottomSymbol.profit, "profit")}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            勝率 {bottomSymbol.winRate.toFixed(0)}% / 取引 {bottomSymbol.count}件
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "bold", color: "var(--muted)", display: "flex", alignItems: "center" }}>
            価格帯 ベスト
            <HelpIcon text="最も稼げているpips範囲です。どのくらいの値動きが得意か把握できます。" />
          </h3>
          <div style={{ fontSize: 18, fontWeight: 700, color: topPipsRange.profit >= 0 ? "var(--gain)" : "var(--loss)" }}>
            {topPipsRange.label}：{formatValue(topPipsRange.profit, "profit")}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            バケット平均 {formatValue(topPipsRange.avgProfit, "avgProfit")}/件
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "bold", color: "var(--muted)", display: "flex", alignItems: "center" }}>
            資産クラス別
            <HelpIcon text="JPY、USD、貴金属、仮想通貨、商品、新興国通貨など、資産クラス別の損益比較です。" />
          </h3>
          <div style={{ fontSize: 13, fontWeight: 600, display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {assetTypeData.jpy.count > 0 && (
              <span
                style={{ color: assetTypeData.jpy.profit >= 0 ? "var(--gain)" : "var(--loss)", cursor: "help" }}
                title="円絡みの通貨ペア（USD/JPY、EUR/JPYなど）"
              >
                JPY：{formatValue(assetTypeData.jpy.profit, "profit")}({assetTypeData.jpy.count})
              </span>
            )}
            {assetTypeData.usdMajor.count > 0 && (
              <span
                style={{ color: assetTypeData.usdMajor.profit >= 0 ? "var(--gain)" : "var(--loss)", cursor: "help" }}
                title="米ドル主要通貨ペア（EUR/USD、GBP/USDなど、円以外のドルストレート）"
              >
                USD：{formatValue(assetTypeData.usdMajor.profit, "profit")}({assetTypeData.usdMajor.count})
              </span>
            )}
            {assetTypeData.metals.count > 0 && (
              <span style={{ color: assetTypeData.metals.profit >= 0 ? "var(--gain)" : "var(--loss)" }}>
                貴金属：{formatValue(assetTypeData.metals.profit, "profit")}({assetTypeData.metals.count})
              </span>
            )}
            {assetTypeData.crypto.count > 0 && (
              <span style={{ color: assetTypeData.crypto.profit >= 0 ? "var(--gain)" : "var(--loss)" }}>
                仮想通貨：{formatValue(assetTypeData.crypto.profit, "profit")}({assetTypeData.crypto.count})
              </span>
            )}
            {assetTypeData.commodities.count > 0 && (
              <span style={{ color: assetTypeData.commodities.profit >= 0 ? "var(--gain)" : "var(--loss)" }}>
                商品：{formatValue(assetTypeData.commodities.profit, "profit")}({assetTypeData.commodities.count})
              </span>
            )}
            {assetTypeData.emerging.count > 0 && (
              <span style={{ color: assetTypeData.emerging.profit >= 0 ? "var(--gain)" : "var(--loss)" }}>
                新興国：{formatValue(assetTypeData.emerging.profit, "profit")}({assetTypeData.emerging.count})
              </span>
            )}
            {assetTypeData.other.count > 0 && (
              <span style={{ color: assetTypeData.other.profit >= 0 ? "var(--gain)" : "var(--loss)" }}>
                他：{formatValue(assetTypeData.other.profit, "profit")}({assetTypeData.other.count})
              </span>
            )}
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
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "bold", color: "var(--muted)", display: "flex", alignItems: "center" }}>
            通貨ペア別（上位6）
            <HelpIcon text="主要6銘柄の損益を比較したグラフです。どの銘柄を優先すべきか見えてきます。" />
          </h3>
          <div style={{ height: 180 }}>
            <Bar
              data={{
                labels: symbolData.slice(0, 6).map((s) => s.symbol),
                datasets: [
                  {
                    data: symbolData.slice(0, 6).map(getMetricValue),
                    backgroundColor: symbolData.slice(0, 6).map((s) =>
                      s.profit >= 0 ? getAccentColor() : getLossColor()
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
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "bold", color: "var(--muted)", display: "flex", alignItems: "center" }}>
            価格帯（pipsビン）
            <HelpIcon text="値動きの幅ごとの損益分布です。どのくらいのボラティリティが適しているか分かります。" />
          </h3>
          <div style={{ height: 180 }}>
            <Bar
              data={{
                labels: pipsRangeData.map((r) => r.label),
                datasets: [
                  {
                    data: pipsRangeData.map(getMetricValue),
                    backgroundColor: pipsRangeData.map((r) =>
                      r.profit >= 0 ? getAccentColor() : getLossColor()
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
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "bold", color: "var(--muted)", display: "flex", alignItems: "center" }}>
            通貨（ベース/クオート別）
            <HelpIcon text="基軸通貨と決済通貨ごとの損益です。通貨別の得意不得意を把握できます。" />
          </h3>
          <div style={{ height: 180 }}>
            <Bar
              data={{
                labels: [...currencyData.base.slice(0, 4).map((c) => `${c.curr}(B)`), ...currencyData.quote.slice(0, 4).map((c) => `${c.curr}(Q)`)],
                datasets: [
                  {
                    data: [...currencyData.base.slice(0, 4).map((c) => c.profit), ...currencyData.quote.slice(0, 4).map((c) => c.profit)],
                    backgroundColor: [...currencyData.base.slice(0, 4), ...currencyData.quote.slice(0, 4)].map((c) =>
                      c.profit >= 0 ? getAccentColor() : getLossColor()
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
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "bold", color: "var(--muted)", display: "flex", alignItems: "center" }}>
            銘柄別損益
            <HelpIcon text="各銘柄の損益を横棒グラフで比較表示します。カーソルを合わせると取引件数が表示されます。" />
          </h3>
          <div style={{ height: 180 }}>
            <Bar
              data={{
                labels: symbolData.map((s) => s.symbol),
                datasets: [
                  {
                    data: symbolData.map((s) => s.profit),
                    backgroundColor: symbolData.map((s) =>
                      s.profit >= 0 ? getAccentColor() : getLossColor()
                    ),
                  },
                ],
              }}
              options={{
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const dataIndex = context.dataIndex;
                        const profit = symbolData[dataIndex].profit;
                        const count = symbolData[dataIndex].count;
                        return [
                          `損益: ${profit.toLocaleString()}円`,
                          `取引件数: ${count}件`
                        ];
                      }
                    }
                  },
                  datalabels: {
                    display: true,
                    anchor: 'end',
                    align: 'end',
                    formatter: (value) => `${value.toLocaleString()}円`,
                    color: 'var(--text)',
                    font: { size: 10 }
                  }
                },
                scales: {
                  x: {
                    beginAtZero: true,
                    ticks: { callback: (value) => `${(value as number).toLocaleString()}円` },
                  },
                },
              }}
            />
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "bold", color: "var(--muted)", display: "flex", alignItems: "center" }}>
            相場状態（β）
            <HelpIcon text="トレンドやレンジなど市場環境別の損益です。どの相場が得意か確認できます。" />
          </h3>
          <div style={{ height: 180 }}>
            <Bar
              data={{
                labels: marketConditionData.map((m) => m.condition),
                datasets: [
                  {
                    data: marketConditionData.map((m) => m.profit),
                    backgroundColor: marketConditionData.map((m) =>
                      m.profit >= 0 ? getAccentColor() : getLossColor()
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
        <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "bold", color: "var(--muted)", display: "flex", alignItems: "center" }}>
          市場・銘柄 明細
          <HelpIcon text="全通貨ペアと価格帯の詳細データテーブルです。細かい数値を確認して戦略を調整できます。" />
        </h3>
        <MarketSegmentTabs
          assetTypeData={assetTypeData}
          symbolData={symbolData}
          pipsRangeData={pipsRangeData}
          marketConditionData={marketConditionData}
        />
      </div>
    </div>
  );
}
