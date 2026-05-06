'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Suspense } from 'react'

function ConfirmHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')
    const redirectTo = searchParams.get('redirectTo') ?? '/plan'

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(() => {
        router.push(redirectTo)
      })
    } else {
      router.push(redirectTo)
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-4xl mb-4">🥗</p>
        <p className="text-sm text-warm-700/60">Anmeldung wird abgeschlossen…</p>
      </div>
    </div>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmHandler />
    </Suspense>
  )
}
