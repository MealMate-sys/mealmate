'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Recipe } from '@/types'
import { supabase } from '@/lib/supabase'
import { RecipeDetail } from '@/components/recipes/RecipeDetail'
import { TagBadge } from '@/components/ui/TagBadge'
import { ChevronLeft, Users } from 'lucide-react'
import Link from 'next/link'

export default function PrivateRecipePage() {
  const params = useParams()
  const slug = params.slug as string
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecipe() {
      const { data: { user } } = await supabase.auth.getUser()

      const { data } = await supabase
        .from('recipes')
        .select('*, ingredients(*), recipe_steps(*)')
        .eq('slug', slug)
        .eq('user_id', user?.id)
        .single()

      setRecipe(data)
      setLoading(false)
    }
    fetchRecipe()
  }, [slug])

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[1,2,3].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-cream-100 animate-pulse" />
        ))}
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="text-center py-16 text-warm-700/40">
        <p className="text-4xl mb-3">🍽️</p>
        <p className="text-sm font-medium">Rezept nicht gefunden</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/plan"
        className="inline-flex items-center gap-1 text-sm text-warm-700/60 hover:text-warm-900 transition"
      >
        <ChevronLeft size={15} /> Zurück zum Plan
      </Link>

      <div className="flex items-start gap-3">
        <span className="text-5xl">{recipe.cover_emoji ?? '🍽️'}</span>
        <div>
          <h1 className="text-2xl font-display font-semibold text-warm-900">
            {recipe.title}
          </h1>
          <div className="flex items-center gap-2 mt-1 text-sm text-warm-700/60">
            <Users size={14} />
            {recipe.servings} Portionen
          </div>
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {recipe.tags.map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
            </div>
          )}
        </div>
      </div>

      <RecipeDetail recipe={recipe} />
    </div>
  )
}