import React from "react";
import { useDataset } from "../../lib/dataset.context";

export default function ReportsStrategy() {
  const { trades } = useDataset();

  return (
    <div style={{ padding: 20 }}>
      <h2>戦略・行動レポート</h2>
      <p>トレード数: {trades.length}</p>
    </div>
  );
}
