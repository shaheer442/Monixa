import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useMediaQuery } from '../hooks/useMediaQuery'
import MobileMenu from '../components/layout/MobileMenu'
import PageContainer from '../components/layout/PageContainer'
import Sidebar from '../components/layout/Sidebar'
import Topbar from '../components/layout/Topbar'

export default function AppLayout() {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const isTablet = useMediaQuery('(min-width: 768px)')

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const showDesktopSidebar = isTablet
  const sidebarCollapsed = isDesktop ? isCollapsed : true

  return (
    <div className="min-h-screen bg-finora-bg text-finora-text">
      <div className="flex min-h-screen">
        {showDesktopSidebar && (
          <div
            className={`sticky top-0 hidden h-screen shrink-0 transition-[width] duration-300 ease-in-out md:block ${
              sidebarCollapsed ? 'w-[5.5rem]' : 'w-64'
            }`}
          >
            <Sidebar
              collapsed={sidebarCollapsed}
              showCollapseToggle={isDesktop}
              onToggleCollapse={() => setIsCollapsed((value) => !value)}
            />
          </div>
        )}

        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onMenuOpen={() => setIsMobileMenuOpen(true)} />
          <PageContainer>
            <Outlet />
          </PageContainer>
        </div>
      </div>
    </div>
  )
}
