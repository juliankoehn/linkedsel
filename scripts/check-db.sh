#!/bin/bash

# Check database health
# Usage: ./scripts/check-db.sh [url]

URL="${1:-http://localhost:3000}"

echo "Checking database health at $URL/api/health..."
echo ""

RESPONSE=$(curl -s "$URL/api/health")
STATUS=$(echo "$RESPONSE" | jq -r '.status' 2>/dev/null)

if [ "$STATUS" = "healthy" ]; then
  echo "✓ Database is healthy"
  echo "$RESPONSE" | jq '.'
  exit 0
else
  echo "✗ Database is NOT healthy"
  echo ""
  echo "$RESPONSE" | jq '.'
  echo ""
  echo "To fix this, run the migration in Supabase SQL Editor:"
  echo "  supabase/migrations/001_initial_schema.sql"
  exit 1
fi
