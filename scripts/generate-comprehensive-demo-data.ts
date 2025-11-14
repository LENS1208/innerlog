import * as fs from 'fs';
import * as path from 'path';

const pairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'EURJPY', 'GBPJPY', 'AUDJPY', 'NZDUSD', 'USDCAD', 'USDCHF', 'EURGBP', 'EURAUD'];
const setups = ['Trend', 'Breakout', 'Reversal', 'Pullback', 'Range', 'Scalp', 'News', 'Support', 'Resistance', 'Swing', 'Position'];
const sessions = ['tokyo', 'london', 'ny'];

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
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${y}.${m}.${d} ${h}:${min}:${s}`;
}

function generateBasePrice(pair: string): number {
  const basePrices: Record<string, number> = {
    'EURUSD': 1.08,
    'GBPUSD': 1.27,
    'USDJPY': 150,
    'AUDUSD': 0.66,
    'EURJPY': 163,
    'GBPJPY': 195,
    'AUDJPY': 99,
    'NZDUSD': 0.59,
    'USDCAD': 1.36,
    'USDCHF': 0.88,
    'EURGBP': 0.85,
    'EURAUD': 1.64,
  };
  return basePrices[pair] || 1.0;
}

function getSessionHours(session: string): [number, number] {
  if (session === 'tokyo') return [0, 8];
  if (session === 'london') return [8, 16];
  return [16, 23];
}

interface Trade {
  ticket: number;
  item: string;
  type: 'buy' | 'sell';
  size: number;
  openTime: Date;
  openPrice: number;
  closeTime: Date;
  closePrice: number;
  sl: number;
  tp: number;
  commission: number;
  swap: number;
  profit: number;
  comment: string;
}

function generateDatasetA(): Trade[] {
  const trades: Trade[] = [];
  const startDate = new Date('2024-02-01T00:00:00Z');
  const endDate = new Date('2025-11-30T23:59:59Z');
  const targetCount = 251;
  const targetProfit = 1215377;

  let currentDate = new Date(startDate);
  let ticket = 101000000;
  let cumulativeProfit = 0;

  const favoredPairs = ['EURUSD', 'USDJPY', 'GBPUSD'];
  const favoredSetups = ['Trend', 'Breakout', 'Pullback'];

  const losingPeriods = [
    { start: new Date('2024-03-15T00:00:00Z'), end: new Date('2024-04-10T00:00:00Z') },
    { start: new Date('2024-06-01T00:00:00Z'), end: new Date('2024-06-20T00:00:00Z') },
    { start: new Date('2024-09-05T00:00:00Z'), end: new Date('2024-09-25T00:00:00Z') }
  ];

  function isInLosingPeriod(date: Date): boolean {
    return losingPeriods.some(period => date >= period.start && date <= period.end);
  }

  while (trades.length < targetCount) {
    if (currentDate > endDate) {
      currentDate = new Date(startDate);
    }

    if (currentDate.getUTCDay() === 0 || currentDate.getUTCDay() === 6) {
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
      continue;
    }

    const remaining = targetCount - trades.length;
    const tradesPerDay = Math.min(remaining, randomInt(1, 3));

    for (let i = 0; i < tradesPerDay && trades.length < targetCount; i++) {
      const session = randomChoice(sessions);
      const [startHour, endHour] = getSessionHours(session);
      const hour = randomInt(startHour, endHour);
      const minute = randomInt(0, 59);

      const openTime = new Date(currentDate);
      openTime.setUTCHours(hour, minute, 0, 0);

      const isSwingOrPosition = Math.random() < 0.12;
      let holdingMinutes: number;
      let setup: string;

      if (isSwingOrPosition) {
        if (Math.random() < 0.6) {
          setup = 'Swing';
          holdingMinutes = randomInt(2880, 10080);
        } else {
          setup = 'Position';
          holdingMinutes = randomInt(10080, 43200);
        }
      } else {
        holdingMinutes = randomInt(60, 480);
        setup = Math.random() < 0.6 ? randomChoice(favoredSetups) : randomChoice(setups.filter(s => s !== 'Swing' && s !== 'Position'));
      }

      const closeTime = new Date(openTime);
      closeTime.setMinutes(closeTime.getMinutes() + holdingMinutes);

      const pair = Math.random() < 0.7 ? randomChoice(favoredPairs) : randomChoice(pairs);
      const type: 'buy' | 'sell' = Math.random() < 0.5 ? 'buy' : 'sell';
      const size = Number((randomBetween(0.3, 2.5)).toFixed(1));

      const basePrice = generateBasePrice(pair);
      const priceVariation = basePrice * randomBetween(-0.02, 0.02);
      const openPrice = Number((basePrice + priceVariation).toFixed(pair.includes('JPY') ? 2 : 4));

      const inLosingPeriod = isInLosingPeriod(currentDate);
      const baseWinRate = inLosingPeriod ? 0.35 : 0.58;
      const isWin = Math.random() < baseWinRate;

      let pipMove: number;
      if (isWin) {
        if (isSwingOrPosition) {
          pipMove = randomBetween(30, 120);
        } else {
          pipMove = randomBetween(5, 35);
        }
      } else {
        if (isSwingOrPosition) {
          pipMove = -randomBetween(25, 90);
        } else {
          pipMove = -randomBetween(5, 30);
        }
      }

      const pipValue = pair.includes('JPY') ? 0.01 : 0.0001;
      const closePrice = Number((openPrice + (type === 'buy' ? pipMove : -pipMove) * pipValue).toFixed(pair.includes('JPY') ? 2 : 4));

      const profitPerPip = pair.includes('JPY') ? 1000 : 10000;
      let profit = Math.round(pipMove * size * profitPerPip);

      if (trades.length === targetCount - 1) {
        profit = targetProfit - cumulativeProfit;
      } else if (trades.length >= targetCount - 15) {
        const remaining = targetProfit - cumulativeProfit;
        const tradesLeft = targetCount - trades.length;
        if (tradesLeft > 0) {
          const adjustmentFactor = 0.4;
          const adjustment = (remaining / tradesLeft) * adjustmentFactor;
          profit = Math.round(profit + adjustment);
        }
      }

      cumulativeProfit += profit;

      const sl = Number((openPrice + (type === 'buy' ? -25 : 25) * pipValue).toFixed(pair.includes('JPY') ? 2 : 4));
      const tp = Number((openPrice + (type === 'buy' ? 40 : -40) * pipValue).toFixed(pair.includes('JPY') ? 2 : 4));

      const swapAmount = isSwingOrPosition ? Number(randomBetween(-20, 15).toFixed(1)) : Number(randomBetween(0.5, 5).toFixed(1));

      trades.push({
        ticket: ticket++,
        item: pair,
        type,
        size,
        openTime,
        openPrice,
        closeTime,
        closePrice,
        sl,
        tp,
        commission: -12,
        swap: swapAmount,
        profit,
        comment: setup,
      });
    }

    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  return trades.slice(0, targetCount);
}

function generateDatasetB(): Trade[] {
  const trades: Trade[] = [];
  const startDate = new Date('2024-08-01T00:00:00Z');
  const endDate = new Date('2025-11-30T23:59:59Z');
  const targetCount = 754;

  const pairPerformance: Record<string, number> = {
    'EURUSD': 0.65,
    'GBPUSD': 0.40,
    'USDJPY': 0.62,
    'AUDUSD': 0.35,
    'EURJPY': 0.58,
    'GBPJPY': 0.45,
    'AUDJPY': 0.50,
    'NZDUSD': 0.38,
    'USDCAD': 0.55,
    'USDCHF': 0.52,
    'EURGBP': 0.48,
    'EURAUD': 0.60,
  };

  let currentDate = new Date(startDate);
  let ticket = 102000000;

  while (trades.length < targetCount) {
    if (currentDate > endDate) {
      currentDate = new Date(startDate);
    }

    if (currentDate.getUTCDay() === 0 || currentDate.getUTCDay() === 6) {
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
      continue;
    }

    const remaining = targetCount - trades.length;
    const tradesPerDay = Math.min(remaining, randomInt(1, 3));

    for (let i = 0; i < tradesPerDay && trades.length < targetCount; i++) {
      const session = randomChoice(sessions);
      const [startHour, endHour] = getSessionHours(session);
      const hour = randomInt(startHour, endHour);
      const minute = randomInt(0, 59);

      const openTime = new Date(currentDate);
      openTime.setUTCHours(hour, minute, 0, 0);

      const holdingMinutes = randomInt(90, 600);
      const closeTime = new Date(openTime);
      closeTime.setMinutes(closeTime.getMinutes() + holdingMinutes);

      const pair = randomChoice(pairs);
      const setup = randomChoice(setups);
      const type: 'buy' | 'sell' = Math.random() < 0.5 ? 'buy' : 'sell';
      const size = Number((randomBetween(0.3, 2.0)).toFixed(1));

      const basePrice = generateBasePrice(pair);
      const priceVariation = basePrice * randomBetween(-0.02, 0.02);
      const openPrice = Number((basePrice + priceVariation).toFixed(pair.includes('JPY') ? 2 : 4));

      const winRate = pairPerformance[pair] || 0.5;
      const isWin = Math.random() < winRate;

      let pipMove: number;
      if (isWin) {
        pipMove = randomBetween(8, 30);
      } else {
        pipMove = -randomBetween(8, 25);
      }

      const pipValue = pair.includes('JPY') ? 0.01 : 0.0001;
      const closePrice = Number((openPrice + (type === 'buy' ? pipMove : -pipMove) * pipValue).toFixed(pair.includes('JPY') ? 2 : 4));

      const profitPerPip = pair.includes('JPY') ? 1000 : 10000;
      const profit = Math.round(pipMove * size * profitPerPip);

      const sl = Number((openPrice + (type === 'buy' ? -20 : 20) * pipValue).toFixed(pair.includes('JPY') ? 2 : 4));
      const tp = Number((openPrice + (type === 'buy' ? 35 : -35) * pipValue).toFixed(pair.includes('JPY') ? 2 : 4));

      trades.push({
        ticket: ticket++,
        item: pair,
        type,
        size,
        openTime,
        openPrice,
        closeTime,
        closePrice,
        sl,
        tp,
        commission: -12,
        swap: Number(randomBetween(0.5, 4).toFixed(1)),
        profit,
        comment: setup,
      });
    }

    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  return trades.slice(0, targetCount);
}

function generateDatasetC(): Trade[] {
  const trades: Trade[] = [];
  const startDate = new Date('2025-01-01T00:00:00Z');
  const endDate = new Date('2025-11-30T23:59:59Z');
  const targetCount = 213;

  let currentDate = new Date(startDate);
  let ticket = 103000000;
  let cumulativeProfit = 0;
  let winStreak = 0;

  while (trades.length < targetCount) {
    if (currentDate > endDate) {
      currentDate = new Date(startDate);
    }

    if (currentDate.getUTCDay() === 0 || currentDate.getUTCDay() === 6) {
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
      continue;
    }

    const shouldTrade = trades.length < targetCount ? (Math.random() < 0.8 || trades.length > targetCount * 0.9) : false;
    if (!shouldTrade) {
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
      continue;
    }

    const remaining = targetCount - trades.length;
    const tradesPerDay = Math.min(remaining, randomInt(1, 3));

    for (let i = 0; i < tradesPerDay && trades.length < targetCount; i++) {
      const session = randomChoice(sessions);
      const [startHour, endHour] = getSessionHours(session);
      const hour = randomInt(startHour, endHour);
      const minute = randomInt(0, 59);

      const openTime = new Date(currentDate);
      openTime.setUTCHours(hour, minute, 0, 0);

      const holdingMinutes = randomInt(30, 360);
      const closeTime = new Date(openTime);
      closeTime.setMinutes(closeTime.getMinutes() + holdingMinutes);

      const pair = randomChoice(pairs);
      const setup = randomChoice(setups);
      const type: 'buy' | 'sell' = Math.random() < 0.5 ? 'buy' : 'sell';
      const size = Number((randomBetween(0.8, 4.0)).toFixed(1));

      const basePrice = generateBasePrice(pair);
      const priceVariation = basePrice * randomBetween(-0.03, 0.03);
      const openPrice = Number((basePrice + priceVariation).toFixed(pair.includes('JPY') ? 2 : 4));

      let isWin: boolean;
      let pipMove: number;

      const bigLossProbability = cumulativeProfit > 50000 ? 0.25 : 0.10;
      const isBigLoss = Math.random() < bigLossProbability;

      if (isBigLoss) {
        isWin = false;
        pipMove = -randomBetween(40, 80);
        winStreak = 0;
      } else {
        const baseWinRate = 0.55;
        isWin = Math.random() < baseWinRate;

        if (isWin) {
          winStreak++;
          pipMove = randomBetween(10, 35);
        } else {
          winStreak = 0;
          pipMove = -randomBetween(8, 25);
        }
      }

      const pipValue = pair.includes('JPY') ? 0.01 : 0.0001;
      const closePrice = Number((openPrice + (type === 'buy' ? pipMove : -pipMove) * pipValue).toFixed(pair.includes('JPY') ? 2 : 4));

      const profitPerPip = pair.includes('JPY') ? 1000 : 10000;
      const profit = Math.round(pipMove * size * profitPerPip);

      cumulativeProfit += profit;

      const sl = Number((openPrice + (type === 'buy' ? -30 : 30) * pipValue).toFixed(pair.includes('JPY') ? 2 : 4));
      const tp = Number((openPrice + (type === 'buy' ? 45 : -45) * pipValue).toFixed(pair.includes('JPY') ? 2 : 4));

      trades.push({
        ticket: ticket++,
        item: pair,
        type,
        size,
        openTime,
        openPrice,
        closeTime,
        closePrice,
        sl,
        tp,
        commission: -12,
        swap: Number(randomBetween(-2, 3).toFixed(1)),
        profit,
        comment: setup,
      });
    }

    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  return trades.slice(0, targetCount);
}

function tradesToCSV(trades: Trade[]): string {
  const header = 'Ticket\tItem\tType\tSize\tOpen Time\tOpen Price\tClose Time\tClose Price\tS/L\tT/P\tCommission\tSwap\tProfit\tComment\n';
  const rows = trades.map(t =>
    `${t.ticket}\t${t.item}\t${t.type}\t${t.size}\t${formatDate(t.openTime)}\t${t.openPrice}\t${formatDate(t.closeTime)}\t${t.closePrice}\t${t.sl}\t${t.tp}\t${t.commission}\t${t.swap}\t${t.profit}\t${t.comment}`
  ).join('\n');
  return header + rows + '\n';
}

console.log('Generating Dataset A (High-frequency trader, 1253 trades)...');
const datasetA = generateDatasetA();
console.log(`Generated ${datasetA.length} trades for Dataset A`);
console.log(`Date range: ${formatDate(datasetA[0].openTime)} to ${formatDate(datasetA[datasetA.length - 1].openTime)}`);
console.log(`Total profit: ${datasetA.reduce((sum, t) => sum + t.profit, 0).toLocaleString()} JPY`);

console.log('\nGenerating Dataset B (Multi-currency trader, 754 trades)...');
const datasetB = generateDatasetB();
console.log(`Generated ${datasetB.length} trades for Dataset B`);
console.log(`Date range: ${formatDate(datasetB[0].openTime)} to ${formatDate(datasetB[datasetB.length - 1].openTime)}`);
console.log(`Total profit: ${datasetB.reduce((sum, t) => sum + t.profit, 0).toLocaleString()} JPY`);

console.log('\nGenerating Dataset C (No-game trader, 213 trades)...');
const datasetC = generateDatasetC();
console.log(`Generated ${datasetC.length} trades for Dataset C`);
console.log(`Date range: ${formatDate(datasetC[0].openTime)} to ${formatDate(datasetC[datasetC.length - 1].openTime)}`);
console.log(`Total profit: ${datasetC.reduce((sum, t) => sum + t.profit, 0).toLocaleString()} JPY`);

const outputDir = path.join(process.cwd(), 'public', 'demo');
fs.writeFileSync(path.join(outputDir, 'A.csv'), tradesToCSV(datasetA));
fs.writeFileSync(path.join(outputDir, 'B.csv'), tradesToCSV(datasetB));
fs.writeFileSync(path.join(outputDir, 'C.csv'), tradesToCSV(datasetC));

console.log('\n✅ All datasets generated successfully!');
console.log('Files saved to public/demo/');
