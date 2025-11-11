import React, { useEffect, useMemo, useState } from "react";
import { Bar, Doughnut, Scatter } from "react-chartjs-2";
import { useDataset } from "../../lib/dataset.context";
import { parseCsvText } from "../../lib/csv";
import type { Trade } from "../../lib/types";
import { filterTrades, getTradeProfit, getTradeSide, getTradePair } from "../../lib/filterTrades";
import { supabase } from "../../lib/supabase";
import { HelpIcon } from "../../components/common/HelpIcon";

type MetricType = "profit" | "winRate" | "pf" | "avgProfit";

export default function ReportsStrategy() {
  const { dataset, filters, useDatabase } = useDataset();
  const [trades, setTrades] = useState<Trade[]>([]);
  const metric: MetricType = "profit";

  useEffect(() => {
    (async () => {
      try {
        if (useDatabase) {
          const { getAllTrades } = await import('../../lib/db.service');
          const data = await getAllTrades();

          const { data: notesData } = await supabase
            .from('trade_notes')
            .select('ticket, entry_basis');

          const notesMap = new Map(
            (notesData || []).map((n: any) => [
              n.ticket,
              n.entry_basis?.setup || ''
            ])
          );

          const normalizeSide = (side: string): 'LONG' | 'SHORT' => {
            const s = side?.toUpperCase();
            if (s === 'BUY' || s === 'LONG') return 'LONG';
            if (s === 'SELL' || s === 'SHORT') return 'SHORT';
            return 'LONG';
          };

          const calculateHoldTime = (openTime: string, closeTime: string): number | undefined => {
            try {
              const openMs = new Date(openTime).getTime();
              const closeMs = new Date(closeTime).getTime();
              if (!isNaN(openMs) && !isNaN(closeMs)) {
                return Math.round((closeMs - openMs) / 60000);
              }
            } catch {
              return undefined;
            }
            return undefined;
          };

          const mapped: Trade[] = (data || []).map((t: any) => {
            const setup = notesMap.get(t.ticket) || '';
            return {
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
              comment: setup ? setup : (t.comment || ''),
              memo: t.memo || '',
              holdTimeMin: calculateHoldTime(t.open_time, t.close_time),
            };
          });
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
    return "デフォルト";
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

  // 決済効率分析
  const exitEfficiencyData = useMemo(() => {
    const tradesWithPotential = filteredTrades.filter(t => t.pips !== undefined && t.openPrice && t.closePrice);

    const efficiencies = tradesWithPotential.map(t => {
      const pips = Math.abs(t.pips || 0);
      const profit = getTradeProfit(t);

      // 最大可能利益を推定（実際のpips移動量の2倍と仮定）
      const maxPotentialPips = pips * 2;
      const maxPotentialProfit = profit > 0 ? profit * 2 : Math.abs(profit);

      // 決済効率 = 実現利益 / 最大可能利益
      const efficiency = maxPotentialProfit > 0 ? (profit / maxPotentialProfit) * 100 : 0;

      return {
        trade: t,
        efficiency: Math.max(-100, Math.min(100, efficiency)),
        profit,
        pips,
        maxPotential: maxPotentialProfit,
      };
    });

    const avgEfficiency = efficiencies.length > 0
      ? efficiencies.reduce((sum, e) => sum + e.efficiency, 0) / efficiencies.length
      : 0;

    const earlyExits = efficiencies.filter(e => e.profit > 0 && e.efficiency < 30).length;
    const holdRatio = efficiencies.filter(e => e.efficiency > 50).length / efficiencies.length * 100;

    // 決済効率分布
    const ranges = [
      { label: "-100~-50%", min: -100, max: -50 },
      { label: "-50~0%", min: -50, max: 0 },
      { label: "0~25%", min: 0, max: 25 },
      { label: "25~50%", min: 25, max: 50 },
      { label: "50~75%", min: 50, max: 75 },
      { label: "75~100%", min: 75, max: 100 },
    ];

    const distribution = ranges.map(range => ({
      label: range.label,
      count: efficiencies.filter(e => e.efficiency >= range.min && e.efficiency < range.max).length,
    }));

    // 決済戦略ランキング（最も損失が大きいパターン）
    const setupExitMap = new Map<string, { totalLoss: number; count: number; avgEfficiency: number }>();
    efficiencies.filter(e => e.profit < 0).forEach(e => {
      const setup = extractSetup(e.trade);
      const current = setupExitMap.get(setup) || { totalLoss: 0, count: 0, avgEfficiency: 0 };
      setupExitMap.set(setup, {
        totalLoss: current.totalLoss + Math.abs(e.profit),
        count: current.count + 1,
        avgEfficiency: current.avgEfficiency + e.efficiency,
      });
    });

    const exitRanking = Array.from(setupExitMap.entries())
      .map(([setup, data]) => ({
        setup,
        totalLoss: data.totalLoss,
        count: data.count,
        avgEfficiency: data.avgEfficiency / data.count,
      }))
      .sort((a, b) => b.totalLoss - a.totalLoss)
      .slice(0, 10);

    return {
      avgEfficiency,
      earlyExits,
      holdRatio,
      distribution,
      efficiencies,
      exitRanking,
    };
  }, [filteredTrades]);

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
            セットアップ Top
            <HelpIcon text="最も稼げている取引パターンです。この戦略を増やすことで収益を伸ばせます。" />
          </h3>
          <div style={{ fontSize: 18, fontWeight: 700, color: topSetup.profit >= 0 ? "var(--gain)" : "var(--loss)" }}>
            {topSetup.setup}：{formatValue(topSetup.profit, "profit")}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            勝率 {topSetup.winRate.toFixed(0)}% / 取引 {topSetup.count}件
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "bold", color: "var(--muted)", display: "flex", alignItems: "center" }}>
            セットアップ Bottom
            <HelpIcon text="最も損失が出ている取引パターンです。このパターンを避けるか改善する必要があります。" />
          </h3>
          <div style={{ fontSize: 18, fontWeight: 700, color: bottomSetup.profit >= 0 ? "var(--gain)" : "var(--loss)" }}>
            {bottomSetup.setup}：{formatValue(bottomSetup.profit, "profit")}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            勝率 {bottomSetup.winRate.toFixed(0)}% / 取引 {bottomSetup.count}件
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "bold", color: "var(--muted)", display: "flex", alignItems: "center" }}>
            方向比較
            <HelpIcon text="買いと売りの損益比較です。どちらの方向が得意か確認できます。" />
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: sideData.long.profit >= 0 ? "var(--gain)" : "var(--loss)" }}>
              買い：{formatValue(sideData.long.profit, "profit")}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: sideData.short.profit >= 0 ? "var(--gain)" : "var(--loss)" }}>
              売り：{formatValue(sideData.short.profit, "profit")}
            </div>
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
            PF {sideData.long.pf.toFixed(2)} / {sideData.short.pf.toFixed(2)}
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "bold", color: "var(--muted)", display: "flex", alignItems: "center" }}>
            平均勝ち / 平均負け
            <HelpIcon text="全戦略の平均損益です。利益と損失のバランスを総合的に評価できます。" />
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--gain)" }}>
              勝ち：{formatValue(avgWinLoss.avgWin, "profit")}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--loss)" }}>
              負け：{formatValue(avgWinLoss.avgLoss, "profit")}
            </div>
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>各セットアップ横断の平均</div>
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
            セットアップ別（上位6）
            <HelpIcon text="主要6戦略の損益を比較したグラフです。どの戦略を優先すべきか判断できます。" />
          </h3>
          <div style={{ height: 180 }}>
            <Bar
              data={{
                labels: setupData.slice(0, 6).map((s) => s.setup),
                datasets: [
                  {
                    data: setupData.slice(0, 6).map(getMetricValue),
                    backgroundColor: setupData.slice(0, 6).map((s) =>
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
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "bold", color: "var(--muted)", display: "flex", alignItems: "center" }}>
            買い vs 売り
            <HelpIcon text="ロングとショートの損益比較です。方向性の得意不得意が分かります。" />
          </h3>
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
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "bold", color: "var(--muted)", display: "flex", alignItems: "center" }}>
            セットアップ別 平均保有時間
            <HelpIcon text="戦略ごとの平均ポジション保有期間です。どの戦略が時間効率が良いか分かります。" />
          </h3>
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
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "bold", color: "var(--muted)", display: "flex", alignItems: "center" }}>
            セットアップ別 勝率
            <HelpIcon text="戦略ごとの勝率を比較したグラフです。確率論的にどの戦略が優れているか把握できます。" />
          </h3>
          <div style={{ height: 180 }}>
            <Bar
              data={{
                labels: setupData.slice(0, 6).map((s) => s.setup),
                datasets: [
                  {
                    data: setupData.slice(0, 6).map((s) => s.winRate),
                    backgroundColor: "rgba(22, 163, 74, 0.8)",
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
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "bold", color: "var(--muted)", display: "flex", alignItems: "center" }}>
            セットアップ別 PF
            <HelpIcon text="戦略ごとのプロフィットファクター（総利益÷総損失）です。1.0以上なら利益が損失を上回っています。" />
          </h3>
          <div style={{ height: 180 }}>
            <Bar
              data={{
                labels: setupData.slice(0, 6).map((s) => s.setup),
                datasets: [
                  {
                    data: setupData.slice(0, 6).map((s) => Math.min(s.pf, 5)),
                    backgroundColor: setupData.slice(0, 6).map((s) =>
                      s.pf >= 1 ? "rgba(22, 163, 74, 0.8)" : "rgba(239, 68, 68, 0.8)"
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
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "bold", color: "var(--muted)", display: "flex", alignItems: "center" }}>
            方向×セットアップ（クロス）
            <HelpIcon text="売買方向と戦略の組み合わせ分析です。最適な組み合わせを見つけられます。" />
          </h3>
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

      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12, marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: 17, fontWeight: "bold", color: "var(--ink)" }}>決済効率分析</h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div style={{ background: "var(--chip)", border: "1px solid var(--line)", borderRadius: 12, padding: 12 }}>
            <h4 style={{ margin: "0 0 8px 0", fontSize: 13, fontWeight: "bold", color: "var(--muted)" }}>平均決済効率</h4>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--accent)" }}>
              {exitEfficiencyData.avgEfficiency.toFixed(1)}%
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>実現利益/最大可能利益</div>
          </div>

          <div style={{ background: "var(--chip)", border: "1px solid var(--line)", borderRadius: 12, padding: 12 }}>
            <h4 style={{ margin: "0 0 8px 0", fontSize: 13, fontWeight: "bold", color: "var(--muted)" }}>早期決済回数</h4>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--loss)" }}>
              {exitEfficiencyData.earlyExits}件
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>効率30%未満の勝ちトレード</div>
          </div>

          <div style={{ background: "var(--chip)", border: "1px solid var(--line)", borderRadius: 12, padding: 12 }}>
            <h4 style={{ margin: "0 0 8px 0", fontSize: 13, fontWeight: "bold", color: "var(--muted)" }}>保有率実績</h4>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--gain)" }}>
              {exitEfficiencyData.holdRatio.toFixed(1)}%
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>効率50%以上の割合</div>
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
          <div>
            <h4 style={{ margin: "0 0 12px 0", fontSize: 15, fontWeight: "bold", color: "var(--muted)", display: "flex", alignItems: "center" }}>
            決済効率分布
            <HelpIcon text="決済タイミングの良し悪しの分布です。利確・損切りの改善余地を確認できます。" />
          </h4>
            <div style={{ height: 180 }}>
              <Bar
                data={{
                  labels: exitEfficiencyData.distribution.map(d => d.label),
                  datasets: [
                    {
                      data: exitEfficiencyData.distribution.map(d => d.count),
                      backgroundColor: exitEfficiencyData.distribution.map((d, idx) =>
                        idx < 2 ? "rgba(239, 68, 68, 0.8)" :
                        idx < 4 ? "rgba(245, 158, 11, 0.8)" :
                        "rgba(22, 163, 74, 0.8)"
                      ),
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } },
                  },
                }}
              />
            </div>
          </div>

          <div>
            <h4 style={{ margin: "0 0 12px 0", fontSize: 15, fontWeight: "bold", color: "var(--muted)", display: "flex", alignItems: "center" }}>
            決済戦略ランキング（損失大）
            <HelpIcon text="早期決済で損失を拡大した取引リストです。決済ルールを見直すポイントが分かります。" />
          </h4>
            <div style={{ maxHeight: 180, overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--line)" }}>
                    <th style={{ padding: "6px 8px", textAlign: "left", fontSize: 11, color: "var(--muted)" }}>順位</th>
                    <th style={{ padding: "6px 8px", textAlign: "left", fontSize: 11, color: "var(--muted)" }}>セットアップ</th>
                    <th style={{ padding: "6px 8px", textAlign: "right", fontSize: 11, color: "var(--muted)" }}>損失額</th>
                    <th style={{ padding: "6px 8px", textAlign: "right", fontSize: 11, color: "var(--muted)" }}>回数</th>
                  </tr>
                </thead>
                <tbody>
                  {exitEfficiencyData.exitRanking.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid var(--line)" }}>
                      <td style={{ padding: "6px 8px" }}>{idx + 1}</td>
                      <td style={{ padding: "6px 8px" }}>{item.setup}</td>
                      <td style={{ padding: "6px 8px", textAlign: "right", color: "var(--loss)" }}>
                        {Math.round(item.totalLoss).toLocaleString()}円
                      </td>
                      <td style={{ padding: "6px 8px", textAlign: "right" }}>{item.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
        <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "bold", color: "var(--muted)", display: "flex", alignItems: "center" }}>
            戦略・行動 明細
            <HelpIcon text="全戦略と方向の詳細データテーブルです。細かい数値を確認して改善点を見つけられます。" />
          </h3>
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
