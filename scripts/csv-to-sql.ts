import * as fs from 'fs';

type Trade = {
  ticket: string;
  item: string;
  side: string;
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

function parseCsv(filePath: string): Trade[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  const trades: Trade[] = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (parts.length >= 13) {
      trades.push({
        ticket: parts[0],
        item: parts[1],
        side: parts[2],
        size: parts[3],
        open_time: parts[4],
        open_price: parts[5],
        close_time: parts[6],
        close_price: parts[7],
        sl: parts[8],
        tp: parts[9],
        commission: parts[10],
        swap: parts[11],
        profit: parts[12],
        comment: parts[13] || ''
      });
    }
  }

  return trades;
}

function calculatePips(trade: Trade): number {
  const openPrice = parseFloat(trade.open_price);
  const closePrice = parseFloat(trade.close_price);
  const isJpy = trade.item.includes('JPY');
  const pipValue = isJpy ? 0.01 : 0.0001;

  if (trade.side === 'buy') {
    return Math.round((closePrice - openPrice) / pipValue * 10) / 10;
  } else {
    return Math.round((openPrice - closePrice) / pipValue * 10) / 10;
  }
}

function generateSqlInserts(trades: Trade[], dataset: string, batchSize: number = 50): string {
  let sql = '';

  for (let i = 0; i < trades.length; i += batchSize) {
    const batch = trades.slice(i, i + batchSize);
    const values = batch.map(trade => {
      const pips = calculatePips(trade);
      return `      (user_record.id, '${dataset}', '${trade.ticket}', '${trade.item}', '${trade.side}', ${trade.size}, '${trade.open_time}+00', ${trade.open_price}, '${trade.close_time}+00', ${trade.close_price}, ${trade.sl}, ${trade.tp}, ${trade.commission}, ${trade.swap}, ${trade.profit}, ${pips})`;
    }).join(',\n');

    sql += `    INSERT INTO trades (user_id, dataset, ticket, item, side, size, open_time, open_price, close_time, close_price, sl, tp, commission, swap, profit, pips)
    VALUES
${values}
    ON CONFLICT (user_id, dataset, ticket) DO NOTHING;\n\n`;
  }

  return sql;
}

const dataset = process.argv[2];
const csvFile = process.argv[3];

if (!dataset || !csvFile) {
  console.error('Usage: tsx csv-to-sql.ts <dataset> <csv-file>');
  process.exit(1);
}

const trades = parseCsv(csvFile);
const sql = generateSqlInserts(trades, dataset);

console.log(`DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM auth.users LOOP
${sql}  END LOOP;
END $$;`);
