import React from "react";
import { useDataset } from "../../lib/dataset.context";

export default function ReportsTimeAxis() {
  const { trades } = useDataset();

  return (
    <div style={{ padding: 20 }}>
      <h2>時間軸レポート</h2>
      <p>トレード数: {trades.length}</p>
    </div>
  );
}
