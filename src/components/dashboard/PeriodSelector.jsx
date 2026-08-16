import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export default function PeriodSelector({ options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  const selectedOption = options.find((option) => option.value === value) ?? options[0]

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
    <div ref={containerRef} className="relative w-full sm:w-auto">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-finora-border bg-finora-surface px-4 py-2.5 text-sm font-medium text-finora-text transition-colors hover:border-finora-accent/40 sm:min-w-[10.5rem]"
      >
        <span>{selectedOption.label}</span>
        <ChevronDown
          size={16}
          strokeWidth={1.75}
          className={`text-finora-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <ul
          role="listbox"
          aria-label="Select period"
          className="absolute right-0 z-20 mt-2 w-full overflow-hidden rounded-xl border border-finora-border bg-finora-surface py-1 shadow-xl sm:min-w-[10.5rem]"
        >
          {options.map((option) => {
            const isSelected = option.value === value

            return (
              <li key={option.value} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value)
                    setIsOpen(false)
                  }}
                  className={`flex w-full px-4 py-2.5 text-left text-sm transition-colors ${
                    isSelected
                      ? 'bg-[var(--finora-sidebar-active)] font-medium text-finora-text'
                      : 'text-finora-text-secondary hover:bg-finora-surface-secondary hover:text-finora-text'
                  }`}
                >
                  {option.label}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
