import { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { CommunityGrid } from '@/components/community/CommunityGrid'
import { Recipe } from '@/types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Community-Rezepte',
  description:
    'Entdecke hunderte kostenlose Rezepte von der MealMate-Community. Vegetarisch, vegan, proteinreich, schnell — für jeden Geschmack.',
  openGraph: {
    title: 'Community-Rezepte | MealMate',
    description: 'Entdecke Rezepte von der MealMate-Community.',
    type: 'website',
  },
}

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: { tag?: string; q?: string }
}) {
  const supabase = createSupabaseServerClient()

  let query = supabase
    .from('recipes')
    .select('id, title, description, tags, servings, slug, cover_emoji, like_count, comment_count, created_at, profiles(id, username, display_name)')
    .eq('is_public', true)
    .order('like_count', { ascending: false })
    .limit(48)

  if (searchParams.q) {
    query = query.ilike('title', `%${searchParams.q}%`)
  }
  if (searchParams.tag) {
    query = query.contains('tags', [searchParams.tag])
  }

  const { data, error } = await query

console.log('Community recipes:', JSON.stringify(data, null, 2))
console.log('Query error:', JSON.stringify(error, null, 2))

  const recipes: Recipe[] = (data ?? []).map((r) => ({
    ...r,
    profiles: Array.isArray(r.profiles)
      ? (r.profiles[0] ?? null)
      : r.profiles ?? null,
  })) as Recipe[]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-display font-semibold text-warm-900">
          Community-Rezepte
        </h1>
        <p className="text-sm text-warm-700/60 mt-0.5">
          {recipes.length} Rezepte von der Community
        </p>
      </div>

      <CommunityGrid
        initialRecipes={recipes}
        initialTag={searchParams.tag}
        initialQuery={searchParams.q}
      />
    </div>
  )
}
