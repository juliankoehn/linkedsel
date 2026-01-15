#!/bin/bash
set -e

# Skip migrations if no credentials
if [ -z "$SUPABASE_ACCESS_TOKEN" ] || [ -z "$SUPABASE_PROJECT_REF" ]; then
  echo "⚠️  Skipping migrations: SUPABASE_ACCESS_TOKEN or SUPABASE_PROJECT_REF not set"
  exit 0
fi

if [ -z "$POSTGRES_PASSWORD" ]; then
  echo "⚠️  Skipping migrations: POSTGRES_PASSWORD not set"
  exit 0
fi

echo "🔄 Running database migrations..."

# Link to project
npx supabase link --project-ref "$SUPABASE_PROJECT_REF" --password "$POSTGRES_PASSWORD"

# Push migrations
npx supabase db push

echo "✅ Migrations complete"
