'use client'
import { useState } from 'react'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { parseRecipeText } from '@/lib/recipeParser'
import { FileText, CheckCircle } from 'lucide-react'

const EXAMPLE = `[TITEL]
Kichererbsen-Curry

[PORTIONEN]
1

[TAGS]
vegetarisch, schnell, proteinreich

[ZUTATEN]
Zutat | Menge | Einheit | Kategorie
Kichererbsen | 240 | g | Trockenware
Kokosmilch | 400 | ml | Kühlregal
Paprika | 2 | Stück | Gemüse
Currypaste | 2 | EL | Gewürze
Knoblauch | 2 | Zehen | Gemüse

[ZUBEREITUNG]
1. Kichererbsen abspülen und abtropfen lassen.
2. Paprika würfeln, Knoblauch fein hacken.
3. Alles mit Kokosmilch und Currypaste aufkochen.
4. 15 Minuten köcheln, mit Salz abschmecken.`

interface RecipeImportProps {
  onImport: (parsed: ReturnType<typeof parseRecipeText>) => void
}

export function RecipeImport({ onImport }: RecipeImportProps) {
  const [text, setText] = useState('')
  const [preview, setPreview] = useState<ReturnType<typeof parseRecipeText> | null>(null)
  const [error, setError] = useState('')

  const handleParse = () => {
    if (!text.trim()) {
      setError('Bitte füge einen Rezepttext ein.')
      return
    }
    try {
      const parsed = parseRecipeText(text)
      if (!parsed.title) {
        setError('Kein Titel gefunden. Bitte prüfe das Format.')
        return
      }
      setPreview(parsed)
      setError('')
    } catch {
      setError('Fehler beim Parsen. Bitte Format prüfen.')
    }
  }

  const handleConfirm = () => {
    if (preview) onImport(preview)
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-warm-700/70">
        Füge dein Rezept im folgenden Format ein. Felder mit eckigen Klammern sind Pflicht.
      </p>

      <button
        type="button"
        onClick={() => setText(EXAMPLE)}
        className="text-xs text-sage-600 underline text-left"
      >
        Beispiel einfügen
      </button>

      <Textarea
        placeholder={`[TITEL]\nMein Rezept\n\n[PORTIONEN]\n1\n\n[ZUTATEN]\nZutat | Menge | Einheit | Kategorie\n...`}
        rows={12}
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          setPreview(null)
        }}
        className="font-mono text-xs"
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      {!preview ? (
        <Button onClick={handleParse} variant="secondary" className="self-start">
          <FileText size={14} /> Vorschau
        </Button>
      ) : (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle size={16} />
            <span className="text-sm font-medium">Rezept erkannt</span>
          </div>
          <div className="text-sm text-warm-900 space-y-1">
            <p><strong>{preview.title}</strong></p>
            <p className="text-warm-700/70">
              {preview.servings} Portion(en) · {preview.ingredients.length} Zutaten · {preview.steps.length} Schritte
            </p>
            {preview.tags.length > 0 && (
              <p className="text-warm-700/70">Tags: {preview.tags.join(', ')}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleConfirm}>Importieren</Button>
            <Button variant="ghost" onClick={() => setPreview(null)}>Zurück</Button>
          </div>
        </div>
      )}
    </div>
  )
}
