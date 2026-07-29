import { useState } from 'react'
import { motion } from 'motion/react'
import { useTrades } from '@/hooks/useData'

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
    <div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 12 }}>
        <h2 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 600, color: '#fff', margin: 0 }}>Trades</h2>
        <p style={{ fontSize: 13, color: '#71717a', margin: '4px 0 0' }}>{total} total trades</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card"
        style={{ padding: isMobile ? 8 : 12, marginBottom: 12, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}
      >
        <input
          placeholder="Search..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0) }}
          style={{
            background: '#1a1a25', border: '1px solid #1e1e2e', borderRadius: 6,
            padding: '6px 10px', color: '#e4e4e7', fontSize: 12, outline: 'none',
            minWidth: isMobile ? 120 : 200, fontFamily: 'inherit', flex: isMobile ? 1 : undefined,
          }}
        />
        <select value={dirFilter}
          onChange={e => { setDirFilter(e.target.value); setPage(0) }}
          style={{
            background: '#1a1a25', border: '1px solid #1e1e2e', borderRadius: 6,
            padding: '6px 10px', color: '#e4e4e7', fontSize: 12, outline: 'none', fontFamily: 'inherit',
          }}>
          <option value="">Dir</option>
          <option value="long">Long</option>
          <option value="short">Short</option>
        </select>
        <select value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(0) }}
          style={{
            background: '#1a1a25', border: '1px solid #1e1e2e', borderRadius: 6,
            padding: '6px 10px', color: '#e4e4e7', fontSize: 12, outline: 'none', fontFamily: 'inherit',
          }}>
          <option value="">Status</option>
          <option value="closed">Closed</option>
          <option value="open">Open</option>
        </select>
        {!isMobile && (
          <span style={{ fontSize: 11, color: '#52525b', marginLeft: 'auto' }}>
            Page {page + 1} of {totalPages || 1}
          </span>
        )}
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="glass-card"
        style={{ overflow: 'hidden' }}
      >
        {loading ? (
          <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
            <motion.div animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              style={{ width: 24, height: 24, border: '2px solid #1e1e2e', borderTopColor: '#6366f1', borderRadius: '50%' }}
            />
          </div>
        ) : error ? (
          <div style={{ padding: 20, color: '#ef4444', fontSize: 13 }}>{error}</div>
        ) : (
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{
              width: '100%', borderCollapse: 'collapse', fontSize: isMobile ? 11 : 12,
              minWidth: isMobile ? 580 : 'auto',
            }}>
              <thead>
                <tr style={{ color: '#52525b', borderBottom: '1px solid #1e1e2e' }}>
                  {['Date', 'Symbol', 'Dir', 'Entry', 'Exit', 'Qty', 'P&L', 'Setup', 'R:R', 'Status'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: isMobile ? '8px 6px' : '10px 12px', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trades.map(t => (
                  <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ borderBottom: '1px solid #14141f' }}>
                    <td style={{ padding: isMobile ? '8px 6px' : '10px 12px', color: '#a1a1aa', whiteSpace: 'nowrap' }}>
                      {new Date(t.timestamp).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                    </td>
                    <td style={{ padding: isMobile ? '8px 6px' : '10px 12px', color: '#fff', fontWeight: 600 }}>{t.symbol}</td>
                    <td style={{ padding: isMobile ? '8px 6px' : '10px 12px' }}>
                      <span style={{
                        padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                        background: t.direction === 'long' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                        color: t.direction === 'long' ? '#22c55e' : '#ef4444',
                      }}>
                        {t.direction === 'long' ? 'L' : 'S'}
                      </span>
                    </td>
                    <td style={{ padding: isMobile ? '8px 6px' : '10px 12px', color: '#a1a1aa', fontSize: isMobile ? 10 : 12 }}>
                      ${t.entry_price.toFixed(2)}
                    </td>
                    <td style={{ padding: isMobile ? '8px 6px' : '10px 12px', color: t.exit_price ? '#a1a1aa' : '#52525b', fontSize: isMobile ? 10 : 12 }}>
                      {t.exit_price ? `$${t.exit_price.toFixed(2)}` : '—'}
                    </td>
                    <td style={{ padding: isMobile ? '8px 6px' : '10px 12px', color: '#a1a1aa' }}>{t.quantity}</td>
                    <td style={{
                      padding: isMobile ? '8px 6px' : '10px 12px', fontWeight: 600,
                      color: !t.pnl ? '#52525b' : t.pnl >= 0 ? '#22c55e' : '#ef4444',
                      whiteSpace: 'nowrap',
                    }}>
                      {t.pnl !== null ? `${t.pnl >= 0 ? '+' : ''}$${t.pnl.toFixed(0)}` : '—'}
                    </td>
                    <td style={{ padding: isMobile ? '8px 6px' : '10px 12px', color: '#a1a1aa' }}>{t.setup}</td>
                    <td style={{ padding: isMobile ? '8px 6px' : '10px 12px', color: '#a1a1aa', display: isMobile ? 'none' : 'table-cell' }}>
                      {t.risk_reward ? `${t.risk_reward.toFixed(1)}R` : '—'}
                    </td>
                    <td style={{ padding: isMobile ? '8px 6px' : '10px 12px' }}>
                      <span style={{
                        padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                        background: t.status === 'closed' ? 'rgba(99,102,241,0.1)' : 'rgba(245,158,11,0.1)',
                        color: t.status === 'closed' ? '#818cf8' : '#f59e0b',
                      }}>
                        {t.status === 'closed' ? 'C' : 'O'}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 12, flexWrap: 'wrap' }}>
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            style={{
              padding: isMobile ? '6px 10px' : '6px 12px', borderRadius: 6, border: '1px solid #1e1e2e',
              background: '#12121a', color: page === 0 ? '#3b3b52' : '#e4e4e7',
              fontSize: 11, cursor: page === 0 ? 'default' : 'pointer',
            }}>
            Prev
          </button>
          {Array.from({ length: Math.min(totalPages, isMobile ? 3 : 7) }).map((_, i) => (
            <button key={i} onClick={() => setPage(i)}
              style={{
                padding: isMobile ? '6px 10px' : '6px 12px', borderRadius: 6, border: '1px solid #1e1e2e',
                background: page === i ? '#6366f1' : '#12121a',
                color: page === i ? '#fff' : '#e4e4e7',
                fontSize: 11, cursor: 'pointer', fontWeight: page === i ? 600 : 400,
              }}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
            style={{
              padding: isMobile ? '6px 10px' : '6px 12px', borderRadius: 6, border: '1px solid #1e1e2e',
              background: '#12121a', color: page >= totalPages - 1 ? '#3b3b52' : '#e4e4e7',
              fontSize: 11, cursor: page >= totalPages - 1 ? 'default' : 'pointer',
            }}>
            Next
          </button>
        </div>
      )}
      {isMobile && (
        <div style={{ textAlign: 'center', marginTop: 8, fontSize: 10, color: '#52525b' }}>
          Page {page + 1} of {totalPages || 1}
        </div>
      )}
    </div>
  )
}
