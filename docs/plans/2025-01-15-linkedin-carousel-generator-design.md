# LinkedIn Carousel Generator - Design Document

**Date:** 2025-01-15
**Status:** Approved
**Author:** Julian Koehn

## Overview

A web application that generates LinkedIn carousels from uploaded images or customizable templates. Users can create professional carousel posts with minimal effort.

## Business Model

- **Freemium with Watermark**: Unlimited carousels with watermark, subscription removes watermark + unlocks AI features
- **BYOK (Bring Your Own Key)**: Users can use their own AI API keys for cheaper usage
- **Paid AI**: Users without BYOK pay via subscription for AI content generation

## Tech Stack

| Layer     | Technology                                   |
| --------- | -------------------------------------------- |
| Framework | Next.js 16 (App Router)                      |
| Language  | TypeScript (Strict Mode)                     |
| UI        | React 19                                     |
| Styling   | TailwindCSS v4 + Radix UI                    |
| State     | Zustand                                      |
| Canvas    | Fabric.js                                    |
| Export    | jsPDF + html-to-image                        |
| Backend   | Supabase (Auth, DB, Storage, Edge Functions) |
| Payments  | LemonSqueezy (Merchant of Record)            |
| Analytics | PostHog                                      |
| Consent   | c15t                                         |
| Hosting   | Vercel (Free Tier)                           |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      NEXT.JS 16                             │
│              App Router + Static Export                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   LANDING (SSG)              APP (Client Components)        │
│   ┌─────────────┐            ┌─────────────────────────┐   │
│   │ / (Home)    │            │ /app/editor             │   │
│   │ /pricing    │            │ /app/templates          │   │
│   │ /features   │            │ /app/brand-kits         │   │
│   │ /blog/*     │            │ /app/dashboard          │   │
│   │ /impressum  │            │ /app/settings           │   │
│   │ /datenschutz│            └─────────────────────────┘   │
│   └─────────────┘                  "use client"            │
│        SSG                                                  │
├─────────────────────────────────────────────────────────────┤
│                       SUPABASE                              │
│         Auth │ PostgreSQL │ Storage │ Edge Functions        │
├─────────────────────────────────────────────────────────────┤
│                    EXTERNAL                                 │
│      PostHog │ c15t │ LemonSqueezy │ OpenAI/Anthropic      │
└─────────────────────────────────────────────────────────────┘
```

## Data Model

### Tables

```sql
-- Subscriptions (synced from LemonSqueezy via Webhook)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  status TEXT NOT NULL,
  lemon_subscription_id TEXT UNIQUE,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects (Carousel Projects)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brand Kits
CREATE TABLE brand_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  colors JSONB NOT NULL DEFAULT '[]',
  fonts JSONB NOT NULL DEFAULT '[]',
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Templates (Admin-managed + User custom)
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  thumbnail_url TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Keys (BYOK - encrypted)
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  encrypted_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security

All tables implement RLS policies ensuring users can only access their own data.

## Features

### MVP Features

1. **Template Gallery**
   - Pre-designed carousel templates
   - Categories: Business, Marketing, Personal Brand, etc.
   - Premium templates for subscribers

2. **Editor**
   - Drag & drop image upload
   - Text editing with fonts
   - Color customization
   - Slide management (add, remove, reorder)
   - Real-time preview

3. **Brand Kits**
   - Save brand colors
   - Custom fonts
   - Logo upload
   - Apply to templates with one click

4. **Export**
   - PDF (LinkedIn native format)
   - PNG (individual slides)
   - Watermark on free tier

5. **AI Content Generation**
   - Generate carousel content from topic
   - BYOK support (OpenAI, Anthropic)
   - Paid tier via our API proxy

6. **Authentication**
   - Google OAuth
   - Magic Link
   - Session management

7. **Subscription**
   - Free tier (watermark)
   - Pro tier (no watermark, AI, premium templates)
   - Managed via LemonSqueezy

### Legal Pages

- Impressum (German legal requirement)
- Datenschutzerklärung (Privacy Policy, GDPR)
- Cookie consent via c15t

## Project Structure

```
linkedsel/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (landing)/          # Landing pages (SSG)
│   │   │   ├── page.tsx        # Home
│   │   │   ├── pricing/
│   │   │   ├── features/
│   │   │   ├── impressum/
│   │   │   └── datenschutz/
│   │   ├── (app)/              # App pages (Client)
│   │   │   ├── layout.tsx      # Auth wrapper
│   │   │   ├── editor/
│   │   │   ├── templates/
│   │   │   ├── brand-kits/
│   │   │   ├── dashboard/
│   │   │   └── settings/
│   │   ├── api/                # API routes
│   │   │   ├── webhooks/
│   │   │   │   └── lemonsqueezy/
│   │   │   └── ai/
│   │   └── auth/               # Auth routes
│   ├── components/
│   │   ├── ui/                 # Base components (Radix)
│   │   ├── editor/             # Editor components
│   │   ├── templates/          # Template components
│   │   └── landing/            # Landing page components
│   ├── lib/
│   │   ├── supabase/           # Supabase client & utils
│   │   ├── lemonsqueezy/       # Payment utils
│   │   ├── ai/                 # AI service abstraction
│   │   ├── canvas/             # Fabric.js utils
│   │   └── export/             # PDF/PNG export
│   ├── stores/                 # Zustand stores
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript types
│   └── config/                 # App configuration
├── public/
│   ├── templates/              # Default template assets
│   └── fonts/                  # Custom fonts
├── supabase/
│   ├── migrations/             # Database migrations
│   └── functions/              # Edge functions
├── docs/
│   └── plans/                  # Design documents
├── .github/
│   └── workflows/              # CI/CD
├── CLAUDE.md                   # AI assistant instructions
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## CI/CD Pipeline

### GitHub Actions

1. **PR Checks**
   - TypeScript type checking
   - ESLint
   - Prettier format check
   - Unit tests (Vitest)
   - E2E tests (Playwright)

2. **Deploy**
   - Automatic deploy to Vercel on main
   - Preview deployments for PRs

## Security Considerations

- API keys encrypted at rest (Supabase vault or encrypted column)
- RLS on all database tables
- CSRF protection via Next.js
- Rate limiting on AI endpoints
- Input sanitization for user content

## Performance Targets

- Lighthouse Score: >90
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Bundle size: <200KB (initial)

## Future Considerations

- Team collaboration features
- Custom template builder
- LinkedIn API integration (direct posting)
- More export formats (Video, Instagram)
