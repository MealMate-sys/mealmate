import type { Metadata } from 'next'
import { Navigation } from '@/components/Navigation'
import { AuthProvider } from '@/hooks/useAuth'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'MealMate — Wochenplaner & Rezepte',
    template: '%s | MealMate',
  },
  description:
    'Plane deine Mahlzeiten, entdecke Community-Rezepte und erstelle automatisch Einkaufslisten. Kostenlos, einfach, lecker.',
  keywords: ['Wochenplaner', 'Rezepte', 'Meal Planning', 'Einkaufsliste', 'Kochen', 'vegetarisch'],
  openGraph: {
    type: 'website',
    siteName: 'MealMate',
    title: 'MealMate — Wochenplaner & Rezepte',
    description: 'Plane deine Mahlzeiten, entdecke Community-Rezepte und erstelle automatisch Einkaufslisten.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MealMate — Wochenplaner & Rezepte',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-cream-50 text-warm-900 antialiased">
        <AuthProvider>
          <Navigation />
          <main className="px-4 py-6 pb-24 sm:pb-8">
            {children}

            <footer className="mt-12 pt-6 border-t border-cream-200 flex flex-wrap gap-4 text-xs text-warm-700/40">
  <a href="/impressum" className="hover:text-warm-700 transition">Impressum</a>
  <a href="/datenschutz" className="hover:text-warm-700 transition">Datenschutz</a>
  <a href="/feedback" className="hover:text-warm-700 transition">Feedback</a>
</footer>
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
