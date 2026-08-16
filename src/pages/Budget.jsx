import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'

import { formatCurrency } from '../utils/formatCurrency'
import PageFade from '../components/ui/PageFade'

const TRANSACTIONS_KEY = 'finora-transactions'
const BUDGETS_KEY = 'finora-budgets'

export default function Budget() {
  const [transactions, setTransactions] = useState([])
  const [budgets, setBudgets] = useState(() => {
    try {
      const saved = localStorage.getItem(BUDGETS_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) return parsed
      }
    } catch (error) {
      console.error('Failed to load budgets:', error)
    }
    return []
  })

  const [categoryName, setCategoryName] = useState('')
  const [limitAmount, setLimitAmount] = useState('')

  useEffect(() => {
    try {
      const saved = localStorage.getItem(TRANSACTIONS_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) setTransactions(parsed)
      }
    } catch (error) {
      console.error('Failed to load transactions:', error)
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets))
    } catch (error) {
      console.error('Failed to save budgets:', error)
    }
  }, [budgets])

  const spendingByCategory = useMemo(() => {
    const now = new Date()
    const totals = {}

    transactions
      .filter((transaction) => transaction.type === 'expense')
      .forEach((transaction) => {
        const date = new Date(transaction.date)
        if (Number.isNaN(date.getTime())) return
        if (
          date.getMonth() !== now.getMonth() ||
          date.getFullYear() !== now.getFullYear()
        ) {
          return
        }

       const category = (transaction.category || 'Other').toLowerCase()
        const amount = Number(transaction.amount || 0)
        totals[category] = (totals[category] || 0) + amount
      })

    return totals
  }, [transactions])

  const handleAddBudget = (event) => {
    event.preventDefault()

    const trimmedName = categoryName.trim()
    const numericLimit = Number(limitAmount)

    if (!trimmedName || !numericLimit || numericLimit <= 0) return

    setBudgets((current) => [
      ...current,
      {
        id: Date.now().toString(),
        category: trimmedName,
        limit: numericLimit,
      },
    ])

    setCategoryName('')
    setLimitAmount('')
  }

  const handleDeleteBudget = (id) => {
    setBudgets((current) => current.filter((budget) => budget.id !== id))
  }

  return (
    <PageFade>
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-finora-accent">
          Monixa
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-finora-text sm:text-3xl">
          Budget
        </h2>
        <p className="mt-2 text-sm text-finora-text-secondary sm:text-base">
          Track monthly budgets and category spending limits.
        </p>
      </header>

      <section
        aria-label="Add budget"
        className="rounded-2xl border border-finora-border bg-finora-surface p-6"
      >
        <h3 className="text-lg font-semibold text-finora-text">Add a budget</h3>

        <form
          onSubmit={handleAddBudget}
          className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <label htmlFor="budget-category" className="text-xs font-medium text-finora-text-secondary">
              Category name
            </label>
            <input
              id="budget-category"
              name="category"
              type="text"
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
              placeholder="e.g. Food"
              className="mt-1 w-full rounded-xl border border-finora-border bg-finora-surface-secondary px-4 py-2.5 text-sm text-finora-text outline-none focus:border-finora-accent/50"
            />
          </div>

          <div className="flex-1">
            <label htmlFor="budget-limit" className="text-xs font-medium text-finora-text-secondary">
              Monthly limit (Rs)
            </label>
            <input
              id="budget-limit"
              name="limit"
              type="number"
              min="1"
              value={limitAmount}
              onChange={(event) => setLimitAmount(event.target.value)}
              placeholder="e.g. 15000"
              className="mt-1 w-full rounded-xl border border-finora-border bg-finora-surface-secondary px-4 py-2.5 text-sm text-finora-text outline-none focus:border-finora-accent/50"
            />
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-xl bg-finora-accent px-5 py-2.5 text-sm font-medium text-white transition active:scale-95 hover:opacity-90"
          >
            <Plus size={16} />
            Add Budget
          </button>
        </form>
      </section>

      <section aria-label="Budget list" className="space-y-4">
        {budgets.length === 0 ? (
          <div className="rounded-2xl border border-finora-border bg-finora-surface p-8 text-center text-sm text-finora-text-secondary">
            No budgets yet. Add one above to start tracking your spending limits.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {budgets.map((budget, index) => {
              const spent = spendingByCategory[budget.category.toLowerCase()] || 0
              const percentage = Math.min((spent / budget.limit) * 100, 100)
              const rawPercentage = (spent / budget.limit) * 100
              const isOver = rawPercentage > 100
              const isClose = rawPercentage >= 75 && rawPercentage <= 100

              let barColor = 'bg-finora-accent'
              if (isOver) barColor = 'bg-finora-expense'
              else if (isClose) barColor = 'bg-amber-500'

              return (
                <motion.div
                  key={budget.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="rounded-2xl border border-finora-border bg-finora-surface p-6 transition-shadow hover:border-finora-accent/30 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-semibold text-finora-text">
                        {budget.category}
                      </h4>
                      <p className="mt-1 text-xs text-finora-text-secondary">
                        {formatCurrency(spent)} of {formatCurrency(budget.limit)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteBudget(budget.id)}
                      className="text-finora-text-secondary transition-colors hover:text-finora-expense"
                      aria-label={`Delete ${budget.category} budget`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-finora-surface-secondary">
                    <div
                      className={`h-full rounded-full transition-all ${barColor}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 text-xs">
                    {isOver ? (
                      <>
                        <AlertTriangle size={14} className="text-finora-expense" />
                        <span className="text-finora-expense">
                          Over budget by {formatCurrency(spent - budget.limit)}
                        </span>
                      </>
                    ) : isClose ? (
                      <>
                        <AlertTriangle size={14} className="text-amber-500" />
                        <span className="text-amber-500">
                          {rawPercentage.toFixed(0)}% used — approaching limit
                        </span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={14} className="text-finora-income" />
                        <span className="text-finora-text-secondary">
                          {rawPercentage.toFixed(0)}% used this month
                        </span>
                      </>
                    )}
                  </div>
               </motion.div>
              )
            })}
          </div>
        )}
      </section>
    </div>
    </PageFade>
  )
}