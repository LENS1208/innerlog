export const fmt = {
  datetime_utc: (v: string|Date) => {
    const d = typeof v === "string" ? new Date(v) : v;
    return d.toISOString().slice(0,16).replace("T"," ") + " UTC";
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
  int: (n?: number) => (n==null ? "—" : Math.round(n).toString())
};
