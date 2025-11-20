type TradeRecord = {
  ticket: string;
  item: string;
  type: 'buy' | 'sell';
  size: number;
  openTime: string;
  openPrice: number;
  closeTime: string;
  closePrice: number;
  sl: number;
  tp: number;
  commission: number;
  swap: number;
  profit: number;
  comment: string;
};

type Transaction = {
  user_id: string;
  transaction_type: 'deposit' | 'withdrawal';
  amount: number;
  transaction_date: string;
  description: string;
};

const CURRENCY_PAIRS_DATASET_A = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'EURJPY', 'GBPJPY'];
const CRYPTO_PAIRS = ['BTCUSD', 'ETHUSD'];
const CURRENCY_PAIRS_DATASET_B = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'EURJPY', 'GBPJPY', 'USDCHF', 'NZDUSD'];
const CURRENCY_PAIRS_DATASET_C = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'EURJPY', 'GBPJPY'];

const SETUPS = ['Trend', 'Breakout', 'Reversal', 'Pullback', 'Range'];

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addMinutes(date: Date, minutes: number): Date {
  const newDate = new Date(date);
  newDate.setMinutes(newDate.getMinutes() + minutes);
  return newDate;
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function skipWeekends(date: Date): Date {
  while (isWeekend(date)) {
    date = new Date(date.getTime() + 24 * 60 * 60 * 1000);
  }
  return date;
}

function formatDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;
}

function getPairInfo(pair: string) {
  const isJPY = pair.endsWith('JPY');
  const pipMultiplier = isJPY ? 100 : 10000;

  let basePrice = 1.0;
  let priceRange = 0.02;

  if (pair === 'EURUSD') {
    basePrice = 1.08;
    priceRange = 0.05;
  } else if (pair === 'GBPUSD') {
    basePrice = 1.28;
    priceRange = 0.05;
  } else if (pair === 'USDJPY') {
    basePrice = 150.0;
    priceRange = 3.0;
  } else if (pair === 'AUDUSD') {
    basePrice = 0.66;
    priceRange = 0.03;
  } else if (pair === 'EURJPY') {
    basePrice = 163.0;
    priceRange = 4.0;
  } else if (pair === 'GBPJPY') {
    basePrice = 195.0;
    priceRange = 5.0;
  } else if (pair === 'USDCHF') {
    basePrice = 0.88;
    priceRange = 0.03;
  } else if (pair === 'NZDUSD') {
    basePrice = 0.61;
    priceRange = 0.02;
  } else if (pair === 'BTCUSD') {
    basePrice = 65000;
    priceRange = 5000;
  } else if (pair === 'ETHUSD') {
    basePrice = 3200;
    priceRange = 300;
  }

  return { basePrice, priceRange, pipMultiplier, isJPY };
}

function calculateSwap(pair: string, side: string, holdDays: number): number {
  if (pair === 'BTCUSD' || pair === 'ETHUSD') return 0;

  const baseSwap = side === 'buy' ? randomFloat(-0.5, 1.5) : randomFloat(-1.5, 0.5);
  return parseFloat((baseSwap * holdDays).toFixed(1));
}

