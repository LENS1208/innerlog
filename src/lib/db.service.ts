import { supabase } from './supabase';
import type { Trade } from './types';

export type DbTrade = {
  id: string;
  ticket: string;
  item: string;
  side: string;
  size: number;
  open_time: string;
  open_price: number;
  close_time: string;
  close_price: number;
  commission: number;
  swap: number;
  profit: number;
  pips: number;
  sl: number | null;
  tp: number | null;
  user_id: string | null;
  dataset: string | null;
  created_at: string;
};

export type DbDailyNote = {
  id: string;
  date_key: string;
  title: string;
  good: string;
  improve: string;
  next_promise: string;
  free: string;
  user_id: string | null;
  created_at: string;
  updated_at: string;
};

export type DbTradeNote = {
  id: string;
  ticket: string;
  entry_emotion: string;
  entry_basis: string[];
  tech_set: string[];
  market_set: string[];
  fund_set: string[];
  fund_note: string;
  exit_triggers: string[];
  exit_emotion: string;
  note_right: string;
  note_wrong: string;
  note_next: string;
  note_free: string;
  tags: string[];
  images: string[];
  ai_advice: string;
  ai_advice_pinned: boolean;
  user_id: string | null;
  created_at: string;
  updated_at: string;
};

export type DbFreeMemo = {
  id: string;
  title: string;
  content: string;
  date_key: string;
  tags: string[];
  user_id: string | null;
  created_at: string;
  updated_at: string;
};

export type DbNoteLink = {
  id: string;
  source_type: 'trade' | 'daily' | 'free';
  source_id: string;
  target_type: 'trade' | 'daily' | 'free';
  target_id: string;
  user_id: string | null;
  created_at: string;
};

export async function getAllTrades(): Promise<DbTrade[]> {
  const { data, error } = await supabase
    .from('trades')
    .select('*', { count: 'exact', head: false })
    .order('close_time', { ascending: false })
    .range(0, 299999);

  if (error) throw error;
  return data || [];
}

export async function getTradesCount(): Promise<number> {
  const { count, error } = await supabase
    .from('trades')
    .select('*', { count: 'exact', head: true });

  if (error) throw error;
  return count || 0;
}

export async function deleteAllTrades(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('trades')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (error) throw error;
}

export async function getTradeByTicket(ticket: string): Promise<DbTrade | null> {
  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .eq('ticket', ticket)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function insertTrades(trades: Omit<DbTrade, 'id' | 'created_at' | 'user_id' | 'dataset'>[]): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();

  const tradesWithUser = trades.map(trade => ({
    ...trade,
    user_id: user?.id || null,
    dataset: null,
  }));

  const { error } = await supabase
    .from('trades')
    .upsert(tradesWithUser, { onConflict: 'ticket' });

  if (error) throw error;
}

