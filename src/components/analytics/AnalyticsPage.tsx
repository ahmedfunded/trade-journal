import { motion } from 'motion/react'
import { useMonthlyPnL, useSetupStats, useTrades } from '@/hooks/useData'
import { formatCurrency } from '@/lib/utils'

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
    <div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 600, color: '#fff', margin: 0 }}>Analytics</h2>
        <p style={{ fontSize: 13, color: '#71717a', margin: '4px 0 0' }}>Detailed breakdown of your trading data</p>
      </motion.div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: isMobile ? 6 : 10,
        marginBottom: 12,
      }}>
        {[
          { label: 'Win Rate', value: `${winRate.toFixed(1)}%`, color: '#22c55e' },
          { label: 'Avg Win', value: formatCurrency(avgWin), color: '#22c55e' },
          { label: 'Avg Loss', value: formatCurrency(avgLoss), color: '#ef4444' },
          { label: 'Profit Factor', value: profitFactor === Infinity ? '∞' : profitFactor.toFixed(2), color: profitFactor >= 1.5 ? '#22c55e' : '#f59e0b' },
        ].map((item, i) => (
          <motion.div key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card"
            style={{ padding: isMobile ? 12 : 16, textAlign: 'center' }}
          >
            <div style={{ fontSize: 10, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
              {item.label}
            </div>
            <div style={{ fontSize: isMobile ? 18 : 24, fontWeight: 700, color: item.color }}>
              {item.value}
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: 12,
        marginBottom: 12,
      }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card"
          style={{ padding: isMobile ? 12 : 16 }}
        >
          <h3 style={{ fontSize: 11, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 16px' }}>
            Monthly P&L All Time
          </h3>
          <div style={{ height: isMobile ? 140 : 220, display: 'flex', alignItems: 'flex-end', gap: 2 }}>
            {monthlyPnL.map((m, i) => {
              const maxPnL = Math.max(...monthlyPnL.map(x => Math.abs(x.pnl)), 1)
              const bh = (Math.abs(m.pnl) / maxPnL) * (isMobile ? 100 : 180)
              return (
                <motion.div
                  key={m.month}
                  initial={{ height: 0 }}
                  animate={{ height: Math.max(bh, 3) }}
                  transition={{ delay: i * 0.02, duration: 0.3 }}
                  style={{
                    flex: 1,
                    background: m.pnl >= 0
                      ? 'linear-gradient(180deg, #22c55e, rgba(34,197,94,0.2))'
                      : 'linear-gradient(180deg, #ef4444, rgba(239,68,68,0.2))',
                    borderRadius: '3px 3px 0 0',
                  }}
                />
              )
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card"
          style={{ padding: isMobile ? 12 : 16 }}
        >
          <h3 style={{ fontSize: 11, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 16px' }}>
            Setup Distribution
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {setupStats.map((s, i) => {
              const total = setupStats.reduce((a, b) => a + b.count, 0)
              const pct = total > 0 ? (s.count / total) * 100 : 0
              return (
                <motion.div key={s.setup}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: '#a1a1aa' }}>{s.setup}</span>
                      <span style={{ fontSize: 10, color: '#52525b' }}>({s.count})</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 10, color: s.win_rate >= 50 ? '#22c55e' : '#ef4444' }}>
                        {s.win_rate.toFixed(0)}%
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: s.pnl >= 0 ? '#22c55e' : '#ef4444' }}>
                        {formatCurrency(s.pnl)}
                      </span>
                    </div>
                  </div>
                  <div style={{ background: '#1e1e2e', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: i * 0.04, duration: 0.4 }}
                      style={{
                        height: '100%', borderRadius: 4,
                        background: s.pnl >= 0
                          ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                          : 'linear-gradient(90deg, #ef4444, #dc2626)',
                      }}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card"
        style={{ padding: isMobile ? 12 : 16 }}
      >
        <h3 style={{ fontSize: 11, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 12px' }}>
          Performance by Symbol
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: 8,
        }}>
          {(() => {
            const bySymbol: Record<string, any> = {}
            closed.forEach(t => {
              if (!bySymbol[t.symbol]) bySymbol[t.symbol] = { symbol: t.symbol, trades: 0, wins: 0, pnl: 0 }
              bySymbol[t.symbol].trades++
              if (t.pnl! > 0) bySymbol[t.symbol].wins++
              bySymbol[t.symbol].pnl += t.pnl!
            })
            return Object.values(bySymbol).sort((a: any, b: any) => Math.abs(b.pnl) - Math.abs(a.pnl)).map((s: any) => (
              <div key={s.symbol} className="glass-card" style={{ padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>{s.symbol}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: s.pnl >= 0 ? '#22c55e' : '#ef4444' }}>
                    {formatCurrency(s.pnl)}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#71717a', flexWrap: 'wrap' }}>
                  <span>{s.trades} trades</span>
                  <span>{((s.wins / s.trades) * 100).toFixed(0)}% win</span>
                  <span>Avg {formatCurrency(s.pnl / s.trades)}</span>
                </div>
              </div>
            ))
          })()}
        </div>
      </motion.div>
    </div>
  )
}
