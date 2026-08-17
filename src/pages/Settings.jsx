import { useState } from 'react'
import { Sun, Moon, Download, FileText, Trash2, AlertTriangle, Coins, Sparkles } from 'lucide-react'
import jsPDF from 'jspdf'
import {
  getCurrentCurrency,
  setCurrentCurrency,
  getCurrencyOptions,
} from '../utils/formatCurrency'

import { useTheme } from '../context/ThemeContext'
import PageFade from '../components/ui/PageFade'

const TRANSACTIONS_KEY = 'finora-transactions'
const BUDGETS_KEY = 'finora-budgets'
const GOALS_KEY = 'finora-goals'
const PROFILE_KEY = 'finora-profile'

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

export default function Settings() {
  const { theme, toggleTheme } = useTheme()
  const [confirmingClear, setConfirmingClear] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [isExportingPDF, setIsExportingPDF] = useState(false)
  const [currency, setCurrency] = useState(() => getCurrentCurrency())

  const handleCurrencyChange = (event) => {
    const code = event.target.value
    setCurrency(code)
    setCurrentCurrency(code)
    setFeedback('Currency updated. Refresh to see it everywhere.')
    setTimeout(() => setFeedback(''), 3000)
  }

  const [profileName, setProfileName] = useState(() => {
    try {
      const saved = localStorage.getItem(PROFILE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed?.name) return parsed.name
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    }
    return 'Shaheer Ahmed'
  })

  const handleSaveProfile = (event) => {
    event.preventDefault()

    const trimmed = profileName.trim()
    if (!trimmed) return

    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify({ name: trimmed }))
      setFeedback('Profile updated. Refresh to see it in the header.')
      setTimeout(() => setFeedback(''), 3000)
    } catch (error) {
      console.error('Failed to save profile:', error)
    }
  }

  const handleExportJSON = () => {
    try {
      const transactions = localStorage.getItem(TRANSACTIONS_KEY) || '[]'
      const budgets = localStorage.getItem(BUDGETS_KEY) || '[]'
      const goals = localStorage.getItem(GOALS_KEY) || '[]'

      const exportData = {
        transactions: JSON.parse(transactions),
        budgets: JSON.parse(budgets),
        goals: JSON.parse(goals),
        exportedAt: new Date().toISOString(),
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = `finora-export-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setFeedback('JSON exported successfully.')
      setTimeout(() => setFeedback(''), 3000)
    } catch (error) {
      console.error('Failed to export data:', error)
      setFeedback('Export failed. Check console for details.')
    }
  }

const handleExportPDF = async () => {
    setIsExportingPDF(true)
    await new Promise((resolve) => setTimeout(resolve, 100))

    try {
      const transactions = JSON.parse(
        localStorage.getItem(TRANSACTIONS_KEY) || '[]',
      )
      const budgets = JSON.parse(localStorage.getItem(BUDGETS_KEY) || '[]')

      let userName = 'Personal Account'
      try {
        const savedProfile = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}')
        if (savedProfile?.name) userName = savedProfile.name
      } catch {
        // fall back to default
      }

      const income = transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0)
      const expenses = transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0)

      
      const now = new Date()
      const categorySpending = {}
      transactions
        .filter((t) => t.type === 'expense')
        .forEach((t) => {
          const date = new Date(t.date)
          if (Number.isNaN(date.getTime())) return
          if (date.getMonth() !== now.getMonth() || date.getFullYear() !== now.getFullYear()) return
          const category = (t.category || 'Other').toLowerCase()
          categorySpending[category] = (categorySpending[category] || 0) + Number(t.amount || 0)
        })

      
      const groups = {}
      transactions
        .filter((t) => t.type === 'expense')
        .forEach((t) => {
          const key = (t.description || 'Unknown').trim().toLowerCase()
          const date = new Date(t.date)
          if (Number.isNaN(date.getTime())) return
          if (!groups[key]) {
            groups[key] = { description: t.description, amounts: [], dates: [] }
          }
          groups[key].amounts.push(Number(t.amount || 0))
          groups[key].dates.push(date)
        })

      const recurringPayments = Object.values(groups)
        .filter((g) => g.dates.length >= 2)
        .map((g) => {
          const sortedDates = [...g.dates].sort((a, b) => a - b)
          const avgAmount = g.amounts.reduce((s, a) => s + a, 0) / g.amounts.length
          const avgIntervalDays = averageInterval(sortedDates)
          return {
            description: g.description,
            amount: avgAmount,
            frequency: frequencyLabel(avgIntervalDays),
          }
        })

      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const emerald = [16, 185, 129]
      const dark = [20, 20, 20]
      const gray = [120, 120, 120]

      // Header — logo mark (M shape with ascending bars, matching sidebar icon)
      doc.setFillColor(...emerald)
      doc.roundedRect(14, 12, 12, 12, 3, 3, 'F')

      doc.setFillColor(255, 255, 255)
      doc.lines(
        [
          [1.25, 0],
          [1.6667, 2.0833],
          [1.6667, -2.0833],
          [1.25, 0],
          [0, 4.1667],
          [-1.25, 0],
          [0, -2.5],
          [-1.6667, 2.0833],
          [-1.6667, -2.0833],
          [0, 2.5],
          [-1.25, 0],
        ],
        17.0833,
        15.9167,
        [1, 1],
        'F',
        true,
      )

      doc.setFillColor(5, 150, 105)
      doc.rect(18.75, 18.8333, 0.625, 1.0417, 'F')
      doc.rect(19.6875, 18.2083, 0.625, 1.6667, 'F')
      doc.rect(20.625, 17.5833, 0.625, 2.2917, 'F')

      doc.setTextColor(...dark)
      doc.setFontSize(16)
      doc.text('Monixa', 30, 19)
      doc.setTextColor(...emerald)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.text('Personal Finance', 30, 24)

      doc.setTextColor(...gray)
      doc.setFontSize(9)
      const dateStr = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
      const timeStr = new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
      doc.text(`${dateStr}, ${timeStr}`, pageWidth - 14, 17, { align: 'right' })
      doc.text(userName, pageWidth - 14, 23, { align: 'right' })
      doc.setDrawColor(...emerald)
      doc.setLineWidth(0.8)
      doc.line(14, 30, pageWidth - 14, 30)

      let y = 42
      doc.setTextColor(...dark)
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text('FINANCIAL REPORT', 14, y)
      y += 7

     y += 12

      const leftX = 14
      const rightX = 110
      let yLeft = y
      let yRight = y

      // SUMMARY (left column)
      doc.setTextColor(...emerald)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('SUMMARY', leftX, yLeft)
      yLeft += 7

      doc.setTextColor(...dark)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Total Income: Rs ${income.toLocaleString()}`, leftX, yLeft)
      yLeft += 6
      doc.text(`Total Expenses: Rs ${expenses.toLocaleString()}`, leftX, yLeft)
      yLeft += 6
      doc.text(`Balance: Rs ${(income - expenses).toLocaleString()}`, leftX, yLeft)
      yLeft += 10

      // BUDGETS (right column)
      doc.setTextColor(...emerald)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('BUDGETS', rightX, yRight)
      yRight += 7

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...dark)

      if (budgets.length === 0) {
        doc.text('No budgets set', rightX, yRight)
        yRight += 6
      } else {
        budgets.forEach((budget) => {
          doc.text(`${budget.category}: limit Rs ${budget.limit.toLocaleString()}`, rightX, yRight)
          yRight += 6
        })
      }
      yRight += 6

      // RECURRING PAYMENTS (right column, below budgets)
      doc.setTextColor(...emerald)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('RECURRING PAYMENTS', rightX, yRight)
      yRight += 7

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...dark)

      if (recurringPayments.length === 0) {
        doc.text('None detected', rightX, yRight)
        yRight += 6
      } else {
        recurringPayments.forEach((payment) => {
          doc.text(
            `${payment.description}: Rs ${Math.round(payment.amount).toLocaleString()} (${payment.frequency})`,
            rightX,
            yRight,
          )
          yRight += 6
        })
      }

      y = Math.max(yLeft, yRight) + 8

      // TRANSACTIONS
      doc.setTextColor(...emerald)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('TRANSACTIONS', 14, y)
      y += 8

      doc.setFontSize(8)
      doc.setTextColor(...gray)
      doc.setFont('helvetica', 'normal')
      doc.text('Date', 14, y)
      doc.text('Description', 40, y)
      doc.text('Category', 95, y)
      doc.text('Amount', 130, y)
      doc.text('Budget Status', 160, y)
      y += 4
      doc.setDrawColor(200)
      doc.line(14, y, pageWidth - 14, y)
      y += 5

      transactions.forEach((transaction) => {
        if (y > 280) {
          doc.addPage()
          y = 20
        }

        const amountText = `${transaction.type === 'income' ? '+' : '-'}Rs ${Number(
          transaction.amount || 0,
        ).toLocaleString()}`

        let statusText = '—'
        let isOver = false

        if (transaction.type === 'expense') {
          const catKey = (transaction.category || 'Other').toLowerCase()
          const budgetMatch = budgets.find((b) => b.category.toLowerCase() === catKey)

          if (budgetMatch) {
            const spent = categorySpending[catKey] || 0
            if (spent > budgetMatch.limit) {
              statusText = `Over by Rs ${(spent - budgetMatch.limit).toLocaleString()}`
              isOver = true
            } else {
              statusText = 'In limit'
            }
          }
        }

        doc.setTextColor(...dark)
        doc.text(transaction.date || '-', 14, y)
        doc.text((transaction.description || '-').slice(0, 22), 40, y)
        doc.text(transaction.category || '-', 95, y)
        doc.text(amountText, 130, y)

        doc.setTextColor(...(isOver ? [220, 38, 38] : dark))
        doc.text(statusText, 160, y)

        y += 6
      })

      doc.save(`monixa-report-${new Date().toISOString().slice(0, 10)}.pdf`)

      setFeedback('PDF exported successfully.')
      setTimeout(() => setFeedback(''), 3000)
    } catch (error) {
      console.error('Failed to export PDF:', error)
      setFeedback('PDF export failed. Check console for details.')
    } finally {
      setIsExportingPDF(false)
    }
  }

  const handleLoadDemoData = () => {
    const demoTransactions = [
      { id: 'd1', type: 'income', description: 'Salary', category: 'Salary', amount: 85000, date: '2026-03-01' },
      { id: 'd2', type: 'income', description: 'Salary', category: 'Salary', amount: 85000, date: '2026-04-01' },
      { id: 'd3', type: 'income', description: 'Salary', category: 'Salary', amount: 85000, date: '2026-05-01' },
      { id: 'd4', type: 'income', description: 'Salary', category: 'Salary', amount: 85000, date: '2026-06-01' },
      { id: 'd5', type: 'income', description: 'Salary', category: 'Salary', amount: 85000, date: '2026-07-01' },
      { id: 'd6', type: 'income', description: 'Salary', category: 'Salary', amount: 85000, date: '2026-08-01' },
      { id: 'd7', type: 'income', description: 'Freelance Project', category: 'Freelance', amount: 20000, date: '2026-05-15' },
      { id: 'd8', type: 'income', description: 'Freelance Project', category: 'Freelance', amount: 15000, date: '2026-07-10' },
      { id: 'd9', type: 'income', description: 'Transferred to Savings', category: 'Savings', amount: 12000, date: '2026-05-05' },
      { id: 'd10', type: 'income', description: 'Transferred to Savings', category: 'Savings', amount: 15000, date: '2026-06-05' },
      { id: 'd11', type: 'income', description: 'Transferred to Savings', category: 'Savings', amount: 15000, date: '2026-07-05' },
      { id: 'd12', type: 'income', description: 'Transferred to Savings', category: 'Savings', amount: 18000, date: '2026-08-05' },
      { id: 'd13', type: 'expense', description: 'Netflix Subscription', category: 'Entertainment', amount: 2500, date: '2026-06-03' },
      { id: 'd14', type: 'expense', description: 'Netflix Subscription', category: 'Entertainment', amount: 2500, date: '2026-07-03' },
      { id: 'd15', type: 'expense', description: 'Netflix Subscription', category: 'Entertainment', amount: 2500, date: '2026-08-03' },
      { id: 'd16', type: 'expense', description: 'Electricity Bill', category: 'Bills', amount: 7000, date: '2026-06-05' },
      { id: 'd17', type: 'expense', description: 'Electricity Bill', category: 'Bills', amount: 6800, date: '2026-07-05' },
      { id: 'd18', type: 'expense', description: 'Electricity Bill', category: 'Bills', amount: 7200, date: '2026-08-05' },
      { id: 'd19', type: 'expense', description: 'Gym Membership', category: 'Health', amount: 3000, date: '2026-07-01' },
      { id: 'd20', type: 'expense', description: 'Gym Membership', category: 'Health', amount: 3000, date: '2026-08-01' },
      { id: 'd21', type: 'expense', description: 'Grocery Shopping', category: 'Food', amount: 8500, date: '2026-08-08' },
      { id: 'd22', type: 'expense', description: 'Hoteling', category: 'Food', amount: 4000, date: '2026-08-09' },
      { id: 'd23', type: 'expense', description: 'Dinner with Friends', category: 'Food', amount: 3200, date: '2026-05-22' },
      { id: 'd24', type: 'expense', description: 'Uber Rides', category: 'Transport', amount: 4200, date: '2026-08-11' },
      { id: 'd25', type: 'expense', description: 'Uber Rides', category: 'Transport', amount: 3800, date: '2026-07-18' },
      { id: 'd26', type: 'expense', description: 'New Shoes', category: 'Shopping', amount: 6500, date: '2026-08-12' },
      { id: 'd27', type: 'expense', description: 'Online Course', category: 'Education', amount: 5000, date: '2026-06-20' },
    ]

    const demoBudgets = [
      { id: 'db1', category: 'Food', limit: 10000 },
      { id: 'db2', category: 'Bills', limit: 6000 },
      { id: 'db3', category: 'Entertainment', limit: 3000 },
      { id: 'db4', category: 'Transport', limit: 3500 },
    ]

    const demoGoals = [
      { id: 'dg1', name: 'Emergency Fund', category: 'Savings', target: 100000, deadline: '2026-12-31' },
      { id: 'dg2', name: 'Freelance Growth', category: 'Freelance', target: 50000, deadline: '2026-11-30' },
    ]

    try {
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(demoTransactions))
      localStorage.setItem(BUDGETS_KEY, JSON.stringify(demoBudgets))
      localStorage.setItem(GOALS_KEY, JSON.stringify(demoGoals))

      setFeedback('Demo data loaded — refreshing...')
      setTimeout(() => window.location.reload(), 1000)
    } catch (error) {
      console.error('Failed to load demo data:', error)
      setFeedback('Failed to load demo data. Check console for details.')
    }
  }

  const handleClearData = () => {
    if (!confirmingClear) {
      setConfirmingClear(true)
      return
    }

    try {
      localStorage.removeItem(TRANSACTIONS_KEY)
      localStorage.removeItem(BUDGETS_KEY)
      localStorage.removeItem(GOALS_KEY)

      setFeedback('All data cleared. Refresh the page to see defaults.')
      setConfirmingClear(false)
      setTimeout(() => setFeedback(''), 4000)
    } catch (error) {
      console.error('Failed to clear data:', error)
      setFeedback('Clear failed. Check console for details.')
    }
  }

