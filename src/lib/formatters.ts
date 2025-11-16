export const fmt = {
  datetime_utc: (v: string|Date) => {
    const d = typeof v === "string" ? new Date(v) : v;
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hour = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${year}年${month}月${day}日 ${hour}:${min}`;
  },
  datetime_simple: (v: string|Date) => {
    const d = typeof v === "string" ? new Date(v) : v;
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hour = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${year}年${month}月${day}日 ${hour}:${min}`;
  },
  yen_signed_colored: (n?: number) => {
    if (n == null) return { text: "—", cls: "" };
    const sign = n >= 0 ? "+" : "−";
    const cls  = n >= 0 ? "pnl-pos" : "pnl-neg";
    return { text: `${sign}${Math.abs(n).toLocaleString("ja-JP")}円`, cls };
  },
  pips_signed_colored: (n?: number) => {
    if (n == null) return { text: "—", cls: "" };
    const sign = n >= 0 ? "+" : "−";
    const cls  = n >= 0 ? "pnl-pos" : "pnl-neg";
    return { text: `${sign}${Math.abs(n).toFixed(1)}`, cls };
  },
  r_1: (n?: number) => (n==null ? "—" : `${n.toFixed(1)}R`),
  int: (n?: number) => (n==null ? "—" : Math.round(n).toString()),
  lots: (n?: number) => (n==null ? "—" : n.toFixed(2)),
  note_icon: (note?: string) => {
    if (!note || note.trim() === "") return "—";
    return { text: "📝", cls: "note-icon" };
  },
  symbol: (s?: string) => (s || "—"),
  side_caps: (s?: string) => {
    if (!s) return "—";
    if (s === "LONG" || s === "BUY" || s === "買い") return { text: "買い", cls: "side-long" };
    if (s === "SHORT" || s === "SELL" || s === "売り") return { text: "売り", cls: "side-short" };
    return s;
  },
  price_raw: (n?: number) => (n==null ? "—" : n.toString()),
  price_with_unit: (n?: number) => {
    if (n == null) return "—";
    return n.toFixed(3);
  }
};

export function formatJPY(value: number): string {
  return `${Math.round(value).toLocaleString('ja-JP')}円`;
}

export function formatJPYSigned(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${formatJPY(value)}`;
}

export function getPnLColor(value: number): string {
  return value >= 0 ? 'var(--gain)' : 'var(--loss)';
}

export const pnlStyle = {
  fontWeight: 700 as const
};
