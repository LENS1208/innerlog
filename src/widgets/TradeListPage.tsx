// src/widgets/TradeListPage.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Trade } from "../lib/types";
import TradesTable from "../components/TradesTable";
import { parseCsvText } from "../lib/csv";
import { useDataset, Filters } from "../lib/dataset.context";
import { getAllTrades, dbToTrade } from "../lib/db.service";

function mapToRow(t: Trade) {
  return {
    ticket: t.ticket || t.id,
    datetime: t.datetime,
    symbol: t.pair,
    side: t.side,
    pnl_jpy: t.profitYen,
    pips: t.pips,
    size: t.volume,
    entry: t.openPrice,
    exit: t.closePrice,
    note: t.memo || t.comment || "",
  };
}

function applyFiltersToRows(rows: any[], filters: Filters) {
  const toUTC = (d: string | Date) => (typeof d === "string" ? new Date(d) : d);
  const weekdayOf = (d: Date) => d.getUTCDay();
  const sessionOf = (h: number) => (h >= 5 && h <= 15 ? "asia" : h >= 16 && h <= 21 ? "london" : h >= 22 || h <= 1 ? "ny" : "thin");
  const normalizeSymbol = (s: string) => s.toUpperCase().replace(/[^A-Z]/g, "");

  return rows.filter((r) => {
    const dt = toUTC(r.datetime as any);
    if (Number.isNaN(dt.getTime())) return false;

    const hour = dt.getUTCHours();
    const wday = weekdayOf(dt);

    if (filters.symbol && normalizeSymbol(r.symbol) !== normalizeSymbol(filters.symbol)) return false;
    if (filters.session && sessionOf(hour) !== filters.session) return false;

    if (filters.weekday) {
      if (filters.weekday === "weekdays" && (wday === 0 || wday === 6)) return false;
      if (filters.weekday === "weekend" && (wday !== 0 && wday !== 6)) return false;
      if (/^[0-6]$/.test(filters.weekday) && Number(filters.weekday) !== wday) return false;
    }

    if (filters.side && r.side !== filters.side) return false;

    if (filters.pnl) {
      if (filters.pnl === "win" && !(r.pnl_jpy > 0)) return false;
      if (filters.pnl === "loss" && !(r.pnl_jpy < 0)) return false;
    }

    if (filters.from && dt < new Date(filters.from + "T00:00:00Z")) return false;
    if (filters.to && dt > new Date(filters.to + "T23:59:59Z")) return false;

    return true;
  });
}

