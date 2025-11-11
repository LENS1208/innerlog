import type { Trade } from "./types";

/** ヘッダのゆらぎ対応 */
const alias = {
  datetime: ["datetime","日時","date","time","日時年月日"],
  pair: ["pair","通貨ペア","symbol","シンボル"],
  side: ["side","方向","dir","longshort"],
  volume: ["volume","qty","lot","数量","取引量"],
  profitYen: ["profit","損益","pl","p/l","損益円"],
  pips: ["pips","pip","損益pips"],
  memo: ["memo","note","ノート","メモ"],
} as const;

const keyOf = (raw: string) => {
  const s = raw.trim().toLowerCase();
  for (const k of Object.keys(alias) as (keyof typeof alias)[])
    if (alias[k].some(a => a.toLowerCase() === s)) return k;
  return null;
};

export async function parseCsv(file: File): Promise<Trade[]> {
  const text = await file.text();
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const headers = lines[0].split(/,|\t/);
  const idx: Partial<Record<keyof typeof alias, number>> = {};
  headers.forEach((h,i) => { const k = keyOf(h); if (k) idx[k] = i; });

  const body = lines.slice(1);
  return body.map((row, n) => {
    const cols = row.split(/,|\t/).map(c => c.trim());
    const pick = (k: keyof typeof alias) => {
      const i = idx[k]; return i === undefined ? "" : (cols[i] ?? "");
    };
    const sideRaw = pick("side").toUpperCase();
    return {
      id: `csv-${n}-${pick("datetime")}-${pick("pair")}`,
      datetime: pick("datetime"),
      pair: pick("pair") || "UNKNOWN",
      side: sideRaw.includes("SHORT") || sideRaw === "S" ? "SHORT" : "LONG",
      volume: Number(pick("volume")) || 0,
      profitYen: Number(pick("profitYen")) || 0,
      pips: Number(pick("pips")) || 0,
      memo: pick("memo") || "",
    } satisfies Trade;
  });
}
// src/lib/types.ts
export type Trade = {
  id: string;
  datetime: string;          // Close Time
  pair: string;
  side: "LONG" | "SHORT";
  volume: number;
  profitYen: number;
  pips: number;
  memo?: string;

  // 追加読み取り（任意）
  ticket?: string;
  openTime?: string;
  openPrice?: number;
  closePrice?: number;
  stopPrice?: number;
  targetPrice?: number;
  commission?: number;
  swap?: number;
  comment?: string;
};

// src/lib/csv.ts もしくは TradeListPage.tsx の parseCsvText を置換
import type { Trade } from "./types";

const norm = (s: string) =>
  s.toLowerCase().replace(/\s+/g, "").replace(/[／\/]/g, "/").replace(/[（）()]/g, "");

const toNumLoose = (s: string) => {
  const t = (s || "").replace(/[^\d.\-]/g, "");  // ¥, カンマ, 単位除去
  const n = Number(t);
  return Number.isFinite(n) ? n : 0;
};

const isJpyCross = (pair: string) => /JPY$/i.test((pair || "").trim());

