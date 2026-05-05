'use client'
import { useState } from 'react'
import { ShoppingListItem } from '@/types'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import { Check, Plus, Trash2, RefreshCw } from 'lucide-react'

interface ShoppingListProps {
  initialItems: ShoppingListItem[]
  weekStart: string
  onRegenerate: () => Promise<void>
}

export function ShoppingList({ initialItems, weekStart, onRegenerate }: ShoppingListProps) {
  const [items, setItems] = useState<ShoppingListItem[]>(initialItems)
  const [newItemName, setNewItemName] = useState('')
  const [regenerating, setRegenerating] = useState(false)

  // Group by category
  const grouped = items.reduce<Record<string, ShoppingListItem[]>>((acc, item) => {
    const cat = item.category || 'Sonstiges'
    if (!acc[cat]) acc[cat] = []
    acc[cat]!.push(item)
    return acc
  }, {})

  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    // Checked items go to bottom
    const aAllChecked = grouped[a]!.every((i) => i.is_checked)
    const bAllChecked = grouped[b]!.every((i) => i.is_checked)
    if (aAllChecked && !bAllChecked) return 1
    if (!aAllChecked && bAllChecked) return -1
    return a.localeCompare(b)
  })

  const toggleItem = async (item: ShoppingListItem) => {
    const newValue = !item.is_checked
    await supabase
      .from('shopping_list_items')
      .update({ is_checked: newValue })
      .eq('id', item.id)
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, is_checked: newValue } : i))
    )
  }

  const deleteItem = async (id: string) => {
    await supabase.from('shopping_list_items').delete().eq('id', id)
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const addManualItem = async () => {
    const name = newItemName.trim()
    if (!name) return
    const { data } = await supabase
      .from('shopping_list_items')
      .insert({
        week_start: weekStart,
        name,
        category: 'Sonstiges',
        is_checked: false,
        is_manual: true,
      })
      .select()
      .single()
    if (data) {
      setItems((prev) => [...prev, data])
      setNewItemName('')
    }
  }

  const handleRegenerate = async () => {
    setRegenerating(true)
    await onRegenerate()
    setRegenerating(false)
  }

  const checkedCount = items.filter((i) => i.is_checked).length

  return (
    <div className="flex flex-col gap-5">
      {/* Stats + actions */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-warm-700/60">
            {checkedCount}/{items.length} erledigt
          </p>
          {items.length > 0 && (
            <div className="mt-1 h-1.5 w-32 rounded-full bg-cream-200 overflow-hidden">
              <div
                className="h-full bg-sage-500 rounded-full transition-all"
                style={{ width: `${items.length ? (checkedCount / items.length) * 100 : 0}%` }}
              />
            </div>
          )}
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleRegenerate}
          disabled={regenerating}
        >
          <RefreshCw size={13} className={regenerating ? 'animate-spin' : ''} />
          Neu generieren
        </Button>
      </div>

      {items.length === 0 && (
        <div className="text-center py-12 text-warm-700/40">
          <p className="text-sm">Keine Einträge.</p>
          <p className="text-xs mt-1">Plane erst Rezepte für die Woche ein.</p>
        </div>
      )}

      {/* Grouped items */}
      {sortedCategories.map((category) => {
        const catItems = grouped[category]!
        const allChecked = catItems.every((i) => i.is_checked)
        return (
          <section key={category}>
            <h3
              className={cn(
                'text-xs font-semibold uppercase tracking-wider mb-2',
                allChecked ? 'text-warm-700/30' : 'text-warm-700/50'
              )}
            >
              {category}
            </h3>
            <div className="flex flex-col gap-1">
              {catItems.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 transition',
                    item.is_checked ? 'bg-cream-100' : 'bg-white border border-cream-200'
                  )}
                >
                  <button
                    onClick={() => toggleItem(item)}
                    className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition',
                      item.is_checked
                        ? 'bg-sage-500 border-sage-500'
                        : 'border-cream-300 hover:border-sage-400'
                    )}
                  >
                    {item.is_checked && <Check size={11} className="text-white" strokeWidth={3} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <span
                      className={cn(
                        'text-sm',
                        item.is_checked
                          ? 'line-through text-warm-700/40'
                          : 'text-warm-900'
                      )}
                    >
                      {item.name}
                    </span>
                    {item.amount && (
                      <span className="text-xs text-warm-700/50 ml-2 tabular-nums">
                        {item.amount} {item.unit}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="text-warm-700/20 hover:text-red-400 transition p-1"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )
      })}

      {/* Manual add */}
      <div className="flex gap-2 mt-2">
        <Input
          placeholder="Manuell hinzufügen…"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addManualItem()}
        />
        <Button onClick={addManualItem} disabled={!newItemName.trim()} className="shrink-0">
          <Plus size={16} />
        </Button>
      </div>
    </div>
  )
}
