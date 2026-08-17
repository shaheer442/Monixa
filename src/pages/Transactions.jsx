import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import PageFade from '../components/ui/PageFade'
import { Plus, Search, ArrowUpRight, ArrowDownRight, Trash2 } from 'lucide-react'

import { formatCurrency } from '../utils/formatCurrency'

const STORAGE_KEY = 'finora-transactions'



const CATEGORIES = [
  'Bills',
  'Education',
  'Entertainment',
  'Food',
  'Health',
  'Investment',
  'Salary',
  'Savings',
  'Shopping',
  'Transport',
  'Other',
]

function formatDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function Transactions() {
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved)
      return []
    } catch {
      return []
    }
  })

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState({
    type: 'expense',
    description: '',
    category: 'Food',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
  }, [transactions])

 const filteredTransactions = useMemo(() => {
  return transactions
    .filter((transaction) => {
      const matchesSearch =
        transaction.description.toLowerCase().includes(search.toLowerCase()) ||
        transaction.category.toLowerCase().includes(search.toLowerCase())

      const matchesFilter = filter === 'all' || transaction.type === filter

      return matchesSearch && matchesFilter
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))
}, [transactions, search, filter])

  const totalIncome = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((total, transaction) => total + Number(transaction.amount), 0)

  const totalExpenses = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((total, transaction) => total + Number(transaction.amount), 0)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!form.description.trim() || !form.amount || !form.date) return

    const newTransaction = {
      id: crypto.randomUUID(),
      type: form.type,
      description: form.description.trim(),
      category: form.category,
      amount: Number(form.amount),
      date: form.date,
    }

    setTransactions((current) => [newTransaction, ...current])

    setForm({
      type: 'expense',
      description: '',
      category: 'Food',
      amount: '',
      date: new Date().toISOString().split('T')[0],
    })

    setShowForm(false)
  }

  const deleteTransaction = (id) => {
    setTransactions((current) =>
      current.filter((transaction) => transaction.id !== id),
    )
  }

 return (
    <PageFade>
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-finora-accent">
            Monixa
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-finora-text sm:text-3xl">
            Transactions
          </h1>
          <p className="mt-2 text-sm text-finora-text-secondary sm:text-base">
            Track and manage your income and expenses.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm((current) => !current)}
          className="flex items-center justify-center gap-2 rounded-xl bg-finora-accent px-5 py-2.5 text-sm font-medium text-white transition active:scale-95 hover:opacity-90"
        >
          <Plus size={16} />
          {showForm ? 'Close Form' : 'Add Transaction'}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-finora-border bg-finora-surface p-5">
          <p className="text-sm text-finora-text-secondary">Total Transactions</p>
          <p className="mt-2 text-2xl font-semibold text-finora-text">
            {transactions.length}
          </p>
        </div>

        <div className="rounded-2xl border border-finora-border bg-finora-surface p-5">
          <p className="text-sm text-finora-text-secondary">Total Income</p>
          <p className="mt-2 text-2xl font-semibold text-finora-income">
            {formatCurrency(totalIncome)}
          </p>
        </div>

        <div className="rounded-2xl border border-finora-border bg-finora-surface p-5">
          <p className="text-sm text-finora-text-secondary">Total Expenses</p>
          <p className="mt-2 text-2xl font-semibold text-finora-expense">
            {formatCurrency(totalExpenses)}
          </p>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-finora-border bg-finora-surface p-6"
        >
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-finora-text">
              Add Transaction
            </h2>
            <p className="mt-1 text-sm text-finora-text-secondary">
              Add your income or expense to Finora.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-finora-text-secondary">
                Transaction Type
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setForm((current) => ({ ...current, type: 'expense' }))
                  }
                  className={`rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                    form.type === 'expense'
                      ? 'border-finora-expense/40 bg-finora-expense/10 text-finora-expense'
                      : 'border-finora-border bg-finora-surface-secondary text-finora-text-secondary hover:border-finora-border'
                  }`}
                >
                  Expense
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setForm((current) => ({ ...current, type: 'income' }))
                  }
                  className={`rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                    form.type === 'income'
                      ? 'border-finora-income/40 bg-finora-income/10 text-finora-income'
                      : 'border-finora-border bg-finora-surface-secondary text-finora-text-secondary hover:border-finora-border'
                  }`}
                >
                  Income
                </button>
              </div>
            </div>

            <div>
             <label htmlFor="transaction-amount" className="mb-2 block text-sm font-medium text-finora-text-secondary">
                Amount
              </label>
              <input
                id="transaction-amount"
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                min="1"
                placeholder="e.g. 5000"
                className="w-full rounded-xl border border-finora-border bg-finora-surface-secondary px-4 py-3 text-finora-text outline-none transition-colors placeholder:text-finora-text-secondary focus:border-finora-accent/50"
                required
              />
            </div>

            <div>
             <label htmlFor="transaction-description" className="mb-2 block text-sm font-medium text-finora-text-secondary">
                Description
              </label>
              <input
                id="transaction-description"
                type="text"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="e.g. Grocery shopping"
                className="w-full rounded-xl border border-finora-border bg-finora-surface-secondary px-4 py-3 text-finora-text outline-none transition-colors placeholder:text-finora-text-secondary focus:border-finora-accent/50"
                required
              />
            </div>

            <div>
              <label htmlFor="transaction-category" className="mb-2 block text-sm font-medium text-finora-text-secondary">
                Category
              </label>
              <select
  id="transaction-category"
  name="category"
  value={form.category}
  onChange={handleChange}
  className="w-full rounded-xl border border-finora-border bg-finora-surface-secondary px-4 py-3 text-finora-text outline-none focus:border-finora-accent/50"
