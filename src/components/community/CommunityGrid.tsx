'use client'
import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Recipe } from '@/types'
import { TagBadge } from '@/components/ui/TagBadge'
import { RECIPE_TAGS } from '@/types'
import { Heart, MessageCircle, Search, X } from 'lucide-react'

interface CommunityGridProps {
  initialRecipes: Recipe[]
  initialTag?: string
  initialQuery?: string
}

export function CommunityGrid({ initialRecipes, initialTag, initialQuery }: CommunityGridProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [query, setQuery] = useState(initialQuery ?? '')
  const [activeTag, setActiveTag] = useState(initialTag ?? '')

  const applyFilter = (newTag: string, newQuery: string) => {
    const params = new URLSearchParams()
    if (newQuery) params.set('q', newQuery)
    if (newTag) params.set('tag', newTag)
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleTagClick = (tag: string) => {
    const next = activeTag === tag ? '' : tag
    setActiveTag(next)
    applyFilter(next, query)
  }

  const handleSearch = () => applyFilter(activeTag, query)

  const clearFilters = () => {
    setQuery('')
    setActiveTag('')
    router.push(pathname)
  }

  const hasFilter = !!query || !!activeTag

  return (
    <div className="flex flex-col gap-5">
      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-700/40" />
          <input
            type="search"
            placeholder="Rezepte suchen…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full rounded-xl border border-cream-300 bg-white pl-10 pr-4 py-2.5 text-sm text-warm-900 placeholder:text-warm-700/40 focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500/20 transition"
          />
        </div>
        {hasFilter && (
          <button
            onClick={clearFilters}
            className="rounded-xl border border-cream-300 px-3 text-warm-700/50 hover:text-warm-900 hover:bg-cream-100 transition"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Tag filters */}
      <div className="flex flex-wrap gap-1.5">
        {RECIPE_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => handleTagClick(tag)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition border ${
              activeTag === tag
                ? 'bg-sage-600 text-white border-sage-600'
                : 'bg-white text-warm-700 border-cream-300 hover:border-sage-400'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Grid */}
      {initialRecipes.length === 0 ? (
        <div className="text-center py-16 text-warm-700/40">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm font-medium">Keine Rezepte gefunden</p>
          <p className="text-xs mt-1">Versuche einen anderen Suchbegriff oder Filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {initialRecipes.map((recipe) => (
            <CommunityCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  )
}

function CommunityCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link
      href={`/community/${recipe.slug}`}
      className="group bg-white rounded-2xl border border-cream-200 shadow-card p-4 hover:shadow-soft hover:-translate-y-0.5 transition-all duration-150 flex flex-col gap-3"
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl flex-shrink-0">{recipe.cover_emoji ?? '🍽️'}</span>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-warm-900 text-sm leading-snug group-hover:text-sage-700 transition">
            {recipe.title}
          </h2>
          {recipe.description && (
            <p className="text-xs text-warm-700/60 mt-0.5 line-clamp-2">{recipe.description}</p>
          )}
        </div>
      </div>

      {recipe.tags && recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {recipe.tags.slice(0, 3).map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-warm-700/50 pt-1 border-t border-cream-100">
        <span>
          {(recipe as { profiles?: { display_name?: string; username?: string } }).profiles?.display_name ??
           (recipe as { profiles?: { username?: string } }).profiles?.username ??
           'Anonym'}
        </span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Heart size={11} />
            {recipe.like_count ?? 0}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle size={11} />
            {recipe.comment_count ?? 0}
          </span>
        </div>
      </div>
    </Link>
  )
}
