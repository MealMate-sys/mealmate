'use client'
import { Recipe } from '@/types'
import { TagBadge } from '@/components/ui/TagBadge'
import { Users } from 'lucide-react'

export function RecipeDetail({ recipe }: { recipe: Recipe }) {
  // Group ingredients by category
  const grouped: Record<string, typeof recipe.ingredients> = {}
  recipe.ingredients?.forEach((ing) => {
    const cat = ing.category || 'Sonstiges'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat]!.push(ing)
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-warm-700/60 mb-1">
          <Users size={14} />
          <span>{recipe.servings} Portion(en)</span>
        </div>
        {recipe.description && (
          <p className="text-warm-700/80 text-sm leading-relaxed">{recipe.description}</p>
        )}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {recipe.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
        )}
      </div>

      {/* Ingredients */}
      {recipe.ingredients && recipe.ingredients.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-warm-900 mb-3">Zutaten</h3>
          <div className="flex flex-col gap-4">
            {Object.entries(grouped).map(([cat, items]) => (
              <div key={cat}>
                <p className="text-xs font-medium text-warm-700/50 uppercase tracking-wide mb-1.5">
                  {cat}
                </p>
                <div className="flex flex-col gap-1">
                  {items?.map((ing, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center py-1.5 border-b border-cream-100 last:border-0"
                    >
                      <span className="text-sm text-warm-900">{ing.name}</span>
                      <span className="text-sm text-warm-700/60 tabular-nums">
                        {ing.amount} {ing.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Steps */}
      {recipe.recipe_steps && recipe.recipe_steps.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-warm-900 mb-3">Zubereitung</h3>
          <div className="flex flex-col gap-3">
            {recipe.recipe_steps
              .sort((a, b) => a.step_number - b.step_number)
              .map((step) => (
                <div key={step.id ?? step.step_number} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sage-100 text-sage-700 text-xs font-semibold flex items-center justify-center mt-0.5">
                    {step.step_number}
                  </span>
                  <p className="text-sm text-warm-900 leading-relaxed">{step.description}</p>
                </div>
              ))}
          </div>
        </section>
      )}
    </div>
  )
}
