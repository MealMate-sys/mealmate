'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Textarea } from '@/components/ui/Textarea'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { CheckCircle, MessageSquare, Bug, Lightbulb } from 'lucide-react'
import { Metadata } from 'next'

type FeedbackType = 'feedback' | 'bug' | 'feature'

export default function FeedbackPage() {
  const { user, profile } = useAuth()
  const [type, setType] = useState<FeedbackType>('feedback')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState(user?.email ?? '')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async () => {
    if (!message.trim()) return
    setLoading(true)

    // Speichern in Supabase
    await supabase.from('feedback').insert({
      type,
      message: message.trim(),
      email: email.trim() || null,
      user_id: user?.id ?? null,
    })

    setLoading(false)
    setSent(true)
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
        <div className="w-14 h-14 rounded-full bg-sage-100 flex items-center justify-center">
          <CheckCircle size={28} className="text-sage-600" />
        </div>
        <h2 className="text-lg font-semibold text-warm-900">Danke für dein Feedback!</h2>
        <p className="text-sm text-warm-700/60 max-w-xs">
          Wir lesen jede Nachricht und melden uns bei dir wenn du eine E-Mail hinterlassen hast.
        </p>
        <button
          onClick={() => { setSent(false); setMessage('') }}
          className="text-sm text-sage-600 underline"
        >
          Weiteres Feedback senden
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-display font-semibold text-warm-900">Feedback</h1>
        <p className="text-sm text-warm-700/60 mt-0.5">
          Was denkst du über MealMate? Wir freuen uns über jede Rückmeldung.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-cream-200 shadow-card p-6 flex flex-col gap-5">
        {/* Type selector */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-warm-700">Art des Feedbacks</p>
          <div className="flex gap-2">
            {[
              { key: 'feedback', label: 'Allgemein', icon: MessageSquare },
              { key: 'bug', label: 'Bug', icon: Bug },
              { key: 'feature', label: 'Idee', icon: Lightbulb },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setType(key as FeedbackType)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium border transition ${
                  type === key
                    ? 'bg-sage-600 text-white border-sage-600'
                    : 'bg-white text-warm-700 border-cream-300 hover:border-sage-400'
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </div>

        <Textarea
          label="Deine Nachricht"
          id="message"
          placeholder={
            type === 'bug'
              ? 'Was ist passiert? Wie kann man den Fehler reproduzieren?'
              : type === 'feature'
              ? 'Was würdest du dir wünschen?'
              : 'Was denkst du über MealMate?'
          }
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        {!user && (
          <Input
            label="E-Mail (optional)"
            id="email"
            type="email"
            placeholder="Für Rückfragen"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        )}

        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={!message.trim() || loading}
        >
          {loading ? 'Senden…' : 'Absenden'}
        </Button>
      </div>
    </div>
  )
}