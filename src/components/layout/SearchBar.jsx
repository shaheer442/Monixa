import { Search } from 'lucide-react'

export default function SearchBar({ className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <Search
        size={18}
        strokeWidth={1.75}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-finora-text-secondary"
        aria-hidden="true"
      />
      <input
        type="search"
        placeholder="Search transactions, budgets..."
        aria-label="Search"
        className="h-10 w-full rounded-xl border border-finora-border bg-finora-surface-secondary pl-10 pr-4 text-sm text-finora-text placeholder:text-finora-text-secondary transition-colors hover:border-finora-accent/30 focus:border-finora-accent/50 focus:outline-none md:w-64 lg:w-72"
      />
    </div>
  )
}
