import React, { useEffect, useState } from "react";
import { useDataset } from "../lib/dataset.context";

const ReportsTimeAxis = () => (
  <div style={{ width: "100%", height: "calc(100vh - 160px)", overflow: "auto" }}>
    <iframe
      src="/reports/time/analysis_time_v_0.html"
      style={{
        width: "100%",
        height: "100%",
        border: "none",
        backgroundColor: "var(--bg)"
      }}
      title="時間軸レポート"
    />
  </div>
);
const ReportsMarket = () => <div style={{ padding: "20px" }}><h3>市場レポート</h3><p>準備中</p></div>;
const ReportsStrategy = () => <div style={{ padding: "20px" }}><h3>戦略レポート</h3><p>準備中</p></div>;
const ReportsRisk = () => <div style={{ padding: "20px" }}><h3>リスクレポート</h3><p>準備中</p></div>;

type TabKey = "time" | "market" | "strategy" | "risk";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    const hash = location.hash.replace(/^#\/reports\/?/, "") || "time";
    return ["time", "market", "strategy", "risk"].includes(hash) ? (hash as TabKey) : "time";
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = location.hash.replace(/^#\/reports\/?/, "") || "time";
      const tab: TabKey = ["time", "market", "strategy", "risk"].includes(hash) ? (hash as TabKey) : "time";
      setActiveTab(tab);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const tabs: { key: TabKey; label: string }[] = [
    { key: "time", label: "時間軸" },
    { key: "market", label: "市場・銘柄" },
    { key: "strategy", label: "戦略・行動" },
    { key: "risk", label: "リスク・分布" },
  ];

  return (
    <div style={{ width: "100%" }}>
      {/* タブナビゲーション */}
      <nav
        style={{
          display: "flex",
          gap: 4,
          borderBottom: "1px solid var(--line)",
          marginBottom: 20,
          overflowX: "auto",
        }}
      >
        {tabs.map((tab) => (
          <a
            key={tab.key}
            href={`#/reports/${tab.key}`}
            onClick={(e) => {
              e.preventDefault();
              location.hash = `/reports/${tab.key}`;
            }}
            style={{
              padding: "12px 20px",
              textDecoration: "none",
              color: activeTab === tab.key ? "var(--accent)" : "var(--ink)",
              borderBottom: activeTab === tab.key ? "2px solid var(--accent)" : "2px solid transparent",
              fontWeight: activeTab === tab.key ? 600 : 400,
              whiteSpace: "nowrap",
              transition: "all 0.2s",
            }}
          >
            {tab.label}
          </a>
        ))}
      </nav>

      {/* コンテンツ */}
      <div>
        {activeTab === "time" && <ReportsTimeAxis />}
        {activeTab === "market" && <ReportsMarket />}
        {activeTab === "strategy" && <ReportsStrategy />}
        {activeTab === "risk" && <ReportsRisk />}
      </div>
    </div>
  );
}
