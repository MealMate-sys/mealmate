'use client'
import { useState, useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { Recipe, PlanEntry, Slot, DAYS_OF_WEEK, SLOTS } from '@/types'
import { DroppableSlot } from './DroppableSlot'
import { DraggableRecipeItem } from './DraggableRecipeItem'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  getWeekStart,
  getPrevWeek,
  getNextWeek,
  addDays,
  formatDate,
  isCurrentWeek,
} from '@/lib/week'
import { supabase } from '@/lib/supabase'

interface WeekPlanProps {
  recipes: Recipe[]
  initialEntries: PlanEntry[]
  initialWeekStart: string
  onWeekChange: (weekStart: string) => void
}

export function WeekPlan({
  recipes,
  initialEntries,
  initialWeekStart,
  onWeekChange,
}: WeekPlanProps) {
  const [weekStart, setWeekStart] = useState(initialWeekStart)
  const [entries, setEntries] = useState<PlanEntry[]>(initialEntries)
  const [draggingRecipe, setDraggingRecipe] = useState<Recipe | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  )

  const getEntry = (dayIndex: number, slot: Slot) =>
    entries.find((e) => e.day_of_week === dayIndex && e.slot === slot)

  const handleWeekChange = (newWeek: string) => {
    setWeekStart(newWeek)
    onWeekChange(newWeek)
  }

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setDraggingRecipe(null)
      const { active, over } = event
      if (!over) return

      const recipe = active.data.current?.recipe as Recipe | undefined
      if (!recipe) return

      // droppableId format: "dayIndex-slot"
      const [dayStr, slot] = (over.id as string).split('-')
      const dayIndex = parseInt(dayStr)
      const existingEntry = getEntry(dayIndex, slot as Slot)

      if (existingEntry) {
        // Update existing entry with new recipe
        const { data } = await supabase
          .from('plan_entries')
          .update({ recipe_id: recipe.id })
          .eq('id', existingEntry.id)
          .select()
          .single()

        if (data) {
          setEntries((prev) =>
            prev.map((e) =>
              e.id === existingEntry.id
                ? { ...e, recipe_id: recipe.id, recipe }
                : e
            )
          )
        }
      } else {
        // Create new entry
        const { data } = await supabase
          .from('plan_entries')
          .insert({
            recipe_id: recipe.id,
            week_start: weekStart,
            day_of_week: dayIndex,
            slot,
            servings: recipe.servings ?? 1,
          })
          .select()
          .single()

        if (data) {
          setEntries((prev) => [...prev, { ...data, recipe }])
        }
      }
    },
    [entries, weekStart]
  )

  const handleRemove = async (entryId: string) => {
    await supabase.from('plan_entries').delete().eq('id', entryId)
    setEntries((prev) => prev.filter((e) => e.id !== entryId))
  }

  const handleServingsChange = async (entryId: string, delta: number) => {
    const entry = entries.find((e) => e.id === entryId)
    if (!entry) return
    const newServings = Math.max(1, Math.min(20, entry.servings + delta))
    await supabase.from('plan_entries').update({ servings: newServings }).eq('id', entryId)
    setEntries((prev) =>
      prev.map((e) => (e.id === entryId ? { ...e, servings: newServings } : e))
    )
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(e) => setDraggingRecipe(e.active.data.current?.recipe ?? null)}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col gap-6">
        {/* Week navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => handleWeekChange(getPrevWeek(weekStart))}>
            <ChevronLeft size={16} />
          </Button>
          <div className="text-center">
            <p className="text-sm font-semibold text-warm-900">
              {formatDate(weekStart)} – {formatDate(addDays(weekStart, 6))}
            </p>
            {isCurrentWeek(weekStart) && (
              <span className="text-xs text-sage-600 font-medium">Diese Woche</span>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => handleWeekChange(getNextWeek(weekStart))}>
            <ChevronRight size={16} />
          </Button>
        </div>

        {!isCurrentWeek(weekStart) && (
          <button
            onClick={() => handleWeekChange(getWeekStart())}
            className="text-xs text-sage-600 underline text-center"
          >
            Zur aktuellen Woche
          </button>
        )}

        {/* Day grid */}
        <div className="flex flex-col gap-3">
          {DAYS_OF_WEEK.map((day, dayIndex) => (
            <div key={day} className="bg-white rounded-2xl border border-cream-200 shadow-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <CalendarDays size={14} className="text-sage-500" />
                <h3 className="text-sm font-semibold text-warm-900">{day}</h3>
                <span className="text-xs text-warm-700/40">
                  {formatDate(addDays(weekStart, dayIndex))}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {SLOTS.map(({ key, label }) => (
                  <DroppableSlot
                    key={key}
                    dayIndex={dayIndex}
                    slot={key}
                    slotLabel={label}
                    entry={getEntry(dayIndex, key)}
                    onRemove={handleRemove}
                    onServingsChange={handleServingsChange}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Recipe sidebar / scroll area */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-warm-700/50 mb-2">
            Rezepte — ziehen um einzuplanen
          </p>
          <div className="flex flex-col gap-2">
            {recipes.map((recipe) => (
              <DraggableRecipeItem
                key={recipe.id}
                recipe={recipe}
                dragId={`recipe-${recipe.id}`}
              />
            ))}
          </div>
        </div>
      </div>

      <DragOverlay>
        {draggingRecipe && (
          <div className="bg-white rounded-xl border border-sage-400 px-3 py-2 text-sm font-medium text-warm-900 shadow-soft opacity-90 cursor-grabbing">
            {draggingRecipe.title}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
