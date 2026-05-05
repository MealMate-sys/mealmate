import type { PlanEntry, ShoppingListItem } from '@/types'

interface GeneratedItem {
  name: string
  amount: number
  unit: string
  category: string
}

export function generateShoppingList(
  planEntries: PlanEntry[]
): Omit<ShoppingListItem, 'id' | 'user_id' | 'week_start' | 'created_at' | 'updated_at'>[] {
  // Map: "name|unit" -> aggregated item
  const aggregated = new Map<string, GeneratedItem>()

  for (const entry of planEntries) {
    const recipe = entry.recipe
    if (!recipe || !recipe.ingredients) continue

    const scaleFactor = entry.servings / (recipe.servings || 1)

    for (const ing of recipe.ingredients) {
      const key = `${ing.name.toLowerCase()}|${ing.unit.toLowerCase()}`
      const existing = aggregated.get(key)
      const scaledAmount = ing.amount * scaleFactor

      if (existing) {
        existing.amount += scaledAmount
      } else {
        aggregated.set(key, {
          name: ing.name,
          amount: scaledAmount,
          unit: ing.unit,
          category: ing.category,
        })
      }
    }
  }

  return Array.from(aggregated.values()).map((item) => ({
    name: item.name,
    amount: Math.round(item.amount * 100) / 100,
    unit: item.unit,
    category: item.category,
    is_checked: false,
    is_manual: false,
  }))
}
