import {
  ArrowRight,
  Check,
  Clock,
  Download,
  Layers,
  Palette,
  Sparkles,
  Target,
  Users,
  Zap,
} from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        {/* Gradient glow effect */}
        <div className="absolute inset-0 bg-gradient-glow" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(139,92,246,0.1),transparent_50%)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-muted-foreground backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-accent" />
              AI-Powered Carousel Generator
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              <span className="text-foreground">LinkedIn Carousels.</span>
              <br />
              <span className="text-gradient">In Sekunden.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              Von der Idee zum viralen Carousel in unter 60 Sekunden. KI generiert Content, Design
              und Layout – du postest und wächst.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 bg-brand-500 px-8 text-base hover:bg-brand-600"
              >
                <Link href="/editor">
                  Jetzt kostenlos erstellen
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="h-12 border-white/10 bg-white/5 px-8 text-base hover:bg-white/10"
              >
                <Link href="/features">Demo ansehen</Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Vertraut von Creator & Marketing-Teams
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-white/10 bg-white/[0.02] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-foreground sm:text-4xl">10K+</div>
              <div className="mt-1 text-sm text-muted-foreground">Carousels erstellt</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground sm:text-4xl">500+</div>
              <div className="mt-1 text-sm text-muted-foreground">Stunden gespart</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground sm:text-4xl">1K+</div>
              <div className="mt-1 text-sm text-muted-foreground">Zufriedene Nutzer</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Alles was du brauchst
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Für LinkedIn Carousels die performen
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="group rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-all hover:border-white/20 hover:bg-white/[0.04]">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10">
                <Sparkles className="h-6 w-6 text-brand-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">KI-Generierung</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Gib dein Thema ein – die KI erstellt Texte, wählt passende Bilder und designt das
                komplette Carousel.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-all hover:border-white/20 hover:bg-white/[0.04]">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">60 Sekunden</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Von der Idee zum fertigen PDF in unter einer Minute. Keine Design-Skills nötig.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-all hover:border-white/20 hover:bg-white/[0.04]">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10">
                <Target className="h-6 w-6 text-brand-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">LinkedIn-Optimiert</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                100% fokussiert auf LinkedIn. Perfekte Formate, Best Practices eingebaut, maximales
                Engagement.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-all hover:border-white/20 hover:bg-white/[0.04]">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                <Palette className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">Brand Kits</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Speichere deine Farben, Schriften und Logo. Ein Klick – konsistentes Branding.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-all hover:border-white/20 hover:bg-white/[0.04]">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10">
                <Layers className="h-6 w-6 text-brand-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">Pro Templates</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Dutzende professionelle Vorlagen für jeden Use Case. Anpassen und veröffentlichen.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-all hover:border-white/20 hover:bg-white/[0.04]">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                <Download className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">PDF Export</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Ein Klick Export als PDF. Perfekt für LinkedIn – sofort hochladbar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="border-y border-white/10 bg-white/[0.02] py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              So einfach geht&apos;s
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">3 Schritte zum perfekten Carousel</p>
          </div>

          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="relative text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent text-2xl font-bold text-white">
                1
              </div>
              <h3 className="mt-6 text-lg font-semibold text-foreground">Thema eingeben</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Beschreibe dein Thema in 1-2 Sätzen. Die KI versteht den Kontext.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent text-2xl font-bold text-white">
                2
              </div>
              <h3 className="mt-6 text-lg font-semibold text-foreground">KI generiert</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                In Sekunden: Texte, Design, Bilder – ein komplettes Carousel.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent text-2xl font-bold text-white">
                3
              </div>
              <h3 className="mt-6 text-lg font-semibold text-foreground">Anpassen & Posten</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Feinschliff falls nötig, als PDF exportieren, auf LinkedIn posten.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Für wen ist Stacked?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Creator, Marketer und Berater lieben uns
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
            {/* Use Case 1 */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10">
                <Users className="h-6 w-6 text-brand-400" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-foreground">Creator & Influencer</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Baue deine Personal Brand mit konsistenten, hochwertigen Carousels. Skaliere deinen
                Content ohne Design-Team.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-3 py-1 text-sm font-medium text-brand-400">
                10x mehr Content Output
              </div>
            </div>

            {/* Use Case 2 */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                <Target className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-foreground">Marketing Teams</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Skaliere LinkedIn Content für dein B2B Marketing. Konsistentes Branding, schnelle
                Produktion.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent">
                80% Zeit gespart
              </div>
            </div>

            {/* Use Case 3 */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10">
                <Clock className="h-6 w-6 text-brand-400" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-foreground">Berater & Coaches</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Positioniere dich als Experte mit thought leadership Content. Professionell ohne
                Aufwand.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-3 py-1 text-sm font-medium text-brand-400">
                Mehr Leads & Anfragen
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="border-y border-white/10 bg-white/[0.02] py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Simple Preise
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Starte kostenlos, upgrade wenn du wächst
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
            {/* Free Plan */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
              <h3 className="text-lg font-semibold text-foreground">Free</h3>
              <p className="mt-2 text-sm text-muted-foreground">Perfekt zum Ausprobieren</p>
              <div className="mt-6">
                <span className="text-4xl font-bold text-foreground">0€</span>
                <span className="text-muted-foreground">/Monat</span>
              </div>
              <ul className="mt-8 space-y-4">
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-brand-400" />3 AI Credits pro Monat
                </li>
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-brand-400" />
                  Alle Templates
                </li>
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-brand-400" />
                  PDF Export
                </li>
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-brand-400" />
                  Watermark
                </li>
              </ul>
              <Button
                asChild
                variant="outline"
                className="mt-8 w-full border-white/10 bg-white/5 hover:bg-white/10"
              >
                <Link href="/editor">Kostenlos starten</Link>
              </Button>
            </div>

            {/* Pro Plan */}
            <div className="relative rounded-2xl border border-brand-500/50 bg-gradient-to-b from-brand-500/10 to-transparent p-8">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-brand-500 px-4 py-1 text-sm font-medium text-white">
                Beliebt
              </div>
              <h3 className="text-lg font-semibold text-foreground">Pro</h3>
              <p className="mt-2 text-sm text-muted-foreground">Für ambitionierte Creator</p>
              <div className="mt-6">
                <span className="text-4xl font-bold text-foreground">19€</span>
                <span className="text-muted-foreground">/Monat</span>
              </div>
              <ul className="mt-8 space-y-4">
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-brand-400" />
                  100 AI Credits pro Monat
                </li>
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-brand-400" />
                  Alle Templates
                </li>
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-brand-400" />
                  PDF Export ohne Watermark
                </li>
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-brand-400" />
                  Brand Kits
                </li>
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-brand-400" />
                  Premium Support
                </li>
              </ul>
              <Button asChild className="mt-8 w-full bg-brand-500 hover:bg-brand-600">
                <Link href="/pricing">Pro werden</Link>
              </Button>
            </div>

            {/* BYOK Plan */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
              <h3 className="text-lg font-semibold text-foreground">BYOK</h3>
              <p className="mt-2 text-sm text-muted-foreground">Bring your own API Key</p>
              <div className="mt-6">
                <span className="text-4xl font-bold text-foreground">9€</span>
                <span className="text-muted-foreground">/Monat</span>
              </div>
              <ul className="mt-8 space-y-4">
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-brand-400" />
                  Unlimitierte Generierungen
                </li>
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-brand-400" />
                  Eigene OpenAI API Keys
                </li>
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-brand-400" />
                  Alle Pro Features
                </li>
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-brand-400" />
                  Volle Datenkontrolle
                </li>
              </ul>
              <Button
                asChild
                variant="outline"
                className="mt-8 w-full border-white/10 bg-white/5 hover:bg-white/10"
              >
                <Link href="/pricing">BYOK starten</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.15),transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Bereit für bessere Carousels?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Starte kostenlos – keine Kreditkarte nötig.
            </p>
            <div className="mt-8">
              <Button
                asChild
                size="lg"
                className="h-12 bg-brand-500 px-8 text-base hover:bg-brand-600"
              >
                <Link href="/editor">
                  Jetzt loslegen
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
