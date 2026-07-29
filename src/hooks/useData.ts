import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Trade, Stats, MonthlyPnL, SetupStats, CalendarDay } from '@/types'

/** Map raw DB row to Trade type (setup_type→setup, size→quantity). */
function toTrade(row: Record<string, unknown>): Trade {
  return {
    id: row.id as number,
    timestamp: row.timestamp as string,
    symbol: row.symbol as string,
    direction: row.direction as 'long' | 'short',
    entry_price: row.entry_price as number,
    exit_price: (row.exit_price as number | null) ?? null,
    quantity: (row.size as number) ?? 0,
    pnl: (row.pnl as number | null) ?? null,
    setup: (row.setup_type as string) ?? '',
    status: (row.status as 'open' | 'closed') ?? 'open',
    stop_loss: null, take_profit: null, risk_reward: null, tags: null,
    notes: (row.notes as string | null) ?? null,
    created_at: row.timestamp as string,
    exit_reason: (row.exit_reason as string | null) ?? null,
    bars_held: (row.bars_held as number | null) ?? null,
    pnl_pct: (row.pnl_pct as number | null) ?? null,
    commission: (row.commission as number | null) ?? null,
    slippage: (row.slippage as number | null) ?? null,
  }
}

/**
 * Fetch trades with pagination, search, filters.
 * Column aliasing happens client-side via toTrade().
 */
export function useTrades(page = 0, limit = 50, filters?: Record<string, string>) {
  const [trades, setTrades] = useState<Trade[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let q = supabase.from('trades').select('*', { count: 'exact' })
      if (filters?.search) {
        q = q.or(`symbol.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`)
      }
      if (filters?.direction) q = q.eq('direction', filters.direction)
      if (filters?.setup) q = q.eq('setup_type', filters.setup)
      if (filters?.status) q = q.eq('status', filters.status)
      if (filters?.from) q = q.gte('timestamp', filters.from)
      if (filters?.to) q = q.lte('timestamp', filters.to)

      const { data, count, error } = await q
        .order('timestamp', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1)

      if (error) throw error
      setTrades((data || []).map(toTrade))
      setTotal(count || 0)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [page, limit, JSON.stringify(filters)])

  useEffect(() => { load() }, [load])
  return { trades, total, loading, error, reload: load }
}


/** Compute aggregate stats from all closed trades. */
export function useStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data, error } = await supabase
          .from('trades')
          .select('id, pnl, direction, exit_price, bars_held')
          .eq('status', 'closed')

        if (error) throw error
        if (cancelled) return

        const rows = (data || []) as { pnl: number | null; direction: string; exit_price: number | null; bars_held: number | null }[]
        const closed = rows.filter(r => r.pnl !== null) as { pnl: number; direction: string; exit_price: number | null; bars_held: number | null }[]
        const total_trades = closed.length
        if (total_trades === 0) {
          setStats({
            total_trades: 0, wins: 0, losses: 0, win_rate: 0, net_pnl: 0,
            profit_factor: 0, avg_win: 0, avg_loss: 0, max_drawdown: 0,
            biggest_win: 0, biggest_loss: 0, avg_holding_time: null,
            consecutive_wins: 0, consecutive_losses: 0,
          })
          setLoading(false)
          return
        }

        const pnls = closed.map(r => r.pnl)
        const wins = closed.filter(r => r.pnl > 0)
        const losses = closed.filter(r => r.pnl < 0)
        const winPnls = wins.map(r => r.pnl)
        const lossPnls = losses.map(r => r.pnl)
        const sumWins = winPnls.reduce((a, b) => a + b, 0)
        const sumLosses = Math.abs(lossPnls.reduce((a, b) => a + b, 0))

        // Equity curve & max drawdown
        closed.sort((a, b) => (a as any).id - (b as any).id)
        let eq = 50000
        let peak = eq
        let maxDd = 0
        for (const r of closed) {
          eq += r.pnl
          if (eq > peak) peak = eq
          const dd = ((peak - eq) / peak) * 100
          if (dd > maxDd) maxDd = dd
        }

        // Streaks
        let winStreak = 0, lossStreak = 0, curW = 0, curL = 0
        for (const r of closed) {
          if (r.pnl > 0) { curW++; curL = 0; if (curW > winStreak) winStreak = curW }
          else { curL++; curW = 0; if (curL > lossStreak) lossStreak = curL }
        }

        // Avg holding time
        const bars = closed.filter(r => r.bars_held != null).map(r => r.bars_held as number)
        const avgHoldingTime = bars.length > 0
          ? (bars.reduce((a, b) => a + b, 0) / bars.length).toFixed(1) + ' bars'
          : null

        setStats({
          total_trades,
          wins: wins.length,
          losses: losses.length,
          win_rate: (wins.length / total_trades) * 100,
          net_pnl: pnls.reduce((a, b) => a + b, 0),
          profit_factor: sumLosses > 0 ? sumWins / sumLosses : sumWins > 0 ? Infinity : 0,
          avg_win: wins.length > 0 ? sumWins / wins.length : 0,
          avg_loss: losses.length > 0 ? -(sumLosses / losses.length) : 0,
          max_drawdown: maxDd,
          biggest_win: Math.max(...pnls),
          biggest_loss: Math.min(...pnls),
          avg_holding_time: avgHoldingTime,
          consecutive_wins: winStreak,
          consecutive_losses: lossStreak,
        } as Stats)
      } catch {
        // silently fail — stats stay null
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  return { stats, loading }
}

