import { AnimatePresence, motion } from 'framer-motion'
import { Bell, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { MOCK_NOTIFICATIONS } from '../../data/notifications'

const READ_KEY = 'finora-notifications-read'

export default function NotificationPopover() {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  const [readIds, setReadIds] = useState(() => {
    try {
      const saved = localStorage.getItem(READ_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) return parsed
      }
    } catch (error) {
      console.error('Failed to load read notifications:', error)
    }
    return []
  })

  const unreadCount = MOCK_NOTIFICATIONS.filter(
    (item) => !readIds.includes(item.id),
  ).length

  const handleOpen = () => {
    setIsOpen((open) => {
      const nextOpen = !open

      if (nextOpen) {
        const allIds = MOCK_NOTIFICATIONS.map((item) => item.id)
        setReadIds(allIds)
        try {
          localStorage.setItem(READ_KEY, JSON.stringify(allIds))
        } catch (error) {
          console.error('Failed to save read notifications:', error)
        }
      }

      return nextOpen
    })
  }

  useEffect(() => {
    if (!isOpen) return undefined

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Notifications"
        aria-expanded={isOpen}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-finora-border bg-finora-surface-secondary text-finora-text-secondary transition-colors hover:border-finora-accent/40 hover:text-finora-text"
      >
        <Bell size={18} strokeWidth={1.75} />
        {unreadCount > 0 && (
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-finora-expense ring-2 ring-finora-surface-secondary" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
           className="fixed left-4 right-4 top-16 z-50 mx-auto max-w-sm overflow-hidden rounded-2xl border border-finora-border bg-finora-surface shadow-xl sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-80"
          >
            <div className="flex items-center justify-between border-b border-finora-border px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-finora-text">Notifications</p>
                <p className="text-xs text-finora-text-secondary">
                  {unreadCount} unread
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close notifications"
                className="rounded-lg p-1 text-finora-text-secondary transition-colors hover:bg-finora-surface-secondary hover:text-finora-text"
              >
                <X size={16} />
              </button>
            </div>

            <ul className="max-h-80 overflow-y-auto">
              {MOCK_NOTIFICATIONS.map((notification) => {
                const isUnread = !readIds.includes(notification.id)

                return (
                  <li
                    key={notification.id}
                    className="border-b border-finora-border px-4 py-3 last:border-b-0"
                  >
                    <div className="flex items-start gap-3">
                      {isUnread && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-finora-accent" />
                      )}
                      <div className={isUnread ? '' : 'pl-5'}>
                        <p className="text-sm font-medium text-finora-text">
                          {notification.title}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-finora-text-secondary">
                          {notification.message}
                        </p>
                        <p className="mt-2 text-[11px] text-finora-text-secondary">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}