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

export function getCategoryIcon(category: string): string {
  return CATEGORY_ICONS[category] ?? '📦'
}
