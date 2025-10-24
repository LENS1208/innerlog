import React, { useEffect, useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

type Trade = {
  ticket: string;
  symbol: string;
  type: "Buy" | "Sell" | string;
  time: number;
  profitJPY: number;
  entryPrice?: number;
  exitPrice?: number;
  size?: number;
  openTimeMs?: number;
};

type DailyKPI = {
  winRate: number;
  tradeCount: number;
  winCount: number;
  lossCount: number;
  avgProfit: number;
  profitFactor: number;
  totalPips: number;
  totalProfit: number;
};

function simpleHash(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return ("h" + (h >>> 0).toString(16)).padStart(9, "0");
}

function parseCSV(text: string): string[][] {
  const firstNL = text.indexOf("\n");
  const head = (firstNL >= 0 ? text.slice(0, firstNL) : text).replace(/^\uFEFF/, "");
  const tabCount = (head.match(/\t/g) || []).length;
  const commaCount = (head.match(/,/g) || []).length;
  const delim = tabCount > commaCount ? "\t" : ",";

  const rows: string[][] = [];
  let i = 0, f = "", row: string[] = [], q = false;
  while (i < text.length) {
    const c = text[i];
    if (q) {
      if (c === '"') {
        if (text[i + 1] === '"') { f += '"'; i += 2; continue; }
        q = false; i++; continue;
      }
      f += c; i++; continue;
    } else {
      if (c === '"') { q = true; i++; continue; }
      if (c === delim) { row.push(f); f = ""; i++; continue; }
      if (c === "\n") { row.push(f); rows.push(row); row = []; f = ""; i++; continue; }
      if (c === "\r") { i++; continue; }
      f += c; i++; continue;
    }
  }
  row.push(f); rows.push(row);
  return rows.filter(r => !(r.length === 1 && r[0].trim() === ""));
}

function toUTCms(s: string): number {
  const t = Date.parse(s.replace(/\./g, "-").replace(/\//g, "-"));
  return Number.isNaN(t) ? NaN : new Date(t).getTime();
}

function loadData(ds: "A" | "B" | "C"): Promise<Trade[]> {
  if (ds === "A" || ds === "B" || ds === "C") {
    const cacheBuster = `?t=${Date.now()}`;
    return fetch(`/demo/${ds}.csv${cacheBuster}`, { cache: "no-store" })
      .then((r) => r.text())
      .then((text) => {
        const rows = parseCSV(text);
        const header = rows[0].map((h) => h.trim());
        const lower = header.map((h) => h.toLowerCase());
        const i = {
          ticket: lower.indexOf("ticket"),
          symbol: lower.indexOf("symbol") >= 0 ? lower.indexOf("symbol") : lower.indexOf("item"),
          type: lower.indexOf("type"),
          profit: lower.indexOf("profit"),
          openTime: lower.indexOf("open time"),
          time: lower.indexOf("time"),
          closeTime: lower.indexOf("close time"),
        };
        const trades: Trade[] = [];
        for (let r = 1; r < rows.length; r++) {
          const row = rows[r];
          if (!row || row.length < header.length) continue;
          const ticket = row[i.ticket]?.trim();
          const symbol = row[i.symbol]?.trim();
          const type = row[i.type]?.trim();
          const profit = Number(row[i.profit]?.replace(/[, ]/g, ""));
          const tsRaw = row[i.closeTime ?? -1] ?? row[i.time ?? -1] ?? row[i.openTime ?? -1] ?? "";
          const t = toUTCms(tsRaw);
          if (!ticket || !symbol || !type || Number.isNaN(profit) || Number.isNaN(t)) continue;
          trades.push({ ticket, symbol, type: type as any, time: t, profitJPY: profit });
        }
        trades.sort((a, b) => a.time - b.time);
        return trades;
      });
  }
  return Promise.resolve([]);
}

export default function CalendarDayPage() {
  const [dataset, setDataset] = useState<"A" | "B" | "C">("A");
  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [dailyMemo, setDailyMemo] = useState<string>("");

  useEffect(() => {
    const hash = location.hash;
    const match = hash.match(/\/calendar\/day\/(.+)/);
    if (match) {
      setSelectedDate(match[1]);
    }
  }, []);

  useEffect(() => {
    loadData(dataset).then((data) => {
      setTrades(data);
    });
  }, [dataset]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("fxtool:v1:currentId");
      if (stored === "A" || stored === "B" || stored === "C") {
        setDataset(stored);
      }
    } catch {}
  }, []);

  const dayTrades = useMemo(() => {
    return trades.filter((t) => {
      const tradeDate = new Date(t.time);
      const tradeDateStr = tradeDate.toISOString().split('T')[0];
      return tradeDateStr === selectedDate;
    });
  }, [trades, selectedDate]);

  const kpi: DailyKPI = useMemo(() => {
    const tradeCount = dayTrades.length;
    const winTrades = dayTrades.filter((t) => t.profitJPY > 0);
    const lossTrades = dayTrades.filter((t) => t.profitJPY < 0);
    const winCount = winTrades.length;
    const lossCount = lossTrades.length;
    const winRate = tradeCount > 0 ? winCount / tradeCount : 0;

    const totalProfit = dayTrades.reduce((sum, t) => sum + t.profitJPY, 0);
    const avgProfit = tradeCount > 0 ? totalProfit / tradeCount : 0;

    const grossProfit = winTrades.reduce((sum, t) => sum + t.profitJPY, 0);
    const grossLoss = Math.abs(lossTrades.reduce((sum, t) => sum + t.profitJPY, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;

    const totalPips = 0;

    return {
      winRate,
      tradeCount,
      winCount,
      lossCount,
      avgProfit,
      profitFactor,
      totalPips,
      totalProfit,
    };
  }, [dayTrades]);

  const equityCurve = useMemo(() => {
    let cumulative = 0;
    return dayTrades.map((t, idx) => {
      cumulative += t.profitJPY;
      return {
        x: idx + 1,
        y: cumulative,
      };
    });
  }, [dayTrades]);

  const goToPrevDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() - 1);
    const newDate = currentDate.toISOString().slice(0, 10);
    location.hash = `/calendar/day/${newDate}`;
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + 1);
    const newDate = currentDate.toISOString().slice(0, 10);
    location.hash = `/calendar/day/${newDate}`;
    setSelectedDate(newDate);
  };

  const dateObj = selectedDate ? new Date(selectedDate + "T00:00:00") : new Date();
  const formattedDate = dateObj.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short"
  });

  return (
    <div style={{ padding: "var(--space-3)", maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{formattedDate}</h1>
        <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-2)" }}>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>日合計</div>
          <div style={{
            fontSize: 24,
            fontWeight: 700,
            color: kpi.totalProfit >= 0 ? "var(--gain)" : "var(--loss)"
          }}>
            {kpi.totalProfit >= 0 ? "+" : ""}{Math.round(kpi.totalProfit).toLocaleString('ja-JP')}円
          </div>
        </div>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <button
            onClick={goToPrevDay}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: 8,
              padding: "8px 14px",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            ← 前日
          </button>
          <button
            onClick={goToNextDay}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: 8,
              padding: "8px 14px",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            翌日 →
          </button>
        </div>
      </div>

      <div className="kpi-grid" style={{ marginBottom: "var(--space-4)" }}>
        <div className="kpi-card">
          <div className="kpi-title">勝率</div>
          <div className="kpi-value">{(kpi.winRate * 100).toFixed(0)} <span className="kpi-unit">%</span></div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">取引件数</div>
          <div className="kpi-value">
            {kpi.tradeCount} <span className="kpi-unit">件</span>
          </div>
          <div className="kpi-desc">(勝ち: {kpi.winCount} / 負け: {kpi.lossCount})</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">平均損益 (1取引あたり)</div>
          <div className="kpi-value" style={{ color: kpi.avgProfit >= 0 ? "var(--gain)" : "var(--loss)" }}>
            {kpi.avgProfit >= 0 ? "+" : ""}{Math.round(kpi.avgProfit).toLocaleString('ja-JP')} <span className="kpi-unit">円/件</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">プロフィットファクター</div>
          <div className="kpi-value">{kpi.profitFactor.toFixed(2)}</div>
          <div className="kpi-desc">総利益 / 総損失</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">総pips数</div>
          <div className="kpi-value" style={{ color: kpi.totalPips >= 0 ? "var(--gain)" : "var(--loss)" }}>
            {kpi.totalPips >= 0 ? "+" : ""}{kpi.totalPips.toFixed(1)} <span className="kpi-unit">pips</span>
          </div>
        </div>
      </div>

      {dayTrades.length > 0 && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "var(--space-3)", marginBottom: "var(--space-3)" }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: "var(--space-2)" }}>当日の推移</h2>
          <div style={{ height: 220 }}>
            <Line
              data={{
                labels: equityCurve.map((d) => d.x),
                datasets: [
                  {
                    label: "累積損益",
                    data: equityCurve.map((d) => d.y),
                    borderColor: kpi.totalProfit >= 0 ? "#16a34a" : "#ef4444",
                    backgroundColor: kpi.totalProfit >= 0 ? "rgba(22, 163, 74, 0.1)" : "rgba(239, 68, 68, 0.1)",
                    tension: 0.1,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: false,
                    grid: {
                      color: "rgba(0,0,0,0.05)",
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      )}

      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "var(--space-3)", marginBottom: "var(--space-3)" }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: "var(--space-2)" }}>今日のメモ</h2>
        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: "var(--space-2)" }}>
          例）指標前は見送り。午前は慎重に。午後は目標到達で機械的に利確。
        </div>
        <textarea
          value={dailyMemo}
          onChange={(e) => setDailyMemo(e.target.value)}
          placeholder="その日の市況や戦略メモを記録..."
          style={{
            width: "100%",
            minHeight: 100,
            padding: 10,
            border: "1px solid var(--line)",
            borderRadius: 8,
            fontSize: 13,
            fontFamily: "inherit",
            resize: "vertical",
          }}
        />
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "var(--space-3)", marginBottom: "var(--space-3)" }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: "var(--space-2)" }}>AI相談</h2>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, lineHeight: 1.7, color: "var(--ink)" }}>
          <li>ルール遵守。損切りは迷わずにした。</li>
          <li>利確が早い傾向があります。</li>
          <li>午後の約定成績が相対的に良好です。</li>
        </ul>
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "var(--space-3)" }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: "var(--space-2)" }}>この日の取引一覧</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--line)" }}>
                <th style={{ textAlign: "left", padding: "12px 8px", fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>決済日時</th>
                <th style={{ textAlign: "left", padding: "12px 8px", fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>銘柄</th>
                <th style={{ textAlign: "left", padding: "12px 8px", fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>方向</th>
                <th style={{ textAlign: "right", padding: "12px 8px", fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>損益 (円)</th>
                <th style={{ textAlign: "right", padding: "12px 8px", fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>pips</th>
                <th style={{ textAlign: "right", padding: "12px 8px", fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>ロット数</th>
                <th style={{ textAlign: "right", padding: "12px 8px", fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>建値</th>
                <th style={{ textAlign: "right", padding: "12px 8px", fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>決済</th>
                <th style={{ textAlign: "center", padding: "12px 8px", fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>ノート</th>
              </tr>
            </thead>
            <tbody>
              {dayTrades.map((t, idx) => {
                const dtString = new Date(t.time).toISOString().slice(0, 16).replace("T", " ");
                return (
                  <tr
                    key={idx}
                    className="trade-row"
                    style={{ borderBottom: "1px solid #f3f4f6" }}
                    onClick={() => {
                      location.hash = `/notebook/${t.ticket}`;
                    }}
                  >
                    <td style={{ padding: "12px 8px", fontSize: 13 }}>{dtString}</td>
                    <td style={{ padding: "12px 8px", fontSize: 13 }}>{t.symbol}</td>
                    <td style={{ padding: "12px 8px", fontSize: 13 }}>{t.type}</td>
                    <td style={{
                      padding: "12px 8px",
                      fontSize: 14,
                      fontWeight: 600,
                      textAlign: "right",
                      color: t.profitJPY >= 0 ? "var(--gain)" : "var(--loss)"
                    }}>
                      {t.profitJPY >= 0 ? "+" : ""}¥{Math.abs(t.profitJPY).toLocaleString("ja-JP")}
                    </td>
                    <td style={{
                      padding: "12px 8px",
                      fontSize: 13,
                      textAlign: "right"
                    }}>
                      —
                    </td>
                    <td style={{ padding: "12px 8px", fontSize: 13, textAlign: "right" }}>{t.size?.toFixed(2) ?? "—"}</td>
                    <td style={{ padding: "12px 8px", fontSize: 13, textAlign: "right" }}>{t.entryPrice ?? "—"}</td>
                    <td style={{ padding: "12px 8px", fontSize: 13, textAlign: "right" }}>{t.exitPrice ?? "—"}</td>
                    <td style={{ padding: "12px 8px", fontSize: 16, textAlign: "center" }}>
                      —
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
