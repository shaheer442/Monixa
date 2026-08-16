import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, UserPlus, LogOut, User } from 'lucide-react'

const PROFILE_KEY = 'finora-profile'

function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
}

export default function ProfileMenu() {
  const [name, setName] = useState('Shaheer Ahmed')
  const [isOpen, setIsOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  const containerRef = useRef(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PROFILE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed?.name) setName(parsed.name)
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    }
  }, [])

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

  const handleAddAccount = () => {
    setFeedback('Multiple accounts aren\u2019t supported yet \u2014 coming soon.')
    setTimeout(() => setFeedback(''), 2500)
  }

  const handleSignOut = () => {
    setFeedback('Sign out isn\u2019t available in this demo.')
    setTimeout(() => setFeedback(''), 2500)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label="Open profile menu"
        aria-expanded={isOpen}
        className="flex items-center gap-3 rounded-xl border border-finora-border bg-finora-surface-secondary px-2 py-1.5 transition-colors hover:border-finora-accent/40 md:px-3"
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-finora-accent to-finora-accent-secondary text-sm font-semibold text-white"
          aria-hidden="true"
        >
          {getInitials(name) || 'FA'}
        </div>
        <div className="hidden text-left md:block">
          <p className="text-sm font-medium leading-tight text-finora-text">{name}</p>
          <p className="text-xs text-finora-text-secondary">Personal Account</p>
        </div>
        <ChevronDown
          size={16}
          strokeWidth={1.75}
          className={`hidden text-finora-text-secondary transition-transform md:block ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-finora-border bg-finora-surface shadow-xl"
          >
            <div className="flex items-center gap-3 border-b border-finora-border px-4 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-finora-accent to-finora-accent-secondary text-sm font-semibold text-white">
                {getInitials(name) || 'FA'}
              </div>
              <div>
                <p className="text-sm font-medium text-finora-text">{name}</p>
                <p className="text-xs text-finora-text-secondary">Personal Account</p>
              </div>
            </div>

            <div className="p-1.5">
              <button
                type="button"
                onClick={handleAddAccount}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-finora-text-secondary transition-colors hover:bg-finora-surface-secondary hover:text-finora-text"
              >
                <UserPlus size={16} />
                Add account
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-finora-expense transition-colors hover:bg-finora-expense/10"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>

            {feedback && (
              <div className="border-t border-finora-border px-4 py-2.5 text-xs text-finora-text-secondary">
                {feedback}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}