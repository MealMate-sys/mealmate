'use client'
import { useDroppable } from '@dnd-kit/core'
import { PlanEntry, Slot, Recipe } from '@/types'
import { cn } from '@/lib/utils'
import { X, Minus, Plus, Shuffle, PlusCircle } from 'lucide-react'

interface DroppableSlotProps {
  dayIndex: number
  slot: Slot
  slotLabel: string
  entry: PlanEntry | undefined
  onRemove: (entryId: string) => void
  onServingsChange: (entryId: string, delta: number) => void
  onRecipeClick: (recipe: Recipe) => void
  onRandomize: (dayIndex: number, slot: Slot) => void
  onMobileAdd: (dayIndex: number, slot: Slot) => void
}

export function DroppableSlot({
  dayIndex,
  slot,
  slotLabel,
  entry,
  onRemove,
  onServingsChange,
  onRecipeClick,
  onRandomize,
  onMobileAdd,
}: DroppableSlotProps) {
  const droppableId = `${dayIndex}-${slot}`
  const { isOver, setNodeRef } = useDroppable({ id: droppableId })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'rounded-xl border-2 border-dashed min-h-[68px] p-2 transition-all duration-150',
        isOver
          ? 'border-sage-400 bg-sage-50'
          : entry
          ? 'border-transparent bg-cream-100'
          : 'border-cream-300 bg-cream-50'
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-warm-700/40 mb-1.5">
        {slotLabel}
      </p>

      {entry ? (
        <div className="flex items-start gap-1.5">
          <div className="flex-1 min-w-0">
            <button
              onClick={() => entry.recipe && onRecipeClick(entry.recipe)}
              className="text-sm font-medium text-warm-900 leading-tight truncate hover:text-sage-600 transition text-left w-full"
            >
              {entry.recipe?.title ?? '—'}
            </button>
            <div className="flex items-center gap-1 mt-1.5">
              <button
                onClick={() => onServingsChange(entry.id, -1)}
                disabled={entry.servings <= 1}
                className="w-5 h-5 rounded-full bg-cream-200 flex items-center justify-center text-warm-700 disabled:opacity-30 hover:bg-cream-300 transition"
              >
                <Minus size={10} />
              </button>
              <span className="text-xs text-warm-700 tabular-nums w-5 text-center">
                {entry.servings}P
              </span>
              <button
                onClick={() => onServingsChange(entry.id, 1)}
                disabled={entry.servings >= 20}
                className="w-5 h-5 rounded-full bg-cream-200 flex items-center justify-center text-warm-700 disabled:opacity-30 hover:bg-cream-300 transition"
              >
                <Plus size={10} />
              </button>
            </div>
          </div>
          <button
            onClick={() => onRemove(entry.id)}
            className="p-0.5 text-warm-700/30 hover:text-red-500 transition rounded shrink-0 mt-0.5"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          {/* Desktop: Hinweistext */}
          <p className="hidden sm:block text-xs text-warm-700/30 italic">
            {isOver ? 'Hier ablegen' : 'Rezept hinziehen'}
          </p>
          {/* Mobile: + Button */}
          <button
            onClick={() => onMobileAdd(dayIndex, slot)}
            className="sm:hidden flex items-center gap-1 text-xs text-warm-700/40 hover:text-sage-600 transition"
          >
            <PlusCircle size={16} />
            <span>Hinzufügen</span>
          </button>
          {/* Randomizer */}
          <button
            onClick={() => onRandomize(dayIndex, slot)}
            className="p-1 rounded-lg text-warm-700/30 hover:text-sage-600 hover:bg-sage-50 transition"
            title="Zufälliges Rezept"
          >
            <Shuffle size={13} />
          </button>
        </div>
      )}
    </div>
  )
}