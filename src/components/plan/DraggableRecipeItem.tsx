'use client'
import { useDraggable } from '@dnd-kit/core'
import { Recipe } from '@/types'
import { cn } from '@/lib/utils'

interface DraggableRecipeItemProps {
  recipe: Recipe
  dragId: string
  compact?: boolean
}

export function DraggableRecipeItem({ recipe, dragId, compact = false }: DraggableRecipeItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: dragId,
    data: { recipe },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        'bg-white rounded-xl border border-cream-200 cursor-grab active:cursor-grabbing shadow-card transition-all select-none touch-none',
        isDragging && 'opacity-40 scale-95',
        compact ? 'px-2 py-2 text-xs' : 'px-3 py-2 text-sm'
      )}
    >
      <div className="flex items-center gap-1.5">
        <span className="text-base">{recipe.cover_emoji ?? '🍽️'}</span>
        <span className="font-medium text-warm-900 truncate">{recipe.title}</span>
      </div>
      {!compact && recipe.tags && recipe.tags.length > 0 && (
        <div className="flex gap-1 mt-1 flex-wrap">
          {recipe.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-[10px] text-warm-700/50">{tag}</span>
          ))}
        </div>
      )}
    </div>
  )
}