>
  {CATEGORIES.map((category) => (
    <option key={category} value={category}>
      {category}
    </option>
  ))}
</select>
            </div>

            <div>
              <label htmlFor="transaction-date" className="mb-2 block text-sm font-medium text-finora-text-secondary">
                Date
              </label>
              <input
                id="transaction-date"
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full rounded-xl border border-finora-border bg-finora-surface-secondary px-4 py-3 text-finora-text outline-none focus:border-finora-accent/50"
                required
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="rounded-xl bg-finora-accent px-6 py-3 text-sm font-medium text-white transition active:scale-95 hover:opacity-90"
            >
              Save Transaction
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-finora-text-secondary"
          />
          <input
            id="transaction-search"
            name="search"
            type="text"
            aria-label="Search transactions"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search transactions..."
            className="w-full rounded-xl border border-finora-border bg-finora-surface px-4 py-3 pl-10 text-finora-text outline-none placeholder:text-finora-text-secondary focus:border-finora-accent/50"
          />
        </div>

        <div className="flex rounded-xl border border-finora-border bg-finora-surface p-1">
          {[
            ['all', 'All'],
            ['income', 'Income'],
            ['expense', 'Expenses'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                filter === value
                  ? 'bg-finora-accent text-white'
                  : 'text-finora-text-secondary hover:text-finora-text'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-finora-border bg-finora-surface">
        <div className="border-b border-finora-border px-6 py-5">
          <h2 className="font-semibold text-finora-text">Recent Transactions</h2>
          <p className="mt-1 text-sm text-finora-text-secondary">
            {filteredTransactions.length} transaction
            {filteredTransactions.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-finora-surface-secondary text-2xl">
              💸
            </div>
            <h3 className="mt-4 font-semibold text-finora-text">
              No transactions found
            </h3>
            <p className="mt-2 text-sm text-finora-text-secondary">
              Try changing your search or add a new transaction.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-finora-border">
            {filteredTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: Math.min(index, 8) * 0.03 }}
                className="flex flex-col gap-4 px-6 py-5 transition-colors hover:bg-finora-surface-secondary/50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      transaction.type === 'income'
                        ? 'bg-finora-income/10 text-finora-income'
                        : 'bg-finora-expense/10 text-finora-expense'
                    }`}
                  >
                    {transaction.type === 'income' ? (
                      <ArrowUpRight size={18} />
                    ) : (
                      <ArrowDownRight size={18} />
                    )}
                  </div>

                  <div>
                    <p className="font-medium text-finora-text">
                      {transaction.description}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-finora-text-secondary">
                      <span>{transaction.category}</span>
                      <span>•</span>
                      <span>{formatDate(transaction.date)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-5 sm:justify-end">
                  <p
                    className={`font-semibold ${
                      transaction.type === 'income'
                        ? 'text-finora-income'
                        : 'text-finora-expense'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </p>

                  <button
                    type="button"
                    onClick={() => deleteTransaction(transaction.id)}
                    aria-label="Delete transaction"
                    className="rounded-lg p-2 text-finora-text-secondary transition-colors hover:bg-finora-expense/10 hover:text-finora-expense"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
    </PageFade>
  )
}