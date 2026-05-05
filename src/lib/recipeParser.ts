import type { Ingredient, RecipeStep } from '@/types'

interface ParsedRecipe {
  title: string
  description: string
  servings: number
  tags: string[]
  ingredients: Omit<Ingredient, 'id' | 'recipe_id'>[]
  steps: Omit<RecipeStep, 'id' | 'recipe_id'>[]
}

function extractSection(text: string, tag: string): string {
  const regex = new RegExp(`\\[${tag}\\]([\\s\\S]*?)(?=\\[|$)`, 'i')
  const match = text.match(regex)
  return match ? match[1].trim() : ''
}

export function parseRecipeText(raw: string): ParsedRecipe {
  const title = extractSection(raw, 'TITEL') || 'Unbekanntes Rezept'
  const description = extractSection(raw, 'BESCHREIBUNG') || ''

  const servingsRaw = extractSection(raw, 'PORTIONEN')
  const servings = parseInt(servingsRaw, 10) || 1

  const tagsRaw = extractSection(raw, 'TAGS')
  const tags = tagsRaw
    ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean)
    : []

  // Parse ingredients: "Name | Menge | Einheit | Kategorie"
  const ingredientsRaw = extractSection(raw, 'ZUTATEN')
  const ingredients: ParsedRecipe['ingredients'] = []
  if (ingredientsRaw) {
    const lines = ingredientsRaw.split('\n').filter(Boolean)
    lines.forEach((line, idx) => {
      const parts = line.split('|').map((p) => p.trim())
      if (parts.length >= 2) {
        const name = parts[0]
        const amount = parseFloat(parts[1].replace(',', '.')) || 0
        const unit = parts[2] || 'Stück'
        const category = parts[3] || 'Sonstiges'
        if (name) {
          ingredients.push({ name, amount, unit, category, sort_order: idx })
        }
      }
    })
  }

  // Parse steps: lines starting with numbers like "1. " or just numbered
  const stepsRaw = extractSection(raw, 'ZUBEREITUNG')
  const steps: ParsedRecipe['steps'] = []
  if (stepsRaw) {
    const lines = stepsRaw.split('\n').filter(Boolean)
    let stepNum = 1
    lines.forEach((line) => {
      // Remove leading number like "1. " or "1) "
      const cleaned = line.replace(/^\d+[\.\)]\s*/, '').trim()
      if (cleaned) {
        steps.push({ step_number: stepNum++, description: cleaned })
      }
    })
  }

  return { title, description, servings, tags, ingredients, steps }
}
