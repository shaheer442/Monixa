import {
  ArrowDownRight,
  ArrowUpRight,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react'

export const PERIOD_OPTIONS = [
  { value: 'this-week', label: 'This Week' },
  { value: 'this-month', label: 'This Month' },
  { value: 'last-month', label: 'Last Month' },
  { value: 'last-3-months', label: 'Last 3 Months' },
  { value: 'this-year', label: 'This Year' },
]

export const DASHBOARD_STATS = [
  {
    id: 'total-balance',
    title: 'Total Balance',
    value: 184250,
    change: 8.4,
    changeDirection: 'up',
    changeSentiment: 'positive',
    comparisonLabel: 'vs last month',
    icon: Wallet,
    accentFrom: 'from-finora-accent/20',
    accentTo: 'to-finora-accent-secondary/10',
    iconColor: 'text-finora-accent',
    sparkline: [62, 68, 65, 72, 78, 84, 88],
  },
  {
    id: 'monthly-income',
    title: 'Monthly Income',
    value: 85000,
    change: 5.2,
    changeDirection: 'up',
    changeSentiment: 'positive',
    comparisonLabel: 'vs last month',
    icon: TrendingUp,
    accentFrom: 'from-finora-income/20',
    accentTo: 'to-finora-income/5',
    iconColor: 'text-finora-income',
    sparkline: [70, 72, 75, 78, 80, 82, 85],
  },
  {
    id: 'monthly-expenses',
    title: 'Monthly Expenses',
    value: 42350,
    change: 3.1,
    changeDirection: 'down',
    changeSentiment: 'positive',
    comparisonLabel: 'vs last month',
    icon: TrendingDown,
    accentFrom: 'from-finora-expense/15',
    accentTo: 'to-finora-expense/5',
    iconColor: 'text-finora-expense',
    sparkline: [52, 50, 48, 47, 45, 44, 42],
  },
  {
    id: 'savings',
    title: 'Savings',
    value: 42650,
    change: 12.6,
    changeDirection: 'up',
    changeSentiment: 'positive',
    comparisonLabel: 'vs last month',
    icon: PiggyBank,
    accentFrom: 'from-finora-accent-secondary/20',
    accentTo: 'to-finora-accent/10',
    iconColor: 'text-finora-accent-secondary',
    sparkline: [28, 32, 35, 38, 40, 41, 43],
  },
]

export function getGreeting() {
  const hour = Number(
    new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone: 'Asia/Karachi',
    }).format(new Date()),
  )

  if (hour < 5) return 'Good night'
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 21) return 'Good evening'
  return 'Good night'
}

export function getCurrentTime() {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Karachi',
  }).format(new Date())
}