function generateDatasetA(): TradeRecord[] {
  const trades: TradeRecord[] = [];
  const startDate = new Date('2024-06-01T08:00:00');
  const endDate = new Date('2025-11-30T18:00:00');

  let ticketNum = 101000001;
  let currentDate = skipWeekends(new Date(startDate));
  let runningProfit = 0;
  const targetProfit = 2800000;
  const totalTrades = 350;

  // 通貨ペアごとの得意不得意
  const pairPerformance: Record<string, number> = {
    'EURUSD': 0.3,  // やや苦手
    'GBPUSD': -0.5, // 苦手
    'USDJPY': 1.8,  // 非常に得意
    'AUDUSD': 0.2,  // 普通
    'EURJPY': 1.5,  // 得意
    'GBPJPY': 0.8,  // やや得意
    'BTCUSD': 2.0,  // 得意
    'ETHUSD': 1.2   // やや得意
  };

  for (let i = 0; i < totalTrades; i++) {
    // 10%の確率で仮想通貨トレード
    const isCrypto = Math.random() < 0.1;
    const pair = isCrypto ? randomChoice(CRYPTO_PAIRS) : randomChoice(CURRENCY_PAIRS_DATASET_A);
    const { basePrice, priceRange, pipMultiplier, isJPY } = getPairInfo(pair);

    const type = randomChoice(['buy', 'sell'] as const);
    const size = parseFloat((randomFloat(0.5, 3.5)).toFixed(1));

    const remainingTrades = totalTrades - i;
    const remainingProfit = targetProfit - runningProfit;
    let profitBias = remainingProfit / remainingTrades / 10000;

    profitBias *= pairPerformance[pair];
    profitBias += randomFloat(-0.3, 0.3);

    const setup = randomChoice(SETUPS);

    const openPrice = basePrice + randomFloat(-priceRange / 2, priceRange / 2);
    const pipMove = randomFloat(-35, 45) + profitBias * 12;
    const closePrice = type === 'buy'
      ? openPrice + (pipMove / pipMultiplier)
      : openPrice - (pipMove / pipMultiplier);

    const openTime = new Date(currentDate);
    const holdMinutes = randomFloat(30, 480);
    const closeTime = addMinutes(openTime, holdMinutes);

    const pips = Math.abs(openPrice - closePrice) * pipMultiplier;
    const profit = Math.round((closePrice - openPrice) * (type === 'buy' ? 1 : -1) * size * 100000);

    const holdDays = Math.ceil(holdMinutes / (24 * 60));
    const swap = calculateSwap(pair, type, holdDays);

    const slDistance = randomFloat(10, 25) / pipMultiplier;
    const tpDistance = randomFloat(20, 60) / pipMultiplier;
    const sl = type === 'buy' ? openPrice - slDistance : openPrice + slDistance;
    const tp = type === 'buy' ? openPrice + tpDistance : openPrice - tpDistance;

    trades.push({
      ticket: String(ticketNum++),
      item: pair,
      type,
      size,
      openTime: formatDateTime(openTime),
      openPrice: parseFloat(openPrice.toFixed(pair.includes('USD') && !pair.endsWith('JPY') ? (pair === 'BTCUSD' ? 2 : pair === 'ETHUSD' ? 2 : 5) : 3)),
      closeTime: formatDateTime(closeTime),
      closePrice: parseFloat(closePrice.toFixed(pair.includes('USD') && !pair.endsWith('JPY') ? (pair === 'BTCUSD' ? 2 : pair === 'ETHUSD' ? 2 : 5) : 3)),
      sl: parseFloat(sl.toFixed(pair.includes('USD') && !pair.endsWith('JPY') ? 5 : 3)),
      tp: parseFloat(tp.toFixed(pair.includes('USD') && !pair.endsWith('JPY') ? 5 : 3)),
      commission: -12,
      swap,
      profit,
      comment: setup
    });

    runningProfit += profit;

    // 1〜2日間隔で取引（土日スキップ）
    const daysToAdd = randomFloat(1, 2);
    currentDate = new Date(currentDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    currentDate = skipWeekends(currentDate);

    if (currentDate > endDate) {
      break;
    }
  }

  return trades;
}

function generateDatasetB(): TradeRecord[] {
  const trades: TradeRecord[] = [];
  const startDate = new Date('2024-08-01T08:00:00');
  const endDate = new Date('2025-11-30T18:00:00');

  let ticketNum = 102000001;
  let currentDate = skipWeekends(new Date(startDate));
  let runningProfit = 0;
  const targetProfit = 500000; // 勝ったり負けたりで最終的に微益
  const totalTrades = 420;

  // 通貨ペアごとの得意不得意
  const pairPerformance: Record<string, number> = {
    'EURUSD': 0.2,
    'GBPUSD': -0.3,
    'USDJPY': 0.5,
    'AUDUSD': -0.4,
    'EURJPY': 0.3,
    'GBPJPY': -0.2,
    'USDCHF': 0.1,
    'NZDUSD': -0.1
  };

  // 勝ちと負けを交互に近い形で
  for (let i = 0; i < totalTrades; i++) {
    const pair = randomChoice(CURRENCY_PAIRS_DATASET_B);
    const { basePrice, priceRange, pipMultiplier, isJPY } = getPairInfo(pair);

    const type = randomChoice(['buy', 'sell'] as const);
    const size = parseFloat((randomFloat(0.3, 2.8)).toFixed(1));

    // 勝ちと負けを交互に
    const isWinTrade = i % 2 === 0;
    let profitBias = isWinTrade ? randomFloat(0.5, 1.5) : randomFloat(-1.5, -0.5);
    profitBias *= pairPerformance[pair];

    const setup = randomChoice(SETUPS);

    const openPrice = basePrice + randomFloat(-priceRange / 2, priceRange / 2);
    const pipMove = randomFloat(-30, 50) + profitBias * 15;
    const closePrice = type === 'buy'
      ? openPrice + (pipMove / pipMultiplier)
      : openPrice - (pipMove / pipMultiplier);

    const openTime = new Date(currentDate);
    const holdMinutes = randomFloat(20, 600);
    const closeTime = addMinutes(openTime, holdMinutes);

    const pips = Math.abs(openPrice - closePrice) * pipMultiplier;
    const profit = Math.round((closePrice - openPrice) * (type === 'buy' ? 1 : -1) * size * 100000);

    const holdDays = Math.ceil(holdMinutes / (24 * 60));
    const swap = calculateSwap(pair, type, holdDays);

    const slDistance = randomFloat(8, 22) / pipMultiplier;
    const tpDistance = randomFloat(18, 55) / pipMultiplier;
    const sl = type === 'buy' ? openPrice - slDistance : openPrice + slDistance;
    const tp = type === 'buy' ? openPrice + tpDistance : openPrice - tpDistance;

    trades.push({
      ticket: String(ticketNum++),
      item: pair,
      type,
      size,
      openTime: formatDateTime(openTime),
      openPrice: parseFloat(openPrice.toFixed(isJPY ? 3 : 5)),
      closeTime: formatDateTime(closeTime),
      closePrice: parseFloat(closePrice.toFixed(isJPY ? 3 : 5)),
      sl: parseFloat(sl.toFixed(isJPY ? 3 : 5)),
      tp: parseFloat(tp.toFixed(isJPY ? 3 : 5)),
      commission: -12,
      swap,
      profit,
      comment: setup
    });

    runningProfit += profit;

    // 1〜2日間隔で取引（土日スキップ）
    const daysToAdd = randomFloat(1, 2);
    currentDate = new Date(currentDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    currentDate = skipWeekends(currentDate);

    if (currentDate > endDate) {
      break;
    }
  }

  return trades;
}

function generateDatasetC(): TradeRecord[] {
  const trades: TradeRecord[] = [];
  const startDate = new Date('2025-01-01T08:00:00');
  const endDate = new Date('2025-11-30T18:00:00');

  let ticketNum = 103000001;
  let currentDate = skipWeekends(new Date(startDate));
  let runningProfit = 0;
  const targetLoss = -1800000;
  const totalTrades = 480;

  // 通貨ペアごとの得意不得意
  const pairPerformance: Record<string, number> = {
    'EURUSD': -0.3,
    'GBPUSD': -0.8,
    'USDJPY': 0.4,
    'AUDUSD': -0.6,
    'EURJPY': 0.2,
    'GBPJPY': -1.2  // 特に苦手
  };

  const fomoTradeIndices = [42, 78, 95, 134, 167, 189, 225, 268, 311, 357, 398, 442];

  for (let i = 0; i < totalTrades; i++) {
    const pair = randomChoice(CURRENCY_PAIRS_DATASET_C);
    const { basePrice, priceRange, pipMultiplier, isJPY } = getPairInfo(pair);

    const type = randomChoice(['buy', 'sell'] as const);

    const isFomoTrade = fomoTradeIndices.includes(i);
    const size = isFomoTrade
      ? parseFloat((randomFloat(4.0, 9.0)).toFixed(1))
      : parseFloat((randomFloat(0.5, 2.8)).toFixed(1));

    // 中盤(100-300)は利益が出る期間
    let periodMultiplier = 1;
    if (i >= 100 && i <= 300) {
      periodMultiplier = 2.5; // 利益期間
    } else if (i > 300) {
      periodMultiplier = -2.0; // 後半大きく負ける
    }

    let profitBias = pairPerformance[pair] * periodMultiplier;

    if (isFomoTrade) {
      profitBias = randomFloat(-12, -5);
    } else {
      profitBias += randomFloat(-0.8, 0.4);
    }

    const setup = isFomoTrade ? 'FOMO' : randomChoice(SETUPS);

    const openPrice = basePrice + randomFloat(-priceRange / 2, priceRange / 2);
    const pipMove = isFomoTrade
      ? randomFloat(-90, -35)
      : randomFloat(-40, 45) + profitBias * 12;
    const closePrice = type === 'buy'
      ? openPrice + (pipMove / pipMultiplier)
      : openPrice - (pipMove / pipMultiplier);

    const openTime = new Date(currentDate);
    const holdMinutes = randomFloat(25, 420);
    const closeTime = addMinutes(openTime, holdMinutes);

    const pips = Math.abs(openPrice - closePrice) * pipMultiplier;
    const profit = Math.round((closePrice - openPrice) * (type === 'buy' ? 1 : -1) * size * 100000);

    const holdDays = Math.ceil(holdMinutes / (24 * 60));
    const swap = calculateSwap(pair, type, holdDays);

    const slDistance = isFomoTrade
      ? randomFloat(50, 100) / pipMultiplier
      : randomFloat(10, 28) / pipMultiplier;
    const tpDistance = randomFloat(20, 65) / pipMultiplier;
    const sl = type === 'buy' ? openPrice - slDistance : openPrice + slDistance;
    const tp = type === 'buy' ? openPrice + tpDistance : openPrice - tpDistance;

    trades.push({
      ticket: String(ticketNum++),
      item: pair,
      type,
      size,
      openTime: formatDateTime(openTime),
      openPrice: parseFloat(openPrice.toFixed(isJPY ? 3 : 5)),
      closeTime: formatDateTime(closeTime),
      closePrice: parseFloat(closePrice.toFixed(isJPY ? 3 : 5)),
      sl: parseFloat(sl.toFixed(isJPY ? 3 : 5)),
      tp: parseFloat(tp.toFixed(isJPY ? 3 : 5)),
      commission: -12,
      swap,
      profit,
      comment: setup
    });

    runningProfit += profit;

    // 1〜2日間隔で取引（土日スキップ）
    const daysToAdd = randomFloat(1, 2);
    currentDate = new Date(currentDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    currentDate = skipWeekends(currentDate);

    if (currentDate > endDate) {
      break;
    }
  }

  return trades;
}

function tradesToCSV(trades: TradeRecord[]): string {
  const header = 'Ticket\tItem\tType\tSize\tOpen Time\tOpen Price\tClose Time\tClose Price\tS/L\tT/P\tCommission\tSwap\tProfit\tComment\n';
  const rows = trades.map(t =>
    `${t.ticket}\t${t.item}\t${t.type}\t${t.size}\t${t.openTime}\t${t.openPrice}\t${t.closeTime}\t${t.closePrice}\t${t.sl}\t${t.tp}\t${t.commission}\t${t.swap}\t${t.profit}\t${t.comment}`
  ).join('\n');
  return header + rows;
}

console.log('Generating Dataset A...');
const datasetA = generateDatasetA();
const totalProfitA = datasetA.reduce((sum, t) => sum + t.profit, 0);
const totalSwapA = datasetA.reduce((sum, t) => sum + t.swap, 0);
console.log(`Dataset A: ${datasetA.length} trades, Total Profit: ¥${totalProfitA.toLocaleString()}, Total Swap: ¥${totalSwapA.toFixed(1)}`);

const pairStatsA: Record<string, { trades: number; profit: number }> = {};
datasetA.forEach(t => {
  if (!pairStatsA[t.item]) pairStatsA[t.item] = { trades: 0, profit: 0 };
  pairStatsA[t.item].trades++;
  pairStatsA[t.item].profit += t.profit;
});
console.log('Pair breakdown:');
Object.entries(pairStatsA).forEach(([pair, stats]) => {
  console.log(`  ${pair}: ${stats.trades} trades, ¥${stats.profit.toLocaleString()}`);
});

console.log('\nGenerating Dataset B...');
const datasetB = generateDatasetB();
const totalProfitB = datasetB.reduce((sum, t) => sum + t.profit, 0);
const totalSwapB = datasetB.reduce((sum, t) => sum + t.swap, 0);
console.log(`Dataset B: ${datasetB.length} trades, Total Profit: ¥${totalProfitB.toLocaleString()}, Total Swap: ¥${totalSwapB.toFixed(1)}`);

const pairStatsB: Record<string, { trades: number; profit: number }> = {};
datasetB.forEach(t => {
  if (!pairStatsB[t.item]) pairStatsB[t.item] = { trades: 0, profit: 0 };
  pairStatsB[t.item].trades++;
  pairStatsB[t.item].profit += t.profit;
});
console.log('Pair breakdown:');
Object.entries(pairStatsB).forEach(([pair, stats]) => {
  console.log(`  ${pair}: ${stats.trades} trades, ¥${stats.profit.toLocaleString()}`);
});

console.log('\nGenerating Dataset C...');
const datasetC = generateDatasetC();
const totalProfitC = datasetC.reduce((sum, t) => sum + t.profit, 0);
const totalSwapC = datasetC.reduce((sum, t) => sum + t.swap, 0);
console.log(`Dataset C: ${datasetC.length} trades, Total Profit: ¥${totalProfitC.toLocaleString()}, Total Swap: ¥${totalSwapC.toFixed(1)}`);

const pairStatsC: Record<string, { trades: number; profit: number }> = {};
datasetC.forEach(t => {
  if (!pairStatsC[t.item]) pairStatsC[t.item] = { trades: 0, profit: 0 };
  pairStatsC[t.item].trades++;
  pairStatsC[t.item].profit += t.profit;
});
console.log('Pair breakdown:');
Object.entries(pairStatsC).forEach(([pair, stats]) => {
  console.log(`  ${pair}: ${stats.trades} trades, ¥${stats.profit.toLocaleString()}`);
});

// 中盤の利益確認
const midPeriodC = datasetC.slice(100, 301);
const midProfitC = midPeriodC.reduce((sum, t) => sum + t.profit, 0);
console.log(`Mid-period (trade 100-300): ¥${midProfitC.toLocaleString()}`);

const fs = require('fs');

fs.writeFileSync('./public/demo/A.csv', tradesToCSV(datasetA));
console.log('\n✅ Dataset A saved to ./public/demo/A.csv');

fs.writeFileSync('./public/demo/B.csv', tradesToCSV(datasetB));
console.log('✅ Dataset B saved to ./public/demo/B.csv');

fs.writeFileSync('./public/demo/C.csv', tradesToCSV(datasetC));
console.log('✅ Dataset C saved to ./public/demo/C.csv');
