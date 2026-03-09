import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) return '—'
  return `₹${Number(value).toFixed(decimals)}L`
}

export function formatNumber(value) {
  if (value === null || value === undefined || isNaN(value)) return '—'
  return Number(value).toLocaleString('en-IN')
}

export function formatPercent(value) {
  if (value === null || value === undefined || isNaN(value)) return '—'
  return `${Number(value).toFixed(1)}%`
}

export function formatDays(value) {
  if (!value || isNaN(value)) return '—'
  const d = Number(value)
  if (d === 1) return '1 day'
  return `${d} days`
}

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function parseGvizDate(val) {
  if (!val) return null
  if (typeof val === 'string' && val.startsWith('Date(')) {
    const parts = val.replace('Date(', '').replace(')', '').split(',')
    if (parts.length >= 2) {
      const year = parseInt(parts[0])
      const month = parseInt(parts[1]) // 0-indexed
      const day = parts[2] ? parseInt(parts[2]) : 1
      return new Date(year, month, day)
    }
  }
  if (typeof val === 'string') {
    const d = new Date(val)
    if (!isNaN(d)) return d
  }
  return null
}

export function getMonthLabel(date) {
  if (!date) return null
  return `${MONTHS[date.getMonth()]}-${String(date.getFullYear()).slice(2)}`
}

export function getQuarter(date) {
  if (!date) return null
  const m = date.getMonth()
  if (m <= 2) return 'Q1'
  if (m <= 5) return 'Q2'
  if (m <= 8) return 'Q3'
  return 'Q4'
}
