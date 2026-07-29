import { useState } from 'react'
import { motion } from 'motion/react'
import { useTrades } from '@/hooks/useData'
import { Card, CardContent } from '@/components/ui/card'
import { Search, ArrowUpDown } from 'lucide-react'

export function TradesPage({ isMobile }: { isMobile?: boolean }) {
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [dirFilter, setDirFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const filters: Record<string, string> = {}
  if (search) filters.search = search
  if (dirFilter) filters.direction = dirFilter
  if (statusFilter) filters.status = statusFilter

  const { trades, total, loading, error } = useTrades(page, 50, filters)
  const totalPages = Math.ceil(total / 50)

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-text-primary m-0`}>
          Trades
        </h2>
        <p className="text-xs text-text-secondary mt-1">{total} total trades</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card>
          <CardContent className={`${isMobile ? 'p-2' : 'p-3'} flex gap-2 items-center flex-wrap`}>
            <div className="relative flex-1 min-w-[120px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
              <input
                placeholder="Search..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(0) }}
                className="w-full bg-bg-card-hover border border-border-subtle rounded-md pl-8 pr-3 py-1.5 text-xs text-text-primary outline-none font-inherit"
              />
            </div>
            <select value={dirFilter}
              onChange={e => { setDirFilter(e.target.value); setPage(0) }}
              className="bg-bg-card-hover border border-border-subtle rounded-md px-2.5 py-1.5 text-xs text-text-primary outline-none font-inherit"
            >
              <option value="">Dir</option>
              <option value="long">Long</option>
              <option value="short">Short</option>
            </select>
            <select value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(0) }}
              className="bg-bg-card-hover border border-border-subtle rounded-md px-2.5 py-1.5 text-xs text-text-primary outline-none font-inherit"
            >
              <option value="">Status</option>
              <option value="closed">Closed</option>
              <option value="open">Open</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-text-muted ml-auto hidden sm:block" />
          </CardContent>
        </Card>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="py-10 flex justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-6 h-6 border-2 border-border-subtle border-t-accent rounded-full"
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-text-muted border-b border-border-subtle">
                      {['Date', 'Symbol', 'Direction', 'Entry', 'Exit', 'Qty', 'P&L', 'Setup', 'R:R', 'Status']
                        .filter(h => !isMobile || !['R:R'].includes(h))
                        .map(h => (
                        <th key={h} className="text-left p-3 font-medium whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map((t, i) => (
                      <motion.tr
                        key={t.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.015 }}
                        className="border-b border-[#14141f] hover:bg-bg-card-hover transition-colors"
                      >
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
                        <td className="p-3 text-text-tertiary whitespace-nowrap">
                          ${t.entry_price.toFixed(2)}
                        </td>
                        <td className={`p-3 whitespace-nowrap ${t.exit_price ? 'text-text-tertiary' : 'text-text-muted'}`}>
                          {t.exit_price ? `$${t.exit_price.toFixed(2)}` : '—'}
                        </td>
                        <td className="p-3 text-text-tertiary">{t.quantity}</td>
                        <td className={`p-3 font-semibold whitespace-nowrap ${
                          !t.pnl ? 'text-text-muted' : t.pnl >= 0 ? 'text-green' : 'text-red'
                        }`}>
                          {t.pnl !== null ? `${t.pnl >= 0 ? '+' : ''}$${t.pnl.toFixed(0)}` : '—'}
                        </td>
                        <td className="p-3 text-text-tertiary">{t.setup}</td>
                        <td className="p-3 text-text-tertiary hidden sm:table-cell">
                          {t.risk_reward ? `${t.risk_reward.toFixed(1)}R` : '—'}
                        </td>
                        <td className="p-3">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            t.status === 'closed'
                              ? 'bg-accent/10 text-accent-hover'
                              : 'bg-gold/10 text-gold'
                          }`}>
                            {t.status === 'closed' ? 'C' : 'O'}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-1 flex-wrap">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            className={`px-3 py-1.5 rounded-md border border-border-subtle text-xs font-inherit ${
              page === 0 ? 'bg-bg-card text-text-muted cursor-default' : 'bg-bg-card text-text-primary cursor-pointer'
            }`}>
            Prev
          </button>
          {Array.from({ length: Math.min(totalPages, isMobile ? 3 : 7) }).map((_, i) => (
            <button key={i} onClick={() => setPage(i)}
              className={`px-3 py-1.5 rounded-md border border-border-subtle text-xs font-inherit cursor-pointer ${
                page === i ? 'bg-accent text-white font-semibold' : 'bg-bg-card text-text-primary'
              }`}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
            className={`px-3 py-1.5 rounded-md border border-border-subtle text-xs font-inherit ${
              page >= totalPages - 1 ? 'bg-bg-card text-text-muted cursor-default' : 'bg-bg-card text-text-primary cursor-pointer'
            }`}>
            Next
          </button>
        </div>
      )}
      {isMobile && (
        <div className="text-center text-[10px] text-text-muted">
          Page {page + 1} of {totalPages || 1}
        </div>
      )}
    </div>
  )
}
