'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

function ResetForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleReset = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) setError(error.message)
    else router.push('/plan')
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-display font-semibold text-warm-900">Neues Passwort</h1>
        <p className="text-sm text-warm-700/70 mt-1">Wähle ein neues Passwort für deinen Account.</p>
      </div>
      <Input
        label="Neues Passwort"
        id="password"
        type="password"
        placeholder="Mindestens 6 Zeichen"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button size="lg" onClick={handleReset} disabled={password.length < 6 || loading}>
        {loading ? 'Speichern…' : 'Passwort speichern'}
      </Button>
    </div>
  )
}

export default function ResetPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl border border-cream-200 shadow-soft p-8">
        <div className="text-center mb-8">
          <span className="text-4xl">🥗</span>
          <p className="text-sm font-medium text-warm-700/60 mt-1">MealMate</p>
        </div>
        <Suspense fallback={null}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  )
}