import React, { useEffect, useMemo, useState } from "react";
import { getGridLineColor, getAccentColor, getLossColor, getWarningColor, getGreenColor } from "../../lib/chartColors";
import { Bar, Line, Scatter } from "react-chartjs-2";
import { useDataset } from "../../lib/dataset.context";
import { parseCsvText } from "../../lib/csv";
import type { Trade } from "../../lib/types";
import { filterTrades, getTradeProfit, getTradeTime } from "../../lib/filterTrades";
import { supabase } from "../../lib/supabase";
import { HelpIcon } from "../../components/common/HelpIcon";
import Card from "../../components/common/Card";

type DayOfWeek = "日" | "月" | "火" | "水" | "木" | "金" | "土";
type MetricType = "profit" | "winRate" | "pf" | "avgProfit";

const dayNames: DayOfWeek[] = ["日", "月", "火", "水", "木", "金", "土"];

type SegmentTab = "曜日" | "時間帯" | "週別" | "月別";

function SegmentDetailsTabs({
  dayOfWeekData,
  hourData,
  weeklyDataForTable,
  monthlyData
}: {
  dayOfWeekData: any[];
  hourData: any[];
  weeklyDataForTable: any[];
  monthlyData: any[];
}) {
  const [activeTab, setActiveTab] = React.useState<SegmentTab>("曜日");

  const tabs: SegmentTab[] = ["曜日", "時間帯", "週別", "月別"];

  const renderTable = () => {
    let data: any[] = [];
    let labelKey = "";
    let segmentLabel = "";

    switch (activeTab) {
      case "曜日":
        data = dayOfWeekData;
        labelKey = "day";
        segmentLabel = "曜日";
        break;
      case "時間帯":
        data = hourData;
        labelKey = "label";
        segmentLabel = "時間帯";
        break;
      case "週別":
        data = weeklyDataForTable;
        labelKey = "week";
        segmentLabel = "週";
        break;
      case "月別":
        data = monthlyData;
        labelKey = "month";
        segmentLabel = "月";
        break;
    }

    return (
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid var(--line)" }}>
            <th style={{ padding: 10, textAlign: "left", fontSize: 15, fontWeight: "bold", color: "var(--muted)" }}>
              {segmentLabel}
            </th>
            <th style={{ padding: 10, textAlign: "right", fontSize: 15, fontWeight: "bold", color: "var(--muted)" }}>取引</th>
            <th style={{ padding: 10, textAlign: "right", fontSize: 15, fontWeight: "bold", color: "var(--muted)" }}>Net損益</th>
            <th style={{ padding: 10, textAlign: "right", fontSize: 15, fontWeight: "bold", color: "var(--muted)" }}>勝率</th>
            <th style={{ padding: 10, textAlign: "right", fontSize: 15, fontWeight: "bold", color: "var(--muted)" }}>PF</th>
            <th style={{ padding: 10, textAlign: "right", fontSize: 15, fontWeight: "bold", color: "var(--muted)" }}>平均損益</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => {
            const label = activeTab === "曜日"
              ? `${item[labelKey]}曜日`
              : item[labelKey];

            return (
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
                <td style={{ padding: 10, fontSize: 13 }}>{label}</td>
                <td style={{ padding: 10, textAlign: "right", fontSize: 13 }}>{item.count}</td>
                <td
                  style={{
                    padding: 10,
                    textAlign: "right",
                    fontSize: 13,
                    color: item.profit >= 0 ? "var(--gain)" : "var(--loss)",
                  }}
                >
                  {Math.round(item.profit).toLocaleString("ja-JP")}円
                </td>
                <td style={{ padding: 10, textAlign: "right", fontSize: 13 }}>{item.winRate.toFixed(0)}%</td>
                <td style={{ padding: 10, textAlign: "right", fontSize: 13 }}>{item.pf.toFixed(2)}</td>
                <td style={{ padding: 10, textAlign: "right", fontSize: 13 }}>
                  {Math.round(item.avgProfit).toLocaleString("ja-JP")}円
                </td>
              </tr>
            );
          })}
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
      {renderTable()}
    </div>
  );
}

