import React, { useMemo } from "react";
import { useDataset } from "../lib/dataset.context";
import { Trade } from "../lib/types";

const formatCurrency = (n: number): string => {
  const sign = n >= 0 ? "+" : "";
  return `${sign}¥${Math.abs(n).toLocaleString("ja-JP")}`;
};

interface TimeSegment {
  segment: string;
  bucket: string;
  count: number;
  netPnl: number;
  winRate: number;
  pf: number;
  avgPnl: number;
}

interface HighlightCard {
  title: string;
  value: string;
  sub: string;
  isGood: boolean;
}

export default function ReportsTimeAxis() {
  const { trades } = useDataset();

  const analysis = useMemo(() => {
    if (!trades || trades.length === 0) {
      return {
        highlights: [],
        segments: [],
      };
    }

    const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
    const dayStats: Record<string, { pnl: number; wins: number; total: number; grossWin: number; grossLoss: number }> = {};
    const hourStats: Record<string, { pnl: number; wins: number; total: number; grossWin: number; grossLoss: number }> = {};

    trades.forEach((trade: Trade) => {
      const date = new Date(trade.entryTime);
      const dayOfWeek = dayNames[date.getDay()];
      const hour = date.getHours();
      const hourBucket = `${hour.toString().padStart(2, "0")}:00–${((hour + 1) % 24).toString().padStart(2, "0")}:00`;

      if (!dayStats[dayOfWeek]) {
        dayStats[dayOfWeek] = { pnl: 0, wins: 0, total: 0, grossWin: 0, grossLoss: 0 };
      }
      if (!hourStats[hourBucket]) {
        hourStats[hourBucket] = { pnl: 0, wins: 0, total: 0, grossWin: 0, grossLoss: 0 };
      }

      const pnl = trade.pnl || 0;
      const isWin = pnl > 0;

      dayStats[dayOfWeek].pnl += pnl;
      dayStats[dayOfWeek].total += 1;
      if (isWin) {
        dayStats[dayOfWeek].wins += 1;
        dayStats[dayOfWeek].grossWin += pnl;
      } else {
        dayStats[dayOfWeek].grossLoss += Math.abs(pnl);
      }

      hourStats[hourBucket].pnl += pnl;
      hourStats[hourBucket].total += 1;
      if (isWin) {
        hourStats[hourBucket].wins += 1;
        hourStats[hourBucket].grossWin += pnl;
      } else {
        hourStats[hourBucket].grossLoss += Math.abs(pnl);
      }
    });

    const dayEntries = Object.entries(dayStats).map(([day, stats]) => ({
      type: "曜日",
      label: `（${day}）`,
      ...stats,
      winRate: stats.total > 0 ? (stats.wins / stats.total) * 100 : 0,
      pf: stats.grossLoss > 0 ? stats.grossWin / stats.grossLoss : stats.grossWin > 0 ? 999 : 0,
      avgPnl: stats.total > 0 ? stats.pnl / stats.total : 0,
    }));

    const hourEntries = Object.entries(hourStats).map(([hour, stats]) => ({
      type: "時間帯",
      label: hour,
      ...stats,
      winRate: stats.total > 0 ? (stats.wins / stats.total) * 100 : 0,
      pf: stats.grossLoss > 0 ? stats.grossWin / stats.grossLoss : stats.grossWin > 0 ? 999 : 0,
      avgPnl: stats.total > 0 ? stats.pnl / stats.total : 0,
    }));

    dayEntries.sort((a, b) => b.pnl - a.pnl);
    hourEntries.sort((a, b) => b.pnl - a.pnl);

    const dayTop = dayEntries[0];
    const dayBottom = dayEntries[dayEntries.length - 1];
    const hourTop = hourEntries[0];
    const hourBottom = hourEntries[hourEntries.length - 1];

    const highlights: HighlightCard[] = [];
    if (dayTop) {
      highlights.push({
        title: "曜日 Top",
        value: `${dayTop.label} ${formatCurrency(dayTop.pnl)}`,
        sub: `勝率 ${dayTop.winRate.toFixed(0)}% / 取引 ${dayTop.total}件`,
        isGood: dayTop.pnl > 0,
      });
    }
    if (dayBottom) {
      highlights.push({
        title: "曜日 Bottom",
        value: `${dayBottom.label} ${formatCurrency(dayBottom.pnl)}`,
        sub: `勝率 ${dayBottom.winRate.toFixed(0)}% / 取引 ${dayBottom.total}件`,
        isGood: dayBottom.pnl > 0,
      });
    }
    if (hourTop) {
      highlights.push({
        title: "時間帯 Top",
        value: `${hourTop.label} ${formatCurrency(hourTop.pnl)}`,
        sub: `勝率 ${hourTop.winRate.toFixed(0)}% / 取引 ${hourTop.total}件`,
        isGood: hourTop.pnl > 0,
      });
    }
    if (hourBottom) {
      highlights.push({
        title: "時間帯 Bottom",
        value: `${hourBottom.label} ${formatCurrency(hourBottom.pnl)}`,
        sub: `勝率 ${hourBottom.winRate.toFixed(0)}% / 取引 ${hourBottom.total}件`,
        isGood: hourBottom.pnl > 0,
      });
    }

    const allSegments: TimeSegment[] = [
      ...dayEntries.map((d) => ({
        segment: d.type,
        bucket: d.label,
        count: d.total,
        netPnl: d.pnl,
        winRate: d.winRate,
        pf: d.pf,
        avgPnl: d.avgPnl,
      })),
      ...hourEntries.map((h) => ({
        segment: h.type,
        bucket: h.label,
        count: h.total,
        netPnl: h.pnl,
        winRate: h.winRate,
        pf: h.pf,
        avgPnl: h.avgPnl,
      })),
    ];

    allSegments.sort((a, b) => Math.abs(b.netPnl) - Math.abs(a.netPnl));

    return {
      highlights,
      segments: allSegments.slice(0, 20),
    };
  }, [trades]);

  return (
    <div style={{ width: "100%" }}>
      <section
        className="kpi"
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(2, 1fr)",
          marginBottom: 16,
        }}
        aria-label="ハイライト"
      >
        {analysis.highlights.map((item, idx) => (
          <div
            key={idx}
            className="card"
            style={{
              background: "var(--panel)",
              border: "1px solid var(--line)",
              borderRadius: 16,
              padding: 12,
            }}
          >
            <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "var(--muted)", fontWeight: 400 }}>
              {item.title}
            </h3>
            <div
              className={item.isGood ? "good" : "bad"}
              style={{
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              {item.value}
            </div>
            <div className="sub" style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
              {item.sub}
            </div>
          </div>
        ))}
      </section>

      <section
        className="row row-3"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          <div
            className="card"
            style={{
              background: "var(--panel)",
              border: "1px solid var(--line)",
              borderRadius: 16,
              padding: 12,
            }}
          >
            <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "var(--muted)", fontWeight: 400 }}>
              曜日別
            </h3>
            <div
              className="chart sm"
              style={{
                height: 180,
                borderRadius: 14,
                background:
                  "linear-gradient(180deg, rgba(34,197,94,.18), transparent 60%), var(--panel-2)",
                border: "1px dashed var(--line)",
              }}
              aria-hidden="true"
            ></div>
          </div>
          <div
            className="card"
            style={{
              background: "var(--panel)",
              border: "1px solid var(--line)",
              borderRadius: 16,
              padding: 12,
            }}
          >
            <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "var(--muted)", fontWeight: 400 }}>
              時間帯別
            </h3>
            <div
              className="chart sm"
              style={{
                height: 180,
                borderRadius: 14,
                background:
                  "linear-gradient(180deg, rgba(34,197,94,.18), transparent 60%), var(--panel-2)",
                border: "1px dashed var(--line)",
              }}
              aria-hidden="true"
            ></div>
          </div>
          <div
            className="card"
            style={{
              background: "var(--panel)",
              border: "1px solid var(--line)",
              borderRadius: 16,
              padding: 12,
            }}
          >
            <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "var(--muted)", fontWeight: 400 }}>
              日別推移（小）
            </h3>
            <div
              className="chart sm"
              style={{
                height: 180,
                borderRadius: 14,
                background:
                  "linear-gradient(180deg, rgba(34,197,94,.18), transparent 60%), var(--panel-2)",
                border: "1px dashed var(--line)",
              }}
              aria-hidden="true"
            ></div>
          </div>
        </div>
      </section>

      <section
        className="row row-3"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          <div
            className="card"
            style={{
              background: "var(--panel)",
              border: "1px solid var(--line)",
              borderRadius: 16,
              padding: 12,
            }}
          >
            <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "var(--muted)", fontWeight: 400 }}>
              週別推移（小）
            </h3>
            <div
              className="chart sm"
              style={{
                height: 180,
                borderRadius: 14,
                background:
                  "linear-gradient(180deg, rgba(34,197,94,.18), transparent 60%), var(--panel-2)",
                border: "1px dashed var(--line)",
              }}
              aria-hidden="true"
            ></div>
          </div>
          <div
            className="card"
            style={{
              background: "var(--panel)",
              border: "1px solid var(--line)",
              borderRadius: 16,
              padding: 12,
            }}
          >
            <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "var(--muted)", fontWeight: 400 }}>
              平均保有時間（バケット）
            </h3>
            <div
              className="chart sm"
              style={{
                height: 180,
                borderRadius: 14,
                background:
                  "linear-gradient(180deg, rgba(34,197,94,.18), transparent 60%), var(--panel-2)",
                border: "1px dashed var(--line)",
              }}
              aria-hidden="true"
            ></div>
          </div>
          <div
            className="card"
            style={{
              background: "var(--panel)",
              border: "1px solid var(--line)",
              borderRadius: 16,
              padding: 12,
            }}
          >
            <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "var(--muted)", fontWeight: 400 }}>
              日別勝率（小）
            </h3>
            <div
              className="chart sm"
              style={{
                height: 180,
                borderRadius: 14,
                background:
                  "linear-gradient(180deg, rgba(34,197,94,.18), transparent 60%), var(--panel-2)",
                border: "1px dashed var(--line)",
              }}
              aria-hidden="true"
            ></div>
          </div>
        </div>
      </section>

      <section
        className="row row-3"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          <div
            className="card"
            style={{
              background: "var(--panel)",
              border: "1px solid var(--line)",
              borderRadius: 16,
              padding: 12,
            }}
          >
            <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "var(--muted)", fontWeight: 400 }}>
              散布図：時刻×損益
            </h3>
            <div
              className="chart sm"
              style={{
                height: 180,
                borderRadius: 14,
                background:
                  "linear-gradient(180deg, rgba(34,197,94,.18), transparent 60%), var(--panel-2)",
                border: "1px dashed var(--line)",
              }}
              aria-hidden="true"
            ></div>
          </div>
          <div
            className="card"
            style={{
              background: "var(--panel)",
              border: "1px solid var(--line)",
              borderRadius: 16,
              padding: 12,
            }}
          >
            <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "var(--muted)", fontWeight: 400 }}>
              散布図：保有時間×損益
            </h3>
            <div
              className="chart sm"
              style={{
                height: 180,
                borderRadius: 14,
                background:
                  "linear-gradient(180deg, rgba(34,197,94,.18), transparent 60%), var(--panel-2)",
                border: "1px dashed var(--line)",
              }}
              aria-hidden="true"
            ></div>
          </div>
          <div
            className="card"
            style={{
              background: "var(--panel)",
              border: "1px solid var(--line)",
              borderRadius: 16,
              padding: 12,
            }}
          >
            <h3 style={{ margin: "0 0 8px 0", fontSize: 13, color: "var(--muted)", fontWeight: 400 }}>
              連敗ヒート（時間帯）
            </h3>
            <div
              className="chart sm"
              style={{
                height: 180,
                borderRadius: 14,
                background:
                  "linear-gradient(180deg, rgba(34,197,94,.18), transparent 60%), var(--panel-2)",
                border: "1px dashed var(--line)",
              }}
              aria-hidden="true"
            ></div>
          </div>
        </div>
      </section>

      <section
        className="card"
        style={{
          background: "var(--panel)",
          border: "1px solid var(--line)",
          borderRadius: 16,
          padding: 12,
        }}
      >
        <h3 style={{ margin: "0 0 12px 0", fontSize: 13, color: "var(--muted)", fontWeight: 400 }}>
          セグメント別明細（クリックで取引一覧へ）
        </h3>
        <div className="table-wrap" style={{ maxHeight: "60vh", overflow: "auto", borderRadius: 12 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th
                  style={{
                    padding: 10,
                    borderBottom: "1px solid var(--line)",
                    textAlign: "left",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  セグメント
                </th>
                <th
                  style={{
                    padding: 10,
                    borderBottom: "1px solid var(--line)",
                    textAlign: "left",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  バケット
                </th>
                <th
                  style={{
                    padding: 10,
                    borderBottom: "1px solid var(--line)",
                    textAlign: "right",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  取引
                </th>
                <th
                  style={{
                    padding: 10,
                    borderBottom: "1px solid var(--line)",
                    textAlign: "right",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Net損益
                </th>
                <th
                  style={{
                    padding: 10,
                    borderBottom: "1px solid var(--line)",
                    textAlign: "right",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  勝率
                </th>
                <th
                  style={{
                    padding: 10,
                    borderBottom: "1px solid var(--line)",
                    textAlign: "right",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  PF
                </th>
                <th
                  style={{
                    padding: 10,
                    borderBottom: "1px solid var(--line)",
                    textAlign: "right",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  平均損益
                </th>
              </tr>
            </thead>
            <tbody>
              {analysis.segments.map((seg, idx) => (
                <tr
                  key={idx}
                  className="clickable"
                  style={{
                    height: 44,
                    cursor: "pointer",
                  }}
                  title="詳細へ"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--canvas)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <td style={{ padding: 10, borderBottom: "1px solid var(--line)" }}>{seg.segment}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid var(--line)" }}>{seg.bucket}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid var(--line)", textAlign: "right" }}>
                    {seg.count}
                  </td>
                  <td
                    className={seg.netPnl > 0 ? "good" : "bad"}
                    style={{
                      padding: 10,
                      borderBottom: "1px solid var(--line)",
                      textAlign: "right",
                      fontWeight: 600,
                    }}
                  >
                    {formatCurrency(seg.netPnl)}
                  </td>
                  <td style={{ padding: 10, borderBottom: "1px solid var(--line)", textAlign: "right" }}>
                    {seg.winRate.toFixed(0)}%
                  </td>
                  <td style={{ padding: 10, borderBottom: "1px solid var(--line)", textAlign: "right" }}>
                    {seg.pf.toFixed(2)}
                  </td>
                  <td
                    style={{
                      padding: 10,
                      borderBottom: "1px solid var(--line)",
                      textAlign: "right",
                      color: seg.avgPnl > 0 ? "var(--accent-2)" : seg.avgPnl < 0 ? "var(--danger)" : "inherit",
                    }}
                  >
                    {formatCurrency(seg.avgPnl)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <span
            className="badge"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "2px 8px",
              borderRadius: 999,
              background: "var(--canvas)",
              border: "1px solid var(--line)",
              fontSize: 12,
              color: "var(--muted)",
            }}
          >
            クリックで一覧にドリルダウン
          </span>
          <span
            className="badge"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "2px 8px",
              borderRadius: 999,
              background: "var(--canvas)",
              border: "1px solid var(--line)",
              fontSize: 12,
              color: "var(--muted)",
            }}
          >
            行はロールオーバーでグレー
          </span>
        </div>
      </section>

      <footer className="sub" style={{ fontSize: 12, color: "var(--muted)", marginTop: 16 }}>
        v0.2 HTMLモック（静的）。グローバルフィルタカードを削除し、散布図×2・連敗ヒート（時間帯）を追加。30/60/90日、メトリクス切替は上部コントロールに統一。
      </footer>

      <style>{`
        @media (min-width: 768px) {
          .kpi {
            grid-template-columns: repeat(4, 1fr) !important;
          }
          .chart.sm {
            height: 220px !important;
          }
        }
        @media (min-width: 1280px) {
          .row-3 > div {
            grid-template-columns: 1fr 1fr 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
