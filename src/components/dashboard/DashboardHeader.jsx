import { useEffect, useState } from 'react'
import { getGreeting, getCurrentTime, PERIOD_OPTIONS } from '../../data/dashboardStats'
import PeriodSelector from './PeriodSelector'

const PROFILE_KEY = 'finora-profile'

export default function DashboardHeader({ period, onPeriodChange }) {
 const [name, setName] = useState('there')
  const [currentTime, setCurrentTime] = useState(() => getCurrentTime())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime())
    }, 30000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PROFILE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed?.name) {
          setName(parsed.name.split(' ')[0])
        }
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    }
  }, [])

  return (
    <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-finora-accent">
          Monixa
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-finora-text sm:text-3xl">
          {getGreeting()}, {name} 👋
        </h2>
        <p className="mt-2 text-sm text-finora-text-secondary sm:text-base">
          Here&apos;s your financial overview for this month.
        </p>
        <p className="mt-1 text-xs text-finora-text-secondary">
          {currentTime} (Pakistan Time)
        </p>
      </div>

      <PeriodSelector
        options={PERIOD_OPTIONS}
        value={period}
        onChange={onPeriodChange}
      />
    </header>
  )
}