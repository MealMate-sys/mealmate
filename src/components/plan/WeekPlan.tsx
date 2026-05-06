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
import { Recipe, PlanEntry, Slot, DAYS_OF_WEEK, SLOTS, RECIPE_TAGS } from '@/types'
import { DroppableSlot } from './DroppableSlot'
import { DraggableRecipeItem } from './DraggableRecipeItem'
import { Modal } from '@/components/ui/Modal'
import { RecipeDetail } from '@/components/recipes/RecipeDetail'
import { TagBadge } from '@/components/ui/TagBadge'
import { ChevronLeft, ChevronRight, CalendarDays, Users, Search, LayoutGrid, List, X } from 'lucide-react'
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
import { cn } from '@/lib/utils'

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
  const [modalRecipe, setModalRecipe] = useState<Recipe | null>(null)
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [randomizerSlot, setRandomizerSlot] = useState<{ dayIndex: number; slot: Slot } | null>(null)
  const [randomizerTags, setRandomizerTags] = useState<string[]>([])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  )

  const getEntry = (dayIndex: number, slot: Slot) =>
    entries.find((e) => e.day_of_week === dayIndex && e.slot === slot)

  const handleWeekChange = (newWeek: string) => {
    setWeekStart(newWeek)
    onWeekChange(newWeek)
  }

  const filteredRecipes = recipes.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase())
    const matchesTag = activeTag ? r.tags?.includes(activeTag) : true
    return matchesSearch && matchesTag
  })

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setDraggingRecipe(null)
      const { active, over } = event
      if (!over) return
      const recipe = active.data.current?.recipe as Recipe | undefined
      if (!recipe) return
      const [dayStr, slot] = (over.id as string).split('-')
      const dayIndex = parseInt(dayStr)
      await assignRecipeToSlot(recipe, dayIndex, slot as Slot)
    },
    [entries, weekStart]
  )

  const assignRecipeToSlot = async (recipe: Recipe, dayIndex: number, slot: Slot) => {
    const existingEntry = getEntry(dayIndex, slot)
    if (existingEntry) {
      const { data } = await supabase
        .from('plan_entries')
        .update({ recipe_id: recipe.id })
        .eq('id', existingEntry.id)
        .select()
        .single()
      if (data) {
        setEntries((prev) =>
          prev.map((e) =>
            e.id === existingEntry.id ? { ...e, recipe_id: recipe.id, recipe } : e
          )
        )
      }
    } else {
      const { data } = await supabase
        .from('plan_entries')
        .insert({
          recipe_id: recipe.id,
          week_start: weekStart,
          day_of_week: dayIndex,
          slot,
          servings: recipe.servings ?? 1,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single()
      if (data) {
        setEntries((prev) => [...prev, { ...data, recipe }])
      }
    }
  }

  const handleRandomize = async () => {
    if (!randomizerSlot) return
    const pool = recipes.filter((r) =>
      randomizerTags.length === 0 || randomizerTags.every((t) => r.tags?.includes(t))
    )
    if (pool.length === 0) return
    const random = pool[Math.floor(Math.random() * pool.length)]!
    await assignRecipeToSlot(random, randomizerSlot.dayIndex, randomizerSlot.slot)
    setRandomizerSlot(null)
    setRandomizerTags([])
  }

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

  const handleRecipeClick = async (recipe: Recipe) => {
    if (!recipe.ingredients || !recipe.recipe_steps) {
      const { data } = await supabase
        .from('recipes')
        .select('*, ingredients(*), recipe_steps(*)')
        .eq('id', recipe.id)
        .single()
      if (data) setModalRecipe(data)
    } else {
      setModalRecipe(recipe)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(e) => setDraggingRecipe(e.active.data.current?.recipe ?? null)}
      onDragEnd={handleDragEnd}
    >
      {/* Hauptlayout: Plan links, Sidebar rechts */}
<div className="flex gap-6 items-start">
  
  {/* Day grid — links */}
  <div className="flex-1 flex flex-col gap-3">
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
              onRecipeClick={handleRecipeClick}
              onRandomize={(dayIndex, slot) => {
                setRandomizerSlot({ dayIndex, slot })
                setRandomizerTags([])
              }}
            />
          ))}
        </div>
      </div>
    ))}
  </div>

  {/* Recipe Sidebar — rechts */}
  <div className="hidden sm:flex w-64 flex-col gap-3 sticky top-24 bg-white rounded-2xl border border-cream-200 shadow-card p-4">
    {/* Header */}
    <div className="flex items-center justify-between">
      <p className="text-xs font-semibold uppercase tracking-wider text-warm-700/50">
        Rezepte ({filteredRecipes.length})
      </p>
      <div className="flex gap-1">
        <button
          onClick={() => setViewMode('list')}
          className={cn('p-1.5 rounded-lg transition', viewMode === 'list' ? 'bg-sage-100 text-sage-600' : 'text-warm-700/40 hover:bg-cream-100')}
        >
          <List size={14} />
        </button>
        <button
          onClick={() => setViewMode('grid')}
          className={cn('p-1.5 rounded-lg transition', viewMode === 'grid' ? 'bg-sage-100 text-sage-600' : 'text-warm-700/40 hover:bg-cream-100')}
        >
          <LayoutGrid size={14} />
        </button>
      </div>
    </div>

    {/* Search */}
    <div className="relative">
      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-700/40" />
      <input
        type="search"
        placeholder="Suchen…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-xl border border-cream-300 bg-cream-50 pl-8 pr-3 py-2 text-sm text-warm-900 placeholder:text-warm-700/40 focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500/20 transition"
      />
    </div>

    {/* Tag filter */}
    <div className="flex flex-wrap gap-1.5">
      {RECIPE_TAGS.map((tag) => (
        <button
          key={tag}
          onClick={() => setActiveTag(activeTag === tag ? '' : tag)}
          className={cn(
            'rounded-full px-2.5 py-0.5 text-xs font-medium transition border',
            activeTag === tag
              ? 'bg-sage-600 text-white border-sage-600'
              : 'bg-white text-warm-700 border-cream-300 hover:border-sage-400'
          )}
        >
          {tag}
        </button>
      ))}
    </div>

    {/* Recipe list/grid */}
    {filteredRecipes.length === 0 ? (
      <p className="text-xs text-warm-700/40 italic text-center py-4">
        Keine Rezepte gefunden
      </p>
    ) : viewMode === 'list' ? (
      <div className="flex flex-col gap-2 overflow-y-auto max-h-[60vh]">
        {filteredRecipes.map((recipe) => (
          <DraggableRecipeItem
            key={recipe.id}
            recipe={recipe}
            dragId={`recipe-${recipe.id}`}
          />
        ))}
      </div>
    ) : (
      <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-[60vh]">
        {filteredRecipes.map((recipe) => (
          <DraggableRecipeItem
            key={recipe.id}
            recipe={recipe}
            dragId={`recipe-${recipe.id}`}
            compact
          />
        ))}
      </div>
    )}
  </div>

  {/* Mobile: Rezepte unterhalb */}
  <div className="sm:hidden w-full">
    {/* Search */}
    <div className="relative mb-3">
      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-700/40" />
      <input
        type="search"
        placeholder="Rezepte suchen…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-xl border border-cream-300 bg-white pl-8 pr-3 py-2 text-sm text-warm-900 placeholder:text-warm-700/40 focus:border-sage-500 focus:outline-none transition"
      />
    </div>
    <div className="flex flex-col gap-2">
      {filteredRecipes.map((recipe) => (
        <DraggableRecipeItem
          key={recipe.id}
          recipe={recipe}
          dragId={`recipe-mobile-${recipe.id}`}
        />
      ))}
    </div>
  </div>

