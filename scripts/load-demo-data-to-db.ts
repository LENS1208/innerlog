import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = 'https://zcflpkmxeupharqbaymc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cXBzbnJjbWt2bmd4cmluanlmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc5MDM1MSwiZXhwIjoyMDc4MzY2MzUxfQ.xB4PZL4IM869AWqLr_MF_h4GWF1ylEVJmS-XnOqqnZ0';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const DEMO_USER_ID = '4e4b6842-84ea-45a4-a8d0-e31a133bf054';

function parseCsvLine(line: string): any {
  const parts: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === '\t' && !inQuotes) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  parts.push(current.trim());
  return parts;
}

function convertDateFormat(dateStr: string): string {
  // "2024.12.02 06:51:48" -> "2024-12-02 06:51:48+00"
  const converted = dateStr.replace(/\./g, '-');
  return `${converted}+00`;
}

function calculatePips(item: string, side: string, openPrice: number, closePrice: number): number {
  const isJPY = item.endsWith('JPY');
  const pipMultiplier = isJPY ? 100 : 10000;

  const priceDiff = side === 'buy' ? (closePrice - openPrice) : (openPrice - closePrice);
  return Math.round(priceDiff * pipMultiplier);
}

async function loadCsvFile(filePath: string, dataset: string) {
  console.log(`\n📂 Loading ${dataset} from ${filePath}`);

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());

  // Skip header
  const dataLines = lines.slice(1);

  const trades = dataLines.map(line => {
    const parts = parseCsvLine(line);
    const [ticket, item, type, size, openTime, openPrice, closeTime, closePrice, sl, tp, commission, swap, profit, comment] = parts;

    const openPriceNum = parseFloat(openPrice);
    const closePriceNum = parseFloat(closePrice);
    const pips = calculatePips(item, type, openPriceNum, closePriceNum);

    return {
      user_id: DEMO_USER_ID,
      dataset,
      ticket,
      item: item.toUpperCase(),
      side: type,
      size: parseFloat(size),
      open_time: convertDateFormat(openTime),
      open_price: openPriceNum,
      close_time: convertDateFormat(closeTime),
      close_price: closePriceNum,
      sl: sl ? parseFloat(sl) : null,
      tp: tp ? parseFloat(tp) : null,
      commission: parseFloat(commission),
      swap: parseFloat(swap),
      profit: parseFloat(profit),
      pips
    };
  });

  console.log(`  ✓ Parsed ${trades.length} trades`);
  return trades;
}

async function main() {
  console.log('🚀 Starting demo data load...\n');

  // Delete existing demo data
  console.log('🗑️  Deleting existing demo data...');
  const { error: deleteError } = await supabase
    .from('trades')
    .delete()
    .in('dataset', ['A', 'B', 'C']);

  if (deleteError) {
    console.error('❌ Error deleting data:', deleteError);
    process.exit(1);
  }
  console.log('  ✓ Deleted successfully\n');

  // Load CSV files
  const datasets = [
    { file: 'public/demo/A.csv', dataset: 'A' },
    { file: 'public/demo/B.csv', dataset: 'B' },
    { file: 'public/demo/C.csv', dataset: 'C' }
  ];

  for (const { file, dataset } of datasets) {
    const filePath = path.join(process.cwd(), file);
    const trades = await loadCsvFile(filePath, dataset);

    // Insert in batches
    const BATCH_SIZE = 100;
    for (let i = 0; i < trades.length; i += BATCH_SIZE) {
      const batch = trades.slice(i, i + BATCH_SIZE);

      const { error } = await supabase
        .from('trades')
        .insert(batch);

      if (error) {
        console.error(`❌ Error inserting batch ${i}-${i + batch.length}:`, error);
        process.exit(1);
      }

      console.log(`  ✓ Inserted batch ${i + 1}-${Math.min(i + BATCH_SIZE, trades.length)}/${trades.length}`);
    }

    console.log(`✅ Dataset ${dataset} loaded: ${trades.length} trades\n`);
  }

  console.log('🎉 All demo data loaded successfully!');
}

main().catch(console.error);
