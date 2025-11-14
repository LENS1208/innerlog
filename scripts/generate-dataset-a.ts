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

const pairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'EURJPY', 'GBPJPY'];
const setups = ['Trend', 'Breakout', 'Reversal', 'Pullback', 'Range', 'Scalp'];

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
  const info: Record<string, { pip: number; basePrice: number; volatility: number }> = {
    EURUSD: { pip: 0.0001, basePrice: 1.08, volatility: 0.015 },
    GBPUSD: { pip: 0.0001, basePrice: 1.28, volatility: 0.02 },
    USDJPY: { pip: 0.01, basePrice: 150, volatility: 1.5 },
    AUDUSD: { pip: 0.0001, basePrice: 0.66, volatility: 0.012 },
    EURJPY: { pip: 0.01, basePrice: 162, volatility: 1.8 },
    GBPJPY: { pip: 0.01, basePrice: 192, volatility: 2.2 }
  };
  return info[pair];
}

function calculateProfit(pair: string, side: string, size: number, pips: number): number {
  if (pair.includes('JPY')) {
    const baseValue = 1000;
    return Math.round(pips * size * baseValue);
  } else {
    const baseValue = 100000;
    return Math.round(pips * size * baseValue);
  }
}

function generateDatasetA(): Trade[] {
  const trades: Trade[] = [];
  let currentBalance = 0;
  const targetProfit = 1215332;
  const totalTrades = 262;

  let startDate = new Date('2024-12-01T00:00:00Z');
  const endDate = new Date('2025-11-30T23:59:59Z');
  const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  const daysPerTrade = totalDays / totalTrades;

  let ticketNumber = 101000600;

  const profitPerTrade = targetProfit / totalTrades;
  let accumulatedDeviation = 0;

  for (let i = 0; i < totalTrades; i++) {
    const pair = randomChoice(pairs);
    const pairInfo = getPairInfo(pair);
    const side = Math.random() > 0.5 ? 'buy' : 'sell';
    const size = parseFloat((randomBetween(1.0, 3.5)).toFixed(1));

    const baseDays = Math.floor(i * daysPerTrade);
    const daysOffset = randomInt(0, Math.floor(daysPerTrade) + 1);
    const hoursOffset = randomInt(0, 24);
    const minutesOffset = randomInt(0, 60);
    startDate = new Date(new Date('2024-12-01T00:00:00Z').getTime() + (baseDays + daysOffset) * 24 * 60 * 60 * 1000 + hoursOffset * 60 * 60 * 1000 + minutesOffset * 60 * 1000);

    const holdTimeMinutes = randomInt(180, 720);
    const closeDate = new Date(startDate.getTime() + holdTimeMinutes * 60 * 1000);

    const openPrice = pairInfo.basePrice + randomBetween(-pairInfo.volatility, pairInfo.volatility);

    const cyclePosition = (i % 10) / 10;
    const isUpCycle = Math.floor((i / 10)) % 2 === 0;

    let targetPips: number;
    if (isUpCycle) {
      if (cyclePosition < 0.7) {
        targetPips = randomBetween(15, 45);
      } else {
        targetPips = randomBetween(-35, -15);
      }
    } else {
      if (cyclePosition < 0.6) {
        targetPips = randomBetween(-40, -10);
      } else {
        targetPips = randomBetween(20, 50);
      }
    }

    const tradeTarget = profitPerTrade + accumulatedDeviation;
    const estimatedPips = tradeTarget / (size * (pair.includes('JPY') ? 1000 : 100000));
    targetPips = estimatedPips * 0.7 + targetPips * 0.3;

    const actualPips = targetPips + randomBetween(-5, 5);

    const profit = calculateProfit(pair, side, size, actualPips);
    accumulatedDeviation = tradeTarget - profit;
    currentBalance += profit;

    let closePrice: number;
    if (side === 'buy') {
      closePrice = openPrice + (actualPips * pairInfo.pip);
    } else {
      closePrice = openPrice - (actualPips * pairInfo.pip);
    }

    const slDistance = Math.abs(actualPips) > 20 ? randomBetween(25, 35) : randomBetween(15, 25);
    const tpDistance = Math.abs(actualPips) > 20 ? randomBetween(40, 60) : randomBetween(30, 45);

    const sl = side === 'buy'
      ? openPrice - (slDistance * pairInfo.pip)
      : openPrice + (slDistance * pairInfo.pip);
    const tp = side === 'buy'
      ? openPrice + (tpDistance * pairInfo.pip)
      : openPrice - (tpDistance * pairInfo.pip);

    const commission = -12;
    const swap = parseFloat(randomBetween(1.5, 5.5).toFixed(1));
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

const tradesA = generateDatasetA();
console.log(tradesToCSV(tradesA));
