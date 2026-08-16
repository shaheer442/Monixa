import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, Target, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'

import { formatCurrency } from '../utils/formatCurrency'
import PageFade from '../components/ui/PageFade'

const TRANSACTIONS_KEY = 'finora-transactions'
const GOALS_KEY = 'finora-goals'

export default function Goals() {
  const [transactions, setTransactions] = useState([])
  const [goals, setGoals] = useState(() => {
    try {
      const saved = localStorage.getItem(GOALS_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) return parsed
      }
    } catch (error) {
      console.error('Failed to load goals:', error)
    }
    return []
  })

  const [goalName, setGoalName] = useState('')
  const [goalCategory, setGoalCategory] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [targetDate, setTargetDate] = useState('')

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
      localStorage.setItem(GOALS_KEY, JSON.stringify(goals))
    } catch (error) {
      console.error('Failed to save goals:', error)
    }
  }, [goals])

  const savedByCategory = useMemo(() => {
    const totals = {}

    transactions
      .filter((transaction) => transaction.type === 'income')
      .forEach((transaction) => {
        const category = (transaction.category || 'Other').toLowerCase()
        const amount = Number(transaction.amount || 0)
        totals[category] = (totals[category] || 0) + amount
      })

    return totals
  }, [transactions])

  const handleAddGoal = (event) => {
    event.preventDefault()

    const trimmedName = goalName.trim()
    const trimmedCategory = goalCategory.trim()
    const numericTarget = Number(targetAmount)

    if (!trimmedName || !trimmedCategory || !numericTarget || numericTarget <= 0) return

    setGoals((current) => [
      ...current,
      {
        id: Date.now().toString(),
        name: trimmedName,
        category: trimmedCategory,
        target: numericTarget,
        deadline: targetDate || null,
      },
    ])

    setGoalName('')
    setGoalCategory('')
    setTargetAmount('')
    setTargetDate('')
  }

  const handleDeleteGoal = (id) => {
    setGoals((current) => current.filter((goal) => goal.id !== id))
  }

  const getDaysRemaining = (deadline) => {
    if (!deadline) return null

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const target = new Date(deadline)
    target.setHours(0, 0, 0, 0)

    const diffTime = target.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

return (
    <PageFade>
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-finora-accent">
          Monixa
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-finora-text sm:text-3xl">
          Goals
        </h2>
        <p className="mt-2 text-sm text-finora-text-secondary sm:text-base">
          Track progress toward your financial goals.
        </p>
      </header>

      <section
        aria-label="Add goal"
        className="rounded-2xl border border-finora-border bg-finora-surface p-6"
      >
        <h3 className="text-lg font-semibold text-finora-text">Add a goal</h3>
        <p className="mt-1 text-xs text-finora-text-secondary">
          Progress is tracked automatically from income transactions matching the
          linked category.
        </p>

        <form
          onSubmit={handleAddGoal}
          className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
        >
          <div>
           <label htmlFor="goal-name" className="text-xs font-medium text-finora-text-secondary">
              Goal name
            </label>
            <input
              id="goal-name"
              name="name"
              type="text"
              value={goalName}
              onChange={(event) => setGoalName(event.target.value)}
              placeholder="e.g. Emergency Fund"
              className="mt-1 w-full rounded-xl border border-finora-border bg-finora-surface-secondary px-4 py-2.5 text-sm text-finora-text outline-none focus:border-finora-accent/50"
            />
          </div>

          <div>
           <label htmlFor="goal-category" className="text-xs font-medium text-finora-text-secondary">
              Linked category
            </label>
            <input
              id="goal-category"
              name="category"
              type="text"
              value={goalCategory}
              onChange={(event) => setGoalCategory(event.target.value)}
              placeholder="e.g. Savings"
              className="mt-1 w-full rounded-xl border border-finora-border bg-finora-surface-secondary px-4 py-2.5 text-sm text-finora-text outline-none focus:border-finora-accent/50"
            />
          </div>

          <div>
            <label htmlFor="goal-target" className="text-xs font-medium text-finora-text-secondary">
              Target amount (Rs)
            </label>
            <input
              id="goal-target"
              name="target"
              type="number"
              min="1"
              value={targetAmount}
              onChange={(event) => setTargetAmount(event.target.value)}
              placeholder="e.g. 50000"
              className="mt-1 w-full rounded-xl border border-finora-border bg-finora-surface-secondary px-4 py-2.5 text-sm text-finora-text outline-none focus:border-finora-accent/50"
            />
          </div>

          <div>
            <label htmlFor="goal-date" className="text-xs font-medium text-finora-text-secondary">
              Target date
            </label>
            <input
              id="goal-date"
              name="date"
              type="date"
              value={targetDate}
              onChange={(event) => setTargetDate(event.target.value)}
              className="mt-1 w-full rounded-xl border border-finora-border bg-finora-surface-secondary px-4 py-2.5 text-sm text-finora-text outline-none focus:border-finora-accent/50"
            />
          </div>

          <button
            type="submit"
           className="flex items-center justify-center gap-2 rounded-xl bg-finora-accent px-5 py-2.5 text-sm font-medium text-white transition active:scale-95 hover:opacity-90 sm:col-span-2 xl:col-span-1"
          >
            <Plus size={16} />
            Add Goal
          </button>
        </form>
      </section>

      <section aria-label="Goal list" className="space-y-4">
        {goals.length === 0 ? (
          <div className="rounded-2xl border border-finora-border bg-finora-surface p-8 text-center text-sm text-finora-text-secondary">
            No goals yet. Add one above to start tracking your progress.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {goals.map((goal, index) => {
              const saved = savedByCategory[goal.category.toLowerCase()] || 0
              const percentage = Math.min((saved / goal.target) * 100, 100)
              const isComplete = saved >= goal.target
              const daysRemaining = getDaysRemaining(goal.deadline)

              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="rounded-2xl border border-finora-border bg-finora-surface p-6 transition-shadow hover:border-finora-accent/30 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Target size={16} className="text-finora-accent" />
                        <h4 className="text-base font-semibold text-finora-text">
                          {goal.name}
                        </h4>
                      </div>
                      <p className="mt-1 text-xs text-finora-text-secondary">
                        {formatCurrency(saved)} of {formatCurrency(goal.target)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-finora-text-secondary transition-colors hover:text-finora-expense"
                      aria-label={`Delete ${goal.name} goal`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-finora-surface-secondary">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isComplete ? 'bg-finora-income' : 'bg-finora-accent'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span
                      className={
                        isComplete ? 'text-finora-income' : 'text-finora-text-secondary'
                      }
                    >
                      {isComplete
                        ? 'Goal reached!'
                        : `${percentage.toFixed(0)}% complete`}
                    </span>

                    {goal.deadline && (
                      <span className="flex items-center gap-1 text-finora-text-secondary">
                        <Calendar size={12} />
                        {daysRemaining >= 0
                          ? `${daysRemaining} days left`
                          : 'Overdue'}
                      </span>
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