export function parseCsvText(text: string): Trade[] {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];

  const rawHeaders = lines[0].split(/,|\t/).map((h) => h.trim());
  const H = rawHeaders.map(norm);
  const idx = (cands: string[]) => {
    for (const c of cands.map(norm)) {
      const i = H.indexOf(c);
      if (i >= 0) return i;
    }
    return -1;
  };

  // 列位置（候補を広く持つ）
  const iTicket    = idx(["ticket", "order"]);
  const iPair      = idx(["item", "pair", "symbol", "銘柄"]);
  const iType      = idx(["type", "side", "方向"]);
  const iSize      = idx(["size", "lot", "lots", "qty", "数量", "取引量"]);
  const iOpenTime  = idx(["opentime", "open time"]);
  const iOpenPrice = idx(["openprice", "open price", "entry", "entryprice"]);
  const iCloseTime = idx(["closetime", "close time", "time", "datetime", "日時"]);
  const iClosePrice= idx(["closeprice", "close price", "exit", "exitprice", "price"]); // price が2回あるCSVには注意
  const iSL        = idx(["s/l", "sl", "stopprice", "stop"]);
  const iTP        = idx(["t/p", "tp", "targetprice", "target"]);
  const iComm      = idx(["commission", "commissions", "fee", "fees"]);
  const iSwap      = idx(["swap", "swaps"]);
  const iProfit    = idx(["profit", "損益", "pl", "p/l", "profit¥", "profit(¥)"]);
  const iPips      = idx(["pips", "pip", "損益pips"]);
  const iComment   = idx(["comment"]);

  // price が2回ある（open/close）パターンの救済
  const priceIdxs = H.map((h, i) => (h === "price" ? i : -1)).filter((i) => i >= 0);
  const iEntryFallback = iOpenPrice >= 0 ? iOpenPrice : (priceIdxs[0] ?? -1);
  const iExitFallback  = iClosePrice >= 0 ? iClosePrice : (priceIdxs[1] ?? priceIdxs[0] ?? -1);

  console.log(`📋 CSV Parser - Column indices:`, {
    ticket: iTicket,
    openTime: iOpenTime,
    openPrice: iOpenPrice,
    closeTime: iCloseTime,
    closePrice: iClosePrice,
    iEntryFallback,
    iExitFallback,
    priceIdxs
  });

  const body = lines.slice(1);

  return body.map((row, n) => {
    const cols = row.split(/,|\t/).map((c) => c.trim());
    const get  = (i: number) => (i >= 0 ? cols[i] ?? "" : "");

    // 必須の補完（日時優先順）
    const openTime  = get(iOpenTime);
    const closeTime = get(iCloseTime) || openTime;
    const pair      = get(iPair) || "USDJPY";
    const sideRaw   = get(iType).toLowerCase();
    const side: "LONG" | "SHORT" =
      /short|sell|\bs\b/.test(sideRaw) ? "SHORT" :
      /long|buy|\bl\b/.test(sideRaw)  ? "LONG"  : "LONG";

    const entry = toNumLoose(get(iEntryFallback));
    const exit  = toNumLoose(get(iExitFallback));
    const size  = toNumLoose(get(iSize));
    const profitYen = toNumLoose(get(iProfit));
    let pips   = toNumLoose(get(iPips));

    if (n === 0) {
      console.log(`📊 First trade CSV data:`, {
        ticket: get(iTicket),
        entry,
        exit,
        pips,
        pair,
        side,
        rawEntry: get(iEntryFallback),
        rawExit: get(iExitFallback)
      });
    }

    // pips 自動計算（CSVになければ Open/Close から）
    if (!pips && entry && exit) {
      const mult = isJpyCross(pair) ? 100 : 10000;
      const diff = side === "LONG" ? (exit - entry) : (entry - exit);
      pips = +(diff * mult).toFixed(1);
      if (n === 0) {
        console.log(`🧮 Calculated pips:`, { mult, diff, pips });
      }
    }

    // 保有時間計算（分）
    let holdTimeMin: number | undefined;
    if (openTime && closeTime) {
      try {
        const openMs = new Date(openTime).getTime();
        const closeMs = new Date(closeTime).getTime();
        if (!isNaN(openMs) && !isNaN(closeMs)) {
          holdTimeMin = Math.round((closeMs - openMs) / 60000);
        }
      } catch {
        // ignore
      }
    }

    return {
      id: `csv-${n}-${closeTime}-${pair}`,
      datetime: closeTime,
      pair,
      side,
      volume: size,
      profitYen,
      pips,
      memo: "",

      // 追加フィールド
      ticket: get(iTicket),
      openTime,
      openPrice: entry || undefined,
      closeTime,
      closePrice: exit || undefined,
      stopPrice: toNumLoose(get(iSL)) || undefined,
      targetPrice: toNumLoose(get(iTP)) || undefined,
      commission: toNumLoose(get(iComm)) || undefined,
      swap: toNumLoose(get(iSwap)) || undefined,
      comment: get(iComment) || undefined,
      holdTimeMin,

      // エイリアス（後方互換）
      symbol: pair,
      action: side,
      profit: profitYen,
    } as Trade;
  });
}
