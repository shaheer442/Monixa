import { useEffect, useMemo, useState } from 'react'
import { Repeat, AlertCircle, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

import { formatCurrency } from '../utils/formatCurrency'
import PageFade from '../components/ui/PageFade'

const TRANSACTIONS_KEY = 'finora-transactions'

function averageInterval(sortedDates) {
  if (sortedDates.length < 2) return null

  let totalGap = 0
  for (let i = 1; i < sortedDates.length; i++) {
    totalGap += (sortedDates[i] - sortedDates[i - 1]) / (1000 * 60 * 60 * 24)
  }

  return totalGap / (sortedDates.length - 1)
}

function frequencyLabel(days) {
  if (days === null) return 'Unknown'
  if (days <= 10) return 'Weekly'
  if (days <= 45) return 'Monthly'
  if (days <= 100) return 'Quarterly'
  return 'Yearly'
}

export default function RecurringPayments() {
  const [transactions, setTransactions] = useState([])

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

  const recurringPayments = useMemo(() => {
    const groups = {}

    transactions
      .filter((transaction) => transaction.type === 'expense')
      .forEach((transaction) => {
        const key = (transaction.description || 'Unknown').trim().toLowerCase()
        const date = new Date(transaction.date)

        if (Number.isNaN(date.getTime())) return

        if (!groups[key]) {
          groups[key] = {
            description: transaction.description,
            category: transaction.category || 'Other',
            amounts: [],
            dates: [],
          }
        }

        groups[key].amounts.push(Number(transaction.amount || 0))
        groups[key].dates.push(date)
      })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return Object.values(groups)
      .filter((group) => group.dates.length >= 2)
      .map((group) => {
        const sortedDates = [...group.dates].sort((a, b) => a - b)
        const avgAmount =
          group.amounts.reduce((sum, amount) => sum + amount, 0) /
          group.amounts.length

        const avgIntervalDays = averageInterval(sortedDates)
        const lastDate = sortedDates[sortedDates.length - 1]

        let nextDueDate = null
        let daysUntilDue = null

        if (avgIntervalDays !== null) {
          nextDueDate = new Date(lastDate)
          nextDueDate.setDate(nextDueDate.getDate() + Math.round(avgIntervalDays))

          daysUntilDue = Math.ceil(
            (nextDueDate - today) / (1000 * 60 * 60 * 24),
          )
        }

        return {
          description: group.description,
          category: group.category,
          amount: avgAmount,
          occurrences: group.dates.length,
          frequency: frequencyLabel(avgIntervalDays),
          nextDueDate,
          daysUntilDue,
        }
      })
      .sort((a, b) => {
        if (a.daysUntilDue === null) return 1
        if (b.daysUntilDue === null) return -1
        return a.daysUntilDue - b.daysUntilDue
      })
  }, [transactions])

return (
    <PageFade>
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-finora-accent">
          Monixa
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-finora-text sm:text-3xl">
          Recurring Payments
        </h2>
        <p className="mt-2 text-sm text-finora-text-secondary sm:text-base">
          Monitor subscriptions and recurring expenses, detected automatically
          from your transaction history.
        </p>
      </header>

      <section aria-label="Recurring payments list" className="space-y-4">
        {recurringPayments.length === 0 ? (
          <div className="rounded-2xl border border-finora-border bg-finora-surface p-8 text-center text-sm text-finora-text-secondary">
            No recurring payments detected yet. A payment needs to appear at
            least twice with the same description before it's recognized as
            recurring.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
           {recurringPayments.map((payment, index) => {
              const isDueSoon =
                payment.daysUntilDue !== null &&
                payment.daysUntilDue >= 0 &&
                payment.daysUntilDue <= 7
              const isOverdue =
                payment.daysUntilDue !== null && payment.daysUntilDue < 0

              return (
                <motion.div
                  key={payment.description}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="rounded-2xl border border-finora-border bg-finora-surface p-6 transition-shadow hover:border-finora-accent/30 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Repeat size={16} className="text-finora-accent" />
                        <h4 className="text-base font-semibold text-finora-text">
                          {payment.description}
                        </h4>
                      </div>
                      <p className="mt-1 text-xs text-finora-text-secondary">
                        {payment.category} • {payment.frequency} •{' '}
                        {payment.occurrences} occurrences
                      </p>
                    </div>

                    <p className="text-lg font-semibold text-finora-expense">
                      {formatCurrency(payment.amount)}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-1.5 text-xs">
                    {isOverdue ? (
                      <>
                        <AlertCircle size={14} className="text-finora-expense" />
                        <span className="text-finora-expense">
                          Overdue — expected{' '}
                          {payment.nextDueDate.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </>
                    ) : isDueSoon ? (
                      <>
                        <AlertCircle size={14} className="text-amber-500" />
                        <span className="text-amber-500">
                          Due in {payment.daysUntilDue}{' '}
                          {payment.daysUntilDue === 1 ? 'day' : 'days'} (
                          {payment.nextDueDate.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                          )
                        </span>
                      </>
                    ) : payment.nextDueDate ? (
                      <>
                        <Clock size={14} className="text-finora-text-secondary" />
                        <span className="text-finora-text-secondary">
                          Next expected{' '}
                          {payment.nextDueDate.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </>
                    ) : null}
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