export default function ReportsTimeAxis() {
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
            holdTimeMin: calculateHoldTime(t.open_time, t.close_time),
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
    const map = new Map<string, { profit: number; count: number; wins: number }>();
    filteredTrades.forEach((t) => {
      const date = new Date(getTradeTime(t));
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split("T")[0];
      const profit = getTradeProfit(t);
      const current = map.get(weekKey) || { profit: 0, count: 0, wins: 0 };
      map.set(weekKey, {
        profit: current.profit + profit,
        count: current.count + 1,
        wins: current.wins + (profit > 0 ? 1 : 0)
      });
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12);
  }, [filteredTrades]);

  const weeklyDataForTable = useMemo(() => {
    const map = new Map<string, { profit: number; count: number; wins: number }>();
    filteredTrades.forEach((t) => {
      const date = new Date(getTradeTime(t));
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split("T")[0];
      const profit = getTradeProfit(t);
      const current = map.get(weekKey) || { profit: 0, count: 0, wins: 0 };
      map.set(weekKey, {
        profit: current.profit + profit,
        count: current.count + 1,
        wins: current.wins + (profit > 0 ? 1 : 0)
      });
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([week, data]) => {
        const winRate = data.count > 0 ? (data.wins / data.count) * 100 : 0;
        const weekTrades = filteredTrades.filter(t => {
          const date = new Date(getTradeTime(t));
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          return weekStart.toISOString().split("T")[0] === week;
        });
        const grossProfit = weekTrades.filter(t => getTradeProfit(t) > 0).reduce((sum, t) => sum + getTradeProfit(t), 0);
        const grossLoss = Math.abs(weekTrades.filter(t => getTradeProfit(t) < 0).reduce((sum, t) => sum + getTradeProfit(t), 0));
        const pf = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;
        const avgProfit = data.count > 0 ? data.profit / data.count : 0;
        return { week, ...data, winRate, pf, avgProfit };
      });
  }, [filteredTrades]);

  const monthlyData = useMemo(() => {
    const map = new Map<string, { profit: number; count: number; wins: number }>();
    filteredTrades.forEach((t) => {
      const date = new Date(getTradeTime(t));
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthKey = `${year}-${String(month).padStart(2, '0')}`;
      const profit = getTradeProfit(t);
      const current = map.get(monthKey) || { profit: 0, count: 0, wins: 0 };
      map.set(monthKey, {
        profit: current.profit + profit,
        count: current.count + 1,
        wins: current.wins + (profit > 0 ? 1 : 0)
      });
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, data]) => {
        const winRate = data.count > 0 ? (data.wins / data.count) * 100 : 0;
        const monthTrades = filteredTrades.filter(t => {
          const date = new Date(getTradeTime(t));
          const year = date.getFullYear();
          const m = date.getMonth() + 1;
          return `${year}-${String(m).padStart(2, '0')}` === month;
        });
        const grossProfit = monthTrades.filter(t => getTradeProfit(t) > 0).reduce((sum, t) => sum + getTradeProfit(t), 0);
        const grossLoss = Math.abs(monthTrades.filter(t => getTradeProfit(t) < 0).reduce((sum, t) => sum + getTradeProfit(t), 0));
        const pf = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;
        const avgProfit = data.count > 0 ? data.profit / data.count : 0;
        return { month, ...data, winRate, pf, avgProfit };
      });
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
      { label: "長期投資", min: 10080, max: Infinity },
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

      <Card
        title="保有時間別の統計"
        helpText="ポジション保有時間の長さで分類した統計です。スキャルピング・デイトレード・スイングなど、あなたのトレードスタイルを分析できます。"
        annotation="スキャルピング(0-30分) | デイトレード(30分-8時間) | スイング(8時間-7日) | 長期投資(7日以上)"
        style={{ marginBottom: 16 }}
      >

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
                    backgroundColor: getAccentColor(),
                    yAxisID: 'y',
                    stack: 'stack1',
                    order: 2,
                  },
                  {
                    type: 'bar' as const,
                    label: '負けトレード',
                    data: tradeStyleData.map((s) => s.losses),
                    backgroundColor: getLossColor(),
                    yAxisID: 'y',
                    stack: 'stack1',
                    order: 2,
                  },
                  {
                    type: 'line' as const,
                    label: '勝率(%)',
                    data: tradeStyleData.map((s) => s.winRate),
                    borderColor: getGreenColor(),
                    backgroundColor: getGreenColor(0.1),
                    yAxisID: 'y1',
                    tension: 0.3,
                    pointRadius: 5,
                    pointBackgroundColor: getGreenColor(),
                    order: 1,
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
            <h4 style={{ margin: "0 0 8px 0", fontSize: 13, fontWeight: "bold", color: "var(--muted)" }}>勝ちトレード平均保有時間</h4>
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
      </Card>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <Card title="曜日 ベスト" helpText="最も稼げている曜日です。この曜日に集中的に取引することで効率を上げられます。">
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
                      d.profit >= 0 ? getAccentColor() : getLossColor()
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
        </Card>
        <Card title="曜日 ワースト" helpText="最も損失が出ている曜日です。この曜日は取引を控える判断材料になります。">
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
                      d.profit >= 0 ? getAccentColor() : getLossColor()
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
        </Card>
        <Card title="時間帯 ベスト" helpText="最も稼げている時間帯です。この時間に取引することで勝率を上げられます。">
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
                    backgroundColor: hourData.map((h) => (h.profit >= 0 ? getAccentColor() : getLossColor())),
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
        </Card>
        <Card title="時間帯 ワースト" helpText="最も損失が出ている時間帯です。この時間は取引を避けるべきです。">
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
                    backgroundColor: hourData.map((h) => (h.profit >= 0 ? getAccentColor() : getLossColor())),
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
        </Card>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <Card title="曜日別" helpText="曜日ごとの損益を比較したグラフです。週間パターンを視覚的に把握できます。">
          <div style={{ height: 180 }}>
            <Bar
              data={{
                labels: dayOfWeekData.map((d) => d.day),
                datasets: [
                  {
                    data: dayOfWeekData.map(getMetricValue),
                    backgroundColor: dayOfWeekData.map((d) =>
                      d.profit >= 0 ? getAccentColor() : getLossColor()
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
        </Card>
        <Card title="時間帯別" helpText="時間帯ごとの損益を比較したグラフです1日の中で有利な時間が分かります。">
          <div style={{ height: 180 }}>
            <Bar
              data={{
                labels: hourData.map((h) => h.label),
                datasets: [
                  {
                    data: hourData.map(getMetricValue),
                    backgroundColor: hourData.map((h) => (h.profit >= 0 ? getAccentColor() : getLossColor())),
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
        </Card>
        <Card title="日別推移" helpText="日ごとの累積損益の推移グラフです。短期的な成績の変動を追跡できます。">
          <div style={{ height: 180 }}>
            <Bar
              data={{
                labels: dailyData.map(([date]) => date.substring(5)),
                datasets: [
                  {
                    data: dailyData.map(([_, d]) => d.profit),
                    backgroundColor: dailyData.map(([_, d]) =>
                      d.profit >= 0 ? getAccentColor() : getLossColor()
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
        </Card>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <Card title="週別推移" helpText="週ごとの累積損益の推移グラフです。中期的なパフォーマンストレンドを確認できます。">
          <div style={{ height: 180 }}>
            <Bar
              data={{
                labels: weeklyData.map(([date]) => date.substring(5)),
                datasets: [
                  {
                    data: weeklyData.map(([_, d]) => d.profit),
                    backgroundColor: weeklyData.map(([_, d]) =>
                      d.profit >= 0 ? getAccentColor() : getLossColor()
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
        </Card>
        <Card title="保有時間分布" helpText="勝ち負け別のポジション保有時間を比較します。損切りと利確のタイミングを分析できます。">
          <div style={{ height: 180 }}>
            <Bar
              data={{
                labels: holdTimeDistribution.map((h) => h.label),
                datasets: [
                  {
                    data: holdTimeDistribution.map((h) => h.count),
                    backgroundColor: getAccentColor(),
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
        </Card>
        <Card title="日別勝率" helpText="日ごとの勝率の推移グラフです。勝率の安定性を評価できます。">
          <div style={{ height: 180 }}>
            <Line
              data={{
                labels: dailyData.map(([date]) => date.substring(5)),
                datasets: [
                  {
                    data: dailyData.map(([_, d]) => (d.count > 0 ? (d.wins / d.count) * 100 : 0)),
                    borderColor: getAccentColor(1),
                    backgroundColor: getAccentColor(0.1),
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
        </Card>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <Card title="散布図：時刻×損益" helpText="エントリー時刻と損益の関係を点で表したグラフです。時間帯別の収益性が見えてきます。">
          <div style={{ height: 180 }}>
            <Scatter
              data={{
                datasets: [
                  {
                    data: scatterTimeProfit,
                    backgroundColor: scatterTimeProfit.map((p) =>
                      p.y >= 0 ? getAccentColor() : getLossColor()
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
        </Card>
        <Card title="散布図：保有時間×損益" helpText="保有期間と損益の関係を点で表したグラフです。最適な保有時間を特定できます。">
          <div style={{ height: 180 }}>
            <Scatter
              data={{
                datasets: [
                  {
                    data: scatterHoldTimeProfit,
                    backgroundColor: scatterHoldTimeProfit.map((p) =>
                      p.y >= 0 ? getAccentColor() : getLossColor()
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
        </Card>
        <Card title="連敗ヒート（時間帯）" helpText="曜日×時間帯ごとの連敗発生頻度をヒートマップで表示します。危険な時間枠が一目で分かります。">
          <LossStreakHeatmap trades={filteredTrades} />
          </Card>
        </div>

      <Card
        title="時間帯×銘柄 勝率分析"
        helpText="各時間帯における通貨ペアごとの勝率を分析します。特定の時間帯で有利な銘柄を見つけることができます。"
        style={{ marginBottom: 16 }}
      >
        <TimeSymbolAnalysis trades={filteredTrades} />
      </Card>

      <Card title="セグメント別明細" helpText="全曜日・時間帯の詳細データテーブルです。細かい数値を確認して取引時間を最適化できます。">
        <SegmentDetailsTabs
          dayOfWeekData={dayOfWeekData}
          hourData={hourData}
          weeklyDataForTable={weeklyDataForTable}
          monthlyData={monthlyData}
        />
      </Card>
    </div>
  );
}

function TimeSymbolAnalysis({ trades }: { trades: Trade[] }) {
  const timeRanges = [
    { label: "アジア朝(06-10)", start: 6, end: 10 },
    { label: "アジア昼(10-14)", start: 10, end: 14 },
    { label: "欧州前場(14-18)", start: 14, end: 18 },
    { label: "欧州後場(18-22)", start: 18, end: 22 },
    { label: "NY前場(22-02)", start: 22, end: 26 },
    { label: "NY後場(02-06)", start: 2, end: 6 },
  ];

  const analysisData = useMemo(() => {
    const symbolSet = new Set<string>();
    trades.forEach((t) => symbolSet.add(t.pair));
    const symbols = Array.from(symbolSet).sort();

    const data = timeRanges.map((range) => {
      const symbolData: Record<string, { wins: number; total: number; profit: number }> = {};

      symbols.forEach((symbol) => {
        symbolData[symbol] = { wins: 0, total: 0, profit: 0 };
      });

      trades.forEach((t) => {
        const date = new Date(getTradeTime(t));
        let hour = date.getHours();
        if (range.start === 22 && hour >= 0 && hour < 6) {
          hour += 24;
        }

        if (
          (range.start < range.end && hour >= range.start && hour < range.end) ||
          (range.start > range.end && (hour >= range.start || hour < range.end)) ||
          (range.start === 22 && hour >= 22 && hour < 26)
        ) {
          const profit = getTradeProfit(t);
          if (symbolData[t.pair]) {
            symbolData[t.pair].total++;
            symbolData[t.pair].profit += profit;
            if (profit > 0) symbolData[t.pair].wins++;
          }
        }
      });

      return { range: range.label, symbolData };
    });

    return { data, symbols };
  }, [trades]);

  const getCellBackgroundColor = (winRate: number) => {
    if (winRate >= 70) {
      const intensity = 0.25 + ((winRate - 70) / 30) * 0.35;
      return `rgba(34, 197, 94, ${intensity})`;
    }
    if (winRate >= 55) {
      const intensity = 0.2 + ((winRate - 55) / 15) * 0.25;
      return `rgba(59, 130, 246, ${intensity})`;
    }
    if (winRate >= 45) {
      const intensity = 0.2 + ((winRate - 45) / 10) * 0.2;
      return `rgba(251, 146, 60, ${intensity})`;
    }
    const intensity = 0.25 + ((45 - winRate) / 45) * 0.35;
    return `rgba(239, 68, 68, ${intensity})`;
  };

  const getTextColor = (winRate: number) => {
    if (winRate >= 65) return "#ffffff";
    if (winRate <= 35) return "#ffffff";
    return "var(--fg)";
  };

  if (trades.length === 0) {
    return (
      <div style={{ padding: 20, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
        データがありません
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "2px", minWidth: 600 }}>
        <thead>
          <tr>
            <th style={{ padding: 10, textAlign: "left", fontSize: 13, fontWeight: "bold", color: "var(--muted)", position: "sticky", left: 0, background: "var(--bg)", zIndex: 2 }}>
              時間帯
            </th>
            {analysisData.symbols.map((symbol) => (
              <th key={symbol} style={{ padding: 10, textAlign: "center", fontSize: 13, fontWeight: "bold", color: "var(--muted)", minWidth: 90 }}>
                {symbol}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {analysisData.data.map((item, index) => (
            <tr key={index}>
              <td style={{ padding: 10, fontSize: 13, fontWeight: 600, position: "sticky", left: 0, background: "var(--bg)", zIndex: 1, color: "var(--fg)" }}>
                {item.range}
              </td>
              {analysisData.symbols.map((symbol) => {
                const data = item.symbolData[symbol];
                const winRate = data.total > 0 ? (data.wins / data.total) * 100 : 0;
                const hasData = data.total > 0;

                const tooltipText = hasData
                  ? `${symbol} ${item.range}\n${data.wins}勝 ${data.total - data.wins}敗 (${data.total}戦)\n損益: ${Math.round(data.profit).toLocaleString()}円`
                  : "";

                return (
                  <td
                    key={symbol}
                    style={{
                      padding: 8,
                      textAlign: "center",
                      fontSize: 12,
                      background: hasData ? getCellBackgroundColor(winRate) : "var(--chip)",
                      border: "1px solid var(--line)",
                      cursor: hasData ? "help" : "default",
                      position: "relative",
                      height: 60,
                    }}
                    title={tooltipText}
                  >
                    {hasData ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 700,
                            color: getTextColor(winRate),
                          }}
                        >
                          {winRate.toFixed(0)}%
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: getTextColor(winRate),
                          }}
                        >
                          {Math.round(data.profit) >= 0 ? '+' : ''}{Math.round(data.profit).toLocaleString()}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: "var(--muted)", fontSize: 11 }}>-</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 16, display: "flex", gap: 16, flexWrap: "wrap", fontSize: 11, color: "var(--muted)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 16, height: 16, background: getGreenColor(), borderRadius: 2, border: "1px solid var(--line)" }}></div>
          <span>優秀 (70%+)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 16, height: 16, background: getAccentColor(), borderRadius: 2, border: "1px solid var(--line)" }}></div>
          <span>良好 (55-69%)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 16, height: 16, background: getWarningColor(), borderRadius: 2, border: "1px solid var(--line)" }}></div>
          <span>普通 (45-54%)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 16, height: 16, background: getLossColor(), borderRadius: 2, border: "1px solid var(--line)" }}></div>
          <span>要改善 (-44%)</span>
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
          <div style={{ width: 12, height: 12, background: getLossColor(), border: "1px solid var(--line)", marginLeft: 4 }}></div>
          <span style={{ fontSize: 10 }}>高</span>
        </div>
      </div>
    </div>
  );
}
