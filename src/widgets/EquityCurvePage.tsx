// src/EquityCurvePage.tsx （確定版 v1 / src直下版）
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "chart.js/auto";
import "chartjs-adapter-date-fns";
import { ja } from "date-fns/locale";
import { Line } from "react-chartjs-2";
import { UI_TEXT } from "../lib/i18n";

// ← ここがポイント：本ファイルが src 直下にあるので widgets への相対パスは './widgets/...'
import DashboardKPI from "./DashboardKPI";
import {
  EquityChart,
  DrawdownChart,
  DailyProfitChart,
  RecentTradesTable,
  WeekCalendar,
  SegmentCharts,
  SetupChart
} from "./DashboardSections";
import "../lib/dashboard.css";

const Info: React.FC<{ title: string }> = ({ title }) => (
  <span className="info" title={title} aria-label="説明">
    ?
  </span>
);
const fmtJPY = (v: number) => `${Math.round(v).toLocaleString("ja-JP")}`;

type SessionKey = "ALL" | "ASIA" | "LONDON" | "NY" | "QUIET";
type OutcomeKey = "ALL" | "WIN" | "LOSS" | "EVEN";
/** ← 追加：applyPreset がファイル外側で使うため top-level へ */
type RangePreset =
  | "ALL"
  | "TODAY"
  | "YESTERDAY"
  | "LAST_7"
  | "LAST_30"
  | "THIS_MONTH"
  | "LAST_MONTH"
  | "LAST_12M"
  | "LAST_YEAR"
  | "YTD"
  | "CUSTOM";

type Trade = {
  ticket: string;
  symbol: string;
  type: "Buy" | "Sell" | string;
  time: number; // Close Time（UTC ms）
  profitJPY: number;
  // HTML（XMステートメント）から来た時だけ入る任意項目。CSVはundefinedでOK
  entryPrice?: number;
  exitPrice?: number;
  size?: number;
  openTimeMs?: number;
};
type DatasetEntry = { id: string; name: string; trades: Trade[] };

// ---- Utils -------------------------------------------------
function simpleHash(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return ("h" + (h >>> 0).toString(16)).padStart(9, "0");
}
function parseCSV(text: string): string[][] {
  // 先頭行で区切り推定（タブ優先）
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

  // 空行だけの行は除外
  return rows.filter(r => !(r.length === 1 && r[0].trim() === ""));
}

