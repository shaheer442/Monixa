import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts'

export default function SpendingCategoryChart({ data = [] }) {
  return (
    <div className="rounded-2xl border border-finora-border bg-finora-surface p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-finora-text">
          Spending Breakdown
        </h2>

        <p className="mt-1 text-sm text-finora-text-secondary">
          Where your money went this month
        </p>
      </div>

      <div className="h-[260px] w-full">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-finora-text-secondary">
            No expenses recorded yet
          </div>
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>

            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--finora-surface-secondary)',
                border: '1px solid var(--finora-border)',
                borderRadius: '12px',
                color: 'var(--finora-text)',
              }}
              formatter={(value) => [`Rs ${Number(value).toLocaleString()}`]}
            />
          </PieChart>
        </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {data.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between rounded-xl bg-finora-surface-secondary px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />

              <span className="text-xs text-finora-text-secondary">
                {item.name}
              </span>
            </div>

            <span className="text-xs font-medium text-finora-text">
              Rs {item.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}