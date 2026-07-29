import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Dashboard } from './components/dashboard/Dashboard'
import { TradesPage } from './components/trades/TradesPage'
import { AnalyticsPage } from './components/analytics/AnalyticsPage'
import { CalendarPage } from './components/calendar/CalendarPage'
import { useMediaQuery } from './hooks/useMediaQuery'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'trades', label: 'Trades', icon: '📝' },
  { id: 'analytics', label: 'Analytics', icon: '📈' },
  { id: 'calendar', label: 'Calendar', icon: '📅' },
]

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [menuOpen, setMenuOpen] = useState(false)
  const isMobile = useMediaQuery('(max-width: 768px)')

  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (hash && TABS.some(t => t.id === hash)) setActiveTab(hash)
    const onHashChange = () => {
      const h = window.location.hash.replace('#', '')
      if (h && TABS.some(t => t.id === h)) setActiveTab(h)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = (tab: string) => {
    setActiveTab(tab)
    setMenuOpen(false)
    window.location.hash = tab
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f' }}>
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{
          background: 'rgba(18, 18, 26, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #1e1e2e',
          padding: isMobile ? '0 12px' : '0 24px',
          display: 'flex',
          alignItems: 'center',
          height: 56,
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: isMobile ? 8 : 32 }}>
          <span style={{ fontSize: 20 }}>📊</span>
          {!isMobile && (
            <>
              <h1 style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: 0, letterSpacing: '-0.3px' }}>
                Trade Journal
              </h1>
              <span style={{
                background: 'linear-gradient(135deg, #6366f1, #c084fc)',
                color: '#fff', fontSize: 9, padding: '2px 8px', borderRadius: 10, fontWeight: 500,
              }}>PRO</span>
            </>
          )}
        </div>

        {isMobile ? (
          <>
            <div style={{ flex: 1 }} />
            <button onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: 'transparent', border: 'none', color: '#e4e4e7',
                fontSize: 20, cursor: 'pointer', padding: 8,
              }}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
            {menuOpen && (
              <div style={{
                position: 'fixed', top: 56, left: 0, right: 0,
                background: '#12121a', borderBottom: '1px solid #1e1e2e',
                padding: 8, zIndex: 99, display: 'flex', flexDirection: 'column', gap: 2,
              }}>
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => navigate(tab.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '10px 12px', borderRadius: 8,
                      fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer',
                      background: activeTab === tab.id ? '#6366f1' : 'transparent',
                      color: activeTab === tab.id ? '#fff' : '#71717a',
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 8,
                  background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                  marginTop: 4,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                  <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 500 }}>Live</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <nav style={{ display: 'flex', gap: 2, flex: 1 }}>
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 16px', borderRadius: 8,
                    fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer',
                    background: activeTab === tab.id ? '#6366f1' : 'transparent',
                    color: activeTab === tab.id ? '#fff' : '#71717a',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: 16 }}>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 8,
              background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 500 }}>Live</span>
            </div>
          </>
        )}
      </motion.header>

      {/* Page Content */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: isMobile ? 8 : 16 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'dashboard' && <Dashboard isMobile={isMobile} />}
            {activeTab === 'trades' && <TradesPage isMobile={isMobile} />}
            {activeTab === 'analytics' && <AnalyticsPage isMobile={isMobile} />}
            {activeTab === 'calendar' && <CalendarPage isMobile={isMobile} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App
