import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Trade, Stats, MonthlyPnL, SetupStats, CalendarDay } from '@/types'
import type { PostgrestError } from '@supabase/supabase-js'

export function useTrades(page = 0, limit = 50, filters?: Record<string, string>) {
  const [trades, setTrades] = useState<Trade[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      let q = supabase.from('trades').select('*', { count: 'exact' })
      if (filters?.search) {
        q = q.or(`symbol.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`)
      }
      if (filters?.direction) q = q.eq('direction', filters.direction)
      if (filters?.setup) q = q.eq('setup', filters.setup)
      if (filters?.status) q = q.eq('status', filters.status)
      if (filters?.from) q = q.gte('timestamp', filters.from)
      if (filters?.to) q = q.lte('timestamp', filters.to)

      const { data, count, error } = await q
        .order('timestamp', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1)

      if (error) throw error
      setTrades((data || []) as Trade[])
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

export function useStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.rpc('get_stats').then(({ data, error }: { data: Stats | null; error: PostgrestError | null }) => {
      if (!error && data) setStats(data as Stats)
      setLoading(false)
    })
  }, [])

  return { stats, loading }
}

export function useMonthlyPnL() {
  const [data, setData] = useState<MonthlyPnL[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.rpc('get_monthly_pnl').then(({ data: res, error }: { data: MonthlyPnL[] | null; error: PostgrestError | null }) => {
      if (!error && res) setData(res as MonthlyPnL[])
      setLoading(false)
    })
  }, [])

  return { data, loading }
}

export function useSetupStats() {
  const [data, setData] = useState<SetupStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.rpc('get_setup_stats').then(({ data: res, error }: { data: SetupStats[] | null; error: PostgrestError | null }) => {
      if (!error && res) setData(res as SetupStats[])
      setLoading(false)
    })
  }, [])

  return { data, loading }
}

export function useCalendar(year: number) {
  const [data, setData] = useState<CalendarDay[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.rpc('get_calendar_data', { y: year }).then(({ data: res, error }: { data: CalendarDay[] | null; error: PostgrestError | null }) => {
      if (!error && res) setData(res as CalendarDay[])
      setLoading(false)
    })
  }, [year])

  return { data, loading }
}
