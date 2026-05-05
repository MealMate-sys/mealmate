export type Tag = string

export interface Ingredient {
  id?: string
  recipe_id?: string
  name: string
  amount: number
  unit: string
  category: string
  sort_order?: number
}

export interface RecipeStep {
  id?: string
  recipe_id?: string
  step_number: number
  description: string
}

export interface Profile {
  id: string
  username: string
  display_name?: string | null
  bio?: string | null
  avatar_url?: string | null
  created_at?: string
}

export interface Recipe {
  id: string
  user_id?: string | null
  title: string
  description?: string | null
  tags: string[]
  servings: number
  is_public?: boolean
  slug?: string | null
  cover_emoji?: string
  like_count?: number
  comment_count?: number
  created_at?: string
  updated_at?: string
  ingredients?: Ingredient[]
  recipe_steps?: RecipeStep[]
  profiles?: Profile | null
}

export interface RecipeLike {
  id: string
  recipe_id: string
  user_id: string
  created_at: string
}

export interface RecipeComment {
  id: string
  recipe_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  profiles?: Profile | null
}

export type Slot = 'lunch' | 'dinner'

export interface PlanEntry {
  id: string
  user_id?: string | null
  recipe_id: string
  week_start: string
  day_of_week: number
  slot: Slot
  servings: number
  created_at?: string
  updated_at?: string
  recipe?: Recipe
}

export interface ShoppingListItem {
  id: string
  user_id?: string | null
  week_start: string
  name: string
  amount?: number | null
  unit?: string | null
  category: string
  is_checked: boolean
  is_manual: boolean
  created_at?: string
  updated_at?: string
}

export const INGREDIENT_CATEGORIES = [
  'Gemüse',
  'Obst',
  'Fleisch & Fisch',
  'Milchprodukte',
  'Kühlregal',
  'Trockenware',
  'Gewürze',
  'Backwaren',
  'Tiefkühl',
  'Getränke',
  'Sonstiges',
] as const

export type IngredientCategory = typeof INGREDIENT_CATEGORIES[number]

export const RECIPE_TAGS = [
  'vegetarisch',
  'vegan',
  'proteinreich',
  'schnell',
  'gesund',
  'günstig',
  'aufwendig',
  'familientauglich',
  'meal-prep',
] as const

export const DAYS_OF_WEEK = [
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag',
  'Sonntag',
] as const

export const SLOTS: { key: Slot; label: string }[] = [
  { key: 'lunch', label: 'Mittag' },
  { key: 'dinner', label: 'Abend' },
]
