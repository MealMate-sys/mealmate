import { MetadataRoute } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://mealmate.app'
  const supabase = createSupabaseServerClient()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/community`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
  ]

  // Public recipe pages
  const { data: recipes } = await supabase
    .from('recipes')
    .select('slug, updated_at')
    .eq('is_public', true)
    .not('slug', 'is', null)
    .order('updated_at', { ascending: false })
    .limit(10000)

  const recipePages: MetadataRoute.Sitemap = (recipes ?? []).map((recipe) => ({
    url: `${baseUrl}/community/${recipe.slug}`,
    lastModified: new Date(recipe.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Public profile pages
  const { data: profiles } = await supabase
    .from('profiles')
    .select('username, updated_at')
    .limit(5000)

  const profilePages: MetadataRoute.Sitemap = (profiles ?? []).map((profile) => ({
    url: `${baseUrl}/profile/${profile.username}`,
    lastModified: new Date(profile.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...recipePages, ...profilePages]
}
