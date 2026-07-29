import { motion } from 'motion/react'
import { useStats, useMonthlyPnL, useSetupStats, useTrades } from '@/hooks/useData'
import { formatCurrency } from '@/lib/utils'

const statCards = [
  { key: 'total_trades', label: 'Total Trades', color: '#6366f1' },
  { key: 'win_rate', label: 'Win Rate', suffix: '%', color: '#22c55e' },
  { key: 'net_pnl', label: 'Net P&L', format: 'currency', color: '#f59e0b' },
  { key: 'profit_factor', label: 'Profit Factor', decimals: 2, color: '#6366f1' },
  { key: 'avg_win', label: 'Avg Win', format: 'currency', color: '#22c55e' },
  { key: 'avg_loss', label: 'Avg Loss', format: 'currency', color: '#ef4444' },
  { key: 'biggest_win', label: 'Biggest Win', format: 'currency', color: '#22c55e' },
  { key: 'biggest_loss', label: 'Biggest Loss', format: 'currency', color: '#ef4444' },
]

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
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 40 }}>
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
      <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{ width: 32, height: 32, border: '2px solid #1e1e2e', borderTopColor: '#6366f1', borderRadius: '50%' }}
        />
      </div>
    )
  }

  const renderValue = (card: typeof statCards[0]) => {
    const val = stats?.[card.key as keyof typeof stats]
    if (val === undefined || val === null) return '—'
    if (card.format === 'currency') return formatCurrency(val as number)
    if (typeof val === 'number') {
      const n = card.decimals ? val.toFixed(card.decimals) : val.toFixed(card.suffix === '%' ? 1 : 0)
      return `${n}${card.suffix || ''}`
    }
    return String(val)
  }

  const isPositive = (key: string, val: any) => {
    if (key.includes('loss') || key === 'max_drawdown') return val <= 0
    return val >= 0
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 600, color: '#fff', margin: 0 }}>Dashboard</h2>
        <p style={{ fontSize: 13, color: '#71717a', margin: '4px 0 0' }}>Overview of your trading performance</p>
      </motion.div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: isMobile ? 6 : 10,
        marginBottom: 12,
      }}>
        {statCards.map((card, i) => {
          const val = stats?.[card.key as keyof typeof stats]
          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass-card"
              style={{ padding: isMobile ? '10px 12px' : '14px 16px', position: 'relative', overflow: 'hidden' }}
            >
              <div style={{
                position: 'absolute', top: 0, right: 0, width: 60, height: 60,
                borderRadius: '50%', background: `${card.color}05`,
                transform: 'translate(20px, -30px)',
              }} />
              <div style={{
                fontSize: 10, color: '#71717a', textTransform: 'uppercase',
                letterSpacing: '0.5px', marginBottom: 4,
              }}>
                {card.label}
              </div>
              <div style={{
                fontSize: isMobile ? 16 : 22, fontWeight: 700,
                color: val !== null && val !== undefined && isPositive(card.key, val)
                  ? '#22c55e' : '#ef4444',
                letterSpacing: '-0.5px',
              }}>
                {renderValue(card)}
              </div>
            </motion.div>
          )
        })}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
        gap: 12, marginBottom: 12,
      }}>
        <div className="glass-card" style={{ padding: isMobile ? 12 : 16 }}>
          <h3 style={{ fontSize: 11, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 12px' }}>Monthly P&L</h3>
          <div style={{ height: isMobile ? 140 : 200, display: 'flex', alignItems: 'flex-end', gap: 3, paddingTop: 10 }}>
            {monthlyPnL.slice(-12).map((m, i) => {
              const maxPnL = Math.max(...monthlyPnL.map(x => Math.abs(x.pnl)), 1)
              const bh = maxPnL > 0 ? (Math.abs(m.pnl) / maxPnL) * (isMobile ? 100 : 160) : 0
              return (
                <motion.div
                  key={m.month}
                  initial={{ height: 0 }}
                  animate={{ height: Math.max(bh, 3) }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  style={{
                    flex: 1,
                    background: m.pnl >= 0
                      ? 'linear-gradient(180deg, #22c55e, rgba(34,197,94,0.3))'
                      : 'linear-gradient(180deg, #ef4444, rgba(239,68,68,0.3))',
                    borderRadius: '3px 3px 0 0', minWidth: 16, position: 'relative', cursor: 'pointer',
                  }}
                >
                  <div style={{
                    position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)',
                    fontSize: 8, color: m.pnl >= 0 ? '#22c55e' : '#ef4444', fontWeight: 600, whiteSpace: 'nowrap',
                  }}>
                    {m.pnl >= 0 ? '+' : ''}${Math.round(m.pnl)}
                  </div>
                </motion.div>
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            {monthlyPnL.slice(-12).map(m => (
              <span key={m.month} style={{ fontSize: 8, color: '#52525b' }}>
                {new Date(m.month + '-01').toLocaleDateString('en', { month: 'short' })}
              </span>
            ))}
          </div>
        </div>

        <div className="glass-card" style={{ padding: isMobile ? 12 : 16 }}>
          <h3 style={{ fontSize: 11, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 12px' }}>By Setup</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {setupStats.slice(0, 6).map((s, i) => {
              const total = setupStats.reduce((a, b) => a + b.count, 0)
              const pct = total > 0 ? (s.count / total) * 100 : 0
              return (
                <motion.div key={s.setup} initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontSize: 11, color: '#a1a1aa' }}>{s.setup}</span>
                    <span style={{ fontSize: 11, color: s.pnl >= 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                      {s.pnl >= 0 ? '+' : ''}${Math.round(s.pnl)}
                    </span>
                  </div>
                  <div style={{ background: '#1e1e2e', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: i * 0.05, duration: 0.5 }}
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
        </div>
      </div>

      <div className="glass-card" style={{ padding: isMobile ? 12 : 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: 11, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
            Recent Trades
          </h3>
          {!isMobile && <MiniChart trades={trades} />}
        </div>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: isMobile ? 11 : 12, minWidth: isMobile ? 450 : 'auto' }}>
            <thead>
              <tr style={{ color: '#52525b', borderBottom: '1px solid #1e1e2e' }}>
                {['Date', 'Symbol', 'Dir', 'P&L', 'Setup'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trades.slice(0, isMobile ? 5 : 10).map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid #14141f' }}>
                  <td style={{ padding: '8px', color: '#a1a1aa', whiteSpace: 'nowrap' }}>
                    {new Date(t.timestamp).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                  </td>
                  <td style={{ padding: '8px', color: '#fff', fontWeight: 600 }}>{t.symbol}</td>
                  <td style={{ padding: '8px' }}>
                    <span style={{
                      padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                      background: t.direction === 'long' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                      color: t.direction === 'long' ? '#22c55e' : '#ef4444',
                    }}>
                      {t.direction === 'long' ? 'L' : 'S'}
                    </span>
                  </td>
                  <td style={{
                    padding: '8px', fontWeight: 600,
                    color: t.pnl && t.pnl >= 0 ? '#22c55e' : '#ef4444',
                  }}>
                    {t.pnl !== null ? `${t.pnl >= 0 ? '+' : ''}${t.pnl.toFixed(0)}` : '—'}
                  </td>
                  <td style={{ padding: '8px', color: '#a1a1aa' }}>{t.setup}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
