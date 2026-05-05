'use client'
import { useState } from 'react'
import { Ingredient, RecipeStep, INGREDIENT_CATEGORIES, RECIPE_TAGS, Recipe } from '@/types'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Plus, Trash2, Globe, Lock } from 'lucide-react'

export interface RecipeFormData {
  title: string
  description: string
  servings: number
  tags: string[]
  cover_emoji: string
  is_public: boolean
  ingredients: Omit<Ingredient, 'id' | 'recipe_id'>[]
  steps: Omit<RecipeStep, 'id' | 'recipe_id'>[]
}

interface RecipeFormProps {
  initialData?: Partial<Recipe>
  onSubmit: (data: RecipeFormData) => Promise<void>
  loading?: boolean
}

const emptyIng = (): Omit<Ingredient, 'id' | 'recipe_id'> => ({ name: '', amount: 0, unit: 'g', category: 'Sonstiges', sort_order: 0 })
const emptyStep = (n: number): Omit<RecipeStep, 'id' | 'recipe_id'> => ({ step_number: n, description: '' })
const EMOJIS = ['🍽️','🥗','🍜','🍲','🥘','🫕','🍛','🥙','🌮','🫔','🍱','🥩','🐟','🥦','🍝','🍳','🥚','🫙','🍞','🧆']

