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

const CURRENCY_PAIRS_DATASET_A = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'EURJPY', 'GBPJPY'];
const CURRENCY_PAIRS_DATASET_B = [
  'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'EURJPY', 'GBPJPY',
  'USDCHF', 'NZDUSD', 'EURGBP', 'AUDJPY', 'GBPAUD', 'EURAUD',
  'USDCAD', 'CHFJPY', 'EURCHF', 'NZDJPY'
];
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
  } else if (pair === 'EURGBP') {
    basePrice = 0.84;
    priceRange = 0.02;
  } else if (pair === 'AUDJPY') {
    basePrice = 99.0;
    priceRange = 3.0;
  } else if (pair === 'GBPAUD') {
    basePrice = 1.94;
    priceRange = 0.05;
  } else if (pair === 'EURAUD') {
    basePrice = 1.63;
    priceRange = 0.04;
  } else if (pair === 'USDCAD') {
    basePrice = 1.36;
    priceRange = 0.03;
  } else if (pair === 'CHFJPY') {
    basePrice = 170.0;
    priceRange = 4.0;
  } else if (pair === 'EURCHF') {
    basePrice = 0.95;
    priceRange = 0.02;
  } else if (pair === 'NZDJPY') {
    basePrice = 92.0;
    priceRange = 3.0;
  }

  return { basePrice, priceRange, pipMultiplier, isJPY };
}

