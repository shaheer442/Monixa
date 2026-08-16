import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import Sidebar from './Sidebar'

export default function MobileMenu({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return undefined

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = originalOverflow
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-label="Close navigation menu"
            className="fixed inset-0 z-40 bg-[var(--finora-overlay)] md:hidden"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed inset-y-0 left-0 z-50 w-[min(100vw-3rem,18rem)] md:hidden"
          >
            <div className="relative h-full shadow-2xl">
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="absolute right-3 top-4 z-10 rounded-lg p-2 text-finora-text-secondary transition-colors hover:bg-finora-surface-secondary hover:text-finora-text"
              >
                <X size={18} strokeWidth={1.75} />
              </button>
              <Sidebar onNavigate={onClose} className="h-full" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
