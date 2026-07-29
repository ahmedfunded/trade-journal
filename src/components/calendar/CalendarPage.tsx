import { useState } from 'react'
import { motion } from 'motion/react'
import { useCalendar } from '@/hooks/useData'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'

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
    <div className="space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} justify-between items-start gap-2`}>
          <div>
            <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-text-primary m-0`}>
              Calendar
            </h2>
            <p className="text-xs text-text-secondary mt-1">Daily P&L heatmap</p>
          </div>
          <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-2 items-${isMobile ? 'start' : 'center'}`}>
            <div className="flex gap-2">
              <span className="text-xs text-green">▲ {winDays} win</span>
              <span className="text-xs text-red">▼ {lossDays} loss</span>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setYear(y => y - 1)}
                className="p-1.5 rounded-md border border-border-subtle bg-bg-card text-text-primary cursor-pointer">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setYear(new Date().getFullYear())}
                className="px-2.5 py-1.5 rounded-md border border-border-subtle bg-accent text-white text-xs font-semibold cursor-pointer">
                {year}
              </button>
              <button onClick={() => setYear(y => y + 1)}
                className="p-1.5 rounded-md border border-border-subtle bg-bg-card text-text-primary cursor-pointer">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Summary bar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card>
          <CardContent className="p-3 flex gap-4 text-xs">
            <span className="text-text-secondary">Trading Days: <strong className="text-text-primary">{tradingDays}</strong></span>
            <span className="text-text-secondary">Total P&L: <strong className={totalPnL >= 0 ? 'text-green' : 'text-red'}>
              ${totalPnL >= 0 ? '+' : ''}{Math.round(totalPnL)}
            </strong></span>
            <span className="text-text-secondary">Win Days: <strong className="text-green">{winDays}</strong></span>
            <span className="text-text-secondary">Loss Days: <strong className="text-red">{lossDays}</strong></span>
          </CardContent>
        </Card>
      </motion.div>

      {/* Calendar Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="w-8 h-8 border-2 border-border-subtle border-t-accent rounded-full"
          />
        </div>
      ) : (
        <div className={`grid ${isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-3 gap-3'}`}>
          {months.map((month, mi) => (
            <motion.div
              key={month.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: mi * 0.03 }}
            >
              <Card>
                <CardContent className={`${isMobile ? 'p-2' : 'p-3'}`}>
                  <h4 className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary mb-1.5">
                    {month.name} {year}
                  </h4>
                  <div className="grid grid-cols-7 gap-0.5">
                    {!isMobile && ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                      <span key={d} className="text-[7px] text-text-muted text-center py-0.5 font-semibold">{d}</span>
                    ))}
                    {Array.from({ length: month.startPad }).map((_, i) => (
                      <div key={`empty-${i}`} />
                    ))}
                    {month.days.map(d => (
                      <motion.div
                        key={d.date}
                        whileHover={{ scale: 1.2 }}
                        className="aspect-square rounded-sm flex items-center justify-center cursor-default"
                        style={{
                          background: getColor(d.pnl),
                          fontSize: isMobile ? 7 : 8,
                          color: d.pnl !== null ? '#e4e4e7' : '#52525b',
                          fontWeight: d.pnl !== null ? 600 : 400,
                        }}
                        title={d.pnl !== null ? `${d.date}: $${d.pnl.toFixed(2)}` : d.date}
                      >
                        {d.day}
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex justify-center gap-3 flex-wrap"
      >
        {[
          { color: 'rgba(34,197,94,0.6)', label: 'Big Win' },
          { color: 'rgba(34,197,94,0.2)', label: 'Small Win' },
          { color: 'rgba(239,68,68,0.2)', label: 'Small Loss' },
          { color: 'rgba(239,68,68,0.6)', label: 'Big Loss' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: item.color }} />
            <span className="text-[10px] text-text-secondary">{item.label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
