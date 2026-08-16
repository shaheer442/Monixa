import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout'
import Analytics from '../pages/Analytics'
import Budget from '../pages/Budget'
import Dashboard from '../pages/Dashboard'
import Goals from '../pages/Goals'
import RecurringPayments from '../pages/RecurringPayments'
import Settings from '../pages/Settings'
import Transactions from '../pages/Transactions'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="budget" element={<Budget />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="goals" element={<Goals />} />
        <Route path="recurring" element={<RecurringPayments />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}
