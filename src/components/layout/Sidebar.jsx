import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PanelLeftClose, PanelLeftOpen, Bell } from 'lucide-react'
import { NAV_ITEMS } from '../../config/navigation'
import SidebarItem from './SidebarItem'

const TRANSACTIONS_KEY = 'finora-transactions'

const PRO_TIPS = [
  'Track recurring payments to spot subscription creep early.',
  'Set a budget for every spending category to stay on track.',
  'Review your Analytics page weekly to catch spending trends.',
  'Small, regular savings add up faster than you think.',
  'Link a goal to an income category to auto-track your progress.',
]

function averageInterval(sortedDates) {
  if (sortedDates.length < 2) return null
  let totalGap = 0
  for (let i = 1; i < sortedDates.length; i++) {
    totalGap += (sortedDates[i] - sortedDates[i - 1]) / (1000 * 60 * 60 * 24)
  }
  return totalGap / (sortedDates.length - 1)
}

export default function Sidebar({
  collapsed = false,
  onToggleCollapse,
  showCollapseToggle = false,
  onNavigate,
  className = '',
}) {
  const [tipIndex, setTipIndex] = useState(0)
  const [nextPayment, setNextPayment] = useState(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex((current) => (current + 1) % PRO_TIPS.length)
    }, 8000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(TRANSACTIONS_KEY)
      if (!saved) return

      const transactions = JSON.parse(saved)
      if (!Array.isArray(transactions)) return

      const groups = {}
      transactions
        .filter((t) => t.type === 'expense')
        .forEach((t) => {
          const key = (t.description || 'Unknown').trim().toLowerCase()
          const date = new Date(t.date)
          if (Number.isNaN(date.getTime())) return
          if (!groups[key]) groups[key] = { description: t.description, dates: [] }
          groups[key].dates.push(date)
        })

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const upcoming = Object.values(groups)
        .filter((g) => g.dates.length >= 2)
        .map((g) => {
          const sortedDates = [...g.dates].sort((a, b) => a - b)
          const avgIntervalDays = averageInterval(sortedDates)
          const lastDate = sortedDates[sortedDates.length - 1]

          if (avgIntervalDays === null) return null

          const nextDueDate = new Date(lastDate)
          nextDueDate.setDate(nextDueDate.getDate() + Math.round(avgIntervalDays))

          const daysUntilDue = Math.ceil((nextDueDate - today) / (1000 * 60 * 60 * 24))

          return { description: g.description, daysUntilDue, nextDueDate }
        })
        .filter((item) => item && item.daysUntilDue >= 0)
        .sort((a, b) => a.daysUntilDue - b.daysUntilDue)

      if (upcoming.length > 0) setNextPayment(upcoming[0])
    } catch (error) {
      console.error('Failed to load upcoming payments:', error)
    }
  }, [])

  return (
    <aside
      className={`flex h-full flex-col border-r border-finora-border bg-finora-surface ${className}`}
    >
      <div
        className={`flex h-16 items-center border-b border-finora-border ${
          collapsed ? 'justify-center px-3' : 'justify-between px-5'
        }`}
      >
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <svg
            width="36"
            height="36"
            viewBox="0 0 48 48"
            fill="none"
            className="shrink-0 rounded-xl shadow-lg shadow-finora-accent/20"
          >
            <defs>
              <linearGradient id="monixaGradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
            <rect width="48" height="48" rx="12" fill="url(#monixaGradient)" />
            <path d="M10 14 L16 14 L24 24 L32 14 L38 14 L38 34 L32 34 L32 22 L24 32 L16 22 L16 34 L10 34 Z" fill="white" opacity="0.95" />
            <rect x="18" y="28" width="3" height="5" fill="#059669" />
            <rect x="22.5" y="25" width="3" height="8" fill="#059669" />
            <rect x="27" y="22" width="3" height="11" fill="#059669" />
          </svg>
          {!collapsed && (
            <div>
              <p className="text-base font-semibold tracking-tight text-finora-text">Monixa</p>
              <p className="text-[11px] text-finora-text-secondary">Personal Finance</p>
            </div>
          )}
        </div>

        {showCollapseToggle && !collapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Collapse sidebar"
            className="rounded-lg p-2 text-finora-text-secondary transition-colors hover:bg-finora-surface-secondary hover:text-finora-text"
          >
            <PanelLeftClose size={18} strokeWidth={1.75} />
          </button>
        )}
      </div>

      {showCollapseToggle && collapsed && (
        <div className="flex justify-center border-b border-finora-border py-3">
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Expand sidebar"
            className="rounded-lg p-2 text-finora-text-secondary transition-colors hover:bg-finora-surface-secondary hover:text-finora-text"
          >
            <PanelLeftOpen size={18} strokeWidth={1.75} />
          </button>
        </div>
      )}

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <SidebarItem
            key={item.path}
            item={item}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      {!collapsed && (
        <div className="space-y-3 border-t border-finora-border p-4">
          <div className="overflow-hidden rounded-xl border border-finora-border bg-finora-surface-secondary p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-finora-accent">
              Pro tip
            </p>
            <AnimatePresence mode="wait">
              <motion.p
                key={tipIndex}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3 }}
                className="mt-1 text-xs leading-relaxed text-finora-text-secondary"
              >
                {PRO_TIPS[tipIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          {nextPayment && (
            <div className="rounded-xl border border-finora-border bg-finora-surface-secondary p-3">
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-finora-warning">
                <Bell size={12} />
                Upcoming payment
              </p>
              <p className="mt-1 text-xs leading-relaxed text-finora-text-secondary">
                {nextPayment.description} due{' '}
                {nextPayment.daysUntilDue === 0
                  ? 'today'
                  : `in ${nextPayment.daysUntilDue} day${nextPayment.daysUntilDue === 1 ? '' : 's'}`}
              </p>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}