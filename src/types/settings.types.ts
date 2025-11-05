export interface UserSettings {
  id: string;
  user_id: string | null;
  data_source: 'demo' | 'database';
  default_dataset: 'A' | 'B' | 'C';
  language: 'ja' | 'en';
  timezone: string;
  time_format: '24h' | '12h';
  currency: string;
  initial_capital: number;
  dd_basis: 'capital' | 'r';
  lot_size: number;
  default_spread: number;
  target_pf: number;
  target_winrate: number;
  target_dd_pct: number;
  max_consecutive_losses: number;
  enable_notifications: boolean;
  dd_alert_threshold: number;
  created_at: string;
  updated_at: string;
}

export const DEFAULT_SETTINGS: Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  data_source: 'demo',
  default_dataset: 'A',
  language: 'ja',
  timezone: 'Asia/Tokyo',
  time_format: '24h',
  currency: 'JPY',
  initial_capital: 1000000,
  dd_basis: 'capital',
  lot_size: 100000,
  default_spread: 0,
  target_pf: 1.5,
  target_winrate: 0.5,
  target_dd_pct: -20,
  max_consecutive_losses: 5,
  enable_notifications: true,
  dd_alert_threshold: -15,
};
