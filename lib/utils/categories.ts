export const CATEGORY_ICONS: Record<string, string> = {
  'Food & Dining': '🍜',
  'Transport': '🚌',
  'Shopping': '🛍️',
  'Utilities': '💡',
  'Entertainment': '🎬',
  'Health': '💊',
  'Travel': '✈️',
  'Income': '💰',
  'Cashback': '💰',
  'Transfer': '🔄',
  'Refund & Reversal': '↩️',
  'Other': '📦',
}

/** Selectable labels for user overrides (excludes Uncategorised — that is a display fallback). */
export const CATEGORY_OPTIONS = [
  'Food & Dining',
  'Transport',
  'Shopping',
  'Utilities',
  'Entertainment',
  'Health',
  'Travel',
  'Income',
  'Cashback',
  'Transfer',
  'Refund & Reversal',
  'Other',
] as const

export type CategoryOption = (typeof CATEGORY_OPTIONS)[number]

export function getCategoryIcon(category: string): string {
  return CATEGORY_ICONS[category] ?? '📦'
}

/** Effective category for display / grouping. */
export function effectiveCategory(tx: {
  user_category?: string | null
  claude_category?: string | null
}): string {
  const raw = (tx.user_category ?? tx.claude_category ?? '').trim()
  return raw || 'Uncategorised'
}

/** Needs human review when missing or bucketed as Other / Uncategorised. */
export function needsCategoryReview(tx: {
  user_category?: string | null
  claude_category?: string | null
}): boolean {
  // If user already set a non-Other category, trust it
  const user = (tx.user_category ?? '').trim()
  if (user && user !== 'Other' && user.toLowerCase() !== 'uncategorised') {
    return false
  }
  const cat = effectiveCategory(tx).toLowerCase()
  return cat === 'other' || cat === 'uncategorised' || cat === ''
}
