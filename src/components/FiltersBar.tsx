import React from "react";
import { useDataset } from "../lib/dataset.context";
import { UI_TEXT } from "../lib/i18n";

const box: React.CSSProperties = { height: 36, border: "1px solid var(--line)", borderRadius: 12, background: "var(--surface)", padding: "0 10px" };

type DatePreset = "all"|"today"|"yesterday"|"last7"|"last30"|"thisMonth"|"lastMonth"|"last12"|"lastYear"|"ytd"|"custom";

export default function FiltersBar() {
  const { uiFilters, setUiFilters } = useDataset();
  const [datePreset, setDatePreset] = React.useState<DatePreset>("all");
  const [showModal, setShowModal] = React.useState(false);
  const [tempFrom, setTempFrom] = React.useState("");
  const [tempTo, setTempTo] = React.useState("");

  const getPresetLabel = () => {
    switch(datePreset) {
      case "all": return "期間";
      case "today": return "今日";
      case "yesterday": return "昨日";
      case "last7": return "過去7日間";
      case "last30": return "過去30日間";
      case "thisMonth": return "今月";
      case "lastMonth": return "先月";
      case "last12": return "過去12ヶ月";
      case "lastYear": return "昨年";
      case "ytd": return "年初来";
      case "custom": return uiFilters.from && uiFilters.to ? `${uiFilters.from} ~ ${uiFilters.to}` : "カスタム期間";
      default: return "期間";
    }
  };

  const handlePresetSelect = (preset: DatePreset) => {
    const today = new Date();
    let from: string | undefined;
    let to: string | undefined;

    switch(preset) {
      case "all":
        from = undefined;
        to = undefined;
        break;
      case "today":
        from = to = today.toISOString().split("T")[0];
        break;
      case "yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        from = to = yesterday.toISOString().split("T")[0];
        break;
      case "last7":
        const last7 = new Date(today);
        last7.setDate(last7.getDate() - 7);
        from = last7.toISOString().split("T")[0];
        to = today.toISOString().split("T")[0];
        break;
      case "last30":
        const last30 = new Date(today);
        last30.setDate(last30.getDate() - 30);
        from = last30.toISOString().split("T")[0];
        to = today.toISOString().split("T")[0];
        break;
      case "thisMonth":
        from = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
        to = today.toISOString().split("T")[0];
        break;
      case "lastMonth":
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        from = lastMonthStart.toISOString().split("T")[0];
        to = lastMonthEnd.toISOString().split("T")[0];
        break;
      case "last12":
        const last12 = new Date(today);
        last12.setMonth(last12.getMonth() - 12);
        from = last12.toISOString().split("T")[0];
        to = today.toISOString().split("T")[0];
        break;
      case "lastYear":
        from = new Date(today.getFullYear() - 1, 0, 1).toISOString().split("T")[0];
        to = new Date(today.getFullYear() - 1, 11, 31).toISOString().split("T")[0];
        break;
      case "ytd":
        from = new Date(today.getFullYear(), 0, 1).toISOString().split("T")[0];
        to = today.toISOString().split("T")[0];
        break;
      case "custom":
        setTempFrom(uiFilters.from || "");
        setTempTo(uiFilters.to || "");
        setShowModal(true);
        return;
    }

    setDatePreset(preset);
    setUiFilters({ from, to });
    setShowModal(false);
  };

  const handleApplyCustom = () => {
    setUiFilters({ from: tempFrom || undefined, to: tempTo || undefined });
    setDatePreset("custom");
    setShowModal(false);
  };

  return (
    <>
      <div className="filters-container" style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", width: "100%" }}>
        {/* 銘柄 */}
        <select value={uiFilters.symbol || ""} onChange={(e) => setUiFilters({ symbol: e.target.value || undefined })} style={{ ...box, flex: "1 1 auto", minWidth: 120 }}>
          <option value="">{UI_TEXT.symbol}</option>
          <optgroup label="メジャーペア">
            <option>USD/JPY</option><option>EUR/USD</option><option>GBP/USD</option><option>USD/CHF</option><option>AUD/USD</option><option>NZD/USD</option><option>USD/CAD</option>
          </optgroup>
          <optgroup label="クロス円">
            <option>EUR/JPY</option><option>GBP/JPY</option><option>AUD/JPY</option><option>CHF/JPY</option><option>CAD/JPY</option><option>NZD/JPY</option>
          </optgroup>
          <optgroup label="その他">
            <option>EUR/GBP</option><option>EUR/AUD</option><option>GBP/AUD</option><option>AUD/NZD</option>
          </optgroup>
        </select>

        {/* ポジション */}
        <select value={uiFilters.side || ""} onChange={(e) => setUiFilters({ side: (e.target.value as any) || undefined })} style={{ ...box, flex: "1 1 auto", minWidth: 120 }}>
          <option value="">{UI_TEXT.position}</option>
          <option value="LONG">{UI_TEXT.long}</option>
          <option value="SHORT">{UI_TEXT.short}</option>
        </select>

        {/* 損益 */}
        <select value={uiFilters.pnl || ""} onChange={(e) => setUiFilters({ pnl: (e.target.value as any) || undefined })} style={{ ...box, flex: "1 1 auto", minWidth: 120 }}>
          <option value="">{UI_TEXT.profit}</option>
          <option value="win">{UI_TEXT.winOnly}</option>
          <option value="loss">{UI_TEXT.lossOnly}</option>
        </select>

        {/* 期間プルダウン */}
        <div style={{ position: "relative", flex: "1 1 auto", minWidth: 120 }}>
          <button onClick={() => setShowModal(!showModal)} style={{ ...box, width: "100%", textAlign: "left", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{getPresetLabel()}</span>
            <span>▼</span>
          </button>

          {showModal && (
            <div style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              zIndex: 1000,
              maxWidth: "90vw",
              maxHeight: "90vh",
              overflow: "auto",
              padding: 16
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {[
                    { value: "all", label: "すべて" },
                    { value: "today", label: "今日" },
                    { value: "yesterday", label: "昨日" },
                    { value: "last7", label: "過去7日間" },
                    { value: "last30", label: "過去30日間" },
                    { value: "thisMonth", label: "今月" },
                    { value: "lastMonth", label: "先月" },
                    { value: "last12", label: "過去12ヶ月" },
                    { value: "lastYear", label: "昨年" },
                    { value: "ytd", label: "年初来" },
                    { value: "custom", label: "カスタム期間" }
                  ].map(item => (
                    <button
                      key={item.value}
                      onClick={() => handlePresetSelect(item.value as DatePreset)}
                      style={{
                        padding: "8px 12px",
                        textAlign: "left",
                        background: datePreset === item.value ? "var(--primary-light)" : "transparent",
                        border: "none",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontSize: 14
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div style={{ padding: 16, borderTop: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
                    <input
                      type="date"
                      value={tempFrom}
                      onChange={(e) => setTempFrom(e.target.value)}
                      style={{ ...box, width: "100%" }}
                    />
                    <span style={{ textAlign: "center" }}>~</span>
                    <input
                      type="date"
                      value={tempTo}
                      onChange={(e) => setTempTo(e.target.value)}
                      style={{ ...box, width: "100%" }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button
                      onClick={() => setShowModal(false)}
                      style={{
                        padding: "8px 24px",
                        border: "1px solid var(--line)",
                        borderRadius: 8,
                        background: "var(--surface)",
                        cursor: "pointer"
                      }}
                    >
                      Close
                    </button>
                    <button
                      onClick={handleApplyCustom}
                      style={{
                        padding: "8px 24px",
                        border: "none",
                        borderRadius: 8,
                        background: "#4ade80",
                        color: "white",
                        cursor: "pointer"
                      }}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 曜日 */}
        <select value={uiFilters.weekday || ""} onChange={(e) => setUiFilters({ weekday: (e.target.value as any) || undefined })} style={{ ...box, flex: "1 1 auto", minWidth: 120 }}>
          <option value="">曜日</option>
          <option value="weekdays">平日のみ</option>
          <option value="weekend">週末のみ</option>
          <optgroup label="個別選択">
            <option value="1">月曜</option><option value="2">火曜</option><option value="3">水曜</option><option value="4">木曜</option><option value="5">金曜</option><option value="6">土曜</option><option value="0">日曜</option>
          </optgroup>
        </select>

        {/* 時間帯 */}
        <select value={uiFilters.session || ""} onChange={(e) => setUiFilters({ session: (e.target.value as any) || undefined })} style={{ ...box, flex: "1 1 auto", minWidth: 120 }}>
          <option value="">時間帯</option>
          <option value="asia">アジア</option>
          <option value="london">ロンドン</option>
          <option value="ny">NY</option>
          <option value="thin">閑散</option>
        </select>
      </div>

      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 999
          }}
        />
      )}
    </>
  );
}
