import * as fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

type Trade = {
  dataset: string;
  ticket: string;
  item: string;
  side: string;
  size: number;
  open_time: string;
  open_price: number;
  close_time: string;
  close_price: number;
  sl: number;
  tp: number;
  commission: number;
  swap: number;
  profit: number;
  pips: number;
};

function parseCsv(filePath: string, dataset: string): Trade[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  const trades: Trade[] = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (parts.length >= 13) {
      const trade: Trade = {
        dataset,
        ticket: parts[0],
        item: parts[1],
        side: parts[2],
        size: parseFloat(parts[3]),
        open_time: parts[4],
        open_price: parseFloat(parts[5]),
        close_time: parts[6],
        close_price: parseFloat(parts[7]),
        sl: parseFloat(parts[8]),
        tp: parseFloat(parts[9]),
        commission: parseFloat(parts[10]),
        swap: parseFloat(parts[11]),
        profit: parseFloat(parts[12]),
        pips: 0
      };

      const isJpy = trade.item.includes('JPY');
      const pipValue = isJpy ? 0.01 : 0.0001;
      if (trade.side === 'buy') {
        trade.pips = Math.round((trade.close_price - trade.open_price) / pipValue * 10) / 10;
      } else {
        trade.pips = Math.round((trade.open_price - trade.close_price) / pipValue * 10) / 10;
      }

      trades.push(trade);
    }
  }

  return trades;
}

async function seedData() {
  const datasets = [
    { file: 'public/demo/A.csv', dataset: 'A' },
    { file: 'public/demo/B.csv', dataset: 'B' },
    { file: 'public/demo/C.csv', dataset: 'C' }
  ];

  for (const { file, dataset } of datasets) {
    console.log(`Processing ${dataset}...`);
    const trades = parseCsv(file, dataset);
    console.log(`Loaded ${trades.length} trades from ${file}`);

    const batchSize = 50;
    for (let i = 0; i < trades.length; i += batchSize) {
      const batch = trades.slice(i, i + batchSize);
      const { error } = await supabase.from('trades').insert(batch);

      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1} for dataset ${dataset}:`, error);
      } else {
        console.log(`Inserted batch ${i / batchSize + 1}/${Math.ceil(trades.length / batchSize)} for dataset ${dataset}`);
      }
    }
  }

  console.log('Data seeding complete!');
}

seedData().catch(console.error);
