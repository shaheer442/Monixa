import { NavLink } from 'react-router-dom'

export default function SidebarItem({ item, collapsed = false, onNavigate }) {
  const Icon = item.icon

  return (
    <NavLink
      to={item.path}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        [
          'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
          collapsed ? 'justify-center px-2' : '',
          isActive
            ? 'bg-[var(--finora-sidebar-active)] text-finora-text shadow-sm'
            : 'text-finora-text-secondary hover:bg-finora-surface-secondary hover:text-finora-text',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-finora-accent" />
          )}
          <Icon
            size={20}
            strokeWidth={1.75}
            className={isActive ? 'text-finora-accent' : 'text-finora-text-secondary group-hover:text-finora-text'}
          />
          {!collapsed && <span className="truncate">{item.label}</span>}
        </>
      )}
    </NavLink>
  )
}
