import React, { useEffect, useMemo, useState } from "react";
import { Bar, Line, Scatter } from "react-chartjs-2";
import { useDataset } from "../../lib/dataset.context";
import { parseCsvText } from "../../lib/csv";
import type { Trade } from "../../lib/types";
import { filterTrades, getTradeProfit, getTradeTime } from "../../lib/filterTrades";
import { supabase } from "../../lib/supabase";

type DayOfWeek = "日" | "月" | "火" | "水" | "木" | "金" | "土";
type MetricType = "profit" | "winRate" | "pf" | "avgProfit";

const dayNames: DayOfWeek[] = ["日", "月", "火", "水", "木", "金", "土"];

export default function ReportsTimeAxis() {
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

  const filteredTrades = useMemo(() => {
    return filterTrades(trades, filters);
  }, [trades, filters]);

  const dayOfWeekData = useMemo(() => {
    const map = new Map<DayOfWeek, { profit: number; count: number; wins: number }>();
    filteredTrades.forEach((t) => {
      const date = new Date(getTradeTime(t));
      const dow = dayNames[date.getDay()];
      const profit = getTradeProfit(t);
      const current = map.get(dow) || { profit: 0, count: 0, wins: 0 };
      map.set(dow, {
        profit: current.profit + profit,
        count: current.count + 1,
        wins: current.wins + (profit > 0 ? 1 : 0),
      });
    });
    return dayNames.map((day) => {
      const data = map.get(day) || { profit: 0, count: 0, wins: 0 };
      const winRate = data.count > 0 ? (data.wins / data.count) * 100 : 0;
      const grossProfit = filteredTrades
        .filter((t) => dayNames[new Date(getTradeTime(t)).getDay()] === day && getTradeProfit(t) > 0)
        .reduce((sum, t) => sum + getTradeProfit(t), 0);
      const grossLoss = Math.abs(
        filteredTrades
          .filter((t) => dayNames[new Date(getTradeTime(t)).getDay()] === day && getTradeProfit(t) < 0)
          .reduce((sum, t) => sum + getTradeProfit(t), 0)
      );
      const pf = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;
      const avgProfit = data.count > 0 ? data.profit / data.count : 0;
      return { day, ...data, winRate, pf, avgProfit };
    });
  }, [filteredTrades]);

  const hourData = useMemo(() => {
    const ranges = [
      { label: "00-02", start: 0, end: 2 },
      { label: "02-04", start: 2, end: 4 },
      { label: "04-06", start: 4, end: 6 },
      { label: "06-08", start: 6, end: 8 },
      { label: "08-10", start: 8, end: 10 },
      { label: "10-12", start: 10, end: 12 },
      { label: "12-14", start: 12, end: 14 },
      { label: "14-16", start: 14, end: 16 },
      { label: "16-18", start: 16, end: 18 },
      { label: "18-20", start: 18, end: 20 },
      { label: "20-22", start: 20, end: 22 },
      { label: "22-00", start: 22, end: 24 },
    ];

    return ranges.map((range) => {
      const rangeTrades = filteredTrades.filter((t) => {
        const hour = new Date(getTradeTime(t)).getHours();
        return hour >= range.start && hour < range.end;
      });
      const profit = rangeTrades.reduce((sum, t) => sum + getTradeProfit(t), 0);
      const count = rangeTrades.length;
      const wins = rangeTrades.filter((t) => getTradeProfit(t) > 0).length;
      const winRate = count > 0 ? (wins / count) * 100 : 0;
      const grossProfit = rangeTrades.filter((t) => getTradeProfit(t) > 0).reduce((sum, t) => sum + getTradeProfit(t), 0);
      const grossLoss = Math.abs(rangeTrades.filter((t) => getTradeProfit(t) < 0).reduce((sum, t) => sum + getTradeProfit(t), 0));
      const pf = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;
      const avgProfit = count > 0 ? profit / count : 0;
      return { label: range.label, profit, count, wins, winRate, pf, avgProfit };
    });
  }, [filteredTrades]);

  const dailyData = useMemo(() => {
    const map = new Map<string, { profit: number; count: number; wins: number }>();
    filteredTrades.forEach((t) => {
      const date = getTradeTime(t).split(" ")[0];
      const profit = getTradeProfit(t);
      const current = map.get(date) || { profit: 0, count: 0, wins: 0 };
      map.set(date, {
        profit: current.profit + profit,
        count: current.count + 1,
        wins: current.wins + (profit > 0 ? 1 : 0),
      });
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredTrades]);

  const weeklyData = useMemo(() => {
    const map = new Map<string, { profit: number; count: number }>();
    filteredTrades.forEach((t) => {
      const date = new Date(getTradeTime(t));
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split("T")[0];
      const profit = getTradeProfit(t);
      const current = map.get(weekKey) || { profit: 0, count: 0 };
      map.set(weekKey, {
        profit: current.profit + profit,
        count: current.count + 1,
      });
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12);
  }, [filteredTrades]);

  const holdTimeDistribution = useMemo(() => {
    const ranges = [
      { label: "0-10分", min: 0, max: 10 },
      { label: "10-30分", min: 10, max: 30 },
      { label: "30-60分", min: 30, max: 60 },
      { label: "1-2h", min: 60, max: 120 },
      { label: "2-6h", min: 120, max: 360 },
      { label: "6h+", min: 360, max: Infinity },
    ];
    return ranges.map((range) => {
      const count = filteredTrades.filter((t) => {
        const mins = t.holdTimeMin || 0;
        return mins >= range.min && mins < range.max;
      }).length;
      return { label: range.label, count };
    });
  }, [filteredTrades]);

  const scatterTimeProfit = useMemo(() => {
    return filteredTrades.map((t) => {
      const time = getTradeTime(t);
      const hour = new Date(time).getHours() + new Date(time).getMinutes() / 60;
      return { x: hour, y: getTradeProfit(t) };
    });
  }, [filteredTrades]);

  const scatterHoldTimeProfit = useMemo(() => {
    return filteredTrades.map((t) => ({
      x: t.holdTimeMin || 0,
      y: getTradeProfit(t),
    }));
  }, [filteredTrades]);

  const topDayOfWeek = useMemo(() => {
    const sorted = [...dayOfWeekData].sort((a, b) => b.profit - a.profit);
    return sorted[0] || { day: "-", profit: 0, winRate: 0, count: 0 };
  }, [dayOfWeekData]);

  const bottomDayOfWeek = useMemo(() => {
    const sorted = [...dayOfWeekData].sort((a, b) => a.profit - b.profit);
    return sorted[0] || { day: "-", profit: 0, winRate: 0, count: 0 };
  }, [dayOfWeekData]);

  const topHour = useMemo(() => {
    const sorted = [...hourData].sort((a, b) => b.profit - a.profit);
    return sorted[0] || { label: "-", profit: 0, winRate: 0, count: 0 };
  }, [hourData]);

  const bottomHour = useMemo(() => {
    const sorted = [...hourData].sort((a, b) => a.profit - b.profit);
    return sorted[0] || { label: "-", profit: 0, winRate: 0, count: 0 };
  }, [hourData]);

  const getMetricValue = (item: any) => {
    switch (metric) {
      case "profit":
        return item.profit;
      case "winRate":
        return item.winRate;
      case "pf":
        return item.pf;
      case "avgProfit":
        return item.avgProfit;
      default:
        return item.profit;
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

  const formatHoldTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}分`;
    if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      return mins > 0 ? `${hours}時間${mins}分` : `${hours}時間`;
    }
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    return hours > 0 ? `${days}日${hours}時間` : `${days}日`;
  };

  // トレードスタイル別統計
  const tradeStyleData = useMemo(() => {
    const styles = [
      { label: "スキャルピング", min: 0, max: 30 },
      { label: "デイトレード", min: 30, max: 480 },
      { label: "スイング", min: 480, max: 10080 },
      { label: "ポジション", min: 10080, max: Infinity },
    ];

    return styles.map((style) => {
      const styleTrades = filteredTrades.filter((t) => {
        const mins = t.holdTimeMin || 0;
        return mins >= style.min && mins < style.max;
      });

      const profit = styleTrades.reduce((sum, t) => sum + getTradeProfit(t), 0);
      const wins = styleTrades.filter((t) => getTradeProfit(t) > 0).length;
      const losses = styleTrades.filter((t) => getTradeProfit(t) < 0).length;
      const winRate = styleTrades.length > 0 ? (wins / styleTrades.length) * 100 : 0;
      const ev = styleTrades.length > 0 ? profit / styleTrades.length : 0;
      const avgHoldTime = styleTrades.length > 0
        ? styleTrades.reduce((sum, t) => sum + (t.holdTimeMin || 0), 0) / styleTrades.length
        : 0;

      return {
        label: style.label,
        count: styleTrades.length,
        profit,
        wins,
        losses,
        winRate,
        ev,
        avgHoldTime,
      };
    });
  }, [filteredTrades]);

  // 保有時間統計
  const holdTimeStats = useMemo(() => {
    const winTrades = filteredTrades.filter((t) => getTradeProfit(t) > 0);
    const lossTrades = filteredTrades.filter((t) => getTradeProfit(t) < 0);

    const avgWinHoldTime = winTrades.length > 0
      ? winTrades.reduce((sum, t) => sum + (t.holdTimeMin || 0), 0) / winTrades.length
      : 0;

    const avgLossHoldTime = lossTrades.length > 0
      ? lossTrades.reduce((sum, t) => sum + (t.holdTimeMin || 0), 0) / lossTrades.length
      : 0;

    const maxHoldTime = filteredTrades.reduce((max, t) => Math.max(max, t.holdTimeMin || 0), 0);
    const minHoldTime = filteredTrades.reduce((min, t) => {
      const time = t.holdTimeMin || 0;
      return time > 0 ? Math.min(min, time) : min;
    }, Infinity);

    const maxLossHoldTime = lossTrades.reduce((max, t) => Math.max(max, t.holdTimeMin || 0), 0);
    const minLossHoldTime = lossTrades.reduce((min, t) => {
      const time = t.holdTimeMin || 0;
      return time > 0 ? Math.min(min, time) : min;
    }, Infinity);

    return {
      avgWinHoldTime,
      avgLossHoldTime,
      maxHoldTime,
      minHoldTime: minHoldTime === Infinity ? 0 : minHoldTime,
      maxLossHoldTime,
      minLossHoldTime: minLossHoldTime === Infinity ? 0 : minLossHoldTime,
    };
  }, [filteredTrades]);

  return (
    <div style={{ width: "100%" }}>

      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12, marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: 17, fontWeight: "bold", color: "var(--ink)" }}>トレードスタイル別統計</h3>

        <div style={{ display: "flex", gap: 16, alignItems: "stretch", flexWrap: "wrap", marginBottom: 12 }}>
          <div style={{ flex: "1 1 400px", minWidth: 0, maxHeight: "60vh", overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--line)" }}>
                  <th style={{ padding: 10, textAlign: "left", fontSize: 13, fontWeight: "bold", color: "var(--muted)" }}>スタイル</th>
                  <th style={{ padding: 10, textAlign: "right", fontSize: 13, fontWeight: "bold", color: "var(--muted)" }}>取引数</th>
                  <th style={{ padding: 10, textAlign: "right", fontSize: 13, fontWeight: "bold", color: "var(--muted)" }}>勝率</th>
                  <th style={{ padding: 10, textAlign: "right", fontSize: 13, fontWeight: "bold", color: "var(--muted)" }}>期待値(EV)</th>
                  <th style={{ padding: 10, textAlign: "right", fontSize: 13, fontWeight: "bold", color: "var(--muted)" }}>平均保有時間</th>
                  <th style={{ padding: 10, textAlign: "right", fontSize: 13, fontWeight: "bold", color: "var(--muted)" }}>Net損益</th>
                </tr>
              </thead>
              <tbody>
                {tradeStyleData.map((style) => (
                  <tr
                    key={style.label}
                    style={{
                      borderBottom: "1px solid var(--line)",
                      height: 44,
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--chip)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: 10, fontSize: 13, fontWeight: 600 }}>{style.label}</td>
                    <td style={{ padding: 10, textAlign: "right", fontSize: 13 }}>{style.count}件</td>
                    <td style={{ padding: 10, textAlign: "right", fontSize: 13 }}>{style.winRate.toFixed(1)}%</td>
                    <td style={{ padding: 10, textAlign: "right", fontSize: 13, color: style.ev >= 0 ? "var(--gain)" : "var(--loss)" }}>
                      {Math.round(style.ev).toLocaleString()}円
                    </td>
                    <td style={{ padding: 10, textAlign: "right", fontSize: 13 }}>{formatHoldTime(style.avgHoldTime)}</td>
                    <td style={{ padding: 10, textAlign: "right", fontSize: 13, color: style.profit >= 0 ? "var(--gain)" : "var(--loss)" }}>
                      {Math.round(style.profit).toLocaleString()}円
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ flex: "1 1 400px", minWidth: 0, height: 220 }}>
            <Bar
              data={{
                labels: tradeStyleData.map((s) => s.label),
                datasets: [
                  {
                    type: 'bar' as const,
                    label: '勝ちトレード',
                    data: tradeStyleData.map((s) => s.wins),
                    backgroundColor: 'rgba(34, 197, 246, 0.8)',
                    yAxisID: 'y',
                    stack: 'stack1',
                  },
                  {
                    type: 'bar' as const,
                    label: '負けトレード',
                    data: tradeStyleData.map((s) => s.losses),
                    backgroundColor: 'rgba(239, 99, 68, 0.8)',
                    yAxisID: 'y',
                    stack: 'stack1',
                  },
                  {
                    type: 'line' as const,
                    label: '勝率(%)',
                    data: tradeStyleData.map((s) => s.winRate),
                    borderColor: 'rgba(34, 197, 246, 1)',
                    backgroundColor: 'rgba(34, 197, 246, 0.1)',
                    yAxisID: 'y1',
                    tension: 0.3,
                    pointRadius: 5,
                    pointBackgroundColor: 'rgba(34, 197, 246, 1)',
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: 'bottom' as const,
                  },
                },
                scales: {
                  y: {
                    type: 'linear' as const,
                    display: true,
                    position: 'left' as const,
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: '取引回数',
                    },
                    stacked: true,
                  },
                  y1: {
                    type: 'linear' as const,
                    display: true,
                    position: 'right' as const,
                    min: 0,
                    max: 100,
                    title: {
                      display: true,
                      text: '勝率(%)',
                    },
                    grid: {
                      drawOnChartArea: false,
                    },
                  },
                  x: {
                    stacked: true,
                  },
                },
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 12,
            marginTop: 8,
          }}
        >
          <div style={{ background: "var(--chip)", border: "1px solid var(--line)", borderRadius: 12, padding: 12 }}>
            <h4 style={{ margin: "0 0 8px 0", fontSize: 13, fontWeight: "bold", color: "var(--muted)" }}>勝利トレード平均保有時間</h4>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--gain)" }}>
              {formatHoldTime(holdTimeStats.avgWinHoldTime)}
            </div>
          </div>

          <div style={{ background: "var(--chip)", border: "1px solid var(--line)", borderRadius: 12, padding: 12 }}>
            <h4 style={{ margin: "0 0 8px 0", fontSize: 13, fontWeight: "bold", color: "var(--muted)" }}>負けトレード平均保有時間</h4>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--loss)" }}>
              {formatHoldTime(holdTimeStats.avgLossHoldTime)}
            </div>
          </div>

          <div style={{ background: "var(--chip)", border: "1px solid var(--line)", borderRadius: 12, padding: 12 }}>
            <h4 style={{ margin: "0 0 8px 0", fontSize: 13, fontWeight: "bold", color: "var(--muted)" }}>最長保有時間</h4>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>
              {formatHoldTime(holdTimeStats.maxHoldTime)}
            </div>
          </div>

          <div style={{ background: "var(--chip)", border: "1px solid var(--line)", borderRadius: 12, padding: 12 }}>
            <h4 style={{ margin: "0 0 8px 0", fontSize: 13, fontWeight: "bold", color: "var(--muted)" }}>最短保有時間</h4>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>
              {formatHoldTime(holdTimeStats.minHoldTime)}
            </div>
          </div>
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
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "bold", color: "var(--muted)" }}>曜日 Top</h3>
          <div style={{ fontSize: 18, fontWeight: 700, color: topDayOfWeek.profit >= 0 ? "var(--gain)" : "var(--loss)" }}>
            {topDayOfWeek.day}曜日：{formatValue(topDayOfWeek.profit, "profit")}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            勝率 {topDayOfWeek.winRate.toFixed(0)}% / 取引 {topDayOfWeek.count}件
          </div>
          <div style={{ height: 60, marginTop: 8 }}>
            <Bar
              data={{
                labels: dayOfWeekData.map((d) => d.day),
                datasets: [
                  {
                    data: dayOfWeekData.map((d) => d.profit),
                    backgroundColor: dayOfWeekData.map((d) =>
                      d.profit >= 0 ? "rgba(34, 197, 94, 0.8)" : "rgba(239, 68, 68, 0.8)"
                    ),
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                scales: {
                  x: { display: false },
                  y: { display: false, beginAtZero: true },
                },
              }}
            />
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "bold", color: "var(--muted)" }}>曜日 Bottom</h3>
          <div style={{ fontSize: 18, fontWeight: 700, color: bottomDayOfWeek.profit >= 0 ? "var(--gain)" : "var(--loss)" }}>
            {bottomDayOfWeek.day}曜日：{formatValue(bottomDayOfWeek.profit, "profit")}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            勝率 {bottomDayOfWeek.winRate.toFixed(0)}% / 取引 {bottomDayOfWeek.count}件
          </div>
          <div style={{ height: 60, marginTop: 8 }}>
            <Bar
              data={{
                labels: dayOfWeekData.map((d) => d.day),
                datasets: [
                  {
                    data: dayOfWeekData.map((d) => d.profit),
                    backgroundColor: dayOfWeekData.map((d) =>
                      d.profit >= 0 ? "rgba(34, 197, 94, 0.8)" : "rgba(239, 68, 68, 0.8)"
                    ),
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                scales: {
                  x: { display: false },
                  y: { display: false, beginAtZero: true },
                },
              }}
            />
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "bold", color: "var(--muted)" }}>時間帯 Top</h3>
          <div style={{ fontSize: 18, fontWeight: 700, color: topHour.profit >= 0 ? "var(--gain)" : "var(--loss)" }}>
            {topHour.label.replace('-', '時-')}時：{formatValue(topHour.profit, "profit")}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            勝率 {topHour.winRate.toFixed(0)}% / 取引 {topHour.count}件
          </div>
          <div style={{ height: 60, marginTop: 8 }}>
            <Bar
              data={{
                labels: hourData.map((h) => h.label),
                datasets: [
                  {
                    data: hourData.map((h) => h.profit),
                    backgroundColor: hourData.map((h) => (h.profit >= 0 ? "rgba(34, 197, 94, 0.8)" : "rgba(239, 68, 68, 0.8)")),
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                scales: {
                  x: { display: false },
                  y: { display: false, beginAtZero: true },
                },
              }}
            />
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "bold", color: "var(--muted)" }}>時間帯 Bottom</h3>
          <div style={{ fontSize: 18, fontWeight: 700, color: bottomHour.profit >= 0 ? "var(--gain)" : "var(--loss)" }}>
            {bottomHour.label.replace('-', '時-')}時：{formatValue(bottomHour.profit, "profit")}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            勝率 {bottomHour.winRate.toFixed(0)}% / 取引 {bottomHour.count}件
          </div>
          <div style={{ height: 60, marginTop: 8 }}>
            <Bar
              data={{
                labels: hourData.map((h) => h.label),
                datasets: [
                  {
                    data: hourData.map((h) => h.profit),
                    backgroundColor: hourData.map((h) => (h.profit >= 0 ? "rgba(34, 197, 94, 0.8)" : "rgba(239, 68, 68, 0.8)")),
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                scales: {
                  x: { display: false },
                  y: { display: false, beginAtZero: true },
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
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "bold", color: "var(--muted)" }}>曜日別</h3>
          <div style={{ height: 180 }}>
            <Bar
              data={{
                labels: dayOfWeekData.map((d) => d.day),
                datasets: [
                  {
                    data: dayOfWeekData.map(getMetricValue),
                    backgroundColor: dayOfWeekData.map((d) =>
                      d.profit >= 0 ? "rgba(34, 197, 94, 0.8)" : "rgba(239, 68, 68, 0.8)"
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
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "bold", color: "var(--muted)" }}>時間帯別</h3>
          <div style={{ height: 180 }}>
            <Bar
              data={{
                labels: hourData.map((h) => h.label),
                datasets: [
                  {
                    data: hourData.map(getMetricValue),
                    backgroundColor: hourData.map((h) => (h.profit >= 0 ? "rgba(34, 197, 94, 0.8)" : "rgba(239, 68, 68, 0.8)")),
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
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "bold", color: "var(--muted)" }}>日別推移</h3>
          <div style={{ height: 180 }}>
            <Bar
              data={{
                labels: dailyData.map(([date]) => date.substring(5)),
                datasets: [
                  {
                    data: dailyData.map(([_, d]) => d.profit),
                    backgroundColor: dailyData.map(([_, d]) =>
                      d.profit >= 0 ? "rgba(34, 197, 94, 0.8)" : "rgba(239, 68, 68, 0.8)"
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
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "bold", color: "var(--muted)" }}>週別推移</h3>
          <div style={{ height: 180 }}>
            <Bar
              data={{
                labels: weeklyData.map(([date]) => date.substring(5)),
                datasets: [
                  {
                    data: weeklyData.map(([_, d]) => d.profit),
                    backgroundColor: weeklyData.map(([_, d]) =>
                      d.profit >= 0 ? "rgba(34, 197, 94, 0.8)" : "rgba(239, 68, 68, 0.8)"
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
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "bold", color: "var(--muted)" }}>保有時間分布</h3>
          <div style={{ height: 180 }}>
            <Bar
              data={{
                labels: holdTimeDistribution.map((h) => h.label),
                datasets: [
                  {
                    data: holdTimeDistribution.map((h) => h.count),
                    backgroundColor: "rgba(59, 130, 246, 0.8)",
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
              }}
            />
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "bold", color: "var(--muted)" }}>日別勝率</h3>
          <div style={{ height: 180 }}>
            <Line
              data={{
                labels: dailyData.map(([date]) => date.substring(5)),
                datasets: [
                  {
                    data: dailyData.map(([_, d]) => (d.count > 0 ? (d.wins / d.count) * 100 : 0)),
                    borderColor: "rgba(59, 130, 246, 1)",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    fill: true,
                    tension: 0.3,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: {
                    min: 0,
                    max: 100,
                    ticks: { callback: (value) => `${value}%` },
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
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "bold", color: "var(--muted)" }}>散布図：時刻×損益</h3>
          <div style={{ height: 180 }}>
            <Scatter
              data={{
                datasets: [
                  {
                    data: scatterTimeProfit,
                    backgroundColor: scatterTimeProfit.map((p) =>
                      p.y >= 0 ? "rgba(34, 197, 94, 0.6)" : "rgba(239, 68, 68, 0.6)"
                    ),
                    pointRadius: 4,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { title: { display: true, text: "時刻" }, min: 0, max: 24 },
                  y: { title: { display: true, text: "損益" } },
                },
              }}
            />
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "bold", color: "var(--muted)" }}>散布図：保有時間×損益</h3>
          <div style={{ height: 180 }}>
            <Scatter
              data={{
                datasets: [
                  {
                    data: scatterHoldTimeProfit,
                    backgroundColor: scatterHoldTimeProfit.map((p) =>
                      p.y >= 0 ? "rgba(34, 197, 94, 0.6)" : "rgba(239, 68, 68, 0.6)"
                    ),
                    pointRadius: 4,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { title: { display: true, text: "保有時間（分）" } },
                  y: { title: { display: true, text: "損益" } },
                },
              }}
            />
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "bold", color: "var(--muted)" }}>連敗ヒート（時間帯）</h3>
          <LossStreakHeatmap trades={filteredTrades} />
        </div>
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
        <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: "bold", color: "var(--muted)" }}>セグメント別明細</h3>
        <div>
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
              {dayOfWeekData.map((d) => (
                <tr
                  key={d.day}
                  style={{
                    borderBottom: "1px solid var(--line)",
                    height: 44,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--chip)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: 10, fontSize: 13 }}>曜日</td>
                  <td style={{ padding: 10, fontSize: 13 }}>{d.day}曜日</td>
                  <td style={{ padding: 10, textAlign: "right", fontSize: 13 }}>{d.count}</td>
                  <td
                    style={{
                      padding: 10,
                      textAlign: "right",
                      fontSize: 13,
                      color: d.profit >= 0 ? "var(--gain)" : "var(--loss)",
                    }}
                  >
                    {Math.round(d.profit).toLocaleString("ja-JP")}円
                  </td>
                  <td style={{ padding: 10, textAlign: "right", fontSize: 13 }}>{d.winRate.toFixed(0)}%</td>
                  <td style={{ padding: 10, textAlign: "right", fontSize: 13 }}>{d.pf.toFixed(2)}</td>
                  <td style={{ padding: 10, textAlign: "right", fontSize: 13 }}>
                    {Math.round(d.avgProfit).toLocaleString("ja-JP")}円
                  </td>
                </tr>
              ))}
              {hourData.map((h) => (
                <tr
                  key={h.label}
                  style={{
                    borderBottom: "1px solid var(--line)",
                    height: 44,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--chip)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: 10, fontSize: 13 }}>時間帯</td>
                  <td style={{ padding: 10, fontSize: 13 }}>{h.label}</td>
                  <td style={{ padding: 10, textAlign: "right", fontSize: 13 }}>{h.count}</td>
                  <td
                    style={{
                      padding: 10,
                      textAlign: "right",
                      fontSize: 13,
                      color: h.profit >= 0 ? "var(--gain)" : "var(--loss)",
                    }}
                  >
                    {Math.round(h.profit).toLocaleString("ja-JP")}円
                  </td>
                  <td style={{ padding: 10, textAlign: "right", fontSize: 13 }}>{h.winRate.toFixed(0)}%</td>
                  <td style={{ padding: 10, textAlign: "right", fontSize: 13 }}>{h.pf.toFixed(2)}</td>
                  <td style={{ padding: 10, textAlign: "right", fontSize: 13 }}>
                    {Math.round(h.avgProfit).toLocaleString("ja-JP")}円
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
            曜日・時間帯別の詳細統計
          </span>
        </div>
      </div>
    </div>
  );
}

function LossStreakHeatmap({ trades }: { trades: Trade[] }) {
  const heatmapData = useMemo(() => {
    if (trades.length === 0) return [];

    const hourBuckets: Map<number, number[]> = new Map();
    for (let h = 0; h < 24; h++) {
      hourBuckets.set(h, []);
    }

    const sortedTrades = [...trades].sort((a, b) => getTradeTime(a) - getTradeTime(b));

    let currentStreak = 0;
    sortedTrades.forEach((trade) => {
      const profit = getTradeProfit(trade);
      const time = getTradeTime(trade);
      const date = new Date(time);
      const hour = date.getHours();

      if (profit < 0) {
        currentStreak++;
      } else {
        if (currentStreak > 0) {
          hourBuckets.get(hour)?.push(currentStreak);
        }
        currentStreak = 0;
      }
    });

    const result = [];
    for (let h = 0; h < 24; h++) {
      const streaks = hourBuckets.get(h) || [];
      const maxStreak = streaks.length > 0 ? Math.max(...streaks) : 0;
      const avgStreak = streaks.length > 0 ? streaks.reduce((a, b) => a + b, 0) / streaks.length : 0;
      result.push({ hour: h, maxStreak, avgStreak, count: streaks.length });
    }

    return result;
  }, [trades]);

  const maxValue = Math.max(...heatmapData.map((d) => d.maxStreak), 1);

  const getColor = (value: number) => {
    if (value === 0) return "rgba(200, 200, 200, 0.2)";
    const intensity = Math.min(value / maxValue, 1);
    return `rgba(239, 68, 68, ${0.2 + intensity * 0.6})`;
  };

  if (trades.length === 0) {
    return (
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
        データがありません
      </div>
    );
  }

  return (
    <div style={{ padding: "8px 0" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gap: 4,
          marginBottom: 8,
        }}
      >
        {heatmapData.map((item) => (
          <div
            key={item.hour}
            style={{
              background: getColor(item.maxStreak),
              border: "1px solid var(--line)",
              borderRadius: 4,
              padding: "8px 4px",
              textAlign: "center",
              fontSize: 11,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            title={`${item.hour}時: 最大連敗${item.maxStreak}回, 平均${item.avgStreak.toFixed(1)}回 (${item.count}回発生)`}
          >
            <div style={{ fontWeight: "bold", marginBottom: 2 }}>{item.hour}時</div>
            <div style={{ fontSize: 10, color: "var(--muted)" }}>
              {item.maxStreak > 0 ? `${item.maxStreak}連敗` : "-"}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "var(--muted)" }}>
        <span>色の濃さ = 連敗の深刻度</span>
        <div style={{ display: "flex", gap: 2, marginLeft: "auto" }}>
          <div style={{ width: 12, height: 12, background: "rgba(200, 200, 200, 0.2)", border: "1px solid var(--line)" }}></div>
          <span style={{ fontSize: 10 }}>なし</span>
          <div style={{ width: 12, height: 12, background: "rgba(239, 68, 68, 0.4)", border: "1px solid var(--line)", marginLeft: 4 }}></div>
          <span style={{ fontSize: 10 }}>中</span>
          <div style={{ width: 12, height: 12, background: "rgba(239, 68, 68, 0.8)", border: "1px solid var(--line)", marginLeft: 4 }}></div>
          <span style={{ fontSize: 10 }}>高</span>
        </div>
      </div>
    </div>
  );
}
