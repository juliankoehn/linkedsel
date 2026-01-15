# LinkedSel - LinkedIn Carousel Generator

A SaaS tool for creating professional LinkedIn carousels with AI support.

## Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Canvas:** Fabric.js 6
- **Backend:** Next.js API Routes, Supabase (Auth + DB + Storage)
- **Payments:** LemonSqueezy
- **AI:** OpenAI / Anthropic (BYOK or Pro plan)

## Prerequisites

- Node.js 18+
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
2. Execute in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_storage_buckets.sql`
   - `supabase/migrations/003_add_lemon_customer_id.sql`
   - `supabase/seed.sql`

### 4. LemonSqueezy setup

1. Create a store on [lemonsqueezy.com](https://lemonsqueezy.com)
2. Create two products:
   - **BYOK Plan** (e.g. $9/month) - Users bring their own API keys
   - **Pro Plan** (e.g. $29/month) - Includes AI credits
3. Copy the variant IDs to `.env.local`
4. Set up webhook:
   - URL: `https://your-domain.com/api/webhooks/lemonsqueezy`
   - Events: `subscription_created`, `subscription_updated`, `subscription_cancelled`, `subscription_payment_success`
   - Add secret to `LEMONSQUEEZY_WEBHOOK_SECRET`

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

- **Canvas Editor** - Drag & drop, text, shapes, images
- **Templates** - 6 pre-built templates (4 free, 2 premium)
- **AI Generation** - Generate content via AI (OpenAI/Anthropic)
- **Brand Kits** - Save colors & fonts
- **PDF Export** - High-resolution export (watermark for free users)
- **Subscriptions** - BYOK and Pro plans via LemonSqueezy

## Scripts

```bash
pnpm dev       # Development server
pnpm build     # Production build
pnpm start     # Production server
pnpm lint      # ESLint
pnpm format    # Prettier
```

## Deployment

### Vercel (recommended)

1. Connect repo to Vercel
2. Set environment variables
3. Deploy

### Other platforms

```bash
pnpm build
pnpm start
```

## License

MIT
