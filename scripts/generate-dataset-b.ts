type Trade = {
  ticket: string;
  item: string;
  side: 'buy' | 'sell';
  size: string;
  open_time: string;
  open_price: string;
  close_time: string;
  close_price: string;
  sl: string;
  tp: string;
  commission: string;
  swap: string;
  profit: string;
  comment: string;
};

const pairs = [
  'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'EURJPY', 'GBPJPY',
  'USDCAD', 'NZDUSD', 'EURGBP', 'AUDJPY', 'CHFJPY', 'CADJPY',
  'NZDJPY', 'USDCHF', 'AUDCAD', 'GBPCHF'
];

const pairPerformance: Record<string, number> = {
  'EURUSD': 0.65,
  'GBPUSD': 0.45,
  'USDJPY': 0.75,
  'AUDUSD': 0.55,
  'EURJPY': 0.70,
  'GBPJPY': 0.40,
  'USDCAD': 0.60,
  'NZDUSD': 0.50,
  'EURGBP': 0.35,
  'AUDJPY': 0.68,
  'CHFJPY': 0.42,
  'CADJPY': 0.58,
  'NZDJPY': 0.48,
  'USDCHF': 0.52,
  'AUDCAD': 0.62,
  'GBPCHF': 0.38
};

const setups = ['Trend', 'Breakout', 'Reversal', 'Pullback', 'Range', 'Scalp', 'News', 'Pattern'];

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number): number {
  return Math.floor(randomBetween(min, max));
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weightedRandomPair(): string {
  const weights = pairs.map(p => 1 / pairs.length);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < pairs.length; i++) {
    random -= weights[i];
    if (random <= 0) return pairs[i];
  }
  return pairs[0];
}

function formatDate(date: Date): string {
  return date.toISOString().replace('T', ' ').slice(0, 19);
}

function getPairInfo(pair: string) {
  const basePrices: Record<string, number> = {
    EURUSD: 1.08, GBPUSD: 1.28, USDJPY: 150, AUDUSD: 0.66,
    EURJPY: 162, GBPJPY: 192, USDCAD: 1.36, NZDUSD: 0.61,
    EURGBP: 0.84, AUDJPY: 98, CHFJPY: 168, CADJPY: 110,
    NZDJPY: 91, USDCHF: 0.89, AUDCAD: 0.90, GBPCHF: 1.14
  };

  const volatilities: Record<string, number> = {
    EURUSD: 0.015, GBPUSD: 0.02, USDJPY: 1.5, AUDUSD: 0.012,
    EURJPY: 1.8, GBPJPY: 2.2, USDCAD: 0.018, NZDUSD: 0.014,
    EURGBP: 0.01, AUDJPY: 1.2, CHFJPY: 2.0, CADJPY: 1.3,
    NZDJPY: 1.1, USDCHF: 0.013, AUDCAD: 0.016, GBPCHF: 0.022
  };

  const pip = pair.includes('JPY') ? 0.01 : 0.0001;
  return { pip, basePrice: basePrices[pair] || 1.0, volatility: volatilities[pair] || 0.015 };
}

function calculateProfit(pair: string, size: number, pips: number): number {
  if (pair.includes('JPY')) {
    return Math.round(pips * size * 1000);
  } else {
    return Math.round(pips * size * 100000);
  }
}

function generateDatasetB(): Trade[] {
  const trades: Trade[] = [];
  const totalTrades = 754;
  let startDate = new Date('2024-08-01T00:00:00Z');
  let ticketNumber = 102000100;

  for (let i = 0; i < totalTrades; i++) {
    const pair = weightedRandomPair();
    const pairInfo = getPairInfo(pair);
    const performance = pairPerformance[pair] || 0.5;
    const side = Math.random() > 0.5 ? 'buy' : 'sell';
    const size = parseFloat((randomBetween(0.5, 4.0)).toFixed(1));

    const daysOffset = randomInt(0, 5);
    const hoursOffset = randomInt(0, 24);
    const minutesOffset = randomInt(0, 60);
    startDate = new Date(startDate.getTime() + daysOffset * 24 * 60 * 60 * 1000 + hoursOffset * 60 * 60 * 1000 + minutesOffset * 60 * 1000);

    const holdTimeMinutes = randomInt(120, 900);
    const closeDate = new Date(startDate.getTime() + holdTimeMinutes * 60 * 1000);

    const openPrice = pairInfo.basePrice + randomBetween(-pairInfo.volatility, pairInfo.volatility);

    const isWin = Math.random() < performance;
    let targetPips: number;

    if (isWin) {
      targetPips = randomBetween(10, 60);
    } else {
      targetPips = randomBetween(-50, -8);
    }

    const actualPips = targetPips + randomBetween(-3, 3);
    const profit = calculateProfit(pair, size, actualPips);

    let closePrice: number;
    if (side === 'buy') {
      closePrice = openPrice + (actualPips * pairInfo.pip);
    } else {
      closePrice = openPrice - (actualPips * pairInfo.pip);
    }

    const slDistance = randomBetween(20, 40);
    const tpDistance = randomBetween(35, 70);

    const sl = side === 'buy'
      ? openPrice - (slDistance * pairInfo.pip)
      : openPrice + (slDistance * pairInfo.pip);
    const tp = side === 'buy'
      ? openPrice + (tpDistance * pairInfo.pip)
      : openPrice - (tpDistance * pairInfo.pip);

    const commission = -12;
    const swap = parseFloat(randomBetween(0.8, 6.2).toFixed(1));
    const setup = randomChoice(setups);

    trades.push({
      ticket: `${ticketNumber++}`,
      item: pair,
      side,
      size: size.toFixed(1),
      open_time: formatDate(startDate),
      open_price: pairInfo.pip === 0.01 ? openPrice.toFixed(2) : openPrice.toFixed(4),
      close_time: formatDate(closeDate),
      close_price: pairInfo.pip === 0.01 ? closePrice.toFixed(2) : closePrice.toFixed(4),
      sl: pairInfo.pip === 0.01 ? sl.toFixed(2) : sl.toFixed(4),
      tp: pairInfo.pip === 0.01 ? tp.toFixed(2) : tp.toFixed(4),
      commission: commission.toString(),
      swap: swap.toFixed(1),
      profit: profit.toString(),
      comment: setup
    });
  }

  return trades;
}

function tradesToCSV(trades: Trade[]): string {
  const header = 'Ticket,Item,Type,Size,Open Time,Open Price,Close Time,Close Price,S/L,T/P,Commission,Swap,Profit,Comment';
  const rows = trades.map(t =>
    `${t.ticket},${t.item},${t.side},${t.size},${t.open_time},${t.open_price},${t.close_time},${t.close_price},${t.sl},${t.tp},${t.commission},${t.swap},${t.profit},${t.comment}`
  );
  return [header, ...rows].join('\n');
}

const tradesB = generateDatasetB();
console.log(tradesToCSV(tradesB));
