import { Menu, Search, X } from 'lucide-react'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { PAGE_TITLES } from '../../config/navigation'
import NotificationPopover from './NotificationPopover'
import ProfileMenu from './ProfileMenu'
import SearchBar from './SearchBar'
import ThemeToggle from './ThemeToggle'

export default function Topbar({ onMenuOpen }) {
  const { pathname } = useLocation()
  const pageTitle = PAGE_TITLES[pathname] ?? 'Finora'
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 border-b border-finora-border bg-finora-bg/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-3 px-4 md:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuOpen}
            aria-label="Open navigation menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-finora-border bg-finora-surface-secondary text-finora-text-secondary transition-colors hover:border-finora-accent/40 hover:text-finora-text md:hidden"
          >
            <Menu size={20} strokeWidth={1.75} />
          </button>

          <div className="min-w-0">
            <p className="truncate text-xs font-medium uppercase tracking-wider text-finora-text-secondary">
              Monixa
            </p>
            <h1 className="truncate text-lg font-semibold tracking-tight text-finora-text md:text-xl">
              {pageTitle}
            </h1>
          </div>
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <SearchBar />
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen((open) => !open)}
            aria-label={isMobileSearchOpen ? 'Close search' : 'Open search'}
            aria-expanded={isMobileSearchOpen}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-finora-border bg-finora-surface-secondary text-finora-text-secondary transition-colors hover:border-finora-accent/40 hover:text-finora-text lg:hidden"
          >
            {isMobileSearchOpen ? (
              <X size={18} strokeWidth={1.75} />
            ) : (
              <Search size={18} strokeWidth={1.75} />
            )}
          </button>

          <NotificationPopover />
          <ThemeToggle />
          <ProfileMenu />
        </div>
      </div>

      {isMobileSearchOpen && (
        <div className="border-t border-finora-border px-4 py-3 lg:hidden">
          <SearchBar />
        </div>
      )}
    </header>
  )
}
