import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { RecipeDetailPage } from '@/components/community/RecipeDetailPage'

interface PageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = createSupabaseServerClient()
  const { data: recipe } = await supabase
    .from('recipes')
    .select('title, description, tags, cover_emoji, profiles(display_name)')
    .eq('slug', params.slug)
    .eq('is_public', true)
    .single()

  if (!recipe) return { title: 'Rezept nicht gefunden' }

  const title = `${recipe.cover_emoji ?? '🍽️'} ${recipe.title}`
  const description =
    recipe.description ||
    `Rezept für ${recipe.title} mit ${recipe.tags?.join(', ')} — entdeckt auf MealMate.`

  return {
    title,
    description,
    keywords: [recipe.title, ...(recipe.tags ?? []), 'Rezept', 'kochen', 'MealMate'],
    openGraph: {
      title,
      description,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

export async function generateStaticParams() {
  const supabase = createSupabaseServerClient()
  const { data } = await supabase
    .from('recipes')
    .select('slug')
    .eq('is_public', true)
    .not('slug', 'is', null)
    .limit(500)
  return (data ?? []).map((r) => ({ slug: r.slug! }))
}

export default async function RecipePage({ params }: PageProps) {
  const supabase = createSupabaseServerClient()

  const { data: recipe } = await supabase
    .from('recipes')
    .select(`
      *,
      ingredients(*),
      recipe_steps(*),
      profiles(id, username, display_name)
    `)
    .eq('slug', params.slug)
    .eq('is_public', true)
    .single()

  if (!recipe) notFound()

  const { data: comments } = await supabase
    .from('recipe_comments')
    .select('*, profiles(username, display_name)')
    .eq('recipe_id', recipe.id)
    .order('created_at', { ascending: false })

  // Recipe Schema.org structured data
  const schemaOrgRecipe = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    description: recipe.description ?? undefined,
    keywords: recipe.tags?.join(', '),
    recipeYield: `${recipe.servings} Portionen`,
    author: {
      '@type': 'Person',
      name: recipe.profiles?.display_name ?? recipe.profiles?.username ?? 'MealMate-Nutzer',
    },
    datePublished: recipe.created_at,
    recipeIngredient: recipe.ingredients?.map(
      (ing: { amount: number; unit: string; name: string }) =>
        `${ing.amount} ${ing.unit} ${ing.name}`
    ),
    recipeInstructions: recipe.recipe_steps
      ?.sort((a: { step_number: number }, b: { step_number: number }) => a.step_number - b.step_number)
      .map((step: { description: string; step_number: number }) => ({
        '@type': 'HowToStep',
        position: step.step_number,
        text: step.description,
      })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrgRecipe) }}
      />
      <RecipeDetailPage recipe={recipe} comments={comments ?? []} />
    </>
  )
}
