import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Dashboard } from './components/dashboard/Dashboard'
import { TradesPage } from './components/trades/TradesPage'
import { AnalyticsPage } from './components/analytics/AnalyticsPage'
import { CalendarPage } from './components/calendar/CalendarPage'
import { useMediaQuery } from './hooks/useMediaQuery'
import { LayoutDashboard, ListOrdered, BarChart3, Calendar, Menu, X } from 'lucide-react'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'trades', label: 'Trades', icon: ListOrdered },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
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
    <div className="min-h-screen bg-bg-main">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 h-14 flex items-center px-3 md:px-6"
        style={{ background: 'rgba(18, 18, 26, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1e1e2e' }}
      >
        <div className={`flex items-center gap-2 ${isMobile ? 'mr-2' : 'mr-8'}`}>
          <LayoutDashboard className="w-5 h-5 text-accent" />
          {!isMobile && (
            <>
              <h1 className="text-sm font-semibold text-text-primary m-0 tracking-tight">
                Trade Journal
              </h1>
              <span className="bg-gradient-to-r from-accent to-purple-400 text-white text-[9px] px-2 py-0.5 rounded-full font-medium">
                PRO
              </span>
            </>
          )}
        </div>

        {isMobile ? (
          <>
            <div className="flex-1" />
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="bg-transparent border-none text-text-primary cursor-pointer p-2">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed top-14 left-0 right-0 bg-bg-card border-b border-border-subtle p-2 z-50 flex flex-col gap-0.5"
              >
                {TABS.map(tab => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => navigate(tab.id)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium border-none cursor-pointer transition-colors ${
                        activeTab === tab.id
                          ? 'bg-accent text-white'
                          : 'bg-transparent text-text-muted'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  )
                })}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-bg border border-green/20 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green" />
                  <span className="text-[11px] text-green font-medium">Live</span>
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <>
            <nav className="flex gap-0.5 flex-1">
              {TABS.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => navigate(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium border-none cursor-pointer transition-all ${
                      activeTab === tab.id
                        ? 'bg-accent text-white'
                        : 'bg-transparent text-text-muted hover:text-text-primary'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-bg border border-green/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green" />
              <span className="text-[11px] text-green font-medium">Live</span>
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
