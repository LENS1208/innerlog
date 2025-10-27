import React, { useEffect, useMemo, useState } from "react";
import { Bar, Line, Scatter } from "react-chartjs-2";
import { useDataset } from "../../lib/dataset.context";
import { parseCsvText } from "../../lib/csv";
import type { Trade } from "../../lib/types";
import { filterTrades, getTradeProfit, getTradeTime } from "../../lib/filterTrades";

type DayOfWeek = "日" | "月" | "火" | "水" | "木" | "金" | "土";
type MetricType = "profit" | "winRate" | "pf" | "avgProfit";

const dayNames: DayOfWeek[] = ["日", "月", "火", "水", "木", "金", "土"];

export default function ReportsTimeAxis() {
  const { dataset, filters } = useDataset();
  const [trades, setTrades] = useState<Trade[]>([]);
  const metric: MetricType = "profit";

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
          <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "var(--muted)" }}>曜日 Top</h3>
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
          <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "var(--muted)" }}>曜日 Bottom</h3>
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
          <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "var(--muted)" }}>時間帯 Top</h3>
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
          <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "var(--muted)" }}>時間帯 Bottom</h3>
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
          <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "var(--muted)" }}>曜日別</h3>
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
          <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "var(--muted)" }}>時間帯別</h3>
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
          <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "var(--muted)" }}>日別推移</h3>
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
          <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "var(--muted)" }}>週別推移</h3>
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
          <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "var(--muted)" }}>保有時間分布</h3>
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
          <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "var(--muted)" }}>日別勝率</h3>
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
          <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "var(--muted)" }}>散布図：時刻×損益</h3>
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
          <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "var(--muted)" }}>散布図：保有時間×損益</h3>
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
          <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "var(--muted)" }}>連敗ヒート（時間帯）</h3>
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
        <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "var(--muted)" }}>セグメント別明細</h3>
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
