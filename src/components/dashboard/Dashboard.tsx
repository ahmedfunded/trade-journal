import { motion } from 'motion/react'
import { useStats, useMonthlyPnL, useSetupStats, useTrades } from '@/hooks/useData'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsCard } from '@/components/ui/stats-card'
import { TrendingUp, Activity, DollarSign, Target } from 'lucide-react'

function MiniChart({ trades }: { trades: any[] }) {
  if (!trades.length) return null
  const data = trades.filter(t => t.pnl !== null).reverse().slice(-30)
  if (data.length < 2) return null
  const max = Math.max(...data.map(d => Math.abs(d.pnl || 0)))
  const w = 200; const h = 40
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h / 2 - ((d.pnl || 0) / max) * (h / 2 - 4)
    return `${x},${y}`
  }).join(' ')
  const isUp = (data[data.length - 1]?.pnl || 0) >= (data[0]?.pnl || 0)
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-10">
      <polyline points={pts} fill="none" stroke={isUp ? '#22c55e' : '#ef4444'} strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Dashboard({ isMobile }: { isMobile?: boolean }) {
  const { stats, loading } = useStats()
  const { data: monthlyPnL } = useMonthlyPnL()
  const { data: setupStats } = useSetupStats()
  const { trades } = useTrades(0, 100)

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-8 h-8 border-2 border-border-subtle border-t-accent rounded-full"
        />
      </div>
    )
  }

  const isPositive = (key: string, val: any) => {
    if (key.includes('loss') || key === 'max_drawdown') return val <= 0
    return val >= 0
  }

  const topCards = [
    {
      key: 'total_trades', title: 'Total Trades', value: stats?.total_trades ?? 0,
      icon: <Activity className="w-4 h-4" />, trend: 'neutral' as const,
    },
    {
      key: 'win_rate', title: 'Win Rate', value: stats?.win_rate ?? 0, suffix: '%',
      decimals: 1, icon: <Target className="w-4 h-4" />,
      trend: ((stats?.win_rate ?? 0) >= 50 ? 'up' : 'down') as 'up' | 'down',
    },
    {
      key: 'net_pnl', title: 'Net P&L', value: stats?.net_pnl ?? 0, prefix: '$',
      decimals: 0, icon: <DollarSign className="w-4 h-4" />,
      trend: ((stats?.net_pnl ?? 0) >= 0 ? 'up' : 'down') as 'up' | 'down',
    },
    {
      key: 'profit_factor', title: 'Profit Factor', value: stats?.profit_factor ?? 0,
      decimals: 2, icon: <TrendingUp className="w-4 h-4" />,
      trend: ((stats?.profit_factor ?? 0) >= 1.5 ? 'up' : 'down') as 'up' | 'down',
    },
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-text-primary m-0`}>
          Dashboard
        </h2>
        <p className="text-xs text-text-secondary mt-1">Overview of your trading performance</p>
      </motion.div>

      {/* Top stat cards */}
      <div className={`grid ${isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-4 gap-3'}`}>
        {topCards.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <StatsCard
              title={card.title}
              value={card.value}
              suffix={(card as any).suffix}
              prefix={(card as any).prefix}
              decimals={(card as any).decimals}
              icon={card.icon}
              trend={card.trend}
            />
          </motion.div>
        ))}
      </div>

      {/* Secondary stat cards */}
      <div className={`grid ${isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-4 gap-3'}`}>
        {[
          { key: 'avg_win', label: 'Avg Win', format: 'currency' as const },
          { key: 'avg_loss', label: 'Avg Loss', format: 'currency' as const },
          { key: 'biggest_win', label: 'Biggest Win', format: 'currency' as const },
          { key: 'biggest_loss', label: 'Biggest Loss', format: 'currency' as const },
        ].map((card, i) => {
          const val = stats?.[card.key as keyof typeof stats] as number | undefined
          const pos = !card.key.includes('loss')
          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.05 }}
            >
              <Card>
                <CardHeader className="pb-1">
                  <CardTitle className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                    {card.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <span className={`text-lg font-bold ${pos ? 'text-green' : 'text-red'}`}>
                    {val !== undefined ? formatCurrency(val) : '—'}
                  </span>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
      {/* Charts row */}
      <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-3'}`}>
        {/* Monthly P&L */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                Monthly P&L
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`flex items-end gap-1 ${isMobile ? 'h-28' : 'h-44'}`}>
                {monthlyPnL.map((m, i) => {
                  const maxPnL = Math.max(...monthlyPnL.map(x => Math.abs(x.pnl)), 1)
                  const bh = (Math.abs(m.pnl) / maxPnL) * (isMobile ? 100 : 180)
                  return (
                <motion.div
                  key={m.month}
                  initial={{ height: 0 }}
                  animate={{ height: Math.max(bh, 3) }}
                  transition={{ delay: i * 0.03, duration: 0.4 }}
                  className={`flex-1 rounded-sm relative cursor-pointer min-w-[12px] ${
                    m.pnl >= 0 ? 'bg-green' : 'bg-red'
                  }`}
                  style={{ opacity: 0.7 }}
                >
                  <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] font-semibold whitespace-nowrap ${
                    m.pnl >= 0 ? 'text-green' : 'text-red'
                  }`}>
                    {m.pnl >= 0 ? '+' : ''}${Math.round(m.pnl)}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>

    {/* Setup breakdown */}
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-text-secondary">
            Setup Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {setupStats.map((s, i) => {
            const maxPnl = Math.max(...setupStats.map(x => Math.abs(x.pnl)), 1)
            const pct = (Math.abs(s.pnl) / maxPnl) * 100
            return (
              <motion.div
                key={s.setup}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] text-text-tertiary">{s.setup}</span>
                  <span className={`text-[11px] font-semibold ${s.pnl >= 0 ? 'text-green' : 'text-red'}`}>
                    {s.pnl >= 0 ? '+' : ''}${Math.round(s.pnl)}
                  </span>
                </div>
                <div className="h-1.5 bg-border-subtle rounded-sm overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                    className={`h-full rounded-sm ${s.pnl >= 0 ? 'bg-green' : 'bg-red'}`}
                  />
                </div>
              </motion.div>
            )
          })}
        </CardContent>
      </Card>
    </motion.div>
  </div>

  {/* Recent Trades */}
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.45 }}
  >
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-medium uppercase tracking-wider text-text-secondary">
          Recent Trades
        </CardTitle>
        {!isMobile && <MiniChart trades={trades} />}
      </CardHeader>
      <CardContent className="p-0">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: 11, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
            Recent Trades
          </h3>
          {!isMobile && <MiniChart trades={trades} />}
        </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-text-muted border-b border-border-subtle">
                  {['Date', 'Symbol', 'Dir', 'P&L', 'Setup'].map(h => (
                    <th key={h} className="text-left p-3 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trades.slice(0, isMobile ? 5 : 10).map(t => (
                  <tr key={t.id} className="border-b border-[#14141f] hover:bg-bg-card-hover transition-colors">
                    <td className="p-3 text-text-tertiary whitespace-nowrap">
                      {new Date(t.timestamp).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="p-3 text-text-primary font-semibold">{t.symbol}</td>
                    <td className="p-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        t.direction === 'long'
                          ? 'bg-green-bg text-green'
                          : 'bg-red-bg text-red'
                      }`}>
                        {t.direction === 'long' ? 'L' : 'S'}
                      </span>
                    </td>
                    <td className={`p-3 font-semibold ${t.pnl && t.pnl >= 0 ? 'text-green' : 'text-red'}`}>
                      {t.pnl !== null ? `${t.pnl >= 0 ? '+' : ''}${t.pnl.toFixed(0)}` : '—'}
                    </td>
                    <td className="p-3 text-text-tertiary">{t.setup}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  </div>
  )
}