return (
    <PageFade>
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-finora-accent">
          Monixa
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-finora-text sm:text-3xl">
          Settings
        </h2>
        <p className="mt-2 text-sm text-finora-text-secondary sm:text-base">
          Configure profile, currency, theme, and notification preferences.
        </p>
      </header>

      {feedback && (
        <div className="rounded-xl border border-finora-accent/30 bg-finora-accent/10 px-4 py-3 text-sm text-finora-text">
          {feedback}
        </div>
      )}

      <section className="rounded-2xl border border-finora-border bg-finora-surface p-6">
        <h3 className="text-lg font-semibold text-finora-text">Profile</h3>
        <p className="mt-1 text-sm text-finora-text-secondary">
          This name appears in the top-right of every page.
        </p>

        <form
          onSubmit={handleSaveProfile}
          className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <label htmlFor="profile-name" className="text-xs font-medium text-finora-text-secondary">
              Display name
            </label>
            <input
              id="profile-name"
              name="profileName"
              type="text"
              value={profileName}
              onChange={(event) => setProfileName(event.target.value)}
              placeholder="Your name"
              className="mt-1 w-full rounded-xl border border-finora-border bg-finora-surface-secondary px-4 py-2.5 text-sm text-finora-text outline-none focus:border-finora-accent/50"
            />
          </div>

          <button
            type="submit"
            className="rounded-xl bg-finora-accent px-5 py-2.5 text-sm font-medium text-white transition active:scale-95 hover:opacity-90"
          >
            Save name
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-finora-border bg-finora-surface p-6">
        <h3 className="text-lg font-semibold text-finora-text">Currency</h3>
        <p className="mt-1 text-sm text-finora-text-secondary">
          Choose the currency used across your dashboard and reports.
        </p>

        <div className="mt-4 flex items-center gap-2">
          <Coins size={16} className="text-finora-text-secondary" />
          <select
            id="currency-select"
            name="currency"
            aria-label="Currency"
            value={currency}
            onChange={handleCurrencyChange}
            className="rounded-xl border border-finora-border bg-finora-surface-secondary px-4 py-2.5 text-sm text-finora-text outline-none focus:border-finora-accent/50"
          >
            {getCurrencyOptions().map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="rounded-2xl border border-finora-border bg-finora-surface p-6">
        <h3 className="text-lg font-semibold text-finora-text">Appearance</h3>
        <p className="mt-1 text-sm text-finora-text-secondary">
          Switch between light and dark mode.
        </p>

        <button
          type="button"
          onClick={toggleTheme}
          className="mt-4 flex items-center gap-2 rounded-xl border border-finora-border bg-finora-surface-secondary px-4 py-2.5 text-sm font-medium text-finora-text transition-colors hover:border-finora-accent/40"
        >
          {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
          {theme === 'dark' ? 'Dark mode' : 'Light mode'} (click to switch)
        </button>
      </section>

      <section className="rounded-2xl border border-finora-border bg-finora-surface p-6">
        <h3 className="text-lg font-semibold text-finora-text">Your data</h3>
        <p className="mt-1 text-sm text-finora-text-secondary">
          Export a backup of your transactions, budgets, and goals, load
          sample data to explore the app, or clear everything and start
          fresh.
        </p>

        <button
          type="button"
          onClick={handleLoadDemoData}
          className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-finora-accent/40 bg-finora-accent/10 px-5 py-2.5 text-sm font-medium text-finora-accent transition active:scale-95 hover:bg-finora-accent/20"
        >
          <Sparkles size={16} />
          Load Demo Data
        </button>

       <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
            type="button"
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            className="flex items-center justify-center gap-2 rounded-xl bg-finora-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isExportingPDF ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Generating...
              </>
            ) : (
              <>
                <FileText size={16} />
                Export as PDF
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            className="flex items-center justify-center gap-2 rounded-xl border border-finora-border px-5 py-2.5 text-sm font-medium text-finora-text transition active:scale-95 hover:border-finora-accent/40"
          >
            <Download size={16} />
            Export as JSON
          </button>

          <button
            type="button"
            onClick={handleClearData}
            className={`flex items-center justify-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors ${
              confirmingClear
                ? 'border-finora-expense bg-finora-expense/10 text-finora-expense'
                : 'border-finora-border text-finora-text hover:border-finora-expense/40 hover:text-finora-expense'
            }`}
          >
            {confirmingClear ? (
              <AlertTriangle size={16} />
            ) : (
              <Trash2 size={16} />
            )}
            {confirmingClear ? 'Click again to confirm' : 'Clear all data'}
          </button>
        </div>
      </section>
    </div>
    </PageFade>
  )
}