export interface Trade {
  id: number
  timestamp: string
  symbol: string
  direction: 'long' | 'short'
  entry_price: number
  exit_price: number | null
  quantity: number
  pnl: number | null
  setup: string
  status: 'open' | 'closed'
  stop_loss: number | null
  take_profit: number | null
  risk_reward: number | null
  tags: string | null
  notes: string | null
  created_at: string
  /** DB-only fields mapped into type */
  exit_reason?: string | null
  bars_held?: number | null
  pnl_pct?: number | null
  commission?: number | null
  slippage?: number | null
}

export interface Stats {
  total_trades: number
  wins: number
  losses: number
  win_rate: number
  net_pnl: number
  profit_factor: number
  avg_win: number
  avg_loss: number
  max_drawdown: number
  biggest_win: number
  biggest_loss: number
  avg_holding_time: string | null
  consecutive_wins: number
  consecutive_losses: number
}

export interface MonthlyPnL {
  month: string
  pnl: number
  trades: number
}

export interface SetupStats {
  setup: string
  count: number
  wins: number
  win_rate: number
  pnl: number
}

export interface CalendarDay {
  date: string
  pnl: number
  trades: number
}
