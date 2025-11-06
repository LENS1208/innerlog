import React, { useState, useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type Trade = {
  id: string;
  symbol: string;
  side: "long" | "short";
  entry: string;
  exit: string;
  pnl: number;
};

type ChartPoint = { name: string; pnl: number };

export type InsightsSectionProps = {
  weeklySummary: ChartPoint[];
  weekdayPerformance: ChartPoint[];
  hourlyPerformance: ChartPoint[];
  durationPerformance: ChartPoint[];
  weekendTrades: Trade[];
  overnightTrades: Trade[];
  initialTab?: "weekend" | "overnight";
  pageSize?: number;
  bestDay?: { date: string; pnl: number } | null;
  worstDay?: { date: string; pnl: number } | null;
  maxDailyDD?: number | null;
  topSymbols: { symbol: string; pnl: number }[];
  bottomSymbols: { symbol: string; pnl: number }[];
  topTags: { tag: string; pnl: number; winrate: number }[];
  expectationRows: {
    label: string;
    count: number;
    avgPnl: number;
    winrate?: number | null;
    pf?: number | null;
  }[];
};

const currencyJPY = (n: number) => {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${Math.round(n).toLocaleString("ja-JP")}円`;
};

export default function InsightsSection(props: InsightsSectionProps) {
  const {
    weeklySummary,
    weekdayPerformance,
    hourlyPerformance,
    durationPerformance,
    weekendTrades,
    overnightTrades,
    initialTab = "weekend",
    pageSize = 10,
    bestDay,
    worstDay,
    maxDailyDD,
    topSymbols,
    bottomSymbols,
    topTags,
    expectationRows,
  } = props;

  const [activeTab, setActiveTab] = useState<"weekend" | "overnight">(initialTab);
  const [currentPage, setCurrentPage] = useState(0);

  const currentTrades = activeTab === "weekend" ? weekendTrades : overnightTrades;
  const totalPages = Math.ceil(currentTrades.length / pageSize);
  const paginatedTrades = useMemo(() => {
    const start = currentPage * pageSize;
    return currentTrades.slice(start, start + pageSize);
  }, [currentTrades, currentPage, pageSize]);

  const tradesStats = useMemo(() => {
    const count = currentTrades.length;
    const sumPnl = currentTrades.reduce((sum, t) => sum + t.pnl, 0);
    const avgHrs =
      currentTrades.length > 0
        ? currentTrades.reduce((sum, t) => {
            const entryMs = new Date(t.entry).getTime();
            const exitMs = new Date(t.exit).getTime();
            return sum + (exitMs - entryMs) / (1000 * 60 * 60);
          }, 0) / currentTrades.length
        : 0;
    return { count, sumPnl, avgHrs };
  }, [currentTrades]);

  const createBarChartData = (data: ChartPoint[]) => ({
    labels: data.map((d) => d.name),
    datasets: [
      {
        data: data.map((d) => d.pnl),
        backgroundColor: data.map((d) => (d.pnl >= 0 ? "rgba(34, 197, 94, 0.8)" : "rgba(239, 68, 68, 0.8)")),
        borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 0, bottomRight: 0 },
      },
    ],
  });

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => currencyJPY(context.parsed.y),
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => `${Math.round(value).toLocaleString()}円`,
        },
      },
    },
  };

  const handleTabChange = (tab: "weekend" | "overnight") => {
    setActiveTab(tab);
    setCurrentPage(0);
  };

  return (
    <section style={{ padding: "16px 0", marginTop: 24 }}>
      <style>{`
        .insights-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        @media (min-width: 640px) {
          .insights-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .insights-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (min-width: 1400px) {
          .insights-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .insights-grid-full-width {
          grid-column: 1 / -1;
        }
      `}</style>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>今月のインサイト</h2>
      </div>

      <div className="insights-grid">
        {/* 1) 週別サマリー */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 16,
            padding: 16,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>週別サマリー / Weekly Summary</div>
          <div style={{ height: 300 }}>
            <Bar data={createBarChartData(weeklySummary)} options={barOptions} />
          </div>
        </div>

        {/* 2) 曜日別パフォーマンス */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 16,
            padding: 16,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
            曜日別パフォーマンス / Performance by Day of Week
          </div>
          <div style={{ height: 300 }}>
            <Bar data={createBarChartData(weekdayPerformance)} options={barOptions} />
          </div>
        </div>

        {/* 3) 時間帯パフォーマンス */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 16,
            padding: 16,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>時間帯パフォーマンス / Hour of Day</div>
          <div style={{ height: 300 }}>
            <Bar data={createBarChartData(hourlyPerformance)} options={barOptions} />
          </div>
        </div>

        {/* 4) 保有時間レンジ */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 16,
            padding: 16,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>保有時間レンジ / Intraday Duration</div>
          <div style={{ height: 300 }}>
            <Bar data={createBarChartData(durationPerformance)} options={barOptions} />
          </div>
        </div>

        {/* 5) ポジション一覧（週跨ぎ / 日跨ぎ） full width */}
        <div
          className="insights-grid-full-width"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 16,
            padding: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>ポジション一覧（週跨ぎ / 日跨ぎ）</div>
            <div
              role="tablist"
              aria-label="週跨ぎ/日跨ぎ切替"
              style={{ display: "inline-flex", borderRadius: 8, border: "1px solid var(--line)", overflow: "hidden" }}
            >
              <button
                role="tab"
                aria-selected={activeTab === "weekend"}
                onClick={() => handleTabChange("weekend")}
                style={{
                  padding: "6px 12px",
                  fontSize: 13,
                  border: "none",
                  background: activeTab === "weekend" ? "var(--accent)" : "transparent",
                  color: activeTab === "weekend" ? "#fff" : "var(--ink)",
                  cursor: "pointer",
                }}
              >
                週跨ぎ
              </button>
              <button
                role="tab"
                aria-selected={activeTab === "overnight"}
                onClick={() => handleTabChange("overnight")}
                style={{
                  padding: "6px 12px",
                  fontSize: 13,
                  border: "none",
                  background: activeTab === "overnight" ? "var(--accent)" : "transparent",
                  color: activeTab === "overnight" ? "#fff" : "var(--ink)",
                  cursor: "pointer",
                }}
              >
                日跨ぎ
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 12, display: "flex", flexWrap: "wrap", gap: 12, fontSize: 13, alignItems: "center" }}>
            <div style={{ padding: "4px 12px", borderRadius: 16, border: "1px solid var(--line)" }}>
              件数 <span style={{ fontWeight: 600 }}>{tradesStats.count}</span>
            </div>
            <div style={{ padding: "4px 12px", borderRadius: 16, border: "1px solid var(--line)" }}>
              合計損益 <span style={{ fontWeight: 600 }}>{currencyJPY(tradesStats.sumPnl)}</span>
            </div>
            <div style={{ padding: "4px 12px", borderRadius: 16, border: "1px solid var(--line)" }}>
              平均保有 <span style={{ fontWeight: 600 }}>{tradesStats.avgHrs.toFixed(1)}</span>h
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                style={{
                  padding: "4px 8px",
                  border: "1px solid var(--line)",
                  borderRadius: 4,
                  background: "var(--surface)",
                  cursor: currentPage === 0 ? "not-allowed" : "pointer",
                  fontSize: 12,
                  opacity: currentPage === 0 ? 0.5 : 1,
                }}
                aria-label="前のページ"
              >
                前へ
              </button>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>
                {currentPage + 1} / {totalPages || 1}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1}
                style={{
                  padding: "4px 8px",
                  border: "1px solid var(--line)",
                  borderRadius: 4,
                  background: "var(--surface)",
                  cursor: currentPage >= totalPages - 1 ? "not-allowed" : "pointer",
                  fontSize: 12,
                  opacity: currentPage >= totalPages - 1 ? 0.5 : 1,
                }}
                aria-label="次のページ"
              >
                次へ
              </button>
            </div>
          </div>

          <div style={{ overflowX: "auto", width: "100%" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "100px 80px minmax(200px, 2fr) 80px 100px",
                gap: 8,
                fontSize: 11,
                color: "var(--muted)",
                fontWeight: 600,
                paddingBottom: 8,
                borderBottom: "1px solid var(--line)",
                minWidth: "600px",
              }}
            >
              <div>通貨</div>
              <div>方向</div>
              <div>Entry → Exit (UTC)</div>
              <div style={{ textAlign: "right" }}>保有h</div>
              <div style={{ textAlign: "right" }}>損益</div>
            </div>
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
              {paginatedTrades.length === 0 ? (
                <div style={{ padding: 16, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
                  データがありません
                </div>
              ) : (
                paginatedTrades.map((t, idx) => {
                  const entryMs = new Date(t.entry).getTime();
                  const exitMs = new Date(t.exit).getTime();
                  const hrs = ((exitMs - entryMs) / (1000 * 60 * 60)).toFixed(1);
                  return (
                    <div
                      key={idx}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "100px 80px minmax(200px, 2fr) 80px 100px",
                        gap: 8,
                        fontSize: 13,
                        alignItems: "center",
                        padding: "8px 0",
                        borderBottom: "1px solid #f3f4f6",
                        minWidth: "600px",
                      }}
                    >
                      <div>{t.symbol}</div>
                      <div>{t.side}</div>
                      <div style={{ fontSize: 12 }}>
                        {t.entry.replace("T", " ").substring(0, 16)} → {t.exit.replace("T", " ").substring(0, 16)}
                      </div>
                      <div style={{ textAlign: "right" }}>{hrs}</div>
                      <div
                        style={{
                          textAlign: "right",
                          fontWeight: 600,
                          color: t.pnl >= 0 ? "var(--gain)" : "var(--loss)",
                        }}
                      >
                        {currencyJPY(t.pnl)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* 6) ベスト/ワーストデイ & 最大日次DD */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 16,
            padding: 16,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>ベスト/ワーストデイ & 最大日次DD</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                borderRadius: 12,
                padding: 12,
                background: "rgba(34, 197, 94, 0.1)",
              }}
            >
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>Best Day</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{bestDay?.date || "—"}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--gain)" }}>
                {bestDay ? currencyJPY(bestDay.pnl) : "—"}
              </div>
            </div>
            <div
              style={{
                borderRadius: 12,
                padding: 12,
                background: "rgba(239, 68, 68, 0.1)",
              }}
            >
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>Worst Day</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{worstDay?.date || "—"}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--loss)" }}>
                {worstDay ? currencyJPY(worstDay.pnl) : "—"}
              </div>
            </div>
          </div>
          {maxDailyDD !== null && (
            <div style={{ marginTop: 12, fontSize: 11, color: "var(--muted)", display: "flex", alignItems: "center", gap: 8 }}>
              Max Daily Drawdown:
              <span style={{ fontWeight: 600, color: "var(--loss)" }}>{currencyJPY(maxDailyDD)}</span>
            </div>
          )}
        </div>

        {/* 7) 通貨ペア 上位/下位 */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 16,
            padding: 16,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
            通貨ペア 上位/下位 / Top & Bottom Symbols
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8 }}>Top 3</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                {topSymbols.map((s, i) => (
                  <li key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span>{s.symbol}</span>
                    <span style={{ fontWeight: 600, color: s.pnl >= 0 ? "var(--gain)" : "var(--loss)" }}>
                      {currencyJPY(s.pnl)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8 }}>Bottom 3</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                {bottomSymbols.map((s, i) => (
                  <li key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span>{s.symbol}</span>
                    <span style={{ fontWeight: 600, color: s.pnl >= 0 ? "var(--gain)" : "var(--loss)" }}>
                      {currencyJPY(s.pnl)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 8) タグ / Mini Expectation */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 16,
            padding: 16,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>タグ / Mini Expectation</div>
          <div style={{ overflowX: "auto", width: "100%" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(100px, 2fr) minmax(80px, 1fr) minmax(60px, 1fr) 60px",
              gap: 8,
              fontSize: 11,
              color: "var(--muted)",
              fontWeight: 600,
              paddingBottom: 8,
              borderBottom: "1px solid var(--line)",
              minWidth: "400px",
            }}
          >
            <div>タグ</div>
            <div style={{ textAlign: "right" }}>損益</div>
            <div style={{ textAlign: "right" }}>勝率</div>
            <div style={{ textAlign: "right" }}>注目</div>
          </div>
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8, minWidth: "400px" }}>
            {topTags.map((tag, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(100px, 2fr) minmax(80px, 1fr) minmax(60px, 1fr) 60px",
                  gap: 8,
                  fontSize: 13,
                  alignItems: "center",
                }}
              >
                <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tag.tag}</div>
                <div
                  style={{
                    textAlign: "right",
                    fontWeight: 600,
                    color: tag.pnl >= 0 ? "var(--gain)" : "var(--loss)",
                  }}
                >
                  {currencyJPY(tag.pnl)}
                </div>
                <div style={{ textAlign: "right" }}>{Math.round(tag.winrate * 100)}%</div>
                <div style={{ textAlign: "right", fontWeight: 600 }}>
                  {tag.winrate >= 0.6 ? "◎" : tag.winrate >= 0.5 ? "○" : "—"}
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* 9) 期待値ミニ表（抜粋） */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 16,
            padding: 16,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>期待値ミニ表（抜粋）</div>
          <div style={{ overflowX: "auto", width: "100%" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(100px, 2fr) minmax(50px, 60px) minmax(80px, 1fr) minmax(50px, 60px) minmax(50px, 60px)",
              gap: 8,
              fontSize: 11,
              color: "var(--muted)",
              fontWeight: 600,
              paddingBottom: 8,
              borderBottom: "1px solid var(--line)",
              minWidth: "450px",
            }}
          >
            <div>セグメント</div>
            <div style={{ textAlign: "right" }}>件数</div>
            <div style={{ textAlign: "right" }}>平均損益</div>
            <div style={{ textAlign: "right" }}>勝率</div>
            <div style={{ textAlign: "right" }}>PF</div>
          </div>
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8, minWidth: "450px" }}>
            {expectationRows.map((row, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(100px, 2fr) minmax(50px, 60px) minmax(80px, 1fr) minmax(50px, 60px) minmax(50px, 60px)",
                  gap: 8,
                  fontSize: 13,
                  alignItems: "center",
                }}
              >
                <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.label}</div>
                <div style={{ textAlign: "right" }}>{row.count}</div>
                <div
                  style={{
                    textAlign: "right",
                    fontWeight: 600,
                    color: row.avgPnl >= 0 ? "var(--gain)" : "var(--loss)",
                  }}
                >
                  {currencyJPY(row.avgPnl)}
                </div>
                <div style={{ textAlign: "right" }}>
                  {row.winrate !== null && row.winrate !== undefined ? `${Math.round(row.winrate * 100)}%` : "—"}
                </div>
                <div style={{ textAlign: "right" }}>
                  {row.pf !== null && row.pf !== undefined ? row.pf.toFixed(1) : "—"}
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
