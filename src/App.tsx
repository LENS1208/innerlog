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
import JournalNotesPage from "./pages/JournalNotesPage";
import AiProposalPage from "./pages/AiProposalPage";
import AiEvaluationPage from "./pages/AiEvaluationPage";
import SettingsPage from "./pages/SettingsPage";

type NewRoute = "/dashboard" | "/calendar" | `/calendar/day/${string}` | "/trades" | "/reports" | `/reports/${string}` | "/notebook" | `/notebook/${string}` | "/settings" | "/journal-v0" | "/ai-proposal" | "/ai-evaluation";

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
  if (h.startsWith("/forecast")) return "/ai-proposal";
  if (h === "/notebook" || h.startsWith("/notebook/")) return h as NewRoute;
  if (h.startsWith("/settings")) return "/settings";
  if (h === "/journal-v0") return "/journal-v0";
  if (h.startsWith("/ai-proposal")) return "/ai-proposal";
  if (h.startsWith("/ai-evaluation")) return "/ai-evaluation";

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
  else if (route.startsWith("/calendar/day/")) {
    const dateKey = route.split("/")[3] ?? "";
    Page = <DailyNotePage kpi={{ dateJst: dateKey } as any} />;
  }
  else if (route === "/trades") Page = <TradeListPage />;
  else if (route.startsWith("/reports")) Page = <ReportsPage />;
  else if (route === "/notebook") Page = <JournalNotesPage />;
  else if (route.startsWith("/notebook/")) {
    const entryId = route.split("/")[2] ?? "";
    Page = <TradeDiaryPage entryId={entryId as any} />;
  }
  else if (route === "/settings") Page = <SettingsPage />;
  else if (route === "/ai-proposal") {
    const mockData = {
      hero: {
        pair: 'USD/JPY',
        bias: 'BUY' as const,
        confidence: 82,
        nowYen: 153.77,
        buyEntry: '153.45円',
        sellEntry: '154.20円',
      },
      daily: {
        stance: '戻り売り優先',
        session: '10:00–12:00 / 16:00–17:30',
        anchor: 'R:148.20 / S:147.00',
        riskNote: '要人発言・雇用ヘッドライン',
      },
      scenario: {
        strong: '147.0 反発 → 148.5 ブレイクで追随',
        base: '147.0–148.2 レンジ。方向感出るまでロット抑制',
        weak: '146.9 明確割れで戻り売り。ターゲット 146.2',
      },
      ideas: [
        {
          id: '1',
          side: '売り' as const,
          entry: '147.80 抵抗戻り',
          slPips: 15,
          tpPips: -35,
          expected: 0.42,
          confidence: '◎' as const,
        },
        {
          id: '2',
          side: '買い' as const,
          entry: '147.05 押し目',
          slPips: -15,
          tpPips: 30,
          expected: 0.25,
          confidence: '○' as const,
        },
      ],
      factors: {
        technical: [
          'MA：短期 ＞ 長期（強気）',
          'RSI：54（中立→やや強気）',
          'ATR(20)：0.65%（低下傾向）',
          '価格帯：R=148.20 / S=147.00',
        ],
        fundamental: [
          'NFP 予想 +17万人（前回 +18万人）',
          '金利据置確率：72%',
          'Core CPI：0.2% m/m（鈍化）',
          '日銀：据置トーン',
        ],
        sentiment: [
          'ポジション：CFTC 円ショート増加',
          '1W RR：+0.3（コール優位）',
          'ニュース／SNS：やや強気',
        ],
      },
      notes: {
        memo: [
          '米金利とDXYが同方向に上昇。USD買い優勢の地合い。',
          '直近ニュース：原油下落でインフレ圧力やや低下。',
          'オプション市場で上方向のヘッジ需要が増加。',
        ],
      },
    };
    Page = <AiProposalPage {...mockData} />;
  }
  else if (route === "/ai-evaluation") {
    Page = <AiEvaluationPage />;
  }
  else {
    Page = <EquityCurvePage />;
  }

  return <AppShell>{Page}</AppShell>;
}
