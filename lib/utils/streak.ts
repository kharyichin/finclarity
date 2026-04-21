import type { CheckIn } from '@/types'

export function calculateStreak(checkIns: CheckIn[]): number {
  if (!checkIns.length) return 0

  const months = [...new Set(checkIns.map((c) => c.month_year))].sort((a, b) =>
    b.localeCompare(a)
  )

  let streak = 1
  for (let i = 0; i < months.length - 1; i++) {
    const [y1, m1] = months[i].split('-').map(Number)
    const [y2, m2] = months[i + 1].split('-').map(Number)
    const diff = (y1 - y2) * 12 + (m1 - m2)
    if (diff === 1) {
      streak++
    } else {
      break
    }
  }

  return streak
}
