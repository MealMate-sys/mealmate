import { Metadata } from 'next'
import { CommunityPageClient } from '@/components/community/CommunityPageClient'

export const metadata: Metadata = {
  title: 'Community-Rezepte',
  description: 'Entdecke hunderte kostenlose Rezepte von der MealMate-Community.',
}

export default function CommunityPage({
  searchParams,
}: {
  searchParams: { tag?: string; q?: string }
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-display font-semibold text-warm-900">
          Community-Rezepte
        </h1>
      </div>
      <CommunityPageClient
        initialTag={searchParams.tag}
        initialQuery={searchParams.q}
      />
    </div>
  )
}