function generateDatasetA(): TradeRecord[] {
  const trades: TradeRecord[] = [];
  const startDate = new Date('2024-12-01T08:00:00');
  const endDate = new Date('2025-11-30T18:00:00');

  let ticketNum = 101000001;
  let currentDate = new Date(startDate);
  let runningProfit = 0;
  const targetProfit = 1215332;
  const totalTrades = 262;

  const pairPerformance: Record<string, number> = {
    'EURUSD': randomFloat(-0.3, 1.2),
    'GBPUSD': randomFloat(-0.2, 1.4),
    'USDJPY': randomFloat(0.3, 1.5),
    'AUDUSD': randomFloat(-0.5, 0.8),
    'EURJPY': randomFloat(0.2, 1.3),
    'GBPJPY': randomFloat(-0.4, 1.1)
  };

  const drawdownPeriods = [
    { start: 40, end: 70, severity: -1.5 },
    { start: 120, end: 145, severity: -1.2 },
    { start: 210, end: 235, severity: -0.8 }
  ];

  for (let i = 0; i < totalTrades; i++) {
    const pair = randomChoice(CURRENCY_PAIRS_DATASET_A);
    const { basePrice, priceRange, pipMultiplier, isJPY } = getPairInfo(pair);

    const type = randomChoice(['buy', 'sell'] as const);
    const size = parseFloat((randomFloat(0.5, 3.5)).toFixed(1));

    const remainingTrades = totalTrades - i;
    const remainingProfit = targetProfit - runningProfit;
    let profitBias = remainingProfit / remainingTrades / 10000;

    profitBias *= pairPerformance[pair];

    let periodMultiplier = 1;
    for (const period of drawdownPeriods) {
      if (i >= period.start && i <= period.end) {
        periodMultiplier = period.severity;
        break;
      }
    }
    profitBias *= periodMultiplier;

    profitBias += randomFloat(-0.3, 0.3);

    const setup = randomChoice(SETUPS);
    const isScalp = setup === 'Scalp' || Math.random() < 0.15;

    const openPrice = basePrice + randomFloat(-priceRange / 2, priceRange / 2);
    const pipMove = randomFloat(-35, 45) + profitBias * 12;
    const closePrice = type === 'buy'
      ? openPrice + (pipMove / pipMultiplier)
      : openPrice - (pipMove / pipMultiplier);

    const openTime = new Date(currentDate);
    let holdMinutes: number;
    if (isScalp) {
      holdMinutes = randomFloat(2, 45);
    } else if (setup === 'Trend') {
      holdMinutes = randomFloat(180, 720);
    } else {
      holdMinutes = randomFloat(30, 480);
    }
    const closeTime = addMinutes(openTime, holdMinutes);

    const pips = Math.abs(openPrice - closePrice) * pipMultiplier;
    const profit = Math.round((closePrice - openPrice) * (type === 'buy' ? 1 : -1) * size * 100000);

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
      openPrice: parseFloat(openPrice.toFixed(isJPY ? 3 : 5)),
      closeTime: formatDateTime(closeTime),
      closePrice: parseFloat(closePrice.toFixed(isJPY ? 3 : 5)),
      sl: parseFloat(sl.toFixed(isJPY ? 3 : 5)),
      tp: parseFloat(tp.toFixed(isJPY ? 3 : 5)),
      commission: -12,
      swap: parseFloat(randomFloat(-1, 5).toFixed(1)),
      profit,
      comment: setup
    });

    runningProfit += profit;

    const hoursToAdd = randomFloat(2, 24);
    currentDate = new Date(currentDate.getTime() + hoursToAdd * 60 * 60 * 1000);

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
  let currentDate = new Date(startDate);
  let runningProfit = 0;
  const targetProfit = 7806376;
  const totalTrades = 754;

  const pairPerformance: Record<string, number> = {};
  CURRENCY_PAIRS_DATASET_B.forEach(pair => {
    pairPerformance[pair] = randomFloat(-0.6, 1.8);
  });

  const drawdownPeriods = [
    { start: 80, end: 140, severity: -1.3 },
    { start: 280, end: 340, severity: -1.6 },
    { start: 450, end: 510, severity: -0.9 },
    { start: 620, end: 680, severity: -1.1 }
  ];

  for (let i = 0; i < totalTrades; i++) {
    const pair = randomChoice(CURRENCY_PAIRS_DATASET_B);
    const { basePrice, priceRange, pipMultiplier, isJPY } = getPairInfo(pair);

    const type = randomChoice(['buy', 'sell'] as const);
    const size = parseFloat((randomFloat(0.3, 2.8)).toFixed(1));

    const remainingTrades = totalTrades - i;
    const remainingProfit = targetProfit - runningProfit;
    let profitBias = remainingProfit / remainingTrades / 10000;

    profitBias *= pairPerformance[pair];

    let periodMultiplier = 1;
    for (const period of drawdownPeriods) {
      if (i >= period.start && i <= period.end) {
        periodMultiplier = period.severity;
        break;
      }
    }
    profitBias *= periodMultiplier;

    profitBias += randomFloat(-0.4, 0.4);

    const setup = randomChoice(SETUPS);
    const isScalp = setup === 'Scalp' || Math.random() < 0.2;

    const openPrice = basePrice + randomFloat(-priceRange / 2, priceRange / 2);
    const pipMove = randomFloat(-30, 50) + profitBias * 10;
    const closePrice = type === 'buy'
      ? openPrice + (pipMove / pipMultiplier)
      : openPrice - (pipMove / pipMultiplier);

    const openTime = new Date(currentDate);
    let holdMinutes: number;
    if (isScalp) {
      holdMinutes = randomFloat(1, 35);
    } else if (setup === 'Trend') {
      holdMinutes = randomFloat(240, 1080);
    } else {
      holdMinutes = randomFloat(20, 600);
    }
    const closeTime = addMinutes(openTime, holdMinutes);

    const pips = Math.abs(openPrice - closePrice) * pipMultiplier;
    const profit = Math.round((closePrice - openPrice) * (type === 'buy' ? 1 : -1) * size * 100000);

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
      swap: parseFloat(randomFloat(-2, 6).toFixed(1)),
      profit,
      comment: setup
    });

    runningProfit += profit;

    const hoursToAdd = randomFloat(1, 18);
    currentDate = new Date(currentDate.getTime() + hoursToAdd * 60 * 60 * 1000);

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
  let currentDate = new Date(startDate);
  let runningProfit = 0;
  const targetLoss = -2206376;
  const totalTrades = 213;

  const pairPerformance: Record<string, number> = {
    'EURUSD': randomFloat(-0.8, 0.6),
    'GBPUSD': randomFloat(-1.2, 0.3),
    'USDJPY': randomFloat(-0.5, 0.9),
    'AUDUSD': randomFloat(-1.0, 0.4),
    'EURJPY': randomFloat(-0.6, 0.7),
    'GBPJPY': randomFloat(-0.9, 0.5)
  };

  const fomoTradeIndices = [42, 78, 95, 134, 167, 189];

  const recoveryPeriods = [
    { start: 10, end: 35, multiplier: 1.8 },
    { start: 98, end: 125, multiplier: 1.5 },
    { start: 170, end: 185, multiplier: 1.3 }
  ];

  for (let i = 0; i < totalTrades; i++) {
    const pair = randomChoice(CURRENCY_PAIRS_DATASET_C);
    const { basePrice, priceRange, pipMultiplier, isJPY } = getPairInfo(pair);

    const type = randomChoice(['buy', 'sell'] as const);

    const isFomoTrade = fomoTradeIndices.includes(i);
    const size = isFomoTrade
      ? parseFloat((randomFloat(4.0, 9.0)).toFixed(1))
      : parseFloat((randomFloat(0.5, 2.8)).toFixed(1));

    const remainingTrades = totalTrades - i;
    const remainingProfit = targetLoss - runningProfit;
    let profitBias = remainingProfit / remainingTrades / 10000;

    profitBias *= pairPerformance[pair];

    let periodMultiplier = 1;
    for (const period of recoveryPeriods) {
      if (i >= period.start && i <= period.end) {
        periodMultiplier = period.multiplier;
        break;
      }
    }
    profitBias *= periodMultiplier;

    if (isFomoTrade) {
      profitBias = randomFloat(-8, -3);
    } else {
      profitBias += randomFloat(-0.5, 0.5);
    }

    const setup = isFomoTrade ? 'FOMO' : randomChoice(SETUPS);
    const isScalp = setup === 'Scalp' || Math.random() < 0.12;

    const openPrice = basePrice + randomFloat(-priceRange / 2, priceRange / 2);
    const pipMove = isFomoTrade
      ? randomFloat(-90, -35)
      : randomFloat(-40, 45) + profitBias * 12;
    const closePrice = type === 'buy'
      ? openPrice + (pipMove / pipMultiplier)
      : openPrice - (pipMove / pipMultiplier);

    const openTime = new Date(currentDate);
    let holdMinutes: number;
    if (isFomoTrade) {
      holdMinutes = randomFloat(3, 90);
    } else if (isScalp) {
      holdMinutes = randomFloat(2, 40);
    } else if (setup === 'Trend') {
      holdMinutes = randomFloat(150, 600);
    } else {
      holdMinutes = randomFloat(25, 420);
    }
    const closeTime = addMinutes(openTime, holdMinutes);

    const pips = Math.abs(openPrice - closePrice) * pipMultiplier;
    const profit = Math.round((closePrice - openPrice) * (type === 'buy' ? 1 : -1) * size * 100000);

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
      swap: parseFloat(randomFloat(-3, 4).toFixed(1)),
      profit,
      comment: setup
    });

    runningProfit += profit;

    const hoursToAdd = randomFloat(3, 30);
    currentDate = new Date(currentDate.getTime() + hoursToAdd * 60 * 60 * 1000);

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
console.log(`Dataset A: ${datasetA.length} trades, Total Profit: ¥${totalProfitA.toLocaleString()}`);

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
console.log(`Dataset B: ${datasetB.length} trades, Total Profit: ¥${totalProfitB.toLocaleString()}`);

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
console.log(`Dataset C: ${datasetC.length} trades, Total Profit: ¥${totalProfitC.toLocaleString()}`);

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

const fs = require('fs');

fs.writeFileSync('./public/demo/A.csv', tradesToCSV(datasetA));
console.log('\n✅ Dataset A saved to ./public/demo/A.csv');

fs.writeFileSync('./public/demo/B.csv', tradesToCSV(datasetB));
console.log('✅ Dataset B saved to ./public/demo/B.csv');

fs.writeFileSync('./public/demo/C.csv', tradesToCSV(datasetC));
console.log('✅ Dataset C saved to ./public/demo/C.csv');
