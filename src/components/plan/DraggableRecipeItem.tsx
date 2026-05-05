'use client'
import { useDraggable } from '@dnd-kit/core'
import { Recipe } from '@/types'
import { cn } from '@/lib/utils'

interface DraggableRecipeItemProps {
  recipe: Recipe
  dragId: string
}

export function DraggableRecipeItem({ recipe, dragId }: DraggableRecipeItemProps) {
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
        'bg-white rounded-xl border border-cream-200 px-3 py-2 cursor-grab active:cursor-grabbing text-sm font-medium text-warm-900 shadow-card transition-all select-none touch-none',
        isDragging && 'opacity-40 scale-95'
      )}
    >
      {recipe.title}
    </div>
  )
}