export default function TradeListPage() {
  console.log("🔄 TradeListPage render");
  const [srcRows, setSrcRows] = useState<Trade[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const { filters, dataset, useDatabase } = useDataset();

  // データ読み込み
  useEffect(() => {
    console.log("📥 TradeListPage: Loading data", { useDatabase, dataset });
    setLoading(true);
    (async () => {
      if (useDatabase) {
        try {
          const dbTrades = await getAllTrades();
          const trades = dbTrades.map(dbToTrade);
          console.log("✅ Loaded from database:", trades.length);
          setSrcRows(trades);
        } catch (err) {
          console.error("❌ Error loading from database:", err);
          setSrcRows([]);
        }
      } else {
        const candidates = [
          `/demo/${dataset}.csv`,
          `/demo/sample/${dataset}.csv`,
          `/demo/demo_${dataset}.csv`,
        ];
        for (const url of candidates) {
          try {
            console.log("🔍 Trying:", url);
            const cacheBuster = `?t=${Date.now()}`;
            const res = await fetch(url + cacheBuster, { cache: "no-store" });
            if (!res.ok) {
              console.log("❌ Failed:", url, res.status);
              continue;
            }
            const text = await res.text();
            const trades = parseCsvText(text);
            console.log("✅ Parsed trades:", trades.length, "from", url);
            if (Array.isArray(trades) && trades.length) {
              setSrcRows(trades);
              setLoading(false);
              return;
            }
          } catch (err) {
            console.error("❌ Error loading", url, err);
          }
        }
        console.log("⚠️ No data loaded, setting empty array");
        setSrcRows([]);
      }
      setLoading(false);
    })();
  }, [dataset, useDatabase]);

  // バナーのボタン（fx:openUpload / fx:preset）と連携
  useEffect(() => {
    const openUpload = () => {
      console.log('📤 Upload button clicked, opening file dialog');
      fileRef.current?.click();
    };
    const onPreset = (e: Event) => {
      const n = (e as CustomEvent<"A" | "B" | "C">).detail;
      if (!n) return;
      const candidates = [
        `/demo/${n}.csv`,
        `/demo/sample/${n}.csv`,
        `/demo/demo_${n}.csv`,
      ];
      (async () => {
        for (const url of candidates) {
          try {
            const cacheBuster = `?t=${Date.now()}`;
            const r = await fetch(url + cacheBuster, { cache: "no-store" });
            if (!r.ok) continue;
            const t = await r.text();
            const tr = parseCsvText(t);
            if (Array.isArray(tr) && tr.length) {
              setSrcRows(tr);
              return;
            }
          } catch {}
        }
        setSrcRows([]);
      })();
    };
    (window as any).addEventListener("fx:openUpload", openUpload);
    (window as any).addEventListener("fx:preset", onPreset);
    return () => {
      (window as any).removeEventListener("fx:openUpload", openUpload);
      (window as any).removeEventListener("fx:preset", onPreset);
    };
  }, []);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    console.log('📂 File selected');
    const f = e.target.files?.[0];
    if (!f) {
      console.log('⚠️ No file selected');
      return;
    }

    console.log('📄 File:', f.name, 'Size:', f.size, 'bytes');
    console.log('🗂️ useDatabase:', useDatabase);

    try {
      const text = await f.text();
      console.log('📝 File content length:', text.length);

      const trades = parseCsvText(text);
      console.log('📊 Parsed trades:', trades.length);

      if (useDatabase && trades.length > 0) {
        console.log('💾 Saving to database...');
        const dbTrades = trades.map(tradeToDb);
        console.log('🔄 Converted to DB format:', dbTrades.length);

        await insertTrades(dbTrades);
        console.log(`✅ Uploaded ${trades.length} trades to database`);

        const dbData = await getAllTrades();
        console.log('📥 Retrieved from database:', dbData.length);
        setSrcRows(dbData.map(dbToTrade));
      } else {
        console.log('📝 Setting trades in memory (useDatabase=' + useDatabase + ')');
        setSrcRows(trades);
      }
    } catch (err) {
      console.error('❌ Error uploading file:', err);
      alert('ファイルのアップロードに失敗しました: ' + (err as Error).message);
    }

    if (fileRef.current) fileRef.current.value = "";
  }

  const allRows = useMemo(() => {
    console.log("🔄 Computing rows. srcRows:", srcRows.length, "filters:", filters);
    const mapped = (srcRows || []).map(mapToRow);
    console.log("📊 Mapped rows:", mapped.length);
    const filtered = applyFiltersToRows(mapped, filters);
    console.log("✅ Filtered rows:", filtered.length);
    return filtered;
  }, [srcRows, filters]);

  const totalPages = Math.ceil(allRows.length / rowsPerPage);
  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;
  const paginatedRows = allRows.slice(startIdx, endIdx);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, rowsPerPage]);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={onPick} style={{ display: "none" }} />

      {/* テスト用の直接アップロードボタン */}
      <div style={{ padding: 16, background: "var(--surface)", borderRadius: 12, border: "1px solid var(--line)" }}>
        <button
          onClick={() => {
            console.log('🔘 Direct upload button clicked');
            fileRef.current?.click();
          }}
          style={{
            padding: "12px 24px",
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600
          }}
        >
          📤 CSVファイルをアップロード（テスト）
        </button>
        <span style={{ marginLeft: 16, color: "var(--muted)", fontSize: 14 }}>
          useDatabase: {useDatabase ? "ON" : "OFF"}
        </span>
      </div>

      <TradesTable rows={paginatedRows as any[]} />

      {/* Pagination Controls */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px",
        background: "var(--surface)",
        borderRadius: 12,
      }}>
        {/* Page Navigation */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              padding: "8px 12px",
              border: "1px solid var(--line)",
              borderRadius: 6,
              background: currentPage === 1 ? "var(--muted-bg)" : "white",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              color: currentPage === 1 ? "var(--muted)" : "var(--text)",
            }}
          >
            ←
          </button>

          {Array.from({ length: Math.min(6, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 6) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 5 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                style={{
                  padding: "8px 12px",
                  border: "1px solid var(--line)",
                  borderRadius: 6,
                  background: currentPage === pageNum ? "var(--accent)" : "white",
                  color: currentPage === pageNum ? "white" : "var(--text)",
                  cursor: "pointer",
                  fontWeight: currentPage === pageNum ? 600 : 400,
                }}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: "8px 12px",
              border: "1px solid var(--line)",
              borderRadius: 6,
              background: currentPage === totalPages ? "var(--muted-bg)" : "white",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              color: currentPage === totalPages ? "var(--muted)" : "var(--text)",
            }}
          >
            →
          </button>
        </div>

        {/* Records per page selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14, color: "var(--muted)" }}>表示件数:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
            style={{
              padding: "6px 32px 6px 12px",
              border: "1px solid var(--line)",
              borderRadius: 6,
              background: "var(--accent)",
              color: "white",
              fontSize: 14,
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>
    </div>
  );
}
