// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./lib/tokens.css";
import "./index.css";
import App from "./App";
import "./scripts/migrate-demo-data";
import { ThemeProvider } from "./lib/theme.context";

// Chart.js setup
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
);

function updateChartColors() {
  const gridColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--grid-line')
    .trim();

  if (!ChartJS.defaults.scales) {
    ChartJS.defaults.scales = {};
  }

  ChartJS.defaults.scale = ChartJS.defaults.scale || {};
  ChartJS.defaults.scale.grid = ChartJS.defaults.scale.grid || {};
  ChartJS.defaults.scale.grid.color = gridColor;
}

updateChartColors();

const observer = new MutationObserver(() => {
  updateChartColors();
});

observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-theme']
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
