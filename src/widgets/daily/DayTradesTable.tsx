import React from "react";
import type { DayTradeRow } from "./types";

type DayTradesTableProps = {
  trades: DayTradeRow[];
  onOpenTradesList?: () => void;
};

export function DayTradesTable({ trades, onOpenTradesList }: DayTradesTableProps) {
  return (
    <div className="section-block">
      <div className="section-header">
        <h3 className="section-title">この日の取引</h3>
        <button className="link-btn" onClick={onOpenTradesList}>
          取引一覧を開く
        </button>
      </div>

      {trades.length === 0 ? (
        <div className="empty-state">この日の取引はありません</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>決済時間</th>
              <th>銘柄</th>
              <th>方向</th>
              <th className="text-right">損益</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade, idx) => {
              const pnlClass = trade.pnlYen >= 0 ? "good" : "bad";
              const pnlLabel = trade.pnlYen >= 0 ? "+" : "";
              return (
                <tr
                  key={idx}
                  style={{ cursor: trade.ticket ? "pointer" : "default" }}
                  onClick={() => {
                    if (trade.ticket) {
                      location.hash = `/notebook/${trade.ticket}`;
                    }
                  }}
                >
                  <td>{trade.time}</td>
                  <td>{trade.symbol}</td>
                  <td>{trade.sideJp}</td>
                  <td className={`text-right ${pnlClass}`}>
                    {pnlLabel}{Math.round(trade.pnlYen).toLocaleString("ja-JP")}円
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
