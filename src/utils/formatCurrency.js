const CURRENCY_KEY = 'finora-currency'

const CURRENCY_CONFIG = {
  PKR: { locale: 'en-PK', symbol: 'Rs.' },
  USD: { locale: 'en-US', symbol: '$' },
  EUR: { locale: 'de-DE', symbol: '€' },
  GBP: { locale: 'en-GB', symbol: '£' },
  INR: { locale: 'en-IN', symbol: '₹' },
}

export function getCurrentCurrency() {
  try {
    const saved = localStorage.getItem(CURRENCY_KEY)
    if (saved && CURRENCY_CONFIG[saved]) return saved
  } catch (error) {
    console.error('Failed to read currency preference:', error)
  }
  return 'PKR'
}

export function setCurrentCurrency(code) {
  if (!CURRENCY_CONFIG[code]) return
  try {
    localStorage.setItem(CURRENCY_KEY, code)
  } catch (error) {
    console.error('Failed to save currency preference:', error)
  }
}

export function getCurrencyOptions() {
  return Object.keys(CURRENCY_CONFIG)
}

export function formatCurrency(amount) {
  const code = getCurrentCurrency()
  const config = CURRENCY_CONFIG[code]

  const formatter = new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  return formatter.format(amount).replace(code, config.symbol)
}