# LinkedSel - AI Assistant Instructions

## Project Overview

LinkedSel is a LinkedIn Carousel Generator web application. Users can create professional carousel posts from templates or uploaded images, with optional AI content generation.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (Strict Mode)
- **UI:** React 19 + TailwindCSS v4 + Radix UI
- **State:** Zustand
- **Canvas:** Fabric.js
- **Backend:** Supabase (Auth, PostgreSQL, Storage, Edge Functions)
- **Payments:** LemonSqueezy
- **Analytics:** PostHog
- **Consent:** c15t
- **Hosting:** Vercel

## Code Standards

### General Principles

- **DRY (Don't Repeat Yourself):** Extract common logic into reusable functions/hooks/components
- **Enterprise Quality:** Write production-ready code, not prototypes
- **Type Safety:** Never use `any`, always define proper types
- **Error Handling:** Handle errors gracefully with user-friendly messages

### File Organization

```
src/
├── app/                    # Next.js App Router pages
│   ├── (landing)/          # Public landing pages (SSG)
│   └── (app)/              # Protected app pages (Client)
├── components/
│   ├── ui/                 # Base UI components (Radix-based)
│   ├── editor/             # Canvas editor components
│   ├── templates/          # Template-related components
│   └── landing/            # Landing page components
├── lib/                    # Utilities and service abstractions
├── stores/                 # Zustand stores
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript type definitions
└── config/                 # Application configuration
```

### Naming Conventions

- **Files:** kebab-case (`user-profile.tsx`, `use-auth.ts`)
- **Components:** PascalCase (`UserProfile`, `EditorCanvas`)
- **Functions/Variables:** camelCase (`getUserData`, `isLoading`)
- **Types/Interfaces:** PascalCase with descriptive names (`UserProfile`, `CarouselProject`)
- **Constants:** SCREAMING_SNAKE_CASE (`MAX_SLIDES`, `API_ENDPOINTS`)

### Component Guidelines

```typescript
// Good: Small, focused components
export function SlidePreview({ slide, onSelect }: SlidePreviewProps) {
  // Single responsibility
}

// Bad: Large, monolithic components doing everything
export function Editor() {
  // 500 lines of mixed concerns
}
```

### State Management

- Use **Zustand** for global state (auth, projects, UI state)
- Use **React Query / SWR** patterns for server state
- Use **local state** for component-specific UI state
- Keep stores small and focused

```typescript
// Good: Focused store
export const useEditorStore = create<EditorState>((set) => ({
  selectedSlide: null,
  setSelectedSlide: (slide) => set({ selectedSlide: slide }),
}))

// Bad: God store with everything
export const useStore = create((set) => ({
  // 50 different state slices
}))
```

### API & Data Fetching

- Use Supabase client for all database operations
- Implement proper error handling
- Use TypeScript types from Supabase generated types

```typescript
// Good
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .eq('user_id', userId)

if (error) throw new DatabaseError(error.message)

// Bad
const data = await supabase.from('projects').select('*')
// No error handling, no type safety
```

### Styling

- Use **TailwindCSS** for all styling
- Use **Radix UI** primitives for accessible components
- Follow mobile-first responsive design
- Use CSS variables for theming

```typescript
// Good: Semantic, responsive classes
<div className="flex flex-col gap-4 md:flex-row md:gap-6">

// Bad: Arbitrary values, no responsiveness
<div style={{ display: 'flex', gap: '16px' }}>
```

## Testing Requirements

- **Unit Tests:** Vitest for utilities and hooks
- **Component Tests:** Testing Library for React components
- **E2E Tests:** Playwright for critical user flows
- Minimum coverage: 80% for utilities, critical path E2E coverage

## Git Workflow

- **main:** Production branch, auto-deploys to Vercel
- **Feature branches:** `feature/description`
- **Fix branches:** `fix/description`
- PRs require passing CI checks before merge
- Squash merge to keep history clean

### Commit Messages

Follow conventional commits:

```
feat: add carousel export functionality
fix: resolve image upload validation
docs: update API documentation
chore: upgrade dependencies
```

## Environment Variables

Required variables (see `.env.example`):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
LEMONSQUEEZY_API_KEY=
LEMONSQUEEZY_WEBHOOK_SECRET=
OPENAI_API_KEY=
```

## Common Tasks

### Adding a New Page

1. Create route in `src/app/(landing)/` or `src/app/(app)/`
2. Landing pages: SSG-compatible (no client hooks at top level)
3. App pages: Add `"use client"` if needed, ensure auth protection

### Adding a New Component

1. Create in appropriate `src/components/` subdirectory
2. Co-locate types with component or in `src/types/`
3. Export from barrel file if public API

### Database Changes

1. Create migration in `supabase/migrations/`
2. Update TypeScript types if needed
3. Test locally with `supabase db reset`
4. Deploy via Supabase dashboard or CLI

## Performance Guidelines

- Lazy load heavy components (Editor, PDF export)
- Use `next/image` for all images
- Implement proper loading states
- Target Lighthouse score >90

## Security Checklist

- [ ] User input sanitized
- [ ] RLS policies on all tables
- [ ] API keys never exposed to client
- [ ] Rate limiting on expensive operations
- [ ] CSRF protection enabled

## Useful Commands

```bash
# Development
pnpm dev                 # Start dev server
pnpm build               # Production build
pnpm lint                # Run ESLint
pnpm typecheck           # TypeScript check
pnpm test                # Run tests
pnpm test:e2e            # Run E2E tests

# Supabase
pnpm supabase:start      # Start local Supabase
pnpm supabase:migrate    # Run migrations
pnpm supabase:types      # Generate TypeScript types

# Database
pnpm db:seed             # Seed database with test data
pnpm db:reset            # Reset database
```
