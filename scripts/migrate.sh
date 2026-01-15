#!/bin/bash
set -e

# Skip migrations in development/preview if no credentials
if [ -z "$SUPABASE_ACCESS_TOKEN" ] || [ -z "$SUPABASE_PROJECT_REF" ]; then
  echo "⚠️  Skipping migrations: SUPABASE_ACCESS_TOKEN or SUPABASE_PROJECT_REF not set"
  exit 0
fi

echo "🔄 Running database migrations..."

# Link to project and push migrations
npx supabase link --project-ref "$SUPABASE_PROJECT_REF"
npx supabase db push

echo "✅ Migrations complete"
