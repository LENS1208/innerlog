import React, { useEffect, useState } from "react";
import AppShell from "./shells/AppShell";

// 既存 widgets をそのまま使う（後で pages に移す）
import DashboardKPI from "./widgets/DashboardKPI";
import ForecastHybrid from "./widgets/ForecastHybrid";
import EquityCurvePage from "./widgets/EquityCurvePage"; // 使わない場合は後で削除
import TradeListPage from "./widgets/TradeListPage";
import TradeDiaryPage from "./widgets/TradeDiaryPage";
import DiaryIndexPage from "./widgets/DiaryIndexPage";
import MonthlyCalendar from "./widgets/MonthlyCalendar";
import ReportsPage from "./widgets/ReportsPage";
import CalendarDayPage from "./widgets/CalendarDayPage";
import DailyNotePage from "./widgets/DailyNotePage";

type NewRoute = "/dashboard" | "/calendar" | `/calendar/day/${string}` | "/trades" | "/reports" | `/reports/${string}` | "/forecast" | "/notebook" | `/notebook/${string}` | "/settings";

function parseHashToNewRoute(): NewRoute {
  const h = location.hash.replace(/^#/, "");

  // 旧→新の読み替え（互換） 
  if (h.startsWith("/kpi")) return "/dashboard";
  if (h.startsWith("/equity")) return "/dashboard";
  if (h === "/") return "/dashboard";
  if (h.startsWith("/trade-diary")) {
    const id = h.split("/")[2];
    return id ? `/notebook/${id}` : "/notebook";
  }
  if (h.startsWith("/new-diary")) return "/notebook";
  if (h === "/journal" || h.startsWith("/journal/")) {
    const id = h.split("/")[2];
    return id ? `/notebook/${id}` : "/notebook";
  }

  // 新ルート群
  if (h.startsWith("/dashboard")) return "/dashboard";
  if (h.startsWith("/calendar/day/")) return h as NewRoute;
  if (h.startsWith("/calendar")) return "/calendar";
  if (h.startsWith("/trades")) return "/trades";
  if (h.startsWith("/reports")) return h as NewRoute;
  if (h.startsWith("/forecast")) return "/forecast";
  if (h === "/notebook" || h.startsWith("/notebook/")) return h as NewRoute;
  if (h.startsWith("/settings")) return "/settings";

  return "/dashboard";
}

export default function App() {
  const [route, setRoute] = useState<NewRoute>(parseHashToNewRoute());
  console.log("🔄 App render - route:", route);
  useEffect(() => {
    const onHash = () => {
      console.log("🔄 hashchange event");
      setRoute(parseHashToNewRoute());
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  let Page: JSX.Element;
  if (route === "/dashboard") Page = <EquityCurvePage />;
  else if (route === "/calendar") Page = <MonthlyCalendar />;
  else if (route.startsWith("/calendar/day/")) Page = <DailyNotePage />;
  else if (route === "/trades") Page = <TradeListPage />;
  else if (route.startsWith("/reports")) Page = <ReportsPage />;
  else if (route === "/forecast") Page = <ForecastHybrid />;
  else if (route === "/notebook") Page = <DiaryIndexPage />;
  else if (route.startsWith("/notebook/")) {
    const entryId = route.split("/")[2] ?? "";
    Page = <TradeDiaryPage entryId={entryId as any} />;
  }
  else if (route === "/settings") Page = <div style={{padding: 40, textAlign: "center"}}>設定（準備中）</div>;
  else {
    Page = <EquityCurvePage />;
  }

  return <AppShell>{Page}</AppShell>;
}
