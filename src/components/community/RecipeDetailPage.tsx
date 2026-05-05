'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Recipe, RecipeComment } from '@/types'
import { TagBadge } from '@/components/ui/TagBadge'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { RecipeDetail } from '@/components/recipes/RecipeDetail'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Heart, MessageCircle, Users, ChevronLeft, Plus, Bookmark } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RecipeDetailPageProps {
  recipe: Recipe
  comments: RecipeComment[]
}

export function RecipeDetailPage({ recipe, comments: initialComments }: RecipeDetailPageProps) {
  const { user } = useAuth()
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(recipe.like_count ?? 0)
  const [comments, setComments] = useState(initialComments)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [addedToPlan, setAddedToPlan] = useState(false)

  const handleLike = async () => {
    if (!user) return
    if (liked) {
      await supabase.from('recipe_likes').delete().match({ recipe_id: recipe.id, user_id: user.id })
      setLiked(false)
      setLikeCount((c) => c - 1)
    } else {
      await supabase.from('recipe_likes').insert({ recipe_id: recipe.id, user_id: user.id })
      setLiked(true)
      setLikeCount((c) => c + 1)
    }
  }

  const handleAddToRecipes = async () => {
    if (!user) return
    // Copy recipe to user's private collection
    const { data: newRecipe } = await supabase
      .from('recipes')
      .insert({
        user_id: user.id,
        title: recipe.title,
        description: recipe.description,
        tags: recipe.tags,
        servings: recipe.servings,
        cover_emoji: recipe.cover_emoji,
        is_public: false,
      })
      .select()
      .single()

    if (!newRecipe) return

    if (recipe.ingredients?.length) {
      await supabase.from('ingredients').insert(
        recipe.ingredients.map((ing) => ({ ...ing, id: undefined, recipe_id: newRecipe.id }))
      )
    }
    if (recipe.recipe_steps?.length) {
      await supabase.from('recipe_steps').insert(
        recipe.recipe_steps.map((s) => ({ ...s, id: undefined, recipe_id: newRecipe.id }))
      )
    }
    setAddedToPlan(true)
  }

  const handleComment = async () => {
    if (!user || !newComment.trim()) return
    setSubmitting(true)
    const { data } = await supabase
      .from('recipe_comments')
      .insert({ recipe_id: recipe.id, user_id: user.id, content: newComment.trim() })
      .select('*, profiles(username, display_name)')
      .single()
    if (data) {
      setComments((prev) => [data, ...prev])
      setNewComment('')
    }
    setSubmitting(false)
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Back */}
      <Link
        href="/community"
        className="inline-flex items-center gap-1 text-sm text-warm-700/60 hover:text-warm-900 transition"
      >
        <ChevronLeft size={15} /> Community
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <span className="text-5xl">{recipe.cover_emoji ?? '🍽️'}</span>
          <div>
            <h1 className="text-2xl font-display font-semibold text-warm-900 leading-snug">
              {recipe.title}
            </h1>
            <p className="text-sm text-warm-700/60 mt-0.5">
              von{' '}
              <Link
                href={`/profile/${recipe.profiles?.username}`}
                className="hover:text-sage-600 transition"
              >
                {recipe.profiles?.display_name ?? recipe.profiles?.username ?? 'Anonym'}
              </Link>
              {' · '}
              {recipe.servings} Portionen
            </p>
          </div>
        </div>

        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {recipe.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleLike}
            disabled={!user}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium border transition',
              liked
                ? 'bg-red-50 border-red-200 text-red-600'
                : 'bg-white border-cream-300 text-warm-700 hover:border-red-300 hover:text-red-500',
              !user && 'opacity-50 cursor-not-allowed'
            )}
            title={!user ? 'Anmelden zum Liken' : undefined}
          >
            <Heart size={15} fill={liked ? 'currentColor' : 'none'} />
            {likeCount}
          </button>

          <span className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-warm-700/60 border border-cream-200 bg-white">
            <MessageCircle size={15} />
            {comments.length}
          </span>

          {user && (
            <Button
              variant={addedToPlan ? 'secondary' : 'primary'}
              size="sm"
              onClick={handleAddToRecipes}
              disabled={addedToPlan}
              className="ml-auto"
            >
              {addedToPlan ? (
                <><Bookmark size={14} /> Gespeichert</>
              ) : (
                <><Plus size={14} /> In meine Rezepte</>
              )}
            </Button>
          )}
        </div>

        {!user && (
          <p className="text-xs text-warm-700/50">
            <Link href="/auth/login" className="text-sage-600 underline">Anmelden</Link> um zu liken, kommentieren und in deine Rezepte zu speichern.
          </p>
        )}
      </div>

      {/* Recipe content */}
      <RecipeDetail recipe={recipe} />

      {/* Comments */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-display font-semibold text-warm-900">
          Kommentare ({comments.length})
        </h2>

        {user && (
          <div className="flex flex-col gap-2">
            <Textarea
              placeholder="Dein Kommentar…"
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <Button
              size="sm"
              onClick={handleComment}
              disabled={!newComment.trim() || submitting}
              className="self-start"
            >
              {submitting ? 'Senden…' : 'Kommentieren'}
            </Button>
          </div>
        )}

        {comments.length === 0 ? (
          <p className="text-sm text-warm-700/40 italic">Noch keine Kommentare. Sei der Erste!</p>
        ) : (
          <div className="flex flex-col gap-3">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-white rounded-2xl border border-cream-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <Link
                    href={`/profile/${comment.profiles?.username}`}
                    className="text-sm font-medium text-warm-900 hover:text-sage-600 transition"
                  >
                    {comment.profiles?.display_name ?? comment.profiles?.username ?? 'Anonym'}
                  </Link>
                  <span className="text-xs text-warm-700/40">
                    {new Date(comment.created_at).toLocaleDateString('de-DE')}
                  </span>
                </div>
                <p className="text-sm text-warm-900/80 leading-relaxed">{comment.content}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
