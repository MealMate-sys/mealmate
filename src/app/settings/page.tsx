'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { CheckCircle } from 'lucide-react'

export default function SettingsPage() {
  const { user, profile } = useAuth()
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (profile) {
      setUsername(profile.username ?? '')
      setDisplayName(profile.display_name ?? '')
      setBio(profile.bio ?? '')
    }
  }, [profile])

  const handleSave = async () => {
    if (!user) return
    setLoading(true)
    setError('')
    setSaved(false)

    const { error } = await supabase
      .from('profiles')
      .update({
        username: username.trim(),
        display_name: displayName.trim(),
        bio: bio.trim(),
      })
      .eq('id', user.id)

    setLoading(false)
    if (error) {
      if (error.code === '23505') setError('Dieser Username ist bereits vergeben.')
      else setError('Fehler beim Speichern.')
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-display font-semibold text-warm-900">Einstellungen</h1>
        <p className="text-sm text-warm-700/60 mt-0.5">Dein öffentliches Profil</p>
      </div>

      <div className="bg-white rounded-2xl border border-cream-200 shadow-card p-6 flex flex-col gap-4">
        <Input
          label="Username"
          id="username"
          placeholder="dein-username"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, '-'))}
        />
        <Input
          label="Anzeigename"
          id="displayName"
          placeholder="Dein Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <Textarea
          label="Bio"
          id="bio"
          placeholder="Ein paar Worte über dich und deine Küche…"
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        {saved && (
          <div className="flex items-center gap-2 text-sage-600 text-sm">
            <CheckCircle size={16} />
            Gespeichert!
          </div>
        )}

        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Speichern…' : 'Speichern'}
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-cream-200 shadow-card p-6 flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-warm-900">Account</h2>
        <p className="text-sm text-warm-700/60">
          Angemeldet als <strong>{user?.email}</strong>
        </p>
        <p className="text-xs text-warm-700/40">
          Öffentliches Profil: /profile/{username}
        </p>
      </div>
    </div>
  )
}