function toUTCms(s: string): number {
  const t = Date.parse(s.replace(/\./g, "-").replace(/\//g, "-"));
  return Number.isNaN(t) ? NaN : new Date(t).getTime();
}
function maxDrawdown(equity: number[]): number {
  let peak = -Infinity,
    m = 0;
  for (const v of equity) {
    if (v > peak) peak = v;
    const dd = peak - v;
    if (dd > m) m = dd;
  }
  return m;
}
// --- pips換算の補助 ---
function isJpyCross(symbol: string) {
  return /JPY$/i.test(symbol?.trim() || "");
}
function diffToPips(symbol: string, diff: number) {
  return isJpyCross(symbol) ? diff * 100 : diff * 10000;
}

// ---- KPI計算 ------------------------------------------------
function computeKPIs(trades: Trade[]) {
  const n = trades.length;
  const winsArr = trades.filter((t) => t.profitJPY > 0);
  const lossesArr = trades.filter((t) => t.profitJPY < 0);

  const totalProfit = winsArr.reduce((a, b) => a + b.profitJPY, 0);
  const totalLossAbs = Math.abs(lossesArr.reduce((a, b) => a + b.profitJPY, 0));
  const winRate = n ? winsArr.length / n : 0;
  const profitFactor = totalLossAbs > 0 ? totalProfit / totalLossAbs : totalProfit > 0 ? Infinity : 0;

  // 平均利益/損失（円/件）
  const avgProfitJPY = winsArr.length ? totalProfit / winsArr.length : 0;
  const avgLossJPY = lossesArr.length ? totalLossAbs / lossesArr.length : 0;

  // 期待値（円/件）= 勝率×平均利 − (1−勝率)×平均損
  const expectancyJPY = winRate * avgProfitJPY - (1 - winRate) * avgLossJPY;

  // pips系（entry/exitがある行のみ）
  const pipsSamples: number[] = [];
  let totalPips = 0;
  for (const t of trades) {
    if (typeof t.entryPrice === "number" && typeof t.exitPrice === "number") {
      const sign = t.type.toLowerCase() === "buy" ? 1 : -1;
      const p = diffToPips(t.symbol, (t.exitPrice - t.entryPrice) * sign);
      pipsSamples.push(p);
      totalPips += p;
    }
  }
  let expectancyPips = 0;
  if (pipsSamples.length) {
    const pos = pipsSamples.filter((p) => p > 0);
    const neg = pipsSamples.filter((p) => p < 0);
    const wr = pipsSamples.length ? pos.length / pipsSamples.length : 0;
    const avgGain = pos.length ? pos.reduce((a, b) => a + b, 0) / pos.length : 0;
    const avgLoss = neg.length ? Math.abs(neg.reduce((a, b) => a + b, 0)) / neg.length : 0;
    expectancyPips = wr * avgGain - (1 - wr) * avgLoss;
  }

  // 平均保有時間（分）：openTimeMs と close time がある行のみ
  const holds: number[] = [];
  for (const t of trades) {
    if (typeof t.openTimeMs === "number" && typeof t.time === "number") {
      const diffMin = (t.time - t.openTimeMs) / 60000;
      if (Number.isFinite(diffMin) && diffMin >= 0) holds.push(diffMin);
    }
  }
  const avgHoldMin = holds.length ? holds.reduce((a, b) => a + b, 0) / holds.length : null;

  return {
    winRate,
    profitFactor,
    expectancyPips,
    expectancyJPY,
    avgProfitJPY,
    avgLossJPY,
    avgHoldMin,
    totalPips,
  };
}

// ---- formatter（分→「H時間M分」）---------------------------------------
function formatMinutesJP(min: number | null): string {
  if (min === null) return "—";
  if (!Number.isFinite(min)) return "—";
  const m = Math.round(min);
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h <= 0) return `${r}分`;
  if (r === 0) return `${h}時間`;
  return `${h}時間${r}分`;
}

// ---- preset helpers（期間プリセット → from/to に反映） --------------------
function monthStart(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function monthEnd(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function lastMonthStart() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() - 1, 1);
}
function lastMonthEnd() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 0);
}

function applyPreset(p: RangePreset, setFrom: (v: string) => void, setTo: (v: string) => void) {
  const fmt = (dt: Date) => dt.toISOString().slice(0, 10);
  const today = new Date();
  switch (p) {
    case "ALL":
      setFrom("");
      setTo("");
      break;
    case "TODAY":
      setFrom(fmt(today));
      setTo(fmt(today));
      break;
    case "YESTERDAY": {
      const y = new Date(today);
      y.setDate(today.getDate() - 1);
      setFrom(fmt(y));
      setTo(fmt(y));
      break;
    }
    case "LAST_7": {
      const s = new Date(today);
      s.setDate(today.getDate() - 6);
      setFrom(fmt(s));
      setTo(fmt(today));
      break;
    }
    case "LAST_30": {
      const s = new Date(today);
      s.setDate(today.getDate() - 29);
      setFrom(fmt(s));
      setTo(fmt(today));
      break;
    }
    case "THIS_MONTH":
      setFrom(fmt(monthStart(today)));
      setTo(fmt(monthEnd(today)));
      break;
    case "LAST_MONTH":
      setFrom(fmt(lastMonthStart()));
      setTo(fmt(lastMonthEnd()));
      break;
    case "LAST_12M": {
      const s = new Date(today);
      s.setFullYear(today.getFullYear() - 1);
      s.setDate(s.getDate() + 1);
      setFrom(fmt(s));
      setTo(fmt(today));
      break;
    }
    case "LAST_YEAR": {
      const s = new Date(today.getFullYear() - 1, 0, 1);
      const e = new Date(today.getFullYear() - 1, 11, 31);
      setFrom(fmt(s));
      setTo(fmt(e));
      break;
    }
    case "YTD": {
      const s = new Date(today.getFullYear(), 0, 1);
      setFrom(fmt(s));
      setTo(fmt(today));
      break;
    }
    case "CUSTOM":
    /* From/To 入力に委ねる */
  }
}

