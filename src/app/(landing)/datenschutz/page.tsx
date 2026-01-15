import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Datenschutzerklärung',
  description: 'Datenschutzerklärung von LinkedSel.',
}

export default function DatenschutzPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">Datenschutzerklärung</h1>

      <div className="prose prose-gray mt-8 max-w-none">
        <h2>1. Datenschutz auf einen Blick</h2>

        <h3>Allgemeine Hinweise</h3>
        <p>
          Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren
          personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten
          sind alle Daten, mit denen Sie persönlich identifiziert werden können.
        </p>

        <h3>Datenerfassung auf dieser Website</h3>
        <p>
          <strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong>
        </p>
        <p>
          Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen
          Kontaktdaten können Sie dem Impressum dieser Website entnehmen.
        </p>

        <h2>2. Hosting</h2>
        <p>
          Wir hosten die Inhalte unserer Website bei Vercel Inc. Anbieter ist die Vercel Inc., 340 S
          Lemon Ave #4133, Walnut, CA 91789, USA.
        </p>

        <h2>3. Allgemeine Hinweise und Pflichtinformationen</h2>

        <h3>Datenschutz</h3>
        <p>
          Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir
          behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen
          Datenschutzvorschriften sowie dieser Datenschutzerklärung.
        </p>

        <h3>Hinweis zur verantwortlichen Stelle</h3>
        <p>Die verantwortliche Stelle für die Datenverarbeitung ist:</p>
        <p>
          [Dein Name]
          <br />
          [Deine Adresse]
          <br />
          [PLZ Ort]
          <br />
          E-Mail: hello@linkedsel.com
        </p>

        <h2>4. Datenerfassung auf dieser Website</h2>

        <h3>Cookies</h3>
        <p>
          Unsere Internetseiten verwenden so genannte Cookies. Cookies sind kleine Datenpakete und
          richten auf Ihrem Endgerät keinen Schaden an. Sie werden entweder vorübergehend für die
          Dauer einer Sitzung (Session-Cookies) oder dauerhaft (permanente Cookies) auf Ihrem
          Endgerät gespeichert.
        </p>

        <h3>Anfrage per E-Mail</h3>
        <p>
          Wenn Sie uns per E-Mail kontaktieren, wird Ihre Anfrage inklusive aller daraus
          hervorgehenden personenbezogenen Daten (Name, Anfrage) zum Zwecke der Bearbeitung Ihres
          Anliegens bei uns gespeichert und verarbeitet.
        </p>

        <h2>5. Analyse-Tools</h2>

        <h3>PostHog</h3>
        <p>
          Diese Website nutzt PostHog, einen Webanalysedienst. PostHog verwendet Cookies, die eine
          Analyse der Benutzung der Website durch Sie ermöglichen. Die durch das Cookie erzeugten
          Informationen über Ihre Benutzung dieser Website werden in der Regel an einen Server von
          PostHog übertragen und dort gespeichert.
        </p>

        <h2>6. Ihre Rechte</h2>
        <p>
          Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck
          Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die
          Berichtigung oder Löschung dieser Daten zu verlangen.
        </p>
      </div>
    </div>
  )
}
