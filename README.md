# LinkedSel - LinkedIn Carousel Generator

Ein SaaS-Tool zum Erstellen professioneller LinkedIn Carousels mit KI-Unterstützung.

## Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Canvas:** Fabric.js 6
- **Backend:** Next.js API Routes, Supabase (Auth + DB + Storage)
- **Payments:** LemonSqueezy
- **AI:** OpenAI / Anthropic (BYOK oder Pro-Plan)

## Voraussetzungen

- Node.js 18+
- pnpm / npm / yarn
- Supabase Account (kostenlos)
- LemonSqueezy Account (für Payments)

## Setup

### 1. Repository klonen

```bash
git clone https://github.com/juliankoehn/linkedsel.git
cd linkedsel
npm install
```

### 2. Umgebungsvariablen

Kopiere `.env.example` zu `.env.local`:

```bash
cp .env.example .env.local
```

Fülle die Variablen aus:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# LemonSqueezy
LEMONSQUEEZY_API_KEY=
LEMONSQUEEZY_STORE_ID=
LEMONSQUEEZY_WEBHOOK_SECRET=
LEMONSQUEEZY_BYOK_VARIANT_ID=
LEMONSQUEEZY_PRO_VARIANT_ID=

# Encryption (generieren mit: openssl rand -hex 32)
ENCRYPTION_KEY=

# AI (optional - nur für Pro-Plan Server-seitig)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Supabase Setup

#### Option A: Supabase CLI (empfohlen)

```bash
# CLI installieren
npm install -g supabase

# Login
supabase login

# Projekt verknüpfen
supabase link --project-ref YOUR_PROJECT_REF

# Migrationen ausführen + Seed
supabase db reset
```

#### Option B: Manuell im Supabase Dashboard

1. Gehe zu SQL Editor
2. Führe nacheinander aus:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_storage_buckets.sql`
   - `supabase/migrations/003_add_lemon_customer_id.sql`
   - `supabase/seed.sql`

### 4. LemonSqueezy Setup

1. Erstelle einen Store auf [lemonsqueezy.com](https://lemonsqueezy.com)
2. Erstelle zwei Produkte:
   - **BYOK Plan** (z.B. 9€/Monat) - Nutzer bringen eigene API Keys
   - **Pro Plan** (z.B. 29€/Monat) - Inkl. AI Credits
3. Kopiere die Variant IDs in `.env.local`
4. Webhook einrichten:
   - URL: `https://deine-domain.com/api/webhooks/lemonsqueezy`
   - Events: `subscription_created`, `subscription_updated`, `subscription_cancelled`, `subscription_payment_success`
   - Secret in `LEMONSQUEEZY_WEBHOOK_SECRET` eintragen

### 5. Encryption Key generieren

```bash
openssl rand -hex 32
```

Diesen Wert als `ENCRYPTION_KEY` eintragen.

### 6. Development Server starten

```bash
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000)

## Projektstruktur

```
src/
├── app/
│   ├── (app)/           # Authenticated routes
│   │   ├── dashboard/   # Projekt-Übersicht
│   │   ├── editor/      # Canvas Editor
│   │   ├── templates/   # Template-Galerie
│   │   ├── brand-kits/  # Brand Kit Manager
│   │   └── settings/    # Account & API Keys
│   ├── (landing)/       # Public pages
│   ├── api/             # API Routes
│   └── auth/            # Auth callbacks
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── editor/          # Editor-spezifische Komponenten
│   └── landing/         # Landing page Komponenten
├── hooks/               # Custom React Hooks
├── lib/                 # Utilities & Services
├── stores/              # Zustand stores
└── types/               # TypeScript types
```

## Features

- **Canvas Editor** - Drag & Drop, Text, Shapes, Bilder
- **Templates** - 6 vorgefertigte Templates (4 Free, 2 Premium)
- **AI Generation** - Inhalte per KI generieren (OpenAI/Anthropic)
- **Brand Kits** - Farben & Fonts speichern
- **PDF Export** - Hochauflösender Export (Watermark für Free-User)
- **Subscriptions** - BYOK und Pro Plans via LemonSqueezy

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
npm run format   # Prettier
```

## Deployment

### Vercel (empfohlen)

1. Repo mit Vercel verbinden
2. Environment Variables setzen
3. Deployen

### Andere Plattformen

```bash
npm run build
npm run start
```

## Lizenz

MIT
