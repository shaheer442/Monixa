import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

const formatCurrency = (value) => `Rs ${(value / 1000).toFixed(0)}k`

export default function IncomeExpenseChart({ data = [] }) {
  const hasData = data.some((month) => month.income > 0 || month.expenses > 0)

  return (
    <div className="rounded-2xl border border-finora-border bg-finora-surface p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-finora-text">
            Income vs Expenses
          </h2>

          <p className="mt-1 text-sm text-finora-text-secondary">
            Your financial activity over the last 6 months
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--finora-income)]" />
            <span className="text-finora-text-secondary">Income</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--finora-expense)]" />
            <span className="text-finora-text-secondary">Expenses</span>
          </div>
        </div>
      </div>

      <div className="h-[300px] w-full">
        {!hasData ? (
          <div className="flex h-full items-center justify-center text-sm text-finora-text-secondary">
            No activity in the last 6 months
          </div>
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--finora-income)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--finora-income)" stopOpacity={0} />
              </linearGradient>

              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--finora-expense)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--finora-expense)" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="var(--finora-border)" strokeDasharray="3 3" vertical={false} />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--finora-text-secondary)', fontSize: 12 }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--finora-text-secondary)', fontSize: 12 }}
              tickFormatter={formatCurrency}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--finora-surface-secondary)',
                border: '1px solid var(--finora-border)',
                borderRadius: '12px',
                color: 'var(--finora-text)',
              }}
              formatter={(value) => [`Rs ${Number(value).toLocaleString()}`]}
            />

            <Area
              type="monotone"
              dataKey="income"
              stroke="var(--finora-income)"
              strokeWidth={3}
              fill="url(#incomeGradient)"
            />

            <Area
              type="monotone"
              dataKey="expenses"
              stroke="var(--finora-expense)"
              strokeWidth={3}
              fill="url(#expenseGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}