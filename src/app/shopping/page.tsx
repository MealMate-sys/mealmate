'use client'
import { useState, useEffect, useCallback } from 'react'
import { ShoppingListItem, PlanEntry } from '@/types'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { ShoppingList } from '@/components/shopping/ShoppingList'
import { Button } from '@/components/ui/Button'
import { getWeekStart, getPrevWeek, getNextWeek, addDays, formatDate, isCurrentWeek } from '@/lib/week'
import { generateShoppingList } from '@/lib/shoppingList'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function ShoppingPage() {
  const { user } = useAuth()
  const [weekStart, setWeekStart] = useState(getWeekStart())
  const [items, setItems] = useState<ShoppingListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) fetchItems(weekStart) }, [weekStart, user])

  async function fetchItems(week: string) {
    setLoading(true)
    const { data } = await supabase.from('shopping_list_items').select('*')
      .eq('week_start', week).eq('user_id', user!.id).order('category')
    setItems(data ?? [])
    setLoading(false)
  }

  const regenerate = useCallback(async () => {
    const { data: planEntries } = await supabase.from('plan_entries')
      .select('*, recipe:recipes(*, ingredients(*))')
      .eq('week_start', weekStart).eq('user_id', user!.id)
    if (!planEntries) return
    await supabase.from('shopping_list_items').delete().eq('week_start', weekStart).eq('user_id', user!.id).eq('is_manual', false)
    const generated = generateShoppingList(planEntries as PlanEntry[])
    if (generated.length > 0)
      await supabase.from('shopping_list_items').insert(generated.map((item) => ({ ...item, week_start: weekStart, user_id: user!.id })))
    await fetchItems(weekStart)
  }, [weekStart, user])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-warm-900">Einkaufsliste</h1>
          <p className="text-sm text-warm-700/60 mt-0.5">
            {formatDate(weekStart)} – {formatDate(addDays(weekStart, 6))}
            {isCurrentWeek(weekStart) && <span className="ml-2 text-sage-600 font-medium">Diese Woche</span>}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setWeekStart(getPrevWeek(weekStart))}><ChevronLeft size={16} /></Button>
          <Button variant="ghost" size="sm" onClick={() => setWeekStart(getNextWeek(weekStart))}><ChevronRight size={16} /></Button>
        </div>
      </div>
      {!isCurrentWeek(weekStart) && (
        <button onClick={() => setWeekStart(getWeekStart())} className="text-xs text-sage-600 underline text-left">
          Zur aktuellen Woche
        </button>
      )}
      {loading ? (
        <div className="flex flex-col gap-2">{[1,2,3,4].map((i) => <div key={i} className="h-12 rounded-xl bg-cream-100 animate-pulse" />)}</div>
      ) : (
        <ShoppingList initialItems={items} weekStart={weekStart} onRegenerate={regenerate} />
      )}
    </div>
  )
}
