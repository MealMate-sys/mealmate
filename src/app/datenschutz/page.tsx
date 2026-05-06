import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Datenschutz',
  robots: { index: false },
}

export default function DatenschutzPage() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-display font-semibold text-warm-900">Datenschutzerklärung</h1>
        <p className="text-sm text-warm-700/60 mt-0.5">Gemäß DSGVO</p>
      </div>

      <div className="bg-white rounded-2xl border border-cream-200 shadow-card p-6 flex flex-col gap-6 text-sm text-warm-900/80 leading-relaxed">

        <section>
          <h2 className="font-semibold text-warm-900 mb-2">1. Verantwortlicher</h2>
          <p>
            Felix Jähnichen<br />
            DEINE ADRESSE<br />
            DEINE@EMAIL.DE
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-warm-900 mb-2">2. Welche Daten wir erheben</h2>
          <p className="text-warm-700/70">
            Bei der Registrierung erheben wir deine E-Mail-Adresse. Wenn du Rezepte erstellst, 
            speichern wir die von dir eingegebenen Inhalte (Rezepte, Zutaten, Wochenplan, 
            Einkaufslisten). Bei der Anmeldung über Google erhalten wir deinen Namen und 
            deine E-Mail-Adresse von Google.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-warm-900 mb-2">3. Zweck der Datenverarbeitung</h2>
          <p className="text-warm-700/70">
            Deine Daten werden ausschließlich zur Bereitstellung der App-Funktionen verwendet. 
            Wir geben deine Daten nicht an Dritte weiter, verkaufen sie nicht und nutzen sie 
            nicht für Werbezwecke.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-warm-900 mb-2">4. Hosting & Infrastruktur</h2>
          <p className="text-warm-700/70">
            Die App wird gehostet bei <strong>Vercel Inc.</strong> (USA) und nutzt 
            <strong> Supabase</strong> (EU-Region Frankfurt) als Datenbank. Beide Anbieter 
            sind DSGVO-konform und verarbeiten Daten gemäß ihrer eigenen Datenschutzrichtlinien.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-warm-900 mb-2">5. Authentifizierung</h2>
          <p className="text-warm-700/70">
            Die Anmeldung erfolgt über Supabase Auth. Bei Google-Login gelten zusätzlich 
            die Datenschutzbestimmungen von Google LLC. Passwörter werden verschlüsselt 
            gespeichert und sind für uns nicht einsehbar.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-warm-900 mb-2">6. Cookies</h2>
          <p className="text-warm-700/70">
            Wir verwenden ausschließlich technisch notwendige Cookies zur Aufrechterhaltung 
            deiner Anmeldesitzung. Es werden keine Tracking- oder Werbe-Cookies eingesetzt.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-warm-900 mb-2">7. Deine Rechte</h2>
          <p className="text-warm-700/70">
            Du hast jederzeit das Recht auf Auskunft, Berichtigung, Löschung und 
            Einschränkung der Verarbeitung deiner Daten. Wende dich dazu per E-Mail 
            an DEINE@EMAIL.DE. Du kannst dein Konto und alle damit verbundenen Daten 
            jederzeit löschen lassen.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-warm-900 mb-2">8. Änderungen</h2>
          <p className="text-warm-700/70">
            Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf anzupassen. 
            Die aktuelle Version ist stets auf dieser Seite abrufbar.
          </p>
        </section>

      </div>
    </div>
  )
}