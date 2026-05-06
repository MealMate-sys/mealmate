'use client'
import { Recipe } from '@/types'
import { TagBadge } from '@/components/ui/TagBadge'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { Globe, Lock, Clock, Users, Edit2, Trash2 } from 'lucide-react'

interface RecipeCardProps {
  recipe: Recipe
  onEdit?: (recipe: Recipe) => void
  onDelete?: (recipe: Recipe) => void
  onClick?: (recipe: Recipe) => void
  compact?: boolean
  dragging?: boolean
}

export function RecipeCard({
  recipe,
  onEdit,
  onDelete,
  onClick,
  compact = false,
  dragging = false,
}: RecipeCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-cream-200 shadow-card transition-all duration-150',
        onClick && 'cursor-pointer hover:shadow-soft hover:-translate-y-0.5',
        dragging && 'opacity-50 scale-95',
        compact ? 'p-3' : 'p-4'
      )}
      onClick={() => onClick?.(recipe)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
  <h3 className={cn('font-semibold text-warm-900 truncate', compact ? 'text-sm' : 'text-base')}>
    {recipe.title}
  </h3>
  {recipe.is_public !== undefined && (
    <span className={`shrink-0 ${recipe.is_public ? 'text-sage-500' : 'text-warm-700/25'}`}>
      {recipe.is_public
        ? <Globe size={12} />
        : <Lock size={12} />}
    </span>
  )}
</div>

          {!compact && recipe.description && (
            <p className="mt-1 text-sm text-warm-700/70 line-clamp-2">{recipe.description}</p>
          )}

          <div className="mt-2 flex items-center gap-3 text-xs text-warm-700/60">
            <span className="flex items-center gap-1">
              <Users size={12} />
              {recipe.servings}P
            </span>
            {recipe.ingredients && (
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {recipe.ingredients.length} Zutaten
              </span>
            )}
          </div>

          {!compact && recipe.tags && recipe.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {recipe.tags.slice(0, 3).map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
            </div>
          )}
        </div>

        {(onEdit || onDelete) && (
          <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(recipe)}
                className="p-2"
                title="Bearbeiten"
              >
                <Edit2 size={14} />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(recipe)}
                className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600"
                title="Löschen"
              >
                <Trash2 size={14} />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
