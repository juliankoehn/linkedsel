import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Datenschutzerklärung',
  description: 'Datenschutzerklärung von Stacked.',
}

export default function DatenschutzPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-foreground">Datenschutzerklärung</h1>

      <div className="mt-8 space-y-8 text-muted-foreground">
        <section>
          <h2 className="text-xl font-semibold text-foreground">1. Datenschutz auf einen Blick</h2>

          <h3 className="mt-6 text-lg font-medium text-foreground">Allgemeine Hinweise</h3>
          <p className="mt-2">
            Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren
            personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene
            Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
          </p>

          <h3 className="mt-6 text-lg font-medium text-foreground">
            Datenerfassung auf dieser Website
          </h3>
          <p className="mt-2">
            <strong className="text-foreground">
              Wer ist verantwortlich für die Datenerfassung auf dieser Website?
            </strong>
          </p>
          <p className="mt-2">
            Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen
            Kontaktdaten können Sie dem Impressum dieser Website entnehmen.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">2. Hosting</h2>
          <p className="mt-4">
            Wir hosten die Inhalte unserer Website bei Vercel Inc. Anbieter ist die Vercel Inc., 340
            S Lemon Ave #4133, Walnut, CA 91789, USA.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            3. Allgemeine Hinweise und Pflichtinformationen
          </h2>

          <h3 className="mt-6 text-lg font-medium text-foreground">Datenschutz</h3>
          <p className="mt-2">
            Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir
            behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen
            Datenschutzvorschriften sowie dieser Datenschutzerklärung.
          </p>

          <h3 className="mt-6 text-lg font-medium text-foreground">
            Hinweis zur verantwortlichen Stelle
          </h3>
          <p className="mt-2">Die verantwortliche Stelle für die Datenverarbeitung ist:</p>
          <p className="mt-2">
            [Dein Name]
            <br />
            [Deine Adresse]
            <br />
            [PLZ Ort]
            <br />
            E-Mail: hello@stacked.ai
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            4. Datenerfassung auf dieser Website
          </h2>

          <h3 className="mt-6 text-lg font-medium text-foreground">Cookies</h3>
          <p className="mt-2">
            Unsere Internetseiten verwenden so genannte Cookies. Cookies sind kleine Datenpakete und
            richten auf Ihrem Endgerät keinen Schaden an. Sie werden entweder vorübergehend für die
            Dauer einer Sitzung (Session-Cookies) oder dauerhaft (permanente Cookies) auf Ihrem
            Endgerät gespeichert.
          </p>

          <h3 className="mt-6 text-lg font-medium text-foreground">Anfrage per E-Mail</h3>
          <p className="mt-2">
            Wenn Sie uns per E-Mail kontaktieren, wird Ihre Anfrage inklusive aller daraus
            hervorgehenden personenbezogenen Daten (Name, Anfrage) zum Zwecke der Bearbeitung Ihres
            Anliegens bei uns gespeichert und verarbeitet.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">5. Analyse-Tools</h2>

          <h3 className="mt-6 text-lg font-medium text-foreground">PostHog</h3>
          <p className="mt-2">
            Diese Website nutzt PostHog, einen Webanalysedienst. PostHog verwendet Cookies, die eine
            Analyse der Benutzung der Website durch Sie ermöglichen. Die durch das Cookie erzeugten
            Informationen über Ihre Benutzung dieser Website werden in der Regel an einen Server von
            PostHog übertragen und dort gespeichert.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">6. Ihre Rechte</h2>
          <p className="mt-4">
            Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck
            Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht,
            die Berichtigung oder Löschung dieser Daten zu verlangen.
          </p>
        </section>
      </div>
    </div>
  )
}
