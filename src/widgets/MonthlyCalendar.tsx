import React, { useEffect, useMemo, useState } from "react";
import type { Trade } from "../lib/types";
import { parseCsvText } from "../lib/csv";
import { useDataset } from "../lib/dataset.context";
import { UI_TEXT } from "../lib/i18n";
import { supabase } from "../lib/supabase";
import InsightsSection from "../components/calendar/InsightsSection";

type DayData = {
  date: string;
  dayOfMonth: number;
  profitYen: number;
  tradeCount: number;
  isCurrentMonth: boolean;
};

type WeekSummary = {
  weekNum: number;
  profitYen: number;
};

function loadData(ds: "A" | "B" | "C"): Promise<Trade[]> {
  if (ds === "A" || ds === "B" || ds === "C") {
    const cacheBuster = `?t=${Date.now()}`;
    return fetch(`/demo/${ds}.csv${cacheBuster}`)
      .then((r) => r.text())
      .then((text) => parseCsvText(text));
  }
  return Promise.resolve([]);
}

function getWeekNumber(date: Date): number {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayOfWeek = firstDayOfMonth.getDay();
  const dayOfMonth = date.getDate();
  return Math.ceil((dayOfMonth + dayOfWeek) / 7);
}

function normalizeDate(dateStr: string): string {
  // "2025.09.18 08:06:00" or "2025-09-18" => "2025-09-18"
  const normalized = dateStr.replace(/\./g, "-").trim();
  const datePart = normalized.split(" ")[0]; // Remove time part if exists
  return datePart;
}

