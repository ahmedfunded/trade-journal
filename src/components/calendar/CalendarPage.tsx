import { useState } from 'react'
import { motion } from 'motion/react'
import { useCalendar } from '@/hooks/useData'

export function CalendarPage({ isMobile }: { isMobile?: boolean }) {
  const [year, setYear] = useState(new Date().getFullYear())
  const { data, loading } = useCalendar(year)

  const pnlMap = new Map(data.map(d => [d.date, d.pnl]))

  const months = Array.from({ length: 12 }, (_, i) => {
    const monthStart = new Date(year, i, 1)
    const monthEnd = new Date(year, i + 1, 0)
    const days: { date: string; day: number; pnl: number | null }[] = []
    for (let d = 1; d <= monthEnd.getDate(); d++) {
      const date = `${year}-${String(i + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      days.push({ date, day: d, pnl: pnlMap.get(date) ?? null })
    }
    const startPad = monthStart.getDay()
    return { name: monthStart.toLocaleDateString('en', { month: 'short' }), days, startPad }
  })

  const getColor = (pnl: number | null): string => {
    if (pnl === null) return 'transparent'
    if (pnl > 500) return 'rgba(34,197,94,0.6)'
    if (pnl > 100) return 'rgba(34,197,94,0.35)'
    if (pnl > 0) return 'rgba(34,197,94,0.15)'
    if (pnl === 0) return 'rgba(113,113,122,0.1)'
    if (pnl < -500) return 'rgba(239,68,68,0.6)'
    if (pnl < -100) return 'rgba(239,68,68,0.35)'
    return 'rgba(239,68,68,0.15)'
  }

  const totalPnL = data.reduce((s, d) => s + d.pnl, 0)
  const tradingDays = data.length
  const winDays = data.filter(d => d.pnl > 0).length
  const lossDays = data.filter(d => d.pnl < 0).length

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 12 }}
      >
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'flex-start',
          gap: 8,
        }}>
          <div>
            <h2 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 600, color: '#fff', margin: 0 }}>Calendar</h2>
            <p style={{ fontSize: 13, color: '#71717a', margin: '4px 0 0' }}>Daily P&L heatmap</p>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 6 : 12,
            alignItems: isMobile ? 'flex-start' : 'center',
          }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontSize: 11, color: '#22c55e' }}>▲ {winDays} win</span>
              <span style={{ fontSize: 11, color: '#ef4444' }}>▼ {lossDays} loss</span>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={() => setYear(y => y - 1)}
                style={{
                  padding: '6px 10px', borderRadius: 6, border: '1px solid #1e1e2e',
                  background: '#12121a', color: '#e4e4e7', fontSize: 11, cursor: 'pointer',
                }}>
                ←
              </button>
              <button onClick={() => setYear(new Date().getFullYear())}
                style={{
                  padding: '6px 10px', borderRadius: 6, border: '1px solid #1e1e2e',
                  background: '#6366f1', color: '#fff', fontSize: 11, cursor: 'pointer', fontWeight: 600,
                }}>
                {year}
              </button>
              <button onClick={() => setYear(y => y + 1)}
                style={{
                  padding: '6px 10px', borderRadius: 6, border: '1px solid #1e1e2e',
                  background: '#12121a', color: '#e4e4e7', fontSize: 11, cursor: 'pointer',
                }}>
                →
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card"
        style={{
          padding: isMobile ? 12 : 16,
          marginBottom: 12,
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(5, 1fr)' : 'repeat(5, 1fr)',
        }}
      >
        {[
          { label: 'Year P&L', value: `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toFixed(0)}`, color: totalPnL >= 0 ? '#22c55e' : '#ef4444' },
          { label: 'Days', value: String(tradingDays), color: '#fff' },
          { label: 'Win', value: String(winDays), color: '#22c55e' },
          { label: 'Loss', value: String(lossDays), color: '#ef4444' },
          { label: 'Win%', value: `${tradingDays > 0 ? ((winDays / tradingDays) * 100).toFixed(0) : 0}%`, color: '#6366f1' },
        ].map(item => (
          <div key={item.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>{item.label}</div>
            <div style={{ fontSize: isMobile ? 13 : 18, fontWeight: 700, color: item.color }}>{item.value}</div>
          </div>
        ))}
      </motion.div>

      {/* Calendar Grid */}
      {loading ? (
        <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
          <motion.div animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            style={{ width: 24, height: 24, border: '2px solid #1e1e2e', borderTopColor: '#6366f1', borderRadius: '50%' }}
          />
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          gap: isMobile ? 6 : 12,
        }}>
          {months.map((month, mi) => (
            <motion.div
              key={month.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: mi * 0.03 }}
              className="glass-card"
              style={{ padding: isMobile ? 8 : 12 }}
            >
              <h4 style={{
                fontSize: 10, color: '#a1a1aa', margin: '0 0 6px',
                fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px',
              }}>
                {month.name} {year}
              </h4>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2,
              }}>
                {!isMobile && ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                  <span key={d} style={{
                    fontSize: 8, color: '#3b3b52', textAlign: 'center',
                    padding: '2px 0', fontWeight: 600,
                  }}>
                    {d}
                  </span>
                ))}
                {Array.from({ length: month.startPad }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {month.days.map(d => (
                  <motion.div
                    key={d.date}
                    whileHover={{ scale: 1.2 }}
                    style={{
                      aspectRatio: '1',
                      borderRadius: 3,
                      background: getColor(d.pnl),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: isMobile ? 7 : 8,
                      color: d.pnl !== null ? '#e4e4e7' : '#52525b',
                      fontWeight: d.pnl !== null ? 600 : 400,
                      cursor: d.pnl !== null ? 'pointer' : 'default',
                    }}
                    title={d.pnl !== null ? `${d.date}: $${d.pnl.toFixed(2)}` : d.date}
                  >
                    {d.day}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{
          display: 'flex', justifyContent: 'center',
          gap: isMobile ? 8 : 16,
          marginTop: 12,
          flexWrap: 'wrap',
        }}
      >
        {[
          { color: 'rgba(34,197,94,0.6)', label: 'Big Win' },
          { color: 'rgba(34,197,94,0.2)', label: 'Small Win' },
          { color: 'rgba(239,68,68,0.2)', label: 'Small Loss' },
          { color: 'rgba(239,68,68,0.6)', label: 'Big Loss' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: item.color }} />
            <span style={{ fontSize: 10, color: '#71717a' }}>{item.label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