/** Monthly P&L grouped by YYYY-MM. */
export function useMonthlyPnL() {
  const [data, setData] = useState<MonthlyPnL[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data: rows, error } = await supabase
          .from('trades')
          .select('timestamp, pnl')
          .eq('status', 'closed')
          .not('pnl', 'is', null)

        if (error) throw error
        if (cancelled) return

        const map = new Map<string, { pnl: number; trades: number }>()
        for (const r of (rows || []) as { timestamp: string; pnl: number }[]) {
          const month = r.timestamp.slice(0, 7)
          const entry = map.get(month) || { pnl: 0, trades: 0 }
          entry.pnl += r.pnl
          entry.trades++
          map.set(month, entry)
        }
        setData(Array.from(map.entries())
          .map(([month, v]) => ({ month, pnl: v.pnl, trades: v.trades }))
          .sort((a, b) => a.month.localeCompare(b.month)))
      } catch { /* silent */ }
      if (!cancelled) setLoading(false)
    })()
    return () => { cancelled = true }
  }, [])

  return { data, loading }
}


/** Breakdown by setup_type. */
export function useSetupStats() {
  const [data, setData] = useState<SetupStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data: rows, error } = await supabase
          .from('trades')
          .select('setup_type, pnl')
          .eq('status', 'closed')
          .not('pnl', 'is', null)

        if (error) throw error
        if (cancelled) return

        const map = new Map<string, { count: number; wins: number; pnl: number }>()
        for (const r of (rows || []) as { setup_type: string | null; pnl: number }[]) {
          const setup = r.setup_type || 'other'
          const entry = map.get(setup) || { count: 0, wins: 0, pnl: 0 }
          entry.count++
          if (r.pnl > 0) entry.wins++
          entry.pnl += r.pnl
          map.set(setup, entry)
        }
        setData(Array.from(map.entries())
          .map(([setup, v]) => ({
            setup, count: v.count, wins: v.wins,
            win_rate: (v.wins / v.count) * 100, pnl: v.pnl,
          }))
          .sort((a, b) => b.count - a.count))
      } catch { /* silent */ }
      if (!cancelled) setLoading(false)
    })()
    return () => { cancelled = true }
  }, [])

  return { data, loading }
}

/** Daily P&L for a given year for the calendar heatmap. */
export function useCalendar(year: number) {
  const [data, setData] = useState<CalendarDay[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const from = `${year}-01-01`
        const to = `${year}-12-31`
        const { data: rows, error } = await supabase
          .from('trades')
          .select('timestamp, pnl')
          .eq('status', 'closed')
          .not('pnl', 'is', null)
          .gte('timestamp', from)
          .lte('timestamp', to)

        if (error) throw error
        if (cancelled) return

        const map = new Map<string, { pnl: number; trades: number }>()
        for (const r of (rows || []) as { timestamp: string; pnl: number }[]) {
          const date = r.timestamp.slice(0, 10)
          const entry = map.get(date) || { pnl: 0, trades: 0 }
          entry.pnl += r.pnl
          entry.trades++
          map.set(date, entry)
        }
        setData(Array.from(map.entries())
          .map(([date, v]) => ({ date, pnl: v.pnl, trades: v.trades }))
          .sort((a, b) => a.date.localeCompare(b.date)))
      } catch { /* silent */ }
      if (!cancelled) setLoading(false)
    })()
    return () => { cancelled = true }
  }, [year])

  return { data, loading }
}
