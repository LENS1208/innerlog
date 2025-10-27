import React from "react";
import type { DailyKpi } from "./types";

type TopBarProps = {
  kpi: DailyKpi;
  onPrevDay?: () => void;
  onNextDay?: () => void;
};

export function TopBar({ kpi, onPrevDay, onNextDay }: TopBarProps) {
  const dateLabel = `${kpi.dateJst.split("-")[0]}年${kpi.dateJst.split("-")[1]}月${kpi.dateJst.split("-")[2]}日（${kpi.weekdayJp}）`;
  const dayTotalLabel = kpi.dayTotalYen >= 0 ? "+" : "";
  const dayTotalClass = kpi.dayTotalYen >= 0 ? "good" : "bad";

  return (
    <div className="topbar">
      <div className="topbar-date">{dateLabel}</div>
      <div className="topbar-total">
        <div className="label">日合計</div>
        <div className={`amount ${dayTotalClass}`}>
          {dayTotalLabel}{Math.round(kpi.dayTotalYen).toLocaleString("ja-JP")}円
        </div>
      </div>
      <div className="topbar-nav">
        <button
          className="nav-btn"
          onClick={onPrevDay}
          aria-label="前日"
        >
          前日
        </button>
        <button
          className="nav-btn"
          onClick={onNextDay}
          aria-label="翌日"
        >
          翌日
        </button>
      </div>
    </div>
  );
}
