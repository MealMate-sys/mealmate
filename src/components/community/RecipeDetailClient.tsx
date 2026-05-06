'use client'
import { useState, useEffect } from 'react'
import { Recipe, RecipeComment } from '@/types'
import { supabase } from '@/lib/supabase'
import { RecipeDetailPage } from './RecipeDetailPage'
import { notFound } from 'next/navigation'

export function RecipeDetailClient({ slug }: { slug: string }) {
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [comments, setComments] = useState<RecipeComment[]>([])
  const [loading, setLoading] = useState(true)
  const [notFoundState, setNotFoundState] = useState(false)

  useEffect(() => {
    fetchRecipe()
  }, [slug])

  async function fetchRecipe() {
    const { data: recipe } = await supabase
      .from('recipes')
      .select(`*, ingredients(*), recipe_steps(*), profiles(id, username, display_name)`)
      .eq('slug', slug)
      .eq('is_public', true)
      .single()

    if (!recipe) {
      setNotFoundState(true)
      setLoading(false)
      return
    }

    const { data: comments } = await supabase
      .from('recipe_comments')
      .select('*, profiles(username, display_name)')
      .eq('recipe_id', recipe.id)
      .order('created_at', { ascending: false })

    setRecipe({
      ...recipe,
      profiles: Array.isArray(recipe.profiles)
        ? recipe.profiles[0] ?? null
        : recipe.profiles ?? null,
    } as Recipe)
    setComments(comments ?? [])
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[1,2,3].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-cream-100 animate-pulse" />
        ))}
      </div>
    )
  }

  if (notFoundState || !recipe) {
    return (
      <div className="text-center py-16 text-warm-700/40">
        <p className="text-4xl mb-3">🍽️</p>
        <p className="text-sm font-medium">Rezept nicht gefunden</p>
      </div>
    )
  }

  return <RecipeDetailPage recipe={recipe} comments={comments} />
}
