import type { Statement } from '@/types'

export interface Week {
  label: string          // e.g. "Apr 1–6" or "Apr 7–13"
  start: Date
  end: Date
}

export function isCompleteMonth(dateRange: { start: Date; end: Date }): boolean {
  const diffMs = dateRange.end.getTime() - dateRange.start.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return (
    diffDays >= 27 &&
    dateRange.start.getMonth() === dateRange.end.getMonth()
  )
}

export function getCalendarWeeks(month: string): Week[] {
  // month format: "2026-04"
  const [year, mon] = month.split('-').map(Number)
  const firstDay = new Date(year, mon - 1, 1)
  const lastDay = new Date(year, mon, 0)

  const weeks: Week[] = []
  let current = new Date(firstDay)

  // Move to the Monday on or before the first day
  const dayOfWeek = current.getDay() // 0=Sun, 1=Mon…
  const offsetToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  current = new Date(current.getTime() + offsetToMonday * 86400000)

  while (current <= lastDay) {
    const weekStart = new Date(Math.max(current.getTime(), firstDay.getTime()))
    const weekEnd = new Date(Math.min(current.getTime() + 6 * 86400000, lastDay.getTime()))

    const fmt = (d: Date) =>
      d.toLocaleDateString('en-SG', { month: 'short', day: 'numeric' })

    weeks.push({
      label: weekStart.getTime() === weekEnd.getTime()
        ? fmt(weekStart)
        : `${fmt(weekStart)}–${fmt(weekEnd)}`,
      start: new Date(weekStart),
      end: new Date(weekEnd),
    })

    current = new Date(current.getTime() + 7 * 86400000)
  }

  return weeks
}

export function checkPeriodDuplicate(
  existing: Statement[],
  incoming: { bankName: string; accountLast4: string; monthYear: string }
): boolean {
  return existing.some(
    (s) =>
      s.bank_name === incoming.bankName &&
      s.account_last4 === incoming.accountLast4 &&
      s.month_year === incoming.monthYear
  )
}
