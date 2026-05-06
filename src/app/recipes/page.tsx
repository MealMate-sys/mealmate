'use client'
import { useState, useEffect } from 'react'
import { Recipe } from '@/types'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { RecipeCard } from '@/components/recipes/RecipeCard'
import { RecipeForm, RecipeFormData } from '@/components/recipes/RecipeForm'
import { RecipeDetail } from '@/components/recipes/RecipeDetail'
import { RecipeImport } from '@/components/recipes/RecipeImport'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Plus, Search, Upload, Globe, Lock } from 'lucide-react'
import { parseRecipeText } from '@/lib/recipeParser'

type ModalType = 'create' | 'import' | 'edit' | 'detail' | null

export default function RecipesPage() {
  const { user } = useAuth()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<ModalType>(null)
  const [selected, setSelected] = useState<Recipe | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (user) fetchRecipes() }, [user])

  async function fetchRecipes() {
    setLoading(true)
    const { data } = await supabase.from('recipes').select('*, ingredients(*), recipe_steps(*)')
      .eq('user_id', user!.id).order('created_at', { ascending: false })
    setRecipes(data ?? [])
    setLoading(false)
  }

  async function saveRecipe(formData: RecipeFormData, existingId?: string) {
    setSaving(true)
    try {
      const payload = { title: formData.title, description: formData.description || null,
        tags: formData.tags, servings: formData.servings, cover_emoji: formData.cover_emoji,
        is_public: formData.is_public, user_id: user!.id }
      let recipeId = existingId
      if (existingId) {
        await supabase.from('recipes').update(payload).eq('id', existingId)
        await supabase.from('ingredients').delete().eq('recipe_id', existingId)
        await supabase.from('recipe_steps').delete().eq('recipe_id', existingId)
      } else {
        const { data } = await supabase.from('recipes').insert(payload).select().single()
        recipeId = data?.id
      }
      if (!recipeId) return
      if (formData.ingredients.length > 0)
        await supabase.from('ingredients').insert(formData.ingredients.map((i) => ({ ...i, recipe_id: recipeId })))
      if (formData.steps.length > 0)
        await supabase.from('recipe_steps').insert(formData.steps.map((s) => ({ ...s, recipe_id: recipeId })))
      setModal(null); await fetchRecipes()
    } finally { setSaving(false) }
  }

  async function deleteRecipe(recipe: Recipe) {
    if (!confirm(`„${recipe.title}" wirklich löschen?`)) return
    await supabase.from('recipes').delete().eq('id', recipe.id)
    setRecipes((p) => p.filter((r) => r.id !== recipe.id))
  }

  function handleImport(parsed: ReturnType<typeof parseRecipeText>) {
    setSelected({ id: '', title: parsed.title, description: parsed.description, servings: parsed.servings, tags: parsed.tags, ingredients: parsed.ingredients, recipe_steps: parsed.steps })
    setModal('create')
  }

  const filtered = recipes.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-semibold text-warm-900">Meine Rezepte</h1>
          <p className="text-sm text-warm-700/60 mt-0.5">{recipes.length} gespeichert</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => { setSelected(null); setModal('import') }}><Upload size={14} /></Button>
          <Button onClick={() => { setSelected(null); setModal('create') }}><Plus size={16} /> Neu</Button>
        </div>
      </div>
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-700/40" />
        <input type="search" placeholder="Rezepte suchen…" value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-cream-300 bg-white pl-10 pr-4 py-2.5 text-sm text-warm-900 placeholder:text-warm-700/40 focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500/20 transition" />
      </div>
      {loading ? (
        <div className="flex flex-col gap-2">{[1,2,3].map((i) => <div key={i} className="h-20 rounded-2xl bg-cream-100 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-warm-700/40">
          <p className="text-4xl mb-3">🍽️</p>
          <p className="text-sm font-medium">Noch keine Rezepte</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((recipe) => (
            <div key={recipe.id} className="relative">
  <RecipeCard
    recipe={recipe}
    onClick={(r) => { setSelected(r); setModal('detail') }}
    onEdit={(r) => { setSelected(r); setModal('edit') }}
    onDelete={deleteRecipe}
  />
  <span
    className={`absolute top-3.5 left-4 flex items-center gap-1 text-[10px] font-medium ${recipe.is_public ? 'text-sage-500' : 'text-warm-700/30'}`}
    title={recipe.is_public ? 'Öffentlich' : 'Privat'}
  >
    {recipe.is_public ? <Globe size={10} /> : <Lock size={10} />}
    {recipe.is_public ? 'Öffentlich' : 'Privat'}
  </span>
</div>
          ))}
        </div>
      )}
      <Modal open={modal === 'create' || modal === 'edit'} onClose={() => setModal(null)}
        title={modal === 'edit' ? 'Rezept bearbeiten' : 'Neues Rezept'}>
        <RecipeForm initialData={selected ?? undefined}
          onSubmit={(data) => saveRecipe(data, modal === 'edit' ? selected?.id : undefined)} loading={saving} />
      </Modal>
      <Modal open={modal === 'import'} onClose={() => setModal(null)} title="Rezept importieren">
        <RecipeImport onImport={(p) => { setModal(null); handleImport(p) }} />
      </Modal>
      <Modal open={modal === 'detail'} onClose={() => setModal(null)} title={selected?.title}>
        {selected && <RecipeDetail recipe={selected} />}
      </Modal>
    </div>
  )
}
