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

const pairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'EURJPY', 'GBPJPY', 'USDCAD', 'NZDUSD'];
const setups = ['Trend', 'Breakout', 'Reversal', 'Pullback', 'Range', 'Scalp', 'FOMO', 'Revenge'];

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number): number {
  return Math.floor(randomBetween(min, max));
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatDate(date: Date): string {
  return date.toISOString().replace('T', ' ').slice(0, 19);
}

function getPairInfo(pair: string) {
  const basePrices: Record<string, number> = {
    EURUSD: 1.08, GBPUSD: 1.28, USDJPY: 150, AUDUSD: 0.66,
    EURJPY: 162, GBPJPY: 192, USDCAD: 1.36, NZDUSD: 0.61
  };

  const volatilities: Record<string, number> = {
    EURUSD: 0.015, GBPUSD: 0.02, USDJPY: 1.5, AUDUSD: 0.012,
    EURJPY: 1.8, GBPJPY: 2.2, USDCAD: 0.018, NZDUSD: 0.014
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

function generateDatasetC(): Trade[] {
  const trades: Trade[] = [];
  const totalTrades = 213;
  const targetProfit = -2206376;
  let startDate = new Date('2025-01-01T00:00:00Z');
  const endDate = new Date('2025-11-30T23:59:59Z');
  const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  const daysPerTrade = totalDays / totalTrades;

  let ticketNumber = 103000100;
  let profitStreak = 0;
  let currentBalance = 0;

  for (let i = 0; i < totalTrades; i++) {
    const pair = randomChoice(pairs);
    const pairInfo = getPairInfo(pair);
    const side = Math.random() > 0.5 ? 'buy' : 'sell';
    const size = parseFloat((randomBetween(0.8, 3.5)).toFixed(1));

    const baseDays = Math.floor(i * daysPerTrade);
    const daysOffset = randomInt(0, Math.floor(daysPerTrade) + 1);
    const hoursOffset = randomInt(0, 24);
    const minutesOffset = randomInt(0, 60);
    startDate = new Date(new Date('2025-01-01T00:00:00Z').getTime() + (baseDays + daysOffset) * 24 * 60 * 60 * 1000 + hoursOffset * 60 * 60 * 1000 + minutesOffset * 60 * 1000);

    const holdTimeMinutes = randomInt(90, 1200);
    const closeDate = new Date(startDate.getTime() + holdTimeMinutes * 60 * 1000);

    const openPrice = pairInfo.basePrice + randomBetween(-pairInfo.volatility, pairInfo.volatility);

    let targetPips: number;
    let setup: string;
    let isMistake = false;

    if (profitStreak >= 3 && Math.random() < 0.35) {
      isMistake = true;
      targetPips = randomBetween(-120, -50);
      setup = Math.random() > 0.5 ? 'FOMO' : 'Revenge';
      profitStreak = 0;
    } else if (profitStreak >= 5 && Math.random() < 0.5) {
      isMistake = true;
      targetPips = randomBetween(-150, -60);
      setup = 'Revenge';
      profitStreak = 0;
    } else {
      const winRate = 0.62;
      const isWin = Math.random() < winRate;

      if (isWin) {
        targetPips = randomBetween(15, 55);
        profitStreak++;
        setup = randomChoice(['Trend', 'Breakout', 'Reversal', 'Pullback']);
      } else {
        targetPips = randomBetween(-35, -10);
        profitStreak = Math.max(0, profitStreak - 1);
        setup = randomChoice(['Range', 'Scalp', 'Breakout']);
      }
    }

    const actualPips = targetPips + randomBetween(-4, 4);
    const profit = calculateProfit(pair, size, actualPips);
    currentBalance += profit;

    let closePrice: number;
    if (side === 'buy') {
      closePrice = openPrice + (actualPips * pairInfo.pip);
    } else {
      closePrice = openPrice - (actualPips * pairInfo.pip);
    }

    let slDistance: number;
    let tpDistance: number;

    if (isMistake) {
      slDistance = randomBetween(120, 200);
      tpDistance = randomBetween(30, 50);
    } else {
      slDistance = randomBetween(20, 40);
      tpDistance = randomBetween(40, 70);
    }

    const sl = side === 'buy'
      ? openPrice - (slDistance * pairInfo.pip)
      : openPrice + (slDistance * pairInfo.pip);
    const tp = side === 'buy'
      ? openPrice + (tpDistance * pairInfo.pip)
      : openPrice - (tpDistance * pairInfo.pip);

    const commission = -12;
    const swap = parseFloat(randomBetween(1.0, 5.8).toFixed(1));

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

  const actualTotal = trades.reduce((sum, t) => sum + parseInt(t.profit), 0);
  const adjustment = targetProfit - actualTotal;
  const lastTrade = trades[trades.length - 1];
  lastTrade.profit = (parseInt(lastTrade.profit) + adjustment).toString();

  return trades;
}

function tradesToCSV(trades: Trade[]): string {
  const header = 'Ticket,Item,Type,Size,Open Time,Open Price,Close Time,Close Price,S/L,T/P,Commission,Swap,Profit,Comment';
  const rows = trades.map(t =>
    `${t.ticket},${t.item},${t.side},${t.size},${t.open_time},${t.open_price},${t.close_time},${t.close_price},${t.sl},${t.tp},${t.commission},${t.swap},${t.profit},${t.comment}`
  );
  return [header, ...rows].join('\n');
}

const tradesC = generateDatasetC();
console.log(tradesToCSV(tradesC));
