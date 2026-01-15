-- LinkedSel Database Seed Script
-- Run with: npx supabase db reset (applies migrations + seed)
-- Or manually: psql -f supabase/seed.sql

-- Clear existing template data (keeps user data intact)
DELETE FROM templates WHERE created_by IS NULL;

-- Seed default templates
INSERT INTO templates (id, name, category, data, thumbnail_url, is_premium, created_by) VALUES
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  '5 Tipps',
  'minimal',
  '{
    "slides": [
      {
        "id": "cover",
        "backgroundColor": "#ffffff",
        "elements": [
          {"type": "text", "props": {"text": "5 TIPPS", "left": 540, "top": 500, "fontSize": 120, "fontFamily": "Inter", "fill": "#000000", "fontWeight": "bold", "textAlign": "center"}},
          {"type": "text", "props": {"text": "für mehr Produktivität", "left": 540, "top": 650, "fontSize": 48, "fontFamily": "Inter", "fill": "#6b7280", "textAlign": "center"}},
          {"type": "shape", "props": {"shape": "rect", "left": 480, "top": 800, "width": 120, "height": 4, "fill": "#000000"}}
        ]
      }
    ]
  }',
  '/templates/minimal-tips.svg',
  false,
  NULL
),
(
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  'Bold Statement',
  'bold',
  '{
    "slides": [
      {
        "id": "cover",
        "backgroundColor": "#1e40af",
        "elements": [
          {"type": "text", "props": {"text": "DAS MUSST DU WISSEN", "left": 540, "top": 550, "fontSize": 72, "fontFamily": "Inter", "fill": "#ffffff", "fontWeight": "bold", "textAlign": "center", "width": 920}},
          {"type": "shape", "props": {"shape": "rect", "left": 440, "top": 700, "width": 200, "height": 8, "fill": "#fbbf24"}}
        ]
      }
    ]
  }',
  '/templates/bold-statement.svg',
  false,
  NULL
),
(
  'c3d4e5f6-a7b8-9012-cdef-123456789012',
  'Business Pro',
  'business',
  '{
    "slides": [
      {
        "id": "cover",
        "backgroundColor": "#0f172a",
        "elements": [
          {"type": "shape", "props": {"shape": "rect", "left": 0, "top": 1050, "width": 1080, "height": 300, "fill": "#0ea5e9"}},
          {"type": "text", "props": {"text": "BUSINESS", "left": 80, "top": 400, "fontSize": 96, "fontFamily": "Inter", "fill": "#ffffff", "fontWeight": "bold"}},
          {"type": "text", "props": {"text": "INSIGHTS", "left": 80, "top": 520, "fontSize": 96, "fontFamily": "Inter", "fill": "#0ea5e9", "fontWeight": "bold"}}
        ]
      }
    ]
  }',
  '/templates/business-pro.svg',
  true,
  NULL
),
(
  'd4e5f6a7-b8c9-0123-def0-234567890123',
  'Gradient Modern',
  'marketing',
  '{
    "slides": [
      {
        "id": "cover",
        "backgroundColor": "#7c3aed",
        "elements": [
          {"type": "shape", "props": {"shape": "circle", "left": 880, "top": -200, "radius": 400, "fill": "#ec4899"}},
          {"type": "text", "props": {"text": "SOCIAL MEDIA", "left": 540, "top": 500, "fontSize": 72, "fontFamily": "Inter", "fill": "#ffffff", "fontWeight": "bold", "textAlign": "center"}},
          {"type": "text", "props": {"text": "STRATEGIE", "left": 540, "top": 600, "fontSize": 72, "fontFamily": "Inter", "fill": "#fbbf24", "fontWeight": "bold", "textAlign": "center"}}
        ]
      }
    ]
  }',
  '/templates/gradient-modern.svg',
  true,
  NULL
),
(
  'e5f6a7b8-c9d0-1234-ef01-345678901234',
  'Step by Step',
  'education',
  '{
    "slides": [
      {
        "id": "cover",
        "backgroundColor": "#059669",
        "elements": [
          {"type": "text", "props": {"text": "SCHRITT FÜR", "left": 540, "top": 480, "fontSize": 64, "fontFamily": "Inter", "fill": "#d1fae5", "textAlign": "center"}},
          {"type": "text", "props": {"text": "SCHRITT", "left": 540, "top": 560, "fontSize": 96, "fontFamily": "Inter", "fill": "#ffffff", "fontWeight": "bold", "textAlign": "center"}}
        ]
      }
    ]
  }',
  '/templates/education-steps.svg',
  false,
  NULL
),
(
  'f6a7b8c9-d0e1-2345-f012-456789012345',
  'Personal Brand',
  'personal',
  '{
    "slides": [
      {
        "id": "cover",
        "backgroundColor": "#1f2937",
        "elements": [
          {"type": "text", "props": {"text": "MEINE", "left": 100, "top": 400, "fontSize": 48, "fontFamily": "Inter", "fill": "#f59e0b"}},
          {"type": "text", "props": {"text": "GESCHICHTE", "left": 100, "top": 470, "fontSize": 80, "fontFamily": "Inter", "fill": "#ffffff", "fontWeight": "bold"}}
        ]
      }
    ]
  }',
  '/templates/personal-brand.svg',
  false,
  NULL
);

-- Note: User-specific data (subscriptions, projects, brand_kits, api_keys)
-- is created dynamically when users sign up and interact with the app.
-- This seed only populates global/shared data like templates.
