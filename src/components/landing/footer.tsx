import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent">
                <span className="text-sm font-bold text-white">S</span>
              </div>
              <span className="text-xl font-bold text-foreground">Stacked</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              LinkedIn Carousels mit KI erstellen. Von der Idee zum viralen Post in Sekunden.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Produkt</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/features"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Preise
                </Link>
              </li>
              <li>
                <Link
                  href="/editor"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Editor
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Unternehmen</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Über uns
                </Link>
              </li>
              <li>
                <a
                  href="mailto:hello@stacked.ai"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Kontakt
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Rechtliches</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/impressum"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Impressum
                </Link>
              </li>
              <li>
                <Link
                  href="/datenschutz"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link
                  href="/agb"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  AGB
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Stacked. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  )
}
