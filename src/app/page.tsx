import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (session) redirect('/plan')

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center gap-8 py-12">
      <div>
        <p className="text-7xl mb-4">🥗</p>
        <h1 className="text-4xl font-display font-semibold text-warm-900 leading-tight">
          Mahlzeiten planen.<br />
          <span className="text-sage-600">Gemeinsam kochen.</span>
        </h1>
        <p className="text-warm-700/70 mt-4 text-lg max-w-sm mx-auto">
          Rezepte verwalten, Wochenpläne erstellen und Einkaufslisten automatisch generieren.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/auth/login" className="rounded-2xl bg-sage-600 text-white px-8 py-3.5 text-base font-medium hover:bg-sage-700 transition shadow-sm">
          Kostenlos starten
        </Link>
        <Link href="/community" className="rounded-2xl bg-cream-200 text-warm-700 px-8 py-3.5 text-base font-medium hover:bg-cream-300 transition">
          Rezepte entdecken →
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-6 mt-4">
        {[
          { icon: '📋', label: 'Wochenplan', desc: 'Drag & Drop' },
          { icon: '🛒', label: 'Einkaufsliste', desc: 'Automatisch' },
          { icon: '👩‍🍳', label: 'Community', desc: 'Tausende Rezepte' },
        ].map(({ icon, label, desc }) => (
          <div key={label} className="flex flex-col gap-1">
            <span className="text-3xl">{icon}</span>
            <p className="text-sm font-semibold text-warm-900">{label}</p>
            <p className="text-xs text-warm-700/50">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
