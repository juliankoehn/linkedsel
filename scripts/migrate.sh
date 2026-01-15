#!/bin/bash
set -e

# Skip migrations if no credentials
if [ -z "$SUPABASE_ACCESS_TOKEN" ] || [ -z "$SUPABASE_PROJECT_REF" ]; then
  echo "⚠️  Skipping migrations: SUPABASE_ACCESS_TOKEN or SUPABASE_PROJECT_REF not set"
  exit 0
fi

if [ -z "$SUPABASE_DB_PASSWORD" ]; then
  echo "⚠️  Skipping migrations: SUPABASE_DB_PASSWORD not set"
  exit 0
fi

echo "🔄 Running database migrations..."

# Link to project
npx supabase link --project-ref "$SUPABASE_PROJECT_REF" --password "$SUPABASE_DB_PASSWORD"

# Push migrations
npx supabase db push

echo "✅ Migrations complete"
