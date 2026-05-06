'use client'
import { useState, useEffect } from 'react'
import { Recipe, PlanEntry } from '@/types'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { WeekPlan } from '@/components/plan/WeekPlan'
import { getWeekStart } from '@/lib/week'

export default function PlanPage() {
  const { user } = useAuth()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [entries, setEntries] = useState<PlanEntry[]>([])
  const [weekStart, setWeekStart] = useState(getWeekStart())
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) fetchRecipes() }, [user])
  useEffect(() => { if (user) fetchEntries(weekStart) }, [weekStart, user])

  async function fetchRecipes() {
    const { data } = await supabase.from('recipes').select('*, ingredients(*)')
      .eq('user_id', user!.id).order('title')
    setRecipes(data ?? [])
  }

  async function fetchEntries(week: string) {
    setLoading(true)
    const { data } = await supabase.from('plan_entries')
      .select('*, recipe:recipes(*, ingredients(*), recipe_steps(*))')
      .eq('week_start', week).eq('user_id', user!.id)
    setEntries(data ?? [])
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-display font-semibold text-warm-900">Wochenplan</h1>
        <p className="text-sm text-warm-700/60 mt-0.5">Ziehe Rezepte in die Slots</p>
      </div>
      {loading ? (
        <div className="flex flex-col gap-3">{[1,2,3].map((i) => <div key={i} className="h-32 rounded-2xl bg-cream-100 animate-pulse" />)}</div>
      ) : (
        <WeekPlan recipes={recipes} initialEntries={entries} initialWeekStart={weekStart} onWeekChange={setWeekStart} />
      )}
    </div>
  )
}
