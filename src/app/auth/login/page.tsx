'use client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Eye, EyeOff } from 'lucide-react'

function LoginForm() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/plan'
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) return
    setLoading(true)
    setError('')
    setSuccess('')
    if (mode === 'register') {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}`,
        },
      })
      if (error) setError(error.message)
      else setSuccess('Konto erstellt! Du kannst dich jetzt anmelden.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (error) setError('E-Mail oder Passwort falsch.')
      else window.location.href = redirectTo
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}`,
      },
    })
  }

  const handleReset = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/reset`,
    })
    setLoading(false)
    if (error) setError(error.message)
    else setSuccess('Reset-Link wurde gesendet! Schau in dein Postfach.')
  }

  // Reset Mode
  if (mode === 'reset') {
    return (
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-2xl font-display font-semibold text-warm-900">
            Passwort zurücksetzen
          </h1>
          <p className="text-sm text-warm-700/70 mt-1">
            Wir schicken dir einen Reset-Link per E-Mail.
          </p>
        </div>
        <Input
          label="E-Mail"
          id="reset-email"
          type="email"
          placeholder="du@beispiel.de"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-sage-600">{success}</p>}
        <Button size="lg" onClick={handleReset} disabled={!email.trim() || loading}>
          {loading ? 'Senden…' : 'Reset-Link senden'}
        </Button>
        <button
          onClick={() => { setMode('login'); setError(''); setSuccess('') }}
          className="text-sm text-center text-sage-600 underline"
        >
          Zurück zur Anmeldung
        </button>
      </div>
    )
  }

  // Login / Register Mode
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-display font-semibold text-warm-900">
          {mode === 'login' ? 'Willkommen zurück 👋' : 'Konto erstellen 🥗'}
        </h1>
        <p className="text-sm text-warm-700/70 mt-1">
          {mode === 'login' ? 'Melde dich an um weiterzukochen.' : 'Kostenlos loslegen.'}
        </p>
      </div>

      {/* Google */}
      <button
        onClick={handleGoogle}
        className="flex items-center justify-center gap-3 w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-sm font-medium text-warm-900 hover:bg-cream-50 transition"
      >
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
          <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 6.294C4.672 4.167 6.656 3.58 9 3.58z"/>
        </svg>
        Mit Google anmelden
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-cream-200" />
        <span className="text-xs text-warm-700/40">oder</span>
        <div className="flex-1 h-px bg-cream-200" />
      </div>

      <Input
        label="E-Mail"
        id="email"
        type="email"
        placeholder="du@beispiel.de"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
      />

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-warm-700">
          Passwort
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Mindestens 6 Zeichen"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleEmailAuth()}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            className="w-full rounded-xl border border-cream-300 bg-white px-4 py-2.5 pr-10 text-sm text-warm-900 placeholder:text-warm-700/40 focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500/20 transition"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-700/40 hover:text-warm-700 transition"
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      {mode === 'login' && (
        <button
          type="button"
          onClick={() => { setMode('reset'); setError(''); setSuccess('') }}
          className="text-xs text-sage-600 underline text-right w-full"
        >
          Passwort vergessen?
        </button>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-sage-600">{success}</p>}

      <Button size="lg" onClick={handleEmailAuth} disabled={!email.trim() || !password.trim() || loading}>
        {loading ? 'Bitte warten…' : mode === 'login' ? 'Anmelden' : 'Konto erstellen'}
      </Button>

      <p className="text-sm text-center text-warm-700/60">
        {mode === 'login' ? 'Noch kein Konto?' : 'Bereits registriert?'}{' '}
        <button
          onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccess('') }}
          className="text-sage-600 font-medium underline"
        >
          {mode === 'login' ? 'Registrieren' : 'Anmelden'}
        </button>
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