function formatDateLocal(year: number, month: number, day: number): string {
  // month is 0-based (0=January, 8=September)
  // Convert to 1-based for display: month=8 => "09"
  const y = String(year);
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDateSafe(dateStr: string): Date {
  // "2025.09.18 08:06:00" => Date(2025, 8, 18) [month is 0-based]
  const normalized = dateStr.replace(/\./g, "-").trim();
  const datePart = normalized.split(" ")[0];
  const [yearStr, monthStr, dayStr] = datePart.split("-");

  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1; // Convert to 0-based
  const day = parseInt(dayStr, 10);

  return new Date(year, month, day);
}

export default function MonthlyCalendar() {
  const { dataset, useDatabase } = useDataset();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadTrades = async () => {
      setLoading(true);
      try {
        if (useDatabase) {
          const { getAllTrades } = await import('../lib/db.service');
          const data = await getAllTrades();

          const mappedTrades: Trade[] = (data || []).map((t: any) => ({
              datetime: new Date(t.close_time).toISOString().replace('T', ' ').substring(0, 19),
              ticket: t.ticket,
              item: t.item,
              side: t.side,
              size: t.size,
              openTime: new Date(t.open_time).toISOString().replace('T', ' ').substring(0, 19),
              openPrice: t.open_price,
              closeTime: new Date(t.close_time).toISOString().replace('T', ' ').substring(0, 19),
              closePrice: t.close_price,
              commission: t.commission,
              swap: t.swap,
              profitYen: t.profit,
              sl: t.sl,
              tp: t.tp,
              pips: t.pips,
            }));
            setTrades(mappedTrades);

            if (mappedTrades.length > 0) {
              const latestTrade = mappedTrades.reduce((latest, trade) => {
                const tradeDate = parseDateSafe(trade.datetime);
                const latestDate = parseDateSafe(latest.datetime);
                return tradeDate > latestDate ? trade : latest;
              });
              const latestDate = parseDateSafe(latestTrade.datetime);
              setCurrentDate(new Date(latestDate.getFullYear(), latestDate.getMonth(), 1));
            }
        } else {
          const data = await loadData(dataset);
          setTrades(data);

          if (data.length > 0) {
            const latestTrade = data.reduce((latest, trade) => {
              const tradeDate = parseDateSafe(trade.datetime);
              const latestDate = parseDateSafe(latest.datetime);
              return tradeDate > latestDate ? trade : latest;
            });
            const latestDate = parseDateSafe(latestTrade.datetime);
            setCurrentDate(new Date(latestDate.getFullYear(), latestDate.getMonth(), 1));
          }
        }
      } catch (e) {
        console.error('Exception loading trades:', e);
        setTrades([]);
      } finally {
        setLoading(false);
      }
    };
    loadTrades();
  }, [dataset, useDatabase]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const totalTradesInMonth = useMemo(() => {
    return trades.filter((t) => {
      const tradeDate = parseDateSafe(t.datetime);
      return !isNaN(tradeDate.getTime()) && tradeDate.getFullYear() === year && tradeDate.getMonth() === month;
    }).length;
  }, [trades, year, month]);

  const { calendarDays, weekSummaries, monthTotal } = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const prevMonthLastDay = new Date(year, month, 0);
    const daysInPrevMonth = prevMonthLastDay.getDate();

    const days: DayData[] = [];

    // Adjust for Monday start (0=Sun, 1=Mon, ..., 6=Sat)
    const adjustedStartDay = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    for (let i = adjustedStartDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      days.push({
        date: formatDateLocal(year, month - 1, day),
        dayOfMonth: day,
        profitYen: 0,
        tradeCount: 0,
        isCurrentMonth: false,
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDateLocal(year, month, day);

      const dayTrades = trades.filter((t) => {
        const tradeDateStr = normalizeDate(t.datetime);
        return tradeDateStr === dateStr;
      });
      const profitYen = dayTrades.reduce((sum, t) => sum + t.profitYen, 0);

      days.push({
        date: dateStr,
        dayOfMonth: day,
        profitYen,
        tradeCount: dayTrades.length,
        isCurrentMonth: true,
      });
    }

    const remainingCells = 35 - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        date: formatDateLocal(year, month + 1, day),
        dayOfMonth: day,
        profitYen: 0,
        tradeCount: 0,
        isCurrentMonth: false,
      });
    }

    const weeks = new Map<number, number>();
    trades.forEach((t) => {
      const tradeDate = parseDateSafe(t.datetime);
      if (!isNaN(tradeDate.getTime()) && tradeDate.getFullYear() === year && tradeDate.getMonth() === month) {
        const weekNum = getWeekNumber(tradeDate);
        weeks.set(weekNum, (weeks.get(weekNum) || 0) + t.profitYen);
      }
    });

    const weekSummaries: WeekSummary[] = [];
    let monthTotal = 0;
    for (let i = 1; i <= 5; i++) {
      const profit = weeks.get(i) || 0;
      monthTotal += profit;
      weekSummaries.push({
        weekNum: i,
        profitYen: profit,
      });
    }

    return { calendarDays: days, weekSummaries, monthTotal };
  }, [trades, year, month]);

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToThisMonth = () => {
    setCurrentDate(new Date());
  };

  const monthName = currentDate.toLocaleDateString("ja-JP", { year: "numeric", month: "long" });

  const insightsData = useMemo(() => {
    const filteredTrades = trades.filter((t) => {
      const tradeDate = parseDateSafe(t.datetime);
      return !isNaN(tradeDate.getTime()) && tradeDate.getFullYear() === year && tradeDate.getMonth() === month;
    });

    const weeklySummary = weekSummaries.map((ws) => ({
      name: `${ws.weekNum}週目`,
      pnl: ws.profitYen,
    }));

    const weekdayNames = ["月", "火", "水", "木", "金", "土", "日"];
    const weekdayMap = new Map<number, number>();
    filteredTrades.forEach((t) => {
      const tradeDate = parseDateSafe(t.datetime);
      const dow = tradeDate.getDay();
      const adjustedDow = dow === 0 ? 6 : dow - 1;
      weekdayMap.set(adjustedDow, (weekdayMap.get(adjustedDow) || 0) + t.profitYen);
    });
    const weekdayPerformance = weekdayNames.map((name, i) => ({
      name,
      pnl: weekdayMap.get(i) || 0,
    }));

    const hourlyMap = new Map<number, number>();
    filteredTrades.forEach((t) => {
      const tradeDate = parseDateSafe(t.datetime);
      const hour = tradeDate.getHours();
      hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + t.profitYen);
    });
    const hourlyPerformance = Array.from({ length: 24 }, (_, i) => ({
      name: `${i}:00`,
      pnl: hourlyMap.get(i) || 0,
    }));

    const durationRanges = [
      { name: "0-15m", min: 0, max: 15 },
      { name: "15-30m", min: 15, max: 30 },
      { name: "30-60m", min: 30, max: 60 },
      { name: "60-120m", min: 60, max: 120 },
      { name: ">120m", min: 120, max: Infinity },
    ];
    const durationPerformance = durationRanges.map((range) => {
      const rangeSum = filteredTrades
        .filter((t) => {
          const openTime = parseDateSafe(t.openTime || t.datetime);
          const closeTime = parseDateSafe(t.datetime);
          const mins = (closeTime.getTime() - openTime.getTime()) / (1000 * 60);
          return mins >= range.min && mins < range.max;
        })
        .reduce((sum, t) => sum + t.profitYen, 0);
      return { name: range.name, pnl: rangeSum };
    });

    const weekendTrades = filteredTrades
      .filter((t) => {
        const openTime = parseDateSafe(t.openTime || t.datetime);
        const closeTime = parseDateSafe(t.datetime);
        const openDow = openTime.getDay();
        const closeDow = closeTime.getDay();
        return openDow !== closeDow && (openDow === 6 || openDow === 0 || closeDow === 6 || closeDow === 0);
      })
      .slice(0, 50)
      .map((t) => ({
        id: t.ticket,
        symbol: t.item,
        side: (t.side?.toLowerCase() === "buy" || t.side?.toLowerCase() === "long" ? "long" : "short") as "long" | "short",
        entry: t.openTime || t.datetime,
        exit: t.datetime,
        pnl: t.profitYen,
      }));

    const overnightTrades = filteredTrades
      .filter((t) => {
        const openTime = parseDateSafe(t.openTime || t.datetime);
        const closeTime = parseDateSafe(t.datetime);
        return openTime.toDateString() !== closeTime.toDateString();
      })
      .slice(0, 50)
      .map((t) => ({
        id: t.ticket,
        symbol: t.item,
        side: (t.side?.toLowerCase() === "buy" || t.side?.toLowerCase() === "long" ? "long" : "short") as "long" | "short",
        entry: t.openTime || t.datetime,
        exit: t.datetime,
        pnl: t.profitYen,
      }));

    const dayProfits = new Map<string, number>();
    filteredTrades.forEach((t) => {
      const dateStr = normalizeDate(t.datetime);
      dayProfits.set(dateStr, (dayProfits.get(dateStr) || 0) + t.profitYen);
    });
    const sortedDays = Array.from(dayProfits.entries()).sort((a, b) => b[1] - a[1]);
    const bestDay = sortedDays.length > 0 ? { date: sortedDays[0][0], pnl: sortedDays[0][1] } : null;
    const worstDay = sortedDays.length > 0 ? { date: sortedDays[sortedDays.length - 1][0], pnl: sortedDays[sortedDays.length - 1][1] } : null;
    const maxDailyDD = worstDay ? worstDay.pnl : null;

    const symbolMap = new Map<string, number>();
    filteredTrades.forEach((t) => {
      symbolMap.set(t.item, (symbolMap.get(t.item) || 0) + t.profitYen);
    });
    const sortedSymbols = Array.from(symbolMap.entries()).sort((a, b) => b[1] - a[1]);
    const topSymbols = sortedSymbols.slice(0, 3).map(([symbol, pnl]) => ({ symbol, pnl }));
    const bottomSymbols = sortedSymbols.slice(-3).reverse().map(([symbol, pnl]) => ({ symbol, pnl }));

    const topTags = [
      { tag: "breakout", pnl: 12432, winrate: 0.56 },
      { tag: "news", pnl: 1832, winrate: 0.52 },
      { tag: "meanrev", pnl: -4321, winrate: 0.41 },
    ];

    const expectationRows = [
      { label: "曜日: Thu", count: 2, avgPnl: 8190, winrate: 0.6, pf: 1.8 },
      { label: "時間: 11:00", count: 1, avgPnl: 3200, winrate: 1.0, pf: null },
      { label: "保有: 60-120m", count: 2, avgPnl: 3100, winrate: 0.55, pf: 1.5 },
    ];

    return {
      weeklySummary,
      weekdayPerformance,
      hourlyPerformance,
      durationPerformance,
      weekendTrades,
      overnightTrades,
      bestDay,
      worstDay,
      maxDailyDD,
      topSymbols,
      bottomSymbols,
      topTags,
      expectationRows,
    };
  }, [trades, year, month, weekSummaries]);

  return (
    <div style={{ width: "100%" }}>
      <style>{`
        .calendar-header-grid {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 2px;
          margin-bottom: 2px;
        }

        .calendar-week-row {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 2px;
          min-height: 110px;
        }

        .week-summary-cell {
          display: flex;
        }

        @media (max-width: 1023px) {
          .calendar-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
            min-height: auto !important;
          }

          .calendar-header h1 {
            font-size: 18px !important;
          }

          .calendar-header-right {
            width: 100% !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 8px !important;
          }

          .month-total-display {
            width: 100% !important;
            justify-content: space-between !important;
          }

          .week-summary-cell {
            display: none !important;
          }

          .calendar-header-grid {
            grid-template-columns: repeat(7, 1fr) !important;
          }

          .calendar-week-row {
            grid-template-columns: repeat(7, 1fr) !important;
          }
        }

        @media (max-width: 640px) {
          .calendar-day {
            padding: 2px !important;
            min-height: 60px !important;
          }

          .calendar-day-number {
            font-size: 10px !important;
            margin-bottom: 2px !important;
          }

          .calendar-day-profit {
            font-size: 10px !important;
            margin-bottom: 1px !important;
          }

          .calendar-day-trades {
            font-size: 8px !important;
          }

          .day-header {
            font-size: 10px !important;
            padding: 2px !important;
            height: 24px !important;
          }

          .week-summary {
            padding: 4px !important;
            min-height: 60px !important;
          }

          .week-summary-label {
            font-size: 9px !important;
          }

          .week-summary-value {
            font-size: 11px !important;
          }

          .calendar-grid {
            gap: 1px !important;
          }

          .calendar-wrapper {
            padding: 8px !important;
          }

          .nav-button {
            padding: 6px 10px !important;
            font-size: 16px !important;
          }

          .month-total-label {
            font-size: 11px !important;
          }

          .month-total-value {
            font-size: 18px !important;
          }
        }

        @media (min-width: 1024px) {
          .calendar-header-grid {
            grid-template-columns: repeat(8, 1fr) !important;
          }

          .calendar-week-row {
            grid-template-columns: repeat(8, 1fr) !important;
          }

          .week-summary-cell {
            display: flex !important;
          }
        }
      `}</style>

      <div className="calendar-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)", minHeight: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <button
            onClick={goToPrevMonth}
            className="nav-button"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: 8,
              padding: "8px 12px",
              cursor: "pointer",
              fontSize: 18,
            }}
          >
            ‹
          </button>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>{monthName}</h1>
          <button
            onClick={goToNextMonth}
            className="nav-button"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: 8,
              padding: "8px 12px",
              cursor: "pointer",
              fontSize: 18,
            }}
          >
            ›
          </button>
        </div>
        <div className="calendar-header-right" style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <div className="month-total-display" style={{ display: "flex", alignItems: "baseline", gap: "var(--space-2)" }}>
            <div className="month-total-label" style={{ fontSize: 13, color: "var(--muted)" }}>{UI_TEXT.monthlyTotal}</div>
            <div className="month-total-value" style={{
              fontSize: 24,
              fontWeight: 700,
              color: monthTotal >= 0 ? "var(--gain)" : "var(--loss)"
            }}>
              {monthTotal >= 0 ? "+" : ""}{Math.round(monthTotal).toLocaleString('ja-JP')}円
            </div>
          </div>
          <button
            onClick={goToThisMonth}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: 8,
              padding: "8px 14px",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            今月
          </button>
        </div>
      </div>

      <div className="calendar-wrapper" style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "var(--space-3)" }}>
        <div className="calendar-header-grid">
          {["月", "火", "水", "木", "金", "土", "日", "週合計"].map((day, idx) => (
            <div
              key={day}
              className={`day-header ${idx === 7 ? 'week-summary-cell' : ''}`}
              style={{
                textAlign: "center",
                fontWeight: "bold",
                fontSize: 15,
                color: "var(--muted)",
                padding: "var(--space-1)",
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {day}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {Array.from({ length: 5 }).map((_, weekIndex) => {
            const weekDays = calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7);
            const weekProfit = weekSummaries[weekIndex].profitYen;
            return (
              <div key={weekIndex} className="calendar-week-row">
                {weekDays.map((day, idx) => {
                  const hasTradesValue = day.isCurrentMonth && day.tradeCount > 0;
                  const bgColor = hasTradesValue
                    ? day.profitYen >= 0
                      ? "rgba(22, 163, 74, 0.1)"
                      : "rgba(239, 68, 68, 0.1)"
                    : day.isCurrentMonth
                    ? "var(--surface)"
                    : "#f9fafb";

                  const borderColor = hasTradesValue
                    ? day.profitYen >= 0
                      ? "rgba(22, 163, 74, 0.3)"
                      : "rgba(239, 68, 68, 0.3)"
                    : "var(--line)";

                  return (
                    <div
                      key={idx}
                      className="calendar-day"
                      onClick={() => {
                        if (hasTradesValue) {
                          location.hash = `/calendar/day/${day.date}`;
                        }
                      }}
                      style={{
                        background: bgColor,
                        border: `1px solid ${borderColor}`,
                        borderRadius: 8,
                        padding: 8,
                        cursor: hasTradesValue ? "pointer" : "default",
                        opacity: day.isCurrentMonth ? 1 : 0.4,
                        transition: "all 0.15s ease",
                        display: "flex",
                        flexDirection: "column",
                        minHeight: 0,
                      }}
                      onMouseEnter={(e) => {
                        if (hasTradesValue) {
                          e.currentTarget.style.transform = "scale(1.02)";
                          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (hasTradesValue) {
                          e.currentTarget.style.transform = "scale(1)";
                          e.currentTarget.style.boxShadow = "none";
                        }
                      }}
                    >
                      <div className="calendar-day-number" style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, color: day.isCurrentMonth ? "var(--ink)" : "var(--muted)", textAlign: "center" }}>
                        {day.dayOfMonth}
                      </div>
                      {hasTradesValue ? (
                        <>
                          <div
                            className="calendar-day-profit"
                            style={{
                              fontSize: 16,
                              fontWeight: 700,
                              color: day.profitYen >= 0 ? "var(--gain)" : "var(--loss)",
                              marginBottom: 2,
                              textAlign: "center",
                            }}
                          >
                            {day.profitYen >= 0 ? "+" : ""}{Math.round(day.profitYen).toLocaleString('ja-JP')}円
                          </div>
                          <div className="calendar-day-trades" style={{ fontSize: 11, color: "var(--muted)", textAlign: "center" }}>取引：{day.tradeCount}</div>
                        </>
                      ) : day.isCurrentMonth ? (
                        <div style={{ fontSize: 11, color: "#d1d5db", textAlign: "center", marginTop: "auto", marginBottom: "auto" }}>取引なし</div>
                      ) : null}
                    </div>
                  );
                })}
                <div
                  className="week-summary week-summary-cell"
                  style={{
                    background: "#f9fafb",
                    border: "1px solid var(--line)",
                    borderRadius: 8,
                    padding: 8,
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  {weekProfit !== 0 ? (
                    <>
                      <div className="week-summary-label" style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>{weekIndex + 1}週目</div>
                      <div
                        className="week-summary-value"
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          color: weekProfit >= 0 ? "var(--gain)" : "var(--loss)",
                        }}
                      >
                        {weekProfit >= 0 ? "+" : ""}{Math.round(weekProfit).toLocaleString('ja-JP')}円
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="week-summary-label" style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>{weekIndex + 1}週目</div>
                      <div className="week-summary-value" style={{ fontSize: 16, color: "var(--muted)" }}>0円</div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <InsightsSection
        weeklySummary={insightsData.weeklySummary}
        weekdayPerformance={insightsData.weekdayPerformance}
        hourlyPerformance={insightsData.hourlyPerformance}
        durationPerformance={insightsData.durationPerformance}
        weekendTrades={insightsData.weekendTrades}
        overnightTrades={insightsData.overnightTrades}
        bestDay={insightsData.bestDay}
        worstDay={insightsData.worstDay}
        maxDailyDD={insightsData.maxDailyDD}
        topSymbols={insightsData.topSymbols}
        bottomSymbols={insightsData.bottomSymbols}
        topTags={insightsData.topTags}
        expectationRows={insightsData.expectationRows}
      />
    </div>
  );
}