export function RecipeForm({ initialData, onSubmit, loading }: RecipeFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [servings, setServings] = useState(initialData?.servings ?? 2)
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? [])
  const [emoji, setEmoji] = useState(initialData?.cover_emoji ?? '🍽️')
  const [isPublic, setIsPublic] = useState(initialData?.is_public ?? false)
  const [showEmoji, setShowEmoji] = useState(false)
  const [ingredients, setIngredients] = useState<Omit<Ingredient, 'id' | 'recipe_id'>[]>(
    initialData?.ingredients?.length ? initialData.ingredients : [emptyIng()]
  )
  const [steps, setSteps] = useState<Omit<RecipeStep, 'id' | 'recipe_id'>[]>(
    initialData?.recipe_steps?.length ? initialData.recipe_steps : [emptyStep(1)]
  )

  const toggleTag = (tag: string) => setTags((p) => p.includes(tag) ? p.filter((t) => t !== tag) : [...p, tag])
  const updIng = (idx: number, f: keyof Ingredient, v: string | number) =>
    setIngredients((p) => p.map((ing, i) => i === idx ? { ...ing, [f]: v } : ing))
  const updStep = (idx: number, desc: string) =>
    setSteps((p) => p.map((s, i) => i === idx ? { ...s, description: desc } : s))
  const rmStep = (idx: number) =>
    setSteps((p) => p.filter((_, i) => i !== idx).map((s, i) => ({ ...s, step_number: i + 1 })))

  const handleSubmit = () => onSubmit({
    title: title.trim(), description: description.trim(), servings, tags,
    cover_emoji: emoji, is_public: isPublic,
    ingredients: ingredients.filter((i) => i.name.trim()).map((ing, i) => ({ ...ing, sort_order: i })),
    steps: steps.filter((s) => s.description.trim()),
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Emoji + Title */}
      <div className="flex gap-3 items-start">
        <div className="flex flex-col items-center gap-1 shrink-0">
          <button type="button" onClick={() => setShowEmoji(!showEmoji)}
            className="text-4xl w-14 h-14 rounded-2xl bg-cream-100 hover:bg-cream-200 transition flex items-center justify-center">
            {emoji}
          </button>
          <span className="text-[10px] text-warm-700/40">Emoji</span>
        </div>
        <div className="flex-1">
          <Input label="Rezeptname *" id="title" placeholder="z. B. Kürbissuppe mit Ingwer"
            value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
      </div>

      {showEmoji && (
        <div className="flex flex-wrap gap-2 p-3 bg-cream-100 rounded-2xl">
          {EMOJIS.map((e) => (
            <button key={e} type="button" onClick={() => { setEmoji(e); setShowEmoji(false) }}
              className={`text-2xl w-10 h-10 rounded-xl hover:bg-cream-200 transition ${emoji === e ? 'bg-cream-300' : ''}`}>
              {e}
            </button>
          ))}
        </div>
      )}

      <Textarea label="Beschreibung" id="desc" placeholder="Kurze Beschreibung…" rows={2}
        value={description} onChange={(e) => setDescription(e.target.value)} />

      <Input label="Portionen" id="servings" type="number" min={1} max={20} value={servings}
        onChange={(e) => setServings(parseInt(e.target.value) || 1)} className="w-28" />

      {/* Tags */}
      <section>
        <p className="text-sm font-medium text-warm-700 mb-2">Tags</p>
        <div className="flex flex-wrap gap-2">
          {RECIPE_TAGS.map((tag) => (
            <button key={tag} type="button" onClick={() => toggleTag(tag)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition border ${tags.includes(tag) ? 'bg-sage-600 text-white border-sage-600' : 'bg-white text-warm-700 border-cream-300 hover:border-sage-400'}`}>
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* Visibility */}
      <section>
        <p className="text-sm font-medium text-warm-700 mb-2">Sichtbarkeit</p>
        <div className="flex gap-2">
          <button type="button" onClick={() => setIsPublic(false)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium border transition ${!isPublic ? 'bg-warm-900 text-white border-warm-900' : 'bg-white text-warm-700 border-cream-300 hover:border-warm-700'}`}>
            <Lock size={14} /> Privat
          </button>
          <button type="button" onClick={() => setIsPublic(true)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium border transition ${isPublic ? 'bg-sage-600 text-white border-sage-600' : 'bg-white text-warm-700 border-cream-300 hover:border-sage-400'}`}>
            <Globe size={14} /> Öffentlich
          </button>
        </div>
        {isPublic && (
          <p className="text-xs text-sage-600 mt-1.5">Sichtbar in der Community &amp; bei Google indexiert.</p>
        )}
      </section>

      {/* Ingredients */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-warm-700">Zutaten</p>
          <Button variant="ghost" size="sm" onClick={() => setIngredients((p) => [...p, { ...emptyIng(), sort_order: p.length }])}>
            <Plus size={14} /> Zutat
          </Button>
        </div>
        <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_2fr_auto] gap-2 px-1 mb-1">
          {['Name','Menge','Einheit','Kategorie',''].map((h) => (
            <span key={h} className="text-xs text-warm-700/50">{h}</span>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {ingredients.map((ing, idx) => (
            <div key={idx} className="grid grid-cols-[2fr_1fr_1fr_2fr_auto] gap-2 items-center">
              <Input placeholder="Zutat" value={ing.name} onChange={(e) => updIng(idx, 'name', e.target.value)} />
              <Input type="number" placeholder="Menge" value={ing.amount || ''} onChange={(e) => updIng(idx, 'amount', parseFloat(e.target.value) || 0)} />
              <Input placeholder="g/ml…" value={ing.unit} onChange={(e) => updIng(idx, 'unit', e.target.value)} />
              <Select value={ing.category} onChange={(e) => updIng(idx, 'category', e.target.value)} options={INGREDIENT_CATEGORIES.map((c) => ({ value: c, label: c }))} />
              <button type="button" onClick={() => setIngredients((p) => p.filter((_, i) => i !== idx))} className="p-1.5 text-warm-700/40 hover:text-red-500 transition"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-warm-700">Zubereitung</p>
          <Button variant="ghost" size="sm" onClick={() => setSteps((p) => [...p, emptyStep(p.length + 1)])}>
            <Plus size={14} /> Schritt
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="w-7 h-7 shrink-0 rounded-full bg-cream-200 text-warm-700 text-xs font-semibold flex items-center justify-center mt-2.5">{idx + 1}</span>
              <Textarea placeholder={`Schritt ${idx + 1}…`} value={step.description} onChange={(e) => updStep(idx, e.target.value)} rows={2} className="flex-1" />
              <button type="button" onClick={() => rmStep(idx)} className="p-1.5 text-warm-700/40 hover:text-red-500 transition mt-2"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </section>

      <Button size="lg" onClick={handleSubmit} disabled={!title.trim() || loading}>
        {loading ? 'Speichern…' : 'Rezept speichern'}
      </Button>
    </div>
  )
}
