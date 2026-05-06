import { Metadata } from 'next'
import { RecipeDetailClient } from '@/components/community/RecipeDetailClient'

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  return {
    title: params.slug.replace(/-/g, ' '),
  }
}

export default function RecipePage({ params }: { params: { slug: string } }) {
  return <RecipeDetailClient slug={params.slug} />
}
