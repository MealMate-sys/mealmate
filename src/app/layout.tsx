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
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
