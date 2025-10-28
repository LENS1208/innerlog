import React, { useEffect, useMemo, useState } from "react";
import type { Trade } from "../lib/types";
import { parseCsvText } from "../lib/csv";
import { useDataset } from "../lib/dataset.context";
import { UI_TEXT } from "../lib/i18n";
import { supabase } from "../lib/supabase";

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
          const { data, error } = await supabase
            .from('trades')
            .select('*')
            .order('close_time', { ascending: true });

          if (error) {
            console.error('Error loading trades from database:', error);
            setTrades([]);
          } else {
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

    const remainingCells = 42 - days.length;
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
    for (let i = 1; i <= 6; i++) {
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

  return (
    <div className="monthly-calendar-container" style={{ padding: "var(--space-3)", maxWidth: 1600, margin: "0 auto" }}>
      <style>{`
        @media (max-width: 1023px) {
          .monthly-calendar-container .calendar-header h1 {
            font-size: 18px !important;
          }
        }

        @media (max-width: 640px) {
          .monthly-calendar-container .calendar-day {
            padding: 4px !important;
          }

          .monthly-calendar-container .calendar-day-number {
            font-size: 11px !important;
          }

          .monthly-calendar-container .calendar-day-profit {
            font-size: 12px !important;
          }

          .monthly-calendar-container .calendar-day-trades {
            font-size: 10px !important;
          }

          .monthly-calendar-container .day-header {
            font-size: 10px !important;
            padding: 4px !important;
          }
        }
      `}</style>

      <div className="calendar-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)", minHeight: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <button
            onClick={goToPrevMonth}
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
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-2)" }}>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>{UI_TEXT.monthlyTotal}</div>
            <div style={{
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

      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "var(--space-3)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 2, marginBottom: 2 }}>
          {["月", "火", "水", "木", "金", "土", "日", "週合計"].map((day) => (
            <div
              key={day}
              className="day-header"
              style={{
                textAlign: "center",
                fontWeight: 600,
                fontSize: 12,
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
          {Array.from({ length: 6 }).map((_, weekIndex) => {
            const weekDays = calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7);
            const hasAnyTradesInWeek = weekDays.some((day) => day.isCurrentMonth && day.tradeCount > 0);
            if (weekIndex === 5 && !hasAnyTradesInWeek) return null;
            const weekProfit = weekSummaries[weekIndex].profitYen;
            return (
              <div key={weekIndex} style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 2, minHeight: 110 }}>
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
                  style={{
                    background: "#f9fafb",
                    border: "1px solid var(--line)",
                    borderRadius: 8,
                    padding: 8,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  {weekProfit !== 0 ? (
                    <>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>{weekIndex + 1}週目</div>
                      <div
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
                      <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>{weekIndex + 1}週目</div>
                      <div style={{ fontSize: 16, color: "var(--muted)" }}>0円</div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
