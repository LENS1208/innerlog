// src/shells/AppShell.tsx
import React, { useEffect, useRef, useState } from "react";
import { DatasetProvider, useDataset } from "../lib/dataset.context";
import FiltersBar from "../components/FiltersBar";
import UserMenu from "../components/UserMenu";
import logoImg from "../assets/inner-log-logo.png";
import { parseCsvText } from "../lib/csv";
import { tradeToDb, insertTrades, getTradesCount, deleteAllTrades, upsertAccountSummary } from "../lib/db.service";
import { parseHtmlStatement, parseFullHtmlStatement, convertHtmlTradesToCsvFormat } from "../lib/html-parser";

type MenuItem = { key: string; label: string; active?: boolean };
type Props = { children: React.ReactNode };

// ヘッダー（右カラムの上部）
function Header({
  onMenuToggle,
  onFilterToggle,
  showFilters,
  onUploadClick
}: {
  onMenuToggle: () => void;
  onFilterToggle: () => void;
  showFilters: boolean;
  onUploadClick: () => void;
}) {
  const { resetFilters, loading } = useDataset();
  return (
    <>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "var(--bg)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div className="header-inner">
          {/* 1行目: タイトルとハンバーガー */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px var(--px-mobile)",
              minHeight: "var(--header-h)",
            }}
          >
            {/* ハンバーガーメニュー（モバイルのみ） */}
            <button
              onClick={onMenuToggle}
              className="mobile-only"
              style={{
                width: 40,
                height: 40,
                display: "none",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 5,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
              aria-label="メニューを開く"
            >
              <span style={{ width: 24, height: 3, background: "var(--ink)", borderRadius: 2 }}></span>
              <span style={{ width: 24, height: 3, background: "var(--ink)", borderRadius: 2 }}></span>
              <span style={{ width: 24, height: 3, background: "var(--ink)", borderRadius: 2 }}></span>
            </button>

            <div style={{ fontSize: 22, fontWeight: 700 }} className="page-title">
              {(() => {
                const k = (location.hash.replace(/^#\//, "") || "dashboard").split("/")[0];
                if (!k || k === "dashboard") return "ダッシュボード";
                if (k === "calendar") return "カレンダー";
                if (k === "trades") return "取引一覧";
                if (k === "reports") return "レポート";
                if (k === "ai-evaluation") return "AI評価";
                if (k === "forecast" || k === "ai-proposal") return "相場予想";
                if (k === "notebook") return "トレード日記";
                if (k === "settings") return "設定";
                return "ダッシュボード";
              })()}
            </div>

            {/* フィルター表示/非表示トグルボタン（モバイルのみ） */}
            <button
              onClick={onFilterToggle}
              className="mobile-only"
              style={{
                width: 40,
                height: 40,
                display: "none",
                justifyContent: "center",
                alignItems: "center",
                background: showFilters ? "var(--accent)" : "var(--surface)",
                color: showFilters ? "#fff" : "var(--ink)",
                border: "1px solid var(--line)",
                borderRadius: 8,
                cursor: "pointer",
                padding: 0,
                marginLeft: "auto",
              }}
              aria-label="フィルターを表示/非表示"
              title="フィルターを表示/非表示"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
            </button>

            {/* 大画面のみ：1行レイアウト */}
            <div className="header-oneline" style={{ marginLeft: "auto", display: "none", gap: 8, alignItems: "center" }}>
              {loading && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13,
                  color: 'var(--muted)'
                }}>
                  <div style={{
                    width: 16,
                    height: 16,
                    border: '2px solid var(--line)',
                    borderTopColor: 'var(--accent)',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }} />
                  <span>適用中...</span>
                </div>
              )}
              <FiltersBar />
              <button
                onClick={resetFilters}
                title="リセット"
                style={{
                  height: 36,
                  padding: "0 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "none",
                  borderRadius: 12,
                  background: "var(--accent)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                リセット
              </button>
              <UserMenu />
            </div>
          </div>

          {/* 2行目: 中画面で2行レイアウト */}
          <div className="header-twoline" style={{ display: "none", padding: "16px var(--px-desktop) 20px" }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center", justifyContent: "space-between", width: "100%" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", flex: "1 1 auto", minWidth: 0 }}>
                <FiltersBar />
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0, marginLeft: "auto" }}>
                {loading && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13,
                    color: 'var(--muted)'
                  }}>
                    <div style={{
                      width: 16,
                      height: 16,
                      border: '2px solid var(--line)',
                      borderTopColor: 'var(--accent)',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }} />
                  </div>
                )}
                <button
                  onClick={resetFilters}
                  title="リセット"
                  style={{
                    height: 36,
                    padding: "0 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "none",
                    borderRadius: 12,
                    background: "var(--accent)",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  リセット
                </button>
                <UserMenu />
              </div>
            </div>
          </div>
        </div>

        {/* モバイルのみ：フィルター縦配置 */}
        {showFilters && (
          <div className="mobile-only mobile-filters" style={{ display: "none", padding: "12px 16px", borderTop: "1px solid var(--line)", flexDirection: "column", gap: 10 }}>
            <FiltersBar />
            <div style={{ display: "flex", gap: 8, marginTop: 4, justifyContent: "flex-end" }}>
              <button
                onClick={resetFilters}
                title="リセット"
                style={{
                  height: 40,
                  padding: "0 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "none",
                  borderRadius: 12,
                  background: "var(--accent)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                リセット
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// 常時バナー（右カラム上：ヘッダーの下）
function Banner() {
  const { dataset, setDataset, useDatabase } = useDataset();
  const [tradesCount, setTradesCount] = useState(0);

  useEffect(() => {
    const checkTradesCount = async () => {
      try {
        const count = await getTradesCount();
        setTradesCount(count);
      } catch (error) {
        console.error('取引履歴の件数取得に失敗:', error);
      }
    };

    checkTradesCount();

    const handler = () => checkTradesCount();
    window.addEventListener('fx:tradesUpdated', handler);
    return () => window.removeEventListener('fx:tradesUpdated', handler);
  }, []);

  return (
    <section
      style={{
        display: "flex",
        margin: "var(--space-3) var(--px-mobile)",
        border: "1px solid #f59e0b",
        background: "#fff7ed",
        color: "#7c2d12",
        borderRadius: 12,
        padding: "12px 14px",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
      }}
      role="region"
      aria-label="データ操作"
      className="banner-section"
    >
      <strong>{tradesCount > 0 ? "データセットを切り替え" : "デモデータを読み込む、またはMT4/MT5の取引履歴を追加してください"}</strong>
      <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "inline-flex", border: "1px solid var(--line)", borderRadius: 999, overflow: "hidden" }}>
          {(["A", "B", "C"] as const).map((d) => (
            <button
              key={d}
              onClick={() => {
                setDataset(d);
                window.dispatchEvent(new CustomEvent("fx:preset", { detail: d }));
              }}
              style={{
                padding: "8px 12px",
                height: 36,
                background: dataset === d ? "var(--accent)" : "var(--surface)",
                color: dataset === d ? "#fff" : "var(--ink)",
                border: 0,
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// 左メニュー（左上に固定）
function SideNav({ menu, activeKey, onUploadClick }: { menu: MenuItem[]; activeKey: string; onUploadClick?: () => void }) {
  return (
    <aside
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: 14,
        padding: 12,
      }}
    >
      <img src={logoImg} alt="inner log" style={{ display: "block", marginBottom: 12, width: "100%", height: "auto" }} />
      <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
        {menu.map((m) => {
          const getIcon = (key: string) => {
            switch (key) {
              case "dashboard":
                return (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                );
              case "calendar":
                return (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                );
              case "trades":
                return (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6"></line>
                    <line x1="8" y1="12" x2="21" y2="12"></line>
                    <line x1="8" y1="18" x2="21" y2="18"></line>
                    <line x1="3" y1="6" x2="3.01" y2="6"></line>
                    <line x1="3" y1="12" x2="3.01" y2="12"></line>
                    <line x1="3" y1="18" x2="3.01" y2="18"></line>
                  </svg>
                );
              case "reports":
                return (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                  </svg>
                );
              case "ai-evaluation":
                return (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                );
              case "forecast":
              case "ai-proposal":
                return (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  </svg>
                );
              case "notebook":
                return (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                );
              case "settings":
                return (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M12 1v6m0 6v6"></path>
                    <path d="M16.24 7.76l-2.12 2.12m-4.24 4.24l-2.12 2.12"></path>
                    <path d="M21 12h-6m-6 0H3"></path>
                    <path d="M16.24 16.24l-2.12-2.12m-4.24-4.24l-2.12-2.12"></path>
                  </svg>
                );
              default:
                return (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                );
            }
          };

          return (
            <li key={m.key} style={{ listStyle: "none" }}>
              <a
                href={`#/${m.key}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  textDecoration: "none",
                  padding: "10px 12px",
                  borderRadius: 10,
                  color: "#111827",
                  background: activeKey === m.key ? "rgba(59,130,246,.12)" : "transparent",
                }}
                onClick={(e) => {
                  e.preventDefault();
                  location.hash = `/${m.key}`;
                }}
              >
                <span style={{ display: "flex", alignItems: "center", opacity: 0.7 }}>{getIcon(m.key)}</span>
                <span>{m.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
      {onUploadClick && (
        <button
          onClick={onUploadClick}
          style={{
            width: "100%",
            marginTop: 12,
            padding: "10px 12px",
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            fontWeight: 600,
            cursor: "pointer",
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="12" y1="18" x2="12" y2="12"></line>
            <polyline points="9 15 12 12 15 15"></polyline>
          </svg>
          取引履歴を追加
        </button>
      )}
    </aside>
  );
}

export default function AppShell({ children }: Props) {
  console.log("🔄 AppShell render");
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [activeKey, setActiveKey] = useState<string>("dashboard");
  const drawerRef = useRef<HTMLDivElement>(null);
  const [quickOpen, setQuickOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    console.log('📤 Header upload button clicked');
    // TradeListPageにいる場合はイベントを発火、それ以外はfileInputを開く
    const currentHash = window.location.hash;
    if (currentHash === '#/trades') {
      window.dispatchEvent(new CustomEvent("fx:openUpload"));
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📂 File selected in AppShell');
    const file = e.target.files?.[0];
    if (!file) {
      console.log('⚠️ No file selected');
      return;
    }

    console.log('📄 File:', file.name, 'Size:', file.size, 'bytes');

    try {
      const text = await file.text();
      console.log('📝 File content length:', text.length);

      const fileName = file.name.toLowerCase();
      let trades;
      let summary = null;

      if (fileName.endsWith('.html') || fileName.endsWith('.htm')) {
        console.log('🌐 Detected HTML file, parsing...');
        const parsed = parseFullHtmlStatement(text);
        console.log('📊 Parsed HTML trades:', parsed.trades.length);
        console.log('💰 Parsed transactions:', parsed.transactions.length);
        console.log('📈 Parsed summary:', parsed.summary);

        if (parsed.trades.length === 0) {
          console.warn('⚠️ No trades found in HTML file');
          alert('HTML形式から有効な取引データが見つかりませんでした');
          e.target.value = '';
          return;
        }

        summary = parsed.summary;

        const csvText = convertHtmlTradesToCsvFormat(parsed.trades);
        trades = parseCsvText(csvText);
        console.log('✅ Converted HTML to CSV format:', trades.length, 'trades');
      } else {
        console.log('📄 Parsing as CSV file...');
        trades = parseCsvText(text);
        console.log('📊 Parsed CSV trades:', trades.length);
      }

      if (trades.length > 0) {
        // 既存の取引履歴を削除してから新しいデータを保存
        await deleteAllTrades();
        console.log('🗑️ Deleted all existing trades');

        const dbTrades = trades.map(tradeToDb);
        await insertTrades(dbTrades);
        console.log(`✅ Uploaded ${trades.length} trades to database`);

        // HTMLファイルからサマリー情報が取得できた場合は保存
        if (summary) {
          await upsertAccountSummary({
            total_deposits: summary.totalDeposits,
            total_withdrawals: summary.totalWithdrawals,
            xm_points_earned: summary.xmPointsEarned,
            xm_points_used: summary.xmPointsUsed,
            total_swap: summary.totalSwap,
            total_commission: summary.totalCommission,
            total_profit: summary.totalProfit,
            closed_pl: summary.closedPL,
          });
          console.log('📊 Account summary saved to database');
        }

        // TradeListPageや他のコンポーネントにイベント発火して再読み込みを促す
        window.dispatchEvent(new CustomEvent("fx:tradesUpdated"));

        // ページをリロードしてデータを反映
        window.location.reload();
      } else {
        console.warn('⚠️ No trades parsed');
        alert('有効な取引データが見つかりませんでした');
      }
    } catch (error) {
      console.error('❌ Error processing file:', error);
      alert('ファイルの処理に失敗しました: ' + (error as Error).message);
    }

    // input要素をリセット
    e.target.value = '';
  };

  useEffect(() => {
    (async () => {
      try {
        const url = `/menu/app_nav_menu.ja_v1.json`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as MenuItem[];
        setMenu(data);
        const fromHash = (location.hash.replace(/^#\//, "") || "").trim();
        setActiveKey(fromHash || data.find((m) => m.active)?.key || data[0]?.key || "dashboard");
      } catch (err) {
        console.error("❌ メニュー読み込み失敗:", err);
        setMenu([
          { key: "dashboard", label: "ダッシュボード", active: true },
          { key: "reports", label: "レポート" },
          { key: "ai-evaluation", label: "AI評価" },
          { key: "calendar", label: "カレンダー" },
          { key: "notebook", label: "トレード日記" },
          { key: "ai-proposal", label: "相場予想" },
          { key: "trades", label: "取引一覧" },
        ]);
        const fromHash = (location.hash.replace(/^#\//, "") || "").trim();
        setActiveKey(fromHash || "dashboard");
      }
    })();
  }, []);

  useEffect(() => {
    const sync = () => setActiveKey(location.hash.replace(/^#\//, "") || "dashboard");
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => setQuickOpen((e as CustomEvent).detail ?? true);
    window.addEventListener("fx:openQuickDiary", handler);
    return () => window.removeEventListener("fx:openQuickDiary", handler);
  }, []);

  return (
    <DatasetProvider>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.html,.htm"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <div style={{ display: "flex", minHeight: "100vh", width: "100%", position: "relative" }}>
        {/* 左メニュー：デスクトップは固定、モバイルはドロワー */}
        <div
          className="desktop-sidenav"
          style={{
            width: "var(--sidenav-w)",
            position: "fixed",
            top: 0,
            left: 0,
            height: "100vh",
            overflowY: "auto",
            padding: "var(--space-3)",
            background: "var(--bg)",
            zIndex: 10,
          }}
        >
          <SideNav menu={menu} activeKey={activeKey} onUploadClick={handleUploadClick} />
        </div>

        {/* モバイルメニュー（ドロワー） */}
        {open && (
          <>
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0,0,0,0.5)",
                zIndex: 200,
              }}
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <div
              ref={drawerRef}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: 280,
                maxWidth: "80vw",
                height: "100vh",
                background: "var(--bg)",
                zIndex: 300,
                padding: "var(--space-3)",
                overflowY: "auto",
                boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
              }}
              role="dialog"
              aria-modal="true"
            >
              <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: 16 }}>
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    fontSize: 24,
                    cursor: "pointer",
                    padding: 4,
                  }}
                  aria-label="メニューを閉じる"
                >
                  ✕
                </button>
              </div>
              <SideNav menu={menu} activeKey={activeKey} onUploadClick={handleUploadClick} />
            </div>
          </>
        )}

        {/* メインエリア：100%幅（左メニュー分のマージン） */}
        <div
          className="main-content"
          style={{
            flex: 1,
            minHeight: "100vh",
            width: "100%",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            background: "var(--bg)"
          }}
        >
          <Header
            onMenuToggle={() => setOpen(true)}
            onFilterToggle={() => setShowFilters(!showFilters)}
            showFilters={showFilters}
            onUploadClick={handleUploadClick}
          />
          <Banner />
          <main style={{ flex: 1, padding: "var(--px-mobile)", width: "100%" }} className="main-container">{children}</main>
        </div>

        {/* 右下：グローバル新規日記ボタン */}
        <button
          className="quick-btn"
          onClick={() => setQuickOpen(true)}
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 1000,
          }}
        >
          ＋ 新しい日記をつける
        </button>

        {/* 新規日記モーダル */}
        {quickOpen && (
          <div className="modal" onClick={() => setQuickOpen(false)} aria-hidden={false}>
            <div className="panel" onClick={(e) => e.stopPropagation()}>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>新規日記</div>
              <div style={{ color: "var(--muted)", fontSize: 14 }}>
                このモーダルはトレード日記ページ（個別トレード）から実装を移行します。
              </div>
              <div style={{ marginTop: 16, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button
                  style={{
                    padding: "8px 16px",
                    border: "1px solid var(--line)",
                    borderRadius: 8,
                    background: "var(--surface)",
                    cursor: "pointer",
                  }}
                  onClick={() => setQuickOpen(false)}
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DatasetProvider>
  );
}
