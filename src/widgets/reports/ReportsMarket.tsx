import React from "react";
import { useDataset } from "../../lib/dataset.context";

export default function ReportsMarket() {
  const { trades } = useDataset();

  return (
    <div style={{ padding: 20 }}>
      <h2>市場・銘柄レポート</h2>
      <p>トレード数: {trades.length}</p>
    </div>
  );
}
