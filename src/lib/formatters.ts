export const fmt = {
  datetime_utc: (v: string|Date) => {
    const d = typeof v === "string" ? new Date(v) : v;
    return d.toISOString().slice(0,16).replace("T"," ") + " UTC";
  },
  datetime_simple: (v: string|Date) => {
    const d = typeof v === "string" ? new Date(v) : v;
    return d.toISOString().slice(0,16).replace("T"," ");
  },
  yen_signed_colored: (n?: number) => {
    if (n == null) return { text: "—", cls: "" };
    const sign = n >= 0 ? "+" : "−";
    const cls  = n >= 0 ? "pnl-pos" : "pnl-neg";
    return { text: `${sign}¥${Math.abs(n).toLocaleString("ja-JP")}`, cls };
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
  side_caps: (s?: string) => (s || "—"),
  price_raw: (n?: number) => (n==null ? "—" : n.toString())
};