</div>

      {/* Randomizer Modal */}
      <Modal
        open={!!randomizerSlot}
        onClose={() => setRandomizerSlot(null)}
        title="🎲 Zufälliges Rezept"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-warm-700/70">
            Wähle optional Tags um die Auswahl einzuschränken, oder würfle direkt.
          </p>
          <div className="flex flex-wrap gap-2">
            {RECIPE_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() =>
                  setRandomizerTags((prev) =>
                    prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                  )
                }
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium transition border',
                  randomizerTags.includes(tag)
                    ? 'bg-sage-600 text-white border-sage-600'
                    : 'bg-white text-warm-700 border-cream-300 hover:border-sage-400'
                )}
              >
                {tag}
              </button>
            ))}
          </div>
          {randomizerTags.length > 0 && (
            <p className="text-xs text-warm-700/50">
              {recipes.filter((r) => randomizerTags.every((t) => r.tags?.includes(t))).length} Rezepte verfügbar
            </p>
          )}
          <div className="flex gap-2">
            <Button size="lg" onClick={handleRandomize} className="flex-1">
              🎲 Würfeln
            </Button>
            <Button variant="ghost" onClick={() => setRandomizerSlot(null)}>
              Abbrechen
            </Button>
          </div>
        </div>
      </Modal>

      {/* Recipe Detail Modal */}
      <Modal
        open={!!modalRecipe}
        onClose={() => setModalRecipe(null)}
        title={modalRecipe?.title}
      >
        {modalRecipe && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{modalRecipe.cover_emoji ?? '🍽️'}</span>
              <div>
                <div className="flex items-center gap-2 text-sm text-warm-700/60">
                  <Users size={14} />
                  {modalRecipe.servings} Portionen
                </div>
                {modalRecipe.tags && modalRecipe.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {modalRecipe.tags.map((tag) => (
                      <TagBadge key={tag} tag={tag} />
                    ))}
                  </div>
                )}
              </div>
            </div>
            <RecipeDetail recipe={modalRecipe} />
          </div>
        )}
      </Modal>

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