'use client'
import { useState, useEffect } from 'react'
import { Recipe } from '@/types'
import { supabase } from '@/lib/supabase'
import { CommunityGrid } from './CommunityGrid'

interface Props {
  initialTag?: string
  initialQuery?: string
}

export function CommunityPageClient({ initialTag, initialQuery }: Props) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecipes()
  }, [])

  async function fetchRecipes() {
    setLoading(true)
    const { data, error } = await supabase
      .from('recipes')
      .select('id, title, description, tags, servings, slug, cover_emoji, like_count, comment_count, created_at, profiles(id, username, display_name)')
      .eq('is_public', true)
      .order('like_count', { ascending: false })
      .limit(48)

    console.log('data:', data, 'error:', error)

    const recipes: Recipe[] = (data ?? []).map((r) => ({
      ...r,
      profiles: Array.isArray(r.profiles) ? r.profiles[0] ?? null : r.profiles ?? null,
    })) as Recipe[]

    setRecipes(recipes)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[1,2,3,4].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-cream-100 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <CommunityGrid
      initialRecipes={recipes}
      initialTag={initialTag}
      initialQuery={initialQuery}
    />
  )
}
