import { supabase } from '../lib/supabase';
import { parseCsvText } from '../lib/csv';

async function loadDemoData() {
  console.log('デモデータの読み込みを開始...');

  const datasets = ['A', 'B', 'C'];

  for (const dataset of datasets) {
    try {
      console.log(`\nデモ${dataset}の処理中...`);

      const response = await fetch(`/demo/${dataset}.csv`);
      if (!response.ok) {
        console.error(`デモ${dataset}.csvが見つかりません`);
        continue;
      }

      const csvText = await response.text();
      const trades = parseCsvText(csvText);

      console.log(`${trades.length}件のトレードを解析しました`);

      const { data: existing, error: checkError } = await supabase
        .from('trades')
        .select('id')
        .eq('dataset', dataset)
        .limit(1);

      if (checkError) {
        console.error(`チェックエラー:`, checkError);
        continue;
      }

      if (existing && existing.length > 0) {
        console.log(`デモ${dataset}は既に存在します。削除して再投入します...`);
        const { error: deleteError } = await supabase
          .from('trades')
          .delete()
          .eq('dataset', dataset);

        if (deleteError) {
          console.error(`削除エラー:`, deleteError);
          continue;
        }
      }

      const tradeRecords = trades.map(trade => ({
        ticket: String(trade.ticket),
        pair: trade.pair,
        side: trade.side,
        size: trade.size,
        open_time: trade.openTime,
        open_price: trade.openPrice,
        close_time: trade.closeTime,
        close_price: trade.closePrice,
        sl: trade.sl,
        tp: trade.tp,
        commission: trade.commission,
        swap: trade.swap,
        profit_yen: trade.profitYen,
        pips: trade.pips,
        datetime: trade.datetime,
        dataset: dataset,
      }));

      const batchSize = 100;
      let inserted = 0;

      for (let i = 0; i < tradeRecords.length; i += batchSize) {
        const batch = tradeRecords.slice(i, i + batchSize);
        const { error: insertError } = await supabase
          .from('trades')
          .insert(batch);

        if (insertError) {
          console.error(`バッチ挿入エラー (${i}-${i + batch.length}):`, insertError);
        } else {
          inserted += batch.length;
          console.log(`${inserted}/${tradeRecords.length}件挿入完了`);
        }
      }

      console.log(`✓ デモ${dataset}: ${inserted}件のトレードを投入しました`);
    } catch (error) {
      console.error(`デモ${dataset}のエラー:`, error);
    }
  }

  console.log('\nデモデータの投入が完了しました');
}

loadDemoData().catch(console.error);
