import { motion } from 'motion/react'
import { useMonthlyPnL, useSetupStats, useTrades } from '@/hooks/useData'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react'

export function AnalyticsPage({ isMobile }: { isMobile?: boolean }) {
  const { data: monthlyPnL } = useMonthlyPnL()
  const { data: setupStats } = useSetupStats()
  const { trades } = useTrades(0, 9999)

  const closed = trades.filter(t => t.pnl !== null)
  const wins = closed.filter(t => t.pnl! > 0)
  const losses = closed.filter(t => t.pnl! < 0)

  const winRate = closed.length > 0 ? (wins.length / closed.length) * 100 : 0
  const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + t.pnl!, 0) / wins.length : 0
  const avgLoss = losses.length > 0 ? losses.reduce((s, t) => s + t.pnl!, 0) / losses.length : 0
  const profitFactor = Math.abs(avgLoss) > 0
    ? (wins.reduce((s, t) => s + t.pnl!, 0)) / Math.abs(losses.reduce((s, t) => s + t.pnl!, 0))
    : wins.length > 0 ? Infinity : 0

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-text-primary m-0`}>
          Analytics
        </h2>
        <p className="text-xs text-text-secondary mt-1">Detailed breakdown of your trading data</p>
      </motion.div>

      {/* KPI Cards */}
      <div className={`grid ${isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-4 gap-3'}`}>
        {[
          { label: 'Win Rate', value: `${winRate.toFixed(1)}%`, color: 'text-green', icon: TrendingUp },
          { label: 'Avg Win', value: formatCurrency(avgWin), color: 'text-green', icon: DollarSign },
          { label: 'Avg Loss', value: formatCurrency(avgLoss), color: 'text-red', icon: TrendingDown },
          { label: 'Profit Factor', value: profitFactor === Infinity ? '∞' : profitFactor.toFixed(2),
            color: profitFactor >= 1.5 ? 'text-green' : 'text-gold', icon: BarChart3 },
        ].map((item, i) => (
          <motion.div key={item.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                  {item.label}
                </CardTitle>
                <item.icon className="w-4 h-4 text-text-muted" />
              </CardHeader>
              <CardContent>
                <span className={`text-2xl font-bold ${item.color}`}>{item.value}</span>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-3'}`}>
        {/* Monthly P&L */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                Monthly P&L All Time
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
                      className={`flex-1 rounded-sm relative cursor-pointer min-w-[12px] ${m.pnl >= 0 ? 'bg-green' : 'bg-red'}`}
                      style={{ opacity: 0.7 }}
                      title={`${m.month}: ${formatCurrency(m.pnl)}`}
                    >
                      <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] font-semibold whitespace-nowrap ${m.pnl >= 0 ? 'text-green' : 'text-red'}`}>
                        {m.pnl >= 0 ? '+' : ''}${Math.round(m.pnl)}
                      </span>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Setup Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                P&L by Setup
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
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-text-tertiary">{s.setup}</span>
                        <span className="text-[10px] text-text-muted">({s.count})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] ${s.win_rate >= 50 ? 'text-green' : 'text-red'}`}>
                          {s.win_rate.toFixed(0)}%
                        </span>
                        <span className={`text-xs font-semibold ${s.pnl >= 0 ? 'text-green' : 'text-red'}`}>
                          {formatCurrency(s.pnl)}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-border-subtle rounded-sm overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: i * 0.04, duration: 0.4 }}
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

      {/* Performance by Symbol */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-text-secondary">
              Performance by Symbol
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'} gap-2`}>
              {(() => {
                const bySymbol: Record<string, any> = {}
                closed.forEach(t => {
                  if (!bySymbol[t.symbol]) bySymbol[t.symbol] = { symbol: t.symbol, trades: 0, wins: 0, pnl: 0 }
                  bySymbol[t.symbol].trades++
                  if (t.pnl! > 0) bySymbol[t.symbol].wins++
                  bySymbol[t.symbol].pnl += t.pnl!
                })
                return Object.values(bySymbol)
                  .sort((a: any, b: any) => Math.abs(b.pnl) - Math.abs(a.pnl))
                  .map((s: any) => (
                    <Card key={s.symbol} className="border-border-subtle/50">
                      <CardContent className="p-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-semibold text-text-primary">{s.symbol}</span>
                          <span className={`text-sm font-bold ${s.pnl >= 0 ? 'text-green' : 'text-red'}`}>
                            {formatCurrency(s.pnl)}
                          </span>
                        </div>
                        <div className="flex gap-3 text-[11px] text-text-secondary flex-wrap">
                          <span>{s.trades} trades</span>
                          <span>{((s.wins / s.trades) * 100).toFixed(0)}% win</span>
                          <span>Avg {formatCurrency(s.pnl / s.trades)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              })()}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
