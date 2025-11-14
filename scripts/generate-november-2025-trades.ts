const november2025TradesA = [
  { ticket: '101000500', item: 'EURUSD', side: 'buy', size: 2.0, open_time: '2025.11.03 08:15:00', open_price: 1.0845, close_time: '2025.11.03 15:30:00', close_price: 1.0720, sl: 1.0745, tp: 1.0945, commission: -12.0, swap: -5.2, profit: -25000, comment: 'Trend' },
  { ticket: '101000501', item: 'GBPUSD', side: 'sell', size: 1.5, open_time: '2025.11.05 10:20:00', open_price: 1.2950, close_time: '2025.11.05 18:45:00', close_price: 1.3080, sl: 1.3000, tp: 1.2800, commission: -12.0, swap: -3.8, profit: -19500, comment: 'Breakout' },
  { ticket: '101000502', item: 'USDJPY', side: 'buy', size: 3.0, open_time: '2025.11.07 06:30:00', open_price: 150.25, close_time: '2025.11.07 12:15:00', close_price: 149.10, sl: 149.75, tp: 151.25, commission: -12.0, swap: -7.5, profit: -34500, comment: 'Range' },
  { ticket: '101000503', item: 'AUDUSD', side: 'sell', size: 2.0, open_time: '2025.11.10 14:00:00', open_price: 0.6580, close_time: '2025.11.10 20:30:00', close_price: 0.6695, sl: 0.6630, tp: 0.6480, commission: -12.0, swap: -4.3, profit: -23000, comment: 'Reversal' },
  { ticket: '101000504', item: 'EURJPY', side: 'buy', size: 2.5, open_time: '2025.11.12 09:45:00', open_price: 163.50, close_time: '2025.11.12 16:20:00', close_price: 162.30, sl: 162.50, tp: 164.50, commission: -12.0, swap: -6.1, profit: -30000, comment: 'Pullback' },
  { ticket: '101000505', item: 'GBPJPY', side: 'sell', size: 1.8, open_time: '2025.11.14 11:30:00', open_price: 195.80, close_time: '2025.11.14 19:00:00', close_price: 197.20, sl: 196.80, tp: 194.80, commission: -12.0, swap: -5.5, profit: -25200, comment: 'Scalp' },
  { ticket: '101000506', item: 'EURUSD', side: 'sell', size: 2.2, open_time: '2025.11.17 07:15:00', open_price: 1.0790, close_time: '2025.11.17 14:45:00', close_price: 1.0885, sl: 1.0840, tp: 1.0690, commission: -12.0, swap: -4.7, profit: -20900, comment: 'Trend' },
  { ticket: '101000507', item: 'USDJPY', side: 'sell', size: 2.8, open_time: '2025.11.19 13:20:00', open_price: 149.75, close_time: '2025.11.19 19:50:00', close_price: 150.95, sl: 150.25, tp: 148.75, commission: -12.0, swap: -6.8, profit: -33600, comment: 'Breakout' },
  { ticket: '101000508', item: 'GBPUSD', side: 'buy', size: 1.6, open_time: '2025.11.21 08:40:00', open_price: 1.2820, close_time: '2025.11.21 15:10:00', close_price: 1.2680, sl: 1.2720, tp: 1.2920, commission: -12.0, swap: -3.9, profit: -22400, comment: 'Range' },
  { ticket: '101000509', item: 'AUDUSD', side: 'buy', size: 1.9, open_time: '2025.11.24 10:15:00', open_price: 0.6625, close_time: '2025.11.24 17:30:00', close_price: 0.6510, sl: 0.6575, tp: 0.6725, commission: -12.0, swap: -4.5, profit: -21850, comment: 'Pullback' },
  { ticket: '101000510', item: 'EURJPY', side: 'sell', size: 2.3, open_time: '2025.11.26 12:00:00', open_price: 162.90, close_time: '2025.11.26 18:25:00', close_price: 164.15, sl: 163.90, tp: 161.90, commission: -12.0, swap: -5.8, profit: -28750, comment: 'Reversal' },
  { ticket: '101000511', item: 'USDJPY', side: 'buy', size: 0.8, open_time: '2025.11.28 09:30:00', open_price: 150.40, close_time: '2025.11.28 11:45:00', close_price: 150.75, sl: 150.00, tp: 150.90, commission: -12.0, swap: -1.8, profit: 2800, comment: 'Scalp' },
  { ticket: '101000512', item: 'GBPUSD', side: 'sell', size: 0.5, open_time: '2025.11.29 14:20:00', open_price: 1.2745, close_time: '2025.11.29 16:40:00', close_price: 1.2710, sl: 1.2795, tp: 1.2645, commission: -12.0, swap: -1.2, profit: 1750, comment: 'Trend' },
];

