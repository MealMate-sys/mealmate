'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { BookOpen, Calendar, ShoppingCart, Users, LogOut, User, Settings } from 'lucide-react'

const navItems = [
  { href: '/community', label: 'Community', icon: Users },
  { href: '/recipes', label: 'Rezepte', icon: BookOpen },
  { href: '/plan', label: 'Wochenplan', icon: Calendar },
  { href: '/shopping', label: 'Einkauf', icon: ShoppingCart },
]

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.push('/community')
  }

  return (
    <>
      <header className="hidden sm:flex sticky top-0 z-40 w-full items-center justify-between px-8 py-4 bg-cream-50/80 backdrop-blur border-b border-cream-200">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🥗</span>
          <span className="font-display text-xl font-semibold text-warm-900">MealMate</span>
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition',
                pathname.startsWith(href)
                  ? 'bg-sage-600 text-white'
                  : 'text-warm-700 hover:bg-cream-200'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
  href={`/profile/${profile?.username ?? user.id}`}
  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-warm-700 hover:bg-cream-200 transition"
>
  <User size={15} />
  {profile?.display_name ?? 'Profil'}
</Link>
<Link
  href="/settings"
  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-warm-700 hover:bg-cream-200 transition"
>
  <Settings size={15} />
</Link>
              <button
                onClick={handleSignOut}
                className="rounded-xl p-2 text-warm-700/50 hover:bg-cream-200 transition"
                title="Abmelden"
              >
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="rounded-xl bg-sage-600 text-white px-4 py-2 text-sm font-medium hover:bg-sage-700 transition"
            >
              Anmelden
            </Link>
          )}
        </div>
      </header>

      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-cream-50/95 backdrop-blur border-t border-cream-200 flex">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition',
                active ? 'text-sage-600' : 'text-warm-700/60'
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px]">{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
