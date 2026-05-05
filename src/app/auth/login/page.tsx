'use client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Mail, CheckCircle } from 'lucide-react'

function LoginForm() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/plan'
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!email.trim()) return
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}`,
      },
    })
    setLoading(false)
    if (error) setError(error.message)
    else setSent(true)
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 text-center py-8">
        <div className="w-14 h-14 rounded-full bg-sage-100 flex items-center justify-center">
          <CheckCircle size={28} className="text-sage-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-warm-900">Link verschickt!</h2>
          <p className="text-sm text-warm-700/70 mt-1">
            Schau in dein E-Mail-Postfach bei <strong>{email}</strong>.<br />
            Klicke auf den Link um dich anzumelden.
          </p>
        </div>
        <button
          onClick={() => { setSent(false); setEmail('') }}
          className="text-xs text-sage-600 underline mt-2"
        >
          Andere E-Mail versuchen
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-display font-semibold text-warm-900">Willkommen 👋</h1>
        <p className="text-sm text-warm-700/70 mt-1">
          Melde dich mit deiner E-Mail-Adresse an — kein Passwort nötig.
        </p>
      </div>

      <Input
        label="E-Mail-Adresse"
        id="email"
        type="email"
        placeholder="du@beispiel.de"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        autoComplete="email"
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button size="lg" onClick={handleSubmit} disabled={!email.trim() || loading}>
        <Mail size={16} />
        {loading ? 'Sende Link…' : 'Magic Link senden'}
      </Button>

      <p className="text-xs text-warm-700/50 text-center">
        Du erhältst einen Anmeldelink per E-Mail. Kein Passwort, kein Stress.
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl border border-cream-200 shadow-soft p-8">
        <div className="text-center mb-8">
          <span className="text-4xl">🥗</span>
          <p className="text-sm font-medium text-warm-700/60 mt-1">MealMate</p>
        </div>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