const november2025TradesC = [
  { ticket: '101000620', item: 'EURUSD', side: 'sell', size: 1.5, open_time: '2025.11.01 08:00:00', open_price: 1.0870, close_time: '2025.11.01 16:30:00', close_price: 1.0745, sl: 1.0920, tp: 1.0745, commission: -12.0, swap: 3.2, profit: 18750, comment: 'Trend' },
  { ticket: '101000621', item: 'GBPUSD', side: 'buy', size: 1.2, open_time: '2025.11.04 09:15:00', open_price: 1.2780, close_time: '2025.11.04 17:45:00', close_price: 1.2920, sl: 1.2730, tp: 1.2930, commission: -12.0, swap: 2.8, profit: 16800, comment: 'Breakout' },
  { ticket: '101000622', item: 'USDJPY', side: 'sell', size: 2.0, open_time: '2025.11.06 10:30:00', open_price: 150.80, close_time: '2025.11.06 18:00:00', close_price: 149.50, sl: 151.30, tp: 149.30, commission: -12.0, swap: 4.5, profit: 26000, comment: 'Reversal' },
  { ticket: '101000623', item: 'AUDUSD', side: 'buy', size: 1.8, open_time: '2025.11.08 07:45:00', open_price: 0.6545, close_time: '2025.11.08 15:20:00', close_price: 0.6680, sl: 0.6495, tp: 0.6695, commission: -12.0, swap: 3.6, profit: 24300, comment: 'Pullback' },
  { ticket: '101000624', item: 'EURJPY', side: 'sell', size: 1.6, open_time: '2025.11.11 11:00:00', open_price: 164.20, close_time: '2025.11.11 19:30:00', close_price: 162.80, sl: 165.20, tp: 162.70, commission: -12.0, swap: 3.1, profit: 22400, comment: 'Range' },
  { ticket: '101000625', item: 'GBPJPY', side: 'buy', size: 1.4, open_time: '2025.11.13 08:30:00', open_price: 194.50, close_time: '2025.11.13 16:45:00', close_price: 196.30, sl: 193.50, tp: 196.50, commission: -12.0, swap: 2.9, profit: 25200, comment: 'Scalp' },
  { ticket: '101000626', item: 'EURUSD', side: 'buy', size: 1.9, open_time: '2025.11.15 09:20:00', open_price: 1.0745, close_time: '2025.11.15 17:50:00', close_price: 1.0865, sl: 1.0695, tp: 1.0870, commission: -12.0, swap: 3.8, profit: 22800, comment: 'Trend' },
  { ticket: '101000627', item: 'USDJPY', side: 'buy', size: 2.2, open_time: '2025.11.18 10:15:00', open_price: 149.20, close_time: '2025.11.18 18:40:00', close_price: 150.50, sl: 148.70, tp: 150.70, commission: -12.0, swap: 4.2, profit: 28600, comment: 'Breakout' },
  { ticket: '101000628', item: 'GBPUSD', side: 'sell', size: 1.5, open_time: '2025.11.20 11:30:00', open_price: 1.2915, close_time: '2025.11.20 19:00:00', close_price: 1.2780, sl: 1.2965, tp: 1.2765, commission: -12.0, swap: 3.3, profit: 20250, comment: 'Range' },
  { ticket: '101000629', item: 'AUDUSD', side: 'sell', size: 1.7, open_time: '2025.11.22 08:45:00', open_price: 0.6680, close_time: '2025.11.22 16:20:00', close_price: 0.6560, sl: 0.6730, tp: 0.6555, commission: -12.0, swap: 3.5, profit: 20400, comment: 'Pullback' },
  { ticket: '101000630', item: 'EURJPY', side: 'buy', size: 1.8, open_time: '2025.11.25 09:50:00', open_price: 162.30, close_time: '2025.11.25 17:15:00', close_price: 163.90, sl: 161.30, tp: 164.00, commission: -12.0, swap: 3.7, profit: 28800, comment: 'Reversal' },
  { ticket: '101000631', item: 'USDJPY', side: 'sell', size: 2.1, open_time: '2025.11.27 10:20:00', open_price: 150.95, close_time: '2025.11.27 18:45:00', close_price: 149.70, sl: 151.45, tp: 149.45, commission: -12.0, swap: 4.1, profit: 26250, comment: 'Scalp' },
  { ticket: '101000632', item: 'GBPUSD', side: 'buy', size: 1.6, open_time: '2025.11.29 11:15:00', open_price: 1.2730, close_time: '2025.11.29 19:30:00', close_price: 1.2845, sl: 1.2680, tp: 1.2855, commission: -12.0, swap: 3.4, profit: 18400, comment: 'Trend' },
];

console.log('Dataset A (November 2025 - Large Losses):');
console.log(`Total trades: ${november2025TradesA.length}`);
const totalProfitA = november2025TradesA.reduce((sum, t) => sum + t.profit, 0);
console.log(`Total P&L: ${totalProfitA.toFixed(2)}`);

console.log('\nDataset C (November 2025 - Large Profits):');
console.log(`Total trades: ${november2025TradesC.length}`);
const totalProfitC = november2025TradesC.reduce((sum, t) => sum + t.profit, 0);
console.log(`Total P&L: ${totalProfitC.toFixed(2)}`);

function generateCSVRows(trades: any[]) {
  return trades.map(t =>
    `${t.ticket}\t${t.item}\t${t.side}\t${t.size}\t${t.open_time}\t${t.open_price}\t${t.close_time}\t${t.close_price}\t${t.sl}\t${t.tp}\t${t.commission}\t${t.swap}\t${t.profit}\t${t.comment}`
  ).join('\n');
}

console.log('\n=== CSV for Dataset A ===');
console.log(generateCSVRows(november2025TradesA));

console.log('\n=== CSV for Dataset C ===');
console.log(generateCSVRows(november2025TradesC));
