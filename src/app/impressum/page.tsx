import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Impressum',
  robots: { index: false },
}

export default function ImpressumPage() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-display font-semibold text-warm-900">Impressum</h1>
        <p className="text-sm text-warm-700/60 mt-0.5">Angaben gemäß § 5 TMG</p>
      </div>

      <div className="bg-white rounded-2xl border border-cream-200 shadow-card p-6 flex flex-col gap-6 text-sm text-warm-900/80 leading-relaxed">
        
        <section>
          <h2 className="font-semibold text-warm-900 mb-2">Betreiber</h2>
          <p>Felix Jähnichen</p>
          <p>DEINE STRASSE UND HAUSNUMMER</p>
          <p>DEINE PLZ DEINE STADT</p>
          <p>Deutschland</p>
        </section>

        <section>
          <h2 className="font-semibold text-warm-900 mb-2">Kontakt</h2>
          <p>E-Mail: DEINE@EMAIL.DE</p>
        </section>

        <section>
          <h2 className="font-semibold text-warm-900 mb-2">Verantwortlich für den Inhalt</h2>
          <p>Felix Jähnichen (Anschrift wie oben)</p>
        </section>

        <section>
          <h2 className="font-semibold text-warm-900 mb-2">Haftungsausschluss</h2>
          <p className="text-warm-700/70">
            Die Inhalte dieser Seite wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, 
            Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. 
            Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten 
            nach den allgemeinen Gesetzen verantwortlich.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-warm-900 mb-2">Streitschlichtung</h2>
          <p className="text-warm-700/70">
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
            https://ec.europa.eu/consumers/odr. Wir sind nicht bereit oder verpflichtet, an 
            Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </section>
      </div>
    </div>
  )
}