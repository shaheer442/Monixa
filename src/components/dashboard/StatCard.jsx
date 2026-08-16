import { motion } from 'framer-motion'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { formatCurrency } from '../../utils/formatCurrency'

function MiniSparkline({ points, sentiment }) {
  const width = 72
  const height = 28

  // Safely handle missing or invalid sparkline data
  const safePoints =
    Array.isArray(points) && points.length > 0
      ? points.filter((point) => Number.isFinite(Number(point))).map(Number)
      : [1, 2, 3, 4]

  // Make sure we always have enough points to draw a line
  const normalizedPoints =
    safePoints.length >= 2 ? safePoints : [safePoints[0] ?? 1, (safePoints[0] ?? 1) + 1]

  const min = Math.min(...normalizedPoints)
  const max = Math.max(...normalizedPoints)
  const range = max - min || 1

  const coordinates = normalizedPoints
    .map((point, index) => {
      const x =
        normalizedPoints.length === 1
          ? width / 2
          : (index / (normalizedPoints.length - 1)) * width

      const y =
        height - ((point - min) / range) * (height - 4) - 2

      return `${x},${y}`
    })
    .join(' ')

  const strokeColor =
    sentiment === 'positive'
      ? 'var(--finora-income)'
      : 'var(--finora-expense)'

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-7 w-[4.5rem] shrink-0 opacity-80"
      aria-hidden="true"
    >
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={coordinates}
      />
    </svg>
  )
}

export default function StatCard({ stat, index = 0 }) {
  const Icon = stat.icon
  const isUp = stat.changeDirection === 'up'
  const isPositive = stat.changeSentiment === 'positive'
  const TrendIcon = isUp ? ArrowUpRight : ArrowDownRight

  const changeColor = isPositive
    ? 'text-finora-income'
    : 'text-finora-expense'

  const changeBg = isPositive
    ? 'bg-finora-income/10'
    : 'bg-finora-expense/10'

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: index * 0.08,
        ease: 'easeOut',
      }}
      whileHover={{ y: -3 }}
      className="group relative overflow-hidden rounded-2xl border border-finora-border bg-finora-surface p-5 shadow-sm transition-shadow hover:shadow-lg hover:shadow-[var(--finora-shadow)]"
    >
      <div
        className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${stat.accentFrom} ${stat.accentTo} blur-2xl transition-opacity group-hover:opacity-100`}
        aria-hidden="true"
      />

      <div className="relative flex items-start justify-between gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${stat.accentFrom} ${stat.accentTo} ring-1 ring-finora-border/60`}
        >
          <Icon
            size={20}
            strokeWidth={1.75}
            className={stat.iconColor}
          />
        </div>

        <MiniSparkline
          points={stat.sparkline}
          sentiment={stat.changeSentiment}
        />
      </div>

      <div className="relative mt-5">
        <p className="text-sm font-medium text-finora-text-secondary">
          {stat.title}
        </p>

        <p className="mt-2 text-2xl font-semibold tracking-tight text-finora-text sm:text-[1.75rem]">
          {formatCurrency(stat.value)}
        </p>
      </div>

      <div className="relative mt-4 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${changeColor} ${changeBg}`}
        >
          <TrendIcon size={14} strokeWidth={2} />
          {stat.change}%
        </span>

        <span className="text-xs text-finora-text-secondary">
          {stat.comparisonLabel}
        </span>
      </div>
    </motion.article>
  )
}