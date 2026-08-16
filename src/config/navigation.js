import {
  ArrowLeftRight,
  BarChart3,
  LayoutDashboard,
  PieChart,
  Repeat,
  Settings,
  Target,
} from 'lucide-react'

export const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { path: '/budget', label: 'Budget', icon: PieChart },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/goals', label: 'Goals', icon: Target },
  { path: '/recurring', label: 'Recurring Payments', icon: Repeat },
  { path: '/settings', label: 'Settings', icon: Settings },
]

export const PAGE_TITLES = Object.fromEntries(
  NAV_ITEMS.map(({ path, label }) => [path, label]),
)
