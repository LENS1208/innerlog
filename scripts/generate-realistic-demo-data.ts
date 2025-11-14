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

const SETUPS = ['Trend', 'Breakout', 'Reversal', 'Pullback', 'Range', 'Scalp'];

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addHours(date: Date, hours: number): Date {
  const newDate = new Date(date);
  newDate.setHours(newDate.getHours() + hours);
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

  const tradesPerMonth = 22;
  const totalTrades = 262;

  for (let i = 0; i < totalTrades; i++) {
    const pair = randomChoice(CURRENCY_PAIRS_DATASET_A);
    const { basePrice, priceRange, pipMultiplier, isJPY } = getPairInfo(pair);

    const type = randomChoice(['buy', 'sell'] as const);
    const size = parseFloat((randomFloat(0.5, 3.5)).toFixed(1));

    const remainingTrades = totalTrades - i;
    const remainingProfit = targetProfit - runningProfit;
    const avgProfitNeeded = remainingProfit / remainingTrades;

    let profitBias = avgProfitNeeded / 10000;

    if (i < 50) {
      profitBias *= randomFloat(0.3, 1.5);
    } else if (i < 150) {
      profitBias *= randomFloat(0.8, 1.2);
    } else {
      profitBias *= randomFloat(0.9, 1.1);
    }

    const openPrice = basePrice + randomFloat(-priceRange / 2, priceRange / 2);
    const pipMove = randomFloat(-30, 50) + profitBias * 10;
    const closePrice = type === 'buy'
      ? openPrice + (pipMove / pipMultiplier)
      : openPrice - (pipMove / pipMultiplier);

    const openTime = new Date(currentDate);
    const holdHours = randomFloat(0.5, 12);
    const closeTime = addHours(openTime, holdHours);

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
      comment: randomChoice(SETUPS)
    });

    runningProfit += profit;

    const daysToAdd = randomFloat(1, 3);
    currentDate = new Date(currentDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

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
    pairPerformance[pair] = randomFloat(0.4, 1.6);
  });

  for (let i = 0; i < totalTrades; i++) {
    const pair = randomChoice(CURRENCY_PAIRS_DATASET_B);
    const { basePrice, priceRange, pipMultiplier, isJPY } = getPairInfo(pair);

    const type = randomChoice(['buy', 'sell'] as const);
    const size = parseFloat((randomFloat(0.3, 2.5)).toFixed(1));

    const remainingTrades = totalTrades - i;
    const remainingProfit = targetProfit - runningProfit;
    const avgProfitNeeded = remainingProfit / remainingTrades;

    let profitBias = (avgProfitNeeded / 10000) * pairPerformance[pair];

    const openPrice = basePrice + randomFloat(-priceRange / 2, priceRange / 2);
    const pipMove = randomFloat(-25, 40) + profitBias * 8;
    const closePrice = type === 'buy'
      ? openPrice + (pipMove / pipMultiplier)
      : openPrice - (pipMove / pipMultiplier);

    const openTime = new Date(currentDate);
    const holdHours = randomFloat(0.2, 18);
    const closeTime = addHours(openTime, holdHours);

    const pips = Math.abs(openPrice - closePrice) * pipMultiplier;
    const profit = Math.round((closePrice - openPrice) * (type === 'buy' ? 1 : -1) * size * 100000);

    const slDistance = randomFloat(8, 20) / pipMultiplier;
    const tpDistance = randomFloat(15, 50) / pipMultiplier;
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
      comment: randomChoice(SETUPS)
    });

    runningProfit += profit;

    const hoursToAdd = randomFloat(4, 36);
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

  const fomoTradeIndices = [45, 78, 112, 156, 189];

  for (let i = 0; i < totalTrades; i++) {
    const pair = randomChoice(CURRENCY_PAIRS_DATASET_C);
    const { basePrice, priceRange, pipMultiplier, isJPY } = getPairInfo(pair);

    const type = randomChoice(['buy', 'sell'] as const);

    const isFomoTrade = fomoTradeIndices.includes(i);
    const size = isFomoTrade
      ? parseFloat((randomFloat(3.5, 8.0)).toFixed(1))
      : parseFloat((randomFloat(0.5, 2.5)).toFixed(1));

    const remainingTrades = totalTrades - i;
    const remainingProfit = targetLoss - runningProfit;
    const avgProfitNeeded = remainingProfit / remainingTrades;

    let profitBias = avgProfitNeeded / 10000;

    if (isFomoTrade) {
      profitBias *= randomFloat(-5, -2);
    } else {
      profitBias *= randomFloat(0.5, 1.5);
    }

    const openPrice = basePrice + randomFloat(-priceRange / 2, priceRange / 2);
    const pipMove = isFomoTrade
      ? randomFloat(-80, -40)
      : randomFloat(-30, 40) + profitBias * 10;
    const closePrice = type === 'buy'
      ? openPrice + (pipMove / pipMultiplier)
      : openPrice - (pipMove / pipMultiplier);

    const openTime = new Date(currentDate);
    const holdHours = isFomoTrade
      ? randomFloat(0.1, 2)
      : randomFloat(0.3, 10);
    const closeTime = addHours(openTime, holdHours);

    const pips = Math.abs(openPrice - closePrice) * pipMultiplier;
    const profit = Math.round((closePrice - openPrice) * (type === 'buy' ? 1 : -1) * size * 100000);

    const slDistance = isFomoTrade
      ? randomFloat(40, 80) / pipMultiplier
      : randomFloat(10, 25) / pipMultiplier;
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
      swap: parseFloat(randomFloat(-3, 4).toFixed(1)),
      profit,
      comment: isFomoTrade ? 'FOMO' : randomChoice(SETUPS)
    });

    runningProfit += profit;

    const daysToAdd = randomFloat(0.8, 2.5);
    currentDate = new Date(currentDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

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
console.log(`Dataset A: ${datasetA.length} trades, Total Profit: ¥${datasetA.reduce((sum, t) => sum + t.profit, 0).toLocaleString()}`);

console.log('\nGenerating Dataset B...');
const datasetB = generateDatasetB();
console.log(`Dataset B: ${datasetB.length} trades, Total Profit: ¥${datasetB.reduce((sum, t) => sum + t.profit, 0).toLocaleString()}`);

console.log('\nGenerating Dataset C...');
const datasetC = generateDatasetC();
console.log(`Dataset C: ${datasetC.length} trades, Total Profit: ¥${datasetC.reduce((sum, t) => sum + t.profit, 0).toLocaleString()}`);

const fs = require('fs');

fs.writeFileSync('./public/demo/A.csv', tradesToCSV(datasetA));
console.log('\n✅ Dataset A saved to ./public/demo/A.csv');

fs.writeFileSync('./public/demo/B.csv', tradesToCSV(datasetB));
console.log('✅ Dataset B saved to ./public/demo/B.csv');

fs.writeFileSync('./public/demo/C.csv', tradesToCSV(datasetC));
console.log('✅ Dataset C saved to ./public/demo/C.csv');
