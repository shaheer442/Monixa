import { useEffect, useMemo, useState } from 'react'
import { TrendingUp, TrendingDown, PiggyBank, Percent } from 'lucide-react'

import PeriodSelector from '../components/dashboard/PeriodSelector'
import IncomeExpenseChart from '../components/dashboard/IncomeExpenseChart'
import SpendingCategoryChart from '../components/dashboard/SpendingCategoryChart'
import { PERIOD_OPTIONS } from '../data/dashboardStats'
import { formatCurrency } from '../utils/formatCurrency'
import PageFade from '../components/ui/PageFade'

const STORAGE_KEY = 'finora-transactions'

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

const CATEGORY_COLORS = [
  '#8b5cf6', '#06b6d4', '#f59e0b', '#f43f5e',
  '#10b981', '#eab308', '#ec4899', '#3b82f6',
]

export default function Analytics() {
  const [period, setPeriod] = useState('this-month')
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)

      if (saved) {
        const parsed = JSON.parse(saved)

        if (Array.isArray(parsed)) {
          setTransactions(parsed)
        }
      }
    } catch (error) {
      console.error('Failed to load transactions:', error)
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

    const savings = Math.max(income - expenses, 0)
    const savingsRate = income > 0 ? (savings / income) * 100 : 0

    return { income, expenses, savings, savingsRate }
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

  const summaryCards = [
    {
      id: 'income',
      title: 'Income',
      value: formatCurrency(totals.income),
      icon: TrendingUp,
      color: 'text-finora-income',
    },
    {
      id: 'expenses',
      title: 'Expenses',
      value: formatCurrency(totals.expenses),
      icon: TrendingDown,
      color: 'text-finora-expense',
    },
    {
      id: 'savings',
      title: 'Savings',
      value: formatCurrency(totals.savings),
      icon: PiggyBank,
      color: 'text-finora-accent-secondary',
    },
    {
      id: 'savings-rate',
      title: 'Savings Rate',
      value: `${totals.savingsRate.toFixed(1)}%`,
      icon: Percent,
      color: 'text-finora-accent',
    },
  ]

  return (
    <PageFade>
    <div className="space-y-8">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-finora-accent">
            Monixa
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-finora-text sm:text-3xl">
            Analytics
          </h2>
          <p className="mt-2 text-sm text-finora-text-secondary sm:text-base">
            Explore spending trends, savings rate, and category breakdowns.
          </p>
        </div>

        <PeriodSelector
          options={PERIOD_OPTIONS}
          value={period}
          onChange={setPeriod}
        />
      </header>

      <section aria-label="Analytics summary">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <div
              key={card.id}
              className="rounded-2xl border border-finora-border bg-finora-surface p-6"
            >
              <div className="flex items-center gap-2">
                <card.icon size={18} className={card.color} />
                <p className="text-sm font-medium text-finora-text-secondary">
                  {card.title}
                </p>
              </div>
              <p className="mt-3 text-2xl font-semibold text-finora-text">
                {card.value}
              </p>
            </div>
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