import React from "react";
import DayTradesTable from "../components/daily/DayTradesTable";
import LinkedNotesTable from "../components/daily/LinkedNotesTable";
import AiAdviceBlock from "../components/daily/AiAdviceBlock";
import type { DailyNotePageProps } from "../components/daily/types";
import "./dailyNote.css";

const DUMMY_DATA: DailyNotePageProps = {
  kpi: {
    winRate: 66.7,
    tradeCount: 6,
    winCount: 4,
    lossCount: 2,
    avgPnLPerTradeYen: 1250,
    profitFactor: 2.15,
    totalPips: 42.3,
    dayTotalYen: 7500,
    dateJst: "2025-10-04",
    weekdayJp: "土",
  },
  trades: [
    { time: "08:12", symbol: "USDJPY", sideJp: "買い", pnlYen: 3200, ticket: "100123" },
    { time: "10:45", symbol: "EURUSD", sideJp: "売り", pnlYen: -1800, ticket: "100124" },
    { time: "13:30", symbol: "GBPJPY", sideJp: "買い", pnlYen: 2400, ticket: "100125" },
    { time: "15:20", symbol: "USDJPY", sideJp: "売り", pnlYen: 1900, ticket: "100126" },
    { time: "17:05", symbol: "AUDUSD", sideJp: "買い", pnlYen: -950, ticket: "100127" },
    { time: "19:40", symbol: "EURUSD", sideJp: "買い", pnlYen: 2750, ticket: "100128" },
  ],
  linkedNotes: [
    {
      title: "2025-10-04（土）｜日次ノート",
      kind: "日次",
      updatedAt: "2025/10/04 20:15",
    },
    {
      title: "USDJPY 買いポジション #100123",
      kind: "取引",
      updatedAt: "2025/10/04 08:30",
    },
  ],
  advice: {
    items: [
      "今日の勝率は66.7%と良好です。引き続き慎重なエントリーを心がけましょう。",
      "EURUSDで2回取引していますが、1勝1敗です。通貨ペアごとのパターンを見直してみましょう。",
      "損切りが適切に機能しています。この調子でリスク管理を継続してください。",
      "午前中の取引が好調です。時間帯ごとの傾向を分析してみると良いでしょう。",
    ],
    lastUpdated: "2025/10/04 20:30",
    pinned: false,
  },
};

export default function DailyNotePage(props?: Partial<DailyNotePageProps>) {
  const mergedProps = { ...DUMMY_DATA, ...props };

  const handlePrevDay = () => console.log("前日へ");
  const handleNextDay = () => console.log("翌日へ");
  const handleSave = (payload: any) => {
    console.log("保存:", payload);
    if (mergedProps.onSave) mergedProps.onSave(payload);
  };
  const handleOpenTradesList = () => console.log("取引一覧を開く");
  const handleOpenNote = (title: string) => console.log("ノートを開く:", title);
  const handleGenerateAdvice = () => console.log("アドバイスを生成");
  const handleRegenerateAdvice = () => console.log("再生成");
  const handlePinAdvice = () => console.log("固定");

  return (
    <div className="daily-note-page">
      <div style={{ padding: "16px", background: "var(--bg-secondary)", marginBottom: "16px", borderRadius: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <button onClick={mergedProps.onPrevDay || handlePrevDay}>← 前日</button>
          <h2>{mergedProps.kpi.dateJst} ({mergedProps.kpi.weekdayJp})</h2>
          <button onClick={mergedProps.onNextDay || handleNextDay}>翌日 →</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          <div><strong>勝率:</strong> {mergedProps.kpi.winRate}%</div>
          <div><strong>トレード数:</strong> {mergedProps.kpi.tradeCount}</div>
          <div><strong>平均損益:</strong> {mergedProps.kpi.avgPnLPerTradeYen}円</div>
          <div><strong>合計損益:</strong> {mergedProps.kpi.dayTotalYen}円</div>
        </div>
      </div>

      <div className="two-col-layout">
        <div style={{ padding: "16px", background: "var(--bg-card)", borderRadius: "8px" }}>
          <h3>日誌カード</h3>
          <button onClick={() => (mergedProps.onSave || handleSave)({})}>保存</button>
        </div>

        <div className="right-panel">
          <div className="panel-card">
            <DayTradesTable
              trades={mergedProps.trades}
              onOpenTradesList={mergedProps.onOpenTradesList || handleOpenTradesList}
            />

            <LinkedNotesTable
              notes={mergedProps.linkedNotes}
              onOpenNote={mergedProps.onOpenNote || handleOpenNote}
            />

            <AiAdviceBlock
              advice={mergedProps.advice}
              onGenerateAdvice={mergedProps.onGenerateAdvice || handleGenerateAdvice}
              onRegenerateAdvice={mergedProps.onRegenerateAdvice || handleRegenerateAdvice}
              onPinAdvice={mergedProps.onPinAdvice || handlePinAdvice}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
