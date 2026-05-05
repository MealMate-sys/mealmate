import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { TagBadge } from '@/components/ui/TagBadge'
import { Heart, MessageCircle, BookOpen } from 'lucide-react'

interface PageProps {
  params: { username: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = createSupabaseServerClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, username, bio')
    .eq('username', params.username)
    .single()

  if (!profile) return { title: 'Profil nicht gefunden' }

  return {
    title: `${profile.display_name ?? profile.username} — Kochbuch`,
    description:
      profile.bio ||
      `Entdecke die öffentlichen Rezepte von ${profile.display_name ?? profile.username} auf MealMate.`,
    openGraph: {
      title: `${profile.display_name ?? profile.username} | MealMate`,
      description: profile.bio ?? `Rezepte von ${profile.display_name ?? profile.username}`,
      type: 'profile',
    },
  }
}

export default async function ProfilePage({ params }: PageProps) {
  const supabase = createSupabaseServerClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username)
    .single()

  if (!profile) notFound()

  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, title, description, tags, slug, cover_emoji, like_count, comment_count')
    .eq('user_id', profile.id)
    .eq('is_public', true)
    .order('like_count', { ascending: false })

  const totalLikes = recipes?.reduce((sum, r) => sum + (r.like_count ?? 0), 0) ?? 0

  return (
    <div className="flex flex-col gap-8">
      {/* Profile header */}
      <div className="bg-white rounded-3xl border border-cream-200 shadow-card p-6 flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-sage-100 flex items-center justify-center text-2xl flex-shrink-0">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            '👤'
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-display font-semibold text-warm-900">
            {profile.display_name ?? profile.username}
          </h1>
          <p className="text-sm text-warm-700/50">@{profile.username}</p>
          {profile.bio && (
            <p className="text-sm text-warm-700/80 mt-2 leading-relaxed">{profile.bio}</p>
          )}
          <div className="flex gap-4 mt-3 text-xs text-warm-700/50">
            <span className="flex items-center gap-1">
              <BookOpen size={12} /> {recipes?.length ?? 0} Rezepte
            </span>
            <span className="flex items-center gap-1">
              <Heart size={12} /> {totalLikes} Likes
            </span>
          </div>
        </div>
      </div>

      {/* Recipes */}
      <div>
        <h2 className="text-lg font-display font-semibold text-warm-900 mb-4">
          Öffentliche Rezepte
        </h2>

        {!recipes || recipes.length === 0 ? (
          <p className="text-sm text-warm-700/40 italic text-center py-8">
            Noch keine öffentlichen Rezepte.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recipes.map((recipe) => (
              <Link
                key={recipe.id}
                href={`/community/${recipe.slug}`}
                className="group bg-white rounded-2xl border border-cream-200 shadow-card p-4 hover:shadow-soft hover:-translate-y-0.5 transition-all duration-150"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{recipe.cover_emoji ?? '🍽️'}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-warm-900 group-hover:text-sage-700 transition truncate">
                      {recipe.title}
                    </h3>
                    {recipe.description && (
                      <p className="text-xs text-warm-700/60 mt-0.5 line-clamp-2">
                        {recipe.description}
                      </p>
                    )}
                    {recipe.tags && recipe.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {recipe.tags.slice(0, 2).map((tag: string) => (
                          <TagBadge key={tag} tag={tag} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 mt-2 text-xs text-warm-700/40">
                  <span className="flex items-center gap-1"><Heart size={10} /> {recipe.like_count ?? 0}</span>
                  <span className="flex items-center gap-1"><MessageCircle size={10} /> {recipe.comment_count ?? 0}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