// ---- session helper（時間帯判定）-----------------------------------------
function inSession(hour: number, key: SessionKey): boolean {
  switch (key) {
    case "ASIA":
      return hour >= 5 && hour <= 15; // 05:00–15:59
    case "LONDON":
      return hour >= 16 && hour <= 21; // 16:00–21:59
    case "NY":
      return hour >= 22 || hour <= 1; // 22:00–01:59
    case "QUIET":
      return hour >= 2 && hour <= 4; // 02:00–04:59
    default:
      return true; // 'ALL'
  }
}

// ---- Main --------------------------------------------------
const EquityCurvePage: React.FC = () => {
  console.log("🔄 EquityCurvePage render");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [datasets, setDatasets] = useState<DatasetEntry[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [pair, setPair] = useState<string>("ALL");

  const [session, setSession] = useState<SessionKey>("ALL");
  const [weekday, setWeekday] = useState<string>("ALL"); // '0'～'6' / 'ALL'
  const [from, setFrom] = useState<string>(""); // 'YYYY-MM-DD'
  const [to, setTo] = useState<string>(""); // 'YYYY-MM-DD'
  const [side, setSide] = useState<"ALL" | "buy" | "sell">("ALL");
  const [outcome, setOutcome] = useState<OutcomeKey>("ALL");

  /** 期間ピッカー用（トリガー＋ポップオーバー） */
  const [preset, setPreset] = useState<RangePreset>("ALL");
  const [rangeOpen, setRangeOpen] = useState(false);
  const rangeRef = useRef<HTMLDivElement>(null);

  // 外側クリックで閉じる
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!rangeRef.current) return;
      if (!rangeRef.current.contains(e.target as Node)) setRangeOpen(false);
    };
    if (rangeOpen) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [rangeOpen]);

  // --- 全フィルタを一括リセット（永続化はしない） ---
  const resetFilters = () => {
    setPair("ALL");
    setSession("ALL");
    setWeekday("ALL");
    setFrom("");
    setTo("");
    setSide("ALL");
    setOutcome("ALL");
  };

  // ① 起動時に前回状態を復元、またはデモデータAを読み込み
  useEffect(() => {
    console.log("📂 EquityCurvePage - restoring from localStorage");
    try {
      const raw = localStorage.getItem("fxtool:v1:datasets");
      const cur = localStorage.getItem("fxtool:v1:currentId");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          console.log("📂 Restored datasets:", parsed.length);
          setDatasets(parsed);
          if (cur) setCurrentId(cur);
          return;
        }
      }
      // データがない場合、デモデータAを自動的に読み込む
      console.log("📂 No existing data, loading demo data A");
      (async () => {
        const cacheBuster = `?t=${Date.now()}`;
        const res = await fetch(`/demo/A.csv${cacheBuster}`, { cache: "no-store" });
        if (!res.ok) return;
        const text = await res.text();
        await importCsvTextAsDataset("A.csv", text, [], setDatasets, setCurrentId);
      })();
    } catch {}
  }, []);

  // ヘッダーの青ボタン／A/B/C を受け取る
  useEffect(() => {
    const onOpenUpload = () => fileInputRef.current?.click();
    const onPreset = async (e: Event) => {
      const n = (e as CustomEvent<"A" | "B" | "C">).detail;
      if (n === "A" || n === "B" || n === "C") {
        // setDatasetsを関数形式で呼び出し、最新のdatasetsを取得
        setDatasets(currentDatasets => {
          const existing = currentDatasets.find(d => d.id === n);
          if (existing) {
            setCurrentId(n);
            return currentDatasets;
          }
          // 新しいデータセットを作成してCSVを非同期で読み込む
          (async () => {
            const cacheBuster = `?t=${Date.now()}`;
            const res = await fetch(`/demo/${n}.csv${cacheBuster}`, { cache: "no-store" });
            if (!res.ok) return;
            const text = await res.text();
            await importCsvTextAsDataset(`${n}.csv`, text, currentDatasets, setDatasets, setCurrentId);
          })();
          return currentDatasets;
        });
      }
    };
    window.addEventListener("fx:openUpload", onOpenUpload as EventListener);
    window.addEventListener("fx:preset", onPreset as EventListener);
    return () => {
      window.removeEventListener("fx:openUpload", onOpenUpload as EventListener);
      window.removeEventListener("fx:preset", onPreset as EventListener);
    };
  }, []); // 依存配列を空に戻す

  // ② 変更されたら保存
  useEffect(() => {
    console.log("💾 EquityCurvePage - saving to localStorage");
    try {
      localStorage.setItem("fxtool:v1:datasets", JSON.stringify(datasets));
      localStorage.setItem("fxtool:v1:currentId", currentId ?? "");
    } catch {}
  }, [datasets, currentId]);

  // CSVテキスト → Dataset 追加
  async function importCsvTextAsDataset(
    name: string,
    text: string,
    dsets: DatasetEntry[],
    setDsets: React.Dispatch<React.SetStateAction<DatasetEntry[]>>,
    setCur: React.Dispatch<React.SetStateAction<string | null>>
  ) {
    const id = simpleHash(text);
    if (dsets.some((d) => d.id === id)) {
      setCur(id);
      return;
    }
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
    setDsets((prev) => {
      const merged = [...prev, { id, name, trades }];
      setCur(id);
      return merged;
    });
  }

  // デモプリセット読込
  async function loadPreset(
    name: "A" | "B" | "C",
    dsets: DatasetEntry[],
    setDsets: React.Dispatch<React.SetStateAction<DatasetEntry[]>>,
    setCur: React.Dispatch<React.SetStateAction<string | null>>
  ) {
    const cacheBuster = `?t=${Date.now()}`;
    const res = await fetch(`/demo/${name}.csv${cacheBuster}`);
    if (!res.ok) {
      alert(`${name}.csv を読み込めませんでした`);
      return;
    }
    const text = await res.text();
    await importCsvTextAsDataset(`${name}.csv`, text, dsets, setDsets, setCur);
  }

  // CSV取り込み（A/B/C複数OK・同一内容はハッシュでスキップ＝冪等）
  const onFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || !files.length) return;
      const newEntries: DatasetEntry[] = [];
      for (const f of Array.from(files)) {
        const text = await f.text();
        const id = simpleHash(text);
        if (datasets.some((d) => d.id === id)) continue;
        try {
          const rows = parseCSV(text);
          if (!rows.length) throw new Error("空のCSV");
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
          if (i.ticket < 0 || i.symbol < 0 || i.type < 0 || i.profit < 0)
            throw new Error("必須カラム不足（ticket/symbol(or item)/type/profit）");
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
          if (!trades.length) throw new Error("有効行が0件");
          trades.sort((a, b) => a.time - b.time);
          newEntries.push({ id, name: f.name, trades });
        } catch (e: any) {
          alert(
            `CSV取り込み失敗（EC-CSV-INVALID-01）\n${f.name}\n原因: ${e?.message || e}\n修正案: ヘッダー名/日付形式を確認してください。`
          );
        }
      }
      if (newEntries.length) {
        setDatasets((prev) => {
          const merged = [...prev, ...newEntries];
          if (!currentId) setCurrentId(merged[0].id);
          return merged;
        });
      }
    },
    [datasets, currentId]
  );

  const current = useMemo(() => datasets.find((d) => d.id === currentId) || null, [datasets, currentId]);
  const pairOptions = useMemo(() => {
    const s = new Set<string>();
    current?.trades.forEach((t) => s.add(t.symbol));
    return ["ALL", ...Array.from(s).sort()];
  }, [current]);

  // フィルタ
  const filteredTrades = useMemo(() => {
    if (!current) return [];
    const fromMs = from ? new Date(from + "T00:00:00").getTime() : null;
    const toMs = to ? new Date(to + "T23:59:59.999").getTime() : null;
    return current.trades.filter((t) => {
      if (pair !== "ALL" && t.symbol !== pair) return false;
      if (side !== "ALL" && (t.type || "").toLowerCase() !== side) return false;
      if (outcome === "WIN" && t.profitJPY <= 0) return false;
      if (outcome === "LOSS" && t.profitJPY >= 0) return false;
      if (outcome === "EVEN" && t.profitJPY !== 0) return false;
      if (fromMs !== null && t.time < fromMs) return false;
      if (toMs !== null && t.time > toMs) return false;
      const d = new Date(t.time);
      const h = d.getHours();
      if (session !== "ALL" && !inSession(h, session)) return false;
      if (weekday !== "ALL" && d.getDay() !== Number(weekday)) return false;
      return true;
    });
  }, [current, pair, side, outcome, from, to, session, weekday]);

  // 累積損益 & KPI
  const { labels, equity, dd, kpi } = useMemo(() => {
    const s = [...filteredTrades].sort((a, b) => a.time - b.time);
    const labels = s.map((t) => t.time);
    const equity: number[] = [];
    let acc = 0;
    for (const t of s) {
      acc += t.profitJPY;
      equity.push(acc);
    }
    const dd = maxDrawdown(equity);
    const kpi = computeKPIs(s);
    return { labels, equity, dd, kpi };
  }, [filteredTrades]);

  // Chart.js 設定
  const data = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "累積損益（円）",
          data: equity,
          borderWidth: 2,
          borderColor: "#1976d2",
          pointRadius: 0,
          fill: false,
          tension: 0.2,
        },
      ],
    }),
    [labels, equity]
  );
  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      spanGaps: true,
      interaction: { mode: "index" as const, intersect: false },
      scales: {
        x: {
          type: "time" as const,
          adapters: { date: { locale: ja } },
          ticks: { maxRotation: 0 },
          time: { tooltipFormat: "yyyy/MM/dd HH:mm" },
        },
        y: {
          beginAtZero: true,
          ticks: { callback: (v: any) => new Intl.NumberFormat("ja-JP").format(v) + " 円" },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items: any) =>
              items[0]?.parsed?.x ? new Date(items[0].parsed.x).toLocaleString("ja-JP") : "",
            label: (item: any) =>
              `累積損益: ${new Intl.NumberFormat("ja-JP").format(item.parsed.y)} 円`,
          },
        },
      },
    }),
    []
  );

  // ---- UI ----
  return (
    <div style={{ width: "100%" }}>
      <div style={{ width: "100%" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
          {/* 左：CSV取り込み（ヘッダーに集約。CSV inputだけ非表示で残す） */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              multiple
              onChange={(e) => onFiles(e.target.files)}
              style={{ display: "none" }}
            />
          </div>

          {/* 右：KPI＋チャート */}
          <div>
            {/* ダッシュボードKPI */}
            <DashboardKPI trades={filteredTrades} />

            {/* 累積損益とドローダウン */}
            <section className="dash-row-2" style={{ marginBottom: 16 }}>
              <div className="dash-card">
                <h3 style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--muted)' }}>累積損益（Equity）</h3>
                <EquityChart trades={filteredTrades as any} />
              </div>
              <div className="dash-card">
                <h3 style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--muted)' }}>ドローダウン</h3>
                <DrawdownChart trades={filteredTrades as any} />
              </div>
            </section>

            {/* 日次損益と直近取引 */}
            <section className="dash-row-2" style={{ marginBottom: 16 }}>
              <div className="dash-card">
                <h3 style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--muted)' }}>日次損益</h3>
                <DailyProfitChart trades={filteredTrades as any} />
              </div>
              <div className="dash-card">
                <h3 style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--muted)' }}>直近の取引（上位/下位）</h3>
                <RecentTradesTable trades={filteredTrades as any} />
              </div>
            </section>

            {/* 今週のトレード */}
            <section className="dash-card" style={{ marginBottom: 16 }}>
              <h3 style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--muted)' }}>今週のトレード</h3>
              <WeekCalendar trades={filteredTrades as any} />
            </section>

            {/* セグメント分析 */}
            <section style={{ marginBottom: 16 }}>
              <SegmentCharts />
            </section>
            <SetupChart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquityCurvePage;