export async function getAllDailyNotes(): Promise<DbDailyNote[]> {
  const { data, error } = await supabase
    .from('daily_notes')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getDailyNote(dateKey: string): Promise<DbDailyNote | null> {
  const { data, error } = await supabase
    .from('daily_notes')
    .select('*')
    .eq('date_key', dateKey)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function saveDailyNote(note: Omit<DbDailyNote, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('daily_notes')
    .upsert({
      ...note,
      user_id: user?.id || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'date_key' });

  if (error) throw error;
}

export async function getAllTradeNotes(): Promise<DbTradeNote[]> {
  const { data, error } = await supabase
    .from('trade_notes')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getTradeNote(ticket: string): Promise<DbTradeNote | null> {
  const { data, error } = await supabase
    .from('trade_notes')
    .select('*')
    .eq('ticket', ticket)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function saveTradeNote(note: Omit<DbTradeNote, 'id' | 'created_at' | 'updated_at' | 'user_id'>, tradeData?: Omit<DbTrade, 'id' | 'created_at' | 'user_id' | 'dataset'>): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();

  if (tradeData) {
    const { error: tradeError } = await supabase
      .from('trades')
      .upsert({
        ...tradeData,
        user_id: user?.id || null,
        dataset: null,
      }, { onConflict: 'ticket' });

    if (tradeError) throw tradeError;
  }

  const { error } = await supabase
    .from('trade_notes')
    .upsert({
      ...note,
      user_id: user?.id || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'ticket' });

  if (error) throw error;
}

export async function getFreeMemo(id: string): Promise<DbFreeMemo | null> {
  const { data, error } = await supabase
    .from('free_memos')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getAllFreeMemos(): Promise<DbFreeMemo[]> {
  const { data, error } = await supabase
    .from('free_memos')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function saveFreeMemo(memo: Omit<DbFreeMemo, 'id' | 'created_at' | 'updated_at' | 'user_id'> & { id?: string }): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();

  if (memo.id) {
    const { error } = await supabase
      .from('free_memos')
      .update({
        title: memo.title,
        content: memo.content,
        date_key: memo.date_key,
        tags: memo.tags,
        updated_at: new Date().toISOString(),
      })
      .eq('id', memo.id);

    if (error) throw error;
    return memo.id;
  } else {
    const { data, error } = await supabase
      .from('free_memos')
      .insert({
        title: memo.title,
        content: memo.content,
        date_key: memo.date_key,
        tags: memo.tags,
        user_id: user?.id || null,
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }
}

export async function deleteFreeMemo(id: string): Promise<void> {
  const { error } = await supabase
    .from('free_memos')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function createLink(
  sourceType: 'trade' | 'daily' | 'free',
  sourceId: string,
  targetType: 'trade' | 'daily' | 'free',
  targetId: string
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('note_links')
    .insert({
      source_type: sourceType,
      source_id: sourceId,
      target_type: targetType,
      target_id: targetId,
      user_id: user?.id || null,
    });

  if (error && error.code !== '23505') {
    throw error;
  }
}

export async function deleteLink(
  sourceType: 'trade' | 'daily' | 'free',
  sourceId: string,
  targetType: 'trade' | 'daily' | 'free',
  targetId: string
): Promise<void> {
  const { error } = await supabase
    .from('note_links')
    .delete()
    .eq('source_type', sourceType)
    .eq('source_id', sourceId)
    .eq('target_type', targetType)
    .eq('target_id', targetId);

  if (error) throw error;
}

export async function getLinksFromSource(
  sourceType: 'trade' | 'daily' | 'free',
  sourceId: string
): Promise<DbNoteLink[]> {
  const { data, error } = await supabase
    .from('note_links')
    .select('*')
    .eq('source_type', sourceType)
    .eq('source_id', sourceId);

  if (error) throw error;
  return data || [];
}

export async function getLinksToTarget(
  targetType: 'trade' | 'daily' | 'free',
  targetId: string
): Promise<DbNoteLink[]> {
  const { data, error } = await supabase
    .from('note_links')
    .select('*')
    .eq('target_type', targetType)
    .eq('target_id', targetId);

  if (error) throw error;
  return data || [];
}

export function tradeToDb(trade: Trade): Omit<DbTrade, 'id' | 'created_at'> {
  // ドット区切り形式（例: "2025.02.23 06:40:46"）をハイフン区切りに変換
  const normalizeDateTime = (dt: string | undefined): string => {
    if (!dt) return '';
    return dt.replace(/\./g, '-');
  };

  return {
    ticket: trade.ticket || trade.id,
    item: trade.pair || trade.symbol || '',
    side: trade.side,
    size: trade.volume,
    open_time: normalizeDateTime(trade.openTime || trade.datetime),
    open_price: trade.openPrice || 0,
    close_time: normalizeDateTime(trade.datetime),
    close_price: trade.closePrice || 0,
    commission: trade.commission || 0,
    swap: trade.swap || 0,
    profit: trade.profitYen || trade.profit || 0,
    pips: trade.pips,
    sl: trade.stopPrice || null,
    tp: trade.targetPrice || null,
  };
}

export function dbToTrade(dbTrade: DbTrade): Trade {
  return {
    id: dbTrade.ticket,
    datetime: dbTrade.close_time,
    pair: dbTrade.item,
    side: dbTrade.side as Side,
    volume: dbTrade.size,
    profitYen: dbTrade.profit,
    pips: dbTrade.pips,
    openTime: dbTrade.open_time,
    openPrice: dbTrade.open_price,
    closePrice: dbTrade.close_price,
    stopPrice: dbTrade.sl || undefined,
    targetPrice: dbTrade.tp || undefined,
    commission: dbTrade.commission,
    swap: dbTrade.swap,
    symbol: dbTrade.item,
    action: dbTrade.side as Side,
    profit: dbTrade.profit,
  };
}

type Side = "LONG" | "SHORT";
