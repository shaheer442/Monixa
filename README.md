Monixa — Smart Personal Finance Dashboard

Live demo: https://monixa.vercel.app

Monixa is a modern personal finance dashboard built to help you track income and expenses, manage budgets, follow savings goals, and understand your spending habits at a glance. It's a fully client-side application — clean, fast, and built with a focus on real, working functionality rather than static mockups.

This is a frontend portfolio project. All data is stored locally in your browser (`localStorage`) — there is no backend, database, or real user authentication. It's built to demonstrate frontend architecture, state management, and data visualization in React.

✨ Features

- Dashboard — Real-time overview of balance, income, expenses, and savings, with an income vs. expenses trend chart and a spending breakdown by category
- Transactions — Add, search, filter, and delete income/expense entries with category tagging
- Budgets — Set monthly spending limits per category, with visual progress bars and over-budget warnings
- Goals — Set savings targets linked to income categories, auto-tracked as you log income
- Recurring Payments — Automatically detects repeating subscriptions/bills from transaction history and flags upcoming due dates
- Analytics — Deeper breakdown of spending trends, savings rate, and category analysis over custom time periods
- Settings — Editable profile, multi-currency support (PKR, USD, EUR, GBP, INR), light/dark theme, and full report export as a branded **PDF** or raw **JSON** backup
- Period filtering — View stats and charts by week, month, last 3 months, or year
- Fully responsive, animated, and accessible interface

🛠️ Tech Stack

| Category | Technology |
|---|---|
| Framework | React (Vite) |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |
| Animation | Framer Motion |
| PDF Generation | jsPDF |
| Routing | React Router |
| Data Persistence | Browser `localStorage` |

💾 Data & Privacy

Monixa stores all data — transactions, budgets, goals, settings — locally in your browser. Nothing is sent to a server. Your data persists across sessions on the same browser/device but does not sync across devices. Use the built-in Export feature in Settings to back up your data as a PDF or JSON file at any time.

Built as a frontend engineering project to practice React state management, data visualization, and client-side PDF generation.