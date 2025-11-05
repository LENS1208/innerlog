import type { TradeRow, TradeMetrics } from '../types/evaluation.types';
import { computeMetrics } from '../utils/evaluation-metrics';

export const INIT_CAPITAL = 1_000_000;

export function getDemoRows(): TradeRow[] {
  const mockTrades: TradeRow[] = [];
  const pairs = ['USD/JPY', 'EUR/USD', 'GBP/JPY', 'AUD/USD', 'EUR/JPY'];
  const baseDate = new Date('2024-01-01').getTime();

  for (let i = 0; i < 150; i++) {
    const isWin = Math.random() > 0.45;
    const pips = isWin
      ? Math.random() * 40 + 10
      : -(Math.random() * 30 + 8);

    const pnl = isWin
      ? Math.random() * 15000 + 3000
      : -(Math.random() * 12000 + 2000);

    const datetime = new Date(baseDate + i * 8 * 60 * 60 * 1000);

    mockTrades.push({
      pnl,
      pips,
      win: isWin,
      pair: pairs[Math.floor(Math.random() * pairs.length)],
      side: Math.random() > 0.5 ? 'Long' : 'Short',
      datetime: datetime.toISOString(),
      hour: datetime.getUTCHours(),
      dayOfWeek: datetime.getUTCDay(),
    });
  }

  return mockTrades;
}

export function getDemoMetrics(): TradeMetrics {
  const rows = getDemoRows();
  return computeMetrics(rows);
}

export const demoConfig = {
  INIT_CAPITAL,
};
