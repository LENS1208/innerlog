export type Side = "LONG" | "SHORT";

export type Trade = {
  id: string;
  datetime: string;
  pair: string;
  side: Side;
  volume: number;
  profitYen: number;
  pips: number;
  memo?: string;

  openTime?: string;
  openPrice?: number;
  closePrice?: number;
  stopPrice?: number;
  targetPrice?: number;
  commission?: number;
  swap?: number;
  comment?: string;
  holdTimeMin?: number;

  symbol?: string;
  action?: Side;
  profit?: number;
};
