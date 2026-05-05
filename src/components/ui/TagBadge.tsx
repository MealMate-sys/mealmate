'use client'
import { cn } from '@/lib/utils'

const TAG_COLORS: Record<string, string> = {
  vegetarisch: 'bg-green-100 text-green-700',
  vegan: 'bg-emerald-100 text-emerald-700',
  proteinreich: 'bg-blue-100 text-blue-700',
  schnell: 'bg-amber-100 text-amber-700',
  gesund: 'bg-teal-100 text-teal-700',
  günstig: 'bg-lime-100 text-lime-700',
  aufwendig: 'bg-orange-100 text-orange-700',
  familientauglich: 'bg-purple-100 text-purple-700',
  'meal-prep': 'bg-indigo-100 text-indigo-700',
}

export function TagBadge({ tag, className }: { tag: string; className?: string }) {
  const color = TAG_COLORS[tag] ?? 'bg-cream-200 text-warm-700'
  return (
    <span
      className={cn(
        'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium',
        color,
        className
      )}
    >
      {tag}
    </span>
  )
}
