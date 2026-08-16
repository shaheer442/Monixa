import { useEffect, useMemo, useState } from 'react'
import {
  PiggyBank,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react'

import DashboardHeader from '../components/dashboard/DashboardHeader'
import StatCard from '../components/dashboard/StatCard'
import { formatCurrency } from '../utils/formatCurrency'
import IncomeExpenseChart from '../components/dashboard/IncomeExpenseChart'
import SpendingCategoryChart from '../components/dashboard/SpendingCategoryChart'
import PageFade from '../components/ui/PageFade'

const STORAGE_KEY = 'finora-transactions'

const DEFAULT_TRANSACTIONS = [
  {
    id: '1',
    type: 'expense',
    description: 'Grocery Shopping',
    category: 'Food',
    amount: 8500,
    date: '2026-08-08',
  },
  {
    id: '2',
    type: 'income',
    description: 'Monthly Salary',
    category: 'Salary',
    amount: 85000,
    date: '2026-08-01',
  },
  {
    id: '3',
    type: 'expense',
    description: 'Electricity Bill',
    category: 'Bills',
    amount: 7200,
    date: '2026-08-05',
  },
  {
    id: '4',
    type: 'expense',
    description: 'Netflix Subscription',
    category: 'Entertainment',
    amount: 2500,
    date: '2026-08-03',
  },
  {
    id: '5',
    type: 'expense',
    description: 'Hoteling',
    category: 'Food',
    amount: 4000,
    date: '2026-08-09',
  },
]
function isDateInPeriod(dateString, period) {
  const date = new Date(dateString)

  if (Number.isNaN(date.getTime())) return false

  const now = new Date()

  if (period === 'this-week') {
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    return date >= startOfWeek
  }

  if (period === 'this-month') {
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    )
  }

  if (period === 'last-month') {
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return (
      date.getMonth() === lastMonth.getMonth() &&
      date.getFullYear() === lastMonth.getFullYear()
    )
  }

  if (period === 'last-3-months') {
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1)
    return date >= threeMonthsAgo
  }

  if (period === 'this-year') {
    return date.getFullYear() === now.getFullYear()
  }

  return true
}

export default function Dashboard() {
  const [period, setPeriod] = useState('this-month')
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)

      if (saved) {
        const parsed = JSON.parse(saved)

        if (Array.isArray(parsed)) {
          return parsed
        }
      }
    } catch (error) {
      console.error('Failed to load transactions:', error)
    }

    return DEFAULT_TRANSACTIONS
  })

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)

        if (saved) {
          const parsed = JSON.parse(saved)

          if (Array.isArray(parsed)) {
            setTransactions(parsed)
          }
        }
      } catch (error) {
        console.error('Failed to sync transactions:', error)
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) =>
      isDateInPeriod(transaction.date, period),
    )
  }, [transactions, period])

  const totals = useMemo(() => {
    const income = filteredTransactions
      .filter((transaction) => transaction.type === 'income')
      .reduce((total, transaction) => total + Number(transaction.amount || 0), 0)

    const expenses = filteredTransactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((total, transaction) => total + Number(transaction.amount || 0), 0)

    const balance = income - expenses
    const savings = Math.max(balance, 0)

    return {
      income,
      expenses,
      balance,
      savings,
    }
  }, [filteredTransactions])

const incomeExpenseData = useMemo(() => {
  const months = []

  for (let i = 5; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)

    months.push({
      month: date.toLocaleString('en-US', { month: 'short' }),
      year: date.getFullYear(),
      monthIndex: date.getMonth(),
      income: 0,
      expenses: 0,
    })
  }

  transactions.forEach((transaction) => {
    const transactionDate = new Date(transaction.date)

    if (Number.isNaN(transactionDate.getTime())) return

    const matchingMonth = months.find(
      (item) =>
        item.monthIndex === transactionDate.getMonth() &&
        item.year === transactionDate.getFullYear(),
    )

    if (!matchingMonth) return

    const amount = Number(transaction.amount || 0)

    if (transaction.type === 'income') {
      matchingMonth.income += amount
    }

    if (transaction.type === 'expense') {
      matchingMonth.expenses += amount
    }
  })

  return months
}, [transactions])
const CATEGORY_COLORS = [
  '#8b5cf6', '#06b6d4', '#f59e0b', '#f43f5e',
  '#10b981', '#eab308', '#ec4899', '#3b82f6',
]

const spendingCategoryData = useMemo(() => {
  const categoryTotals = {}

  filteredTransactions
    .filter((transaction) => transaction.type === 'expense')
    .forEach((transaction) => {
      const category = transaction.category || 'Other'
      const amount = Number(transaction.amount || 0)

      categoryTotals[category] = (categoryTotals[category] || 0) + amount
    })

  return Object.entries(categoryTotals).map(([name, value], index) => ({
    name,
    value,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  }))
}, [filteredTransactions])

  const stats = [
    {
      id: 'total-balance',
      title: 'Total Balance',
      value: totals.balance,
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
      value: totals.income,
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
      value: totals.expenses,
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
      value: totals.savings,
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

return (
    <PageFade>
    <div className="space-y-8">
      <DashboardHeader
        period={period}
        onPeriodChange={setPeriod}
      />

      <section aria-label="Financial summary">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <StatCard
              key={stat.id}
              stat={stat}
              index={index}
            />
          ))}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
  <IncomeExpenseChart data={incomeExpenseData} />
  <SpendingCategoryChart data={spendingCategoryData} />
</div>
      </section>
    </div>
    </PageFade>
  )
}
