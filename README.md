# Stacked - LinkedIn Carousel Generator

Create viral LinkedIn carousels in seconds with AI. The fastest way from idea to finished post.

Built by [Julian Koehn](https://julian.pro)

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui
- **Canvas:** Konva.js
- **Backend:** Next.js API Routes, Supabase (Auth + DB + Storage)
- **Payments:** LemonSqueezy
- **AI:** OpenAI / Anthropic (BYOK or Pro plan)

## Prerequisites

- Node.js 20+
- pnpm
- Supabase account (free tier available)
- LemonSqueezy account (for payments)

## Setup

### 1. Clone repository

```bash
git clone https://github.com/juliankoehn/linkedsel.git
cd linkedsel
pnpm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in the variables:

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

# Encryption (generate with: openssl rand -hex 32)
ENCRYPTION_KEY=

# AI (optional - only for Pro plan server-side)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Unsplash (for AI-generated images)
UNSPLASH_ACCESS_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Supabase setup

#### Option A: Supabase CLI (recommended)

```bash
# Install CLI
pnpm add -g supabase

# Login
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations + seed
supabase db reset
```

#### Option B: Manual via Supabase Dashboard

1. Go to SQL Editor
2. Execute migrations in order from `supabase/migrations/`

### 4. LemonSqueezy setup

1. Create a store on [lemonsqueezy.com](https://lemonsqueezy.com)
2. Create products:
   - **Free Plan** - 3 AI credits/month
   - **Pro Plan** ($19/month) - 100 AI credits/month
   - **BYOK Plan** ($9/month) - Unlimited with own API keys
3. Copy the variant IDs to `.env.local`
4. Set up webhook:
   - URL: `https://your-domain.com/api/webhooks/lemonsqueezy`
   - Events: `subscription_created`, `subscription_updated`, `subscription_cancelled`, `subscription_payment_success`

### 5. Generate encryption key

```bash
openssl rand -hex 32
```

Add this value as `ENCRYPTION_KEY`.

### 6. Start development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── (app)/           # Authenticated routes
│   │   ├── dashboard/   # Project overview
│   │   ├── editor/      # Canvas editor
│   │   ├── templates/   # Template gallery
│   │   ├── brand-kits/  # Brand kit manager
│   │   └── settings/    # Account & API keys
│   ├── (landing)/       # Public pages
│   ├── api/             # API routes
│   └── auth/            # Auth callbacks
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── editor/          # Editor-specific components
│   └── landing/         # Landing page components
├── hooks/               # Custom React hooks
├── lib/                 # Utilities & services
├── stores/              # Zustand stores
└── types/               # TypeScript types
```

## Features

- **AI Carousel Generation** - Generate complete carousels from a topic
- **Canvas Editor** - Drag & drop, text, shapes, images
- **Templates** - Professional templates for every use case
- **Brand Kits** - Save colors, fonts & logos
- **PDF Export** - LinkedIn-ready PDF export
- **Credit System** - Free tier with 3 credits, Pro with 100/month

## Scripts

```bash
pnpm dev        # Development server
pnpm build      # Production build
pnpm start      # Production server
pnpm check      # Biome lint + format
pnpm typecheck  # TypeScript check
pnpm db:migrate # Run Supabase migrations
```

## Deployment

### Vercel (recommended)

1. Connect repo to Vercel
2. Set environment variables from `.env.example`
3. Deploy - migrations run automatically

## Author

**Julian Koehn** - [julian.pro](https://julian.pro)

## License

MIT
