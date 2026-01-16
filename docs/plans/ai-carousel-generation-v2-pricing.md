# AI Carousel Generation v2 - Pricing & Architecture

## Overview

Mehrstufiger AI-Generierungsprozess mit:
1. **Prompt Engineering** mit Few-Shot Examples
2. **Multi-Step Process** (Outline → Design → Layout → Final)
3. **Iterative Refinement** mit Validation

---

## Architektur: 4-Stufen-Pipeline

### Step 1: Content Outline Generation
**Zweck**: Generiere strukturierten Content-Plan

```
Input: Topic, Style, SlideCount, Language
Output: {
  slides: [
    { type: "hook", headline: "...", body: "...", cta?: "..." },
    { type: "content", headline: "...", bullets: [...] },
    { type: "cta", headline: "...", body: "...", button: "..." }
  ]
}
```

**API Call**: 1x OpenAI
- Model: gpt-4o-mini
- Input Tokens: ~500 (prompt) + ~100 (user input)
- Output Tokens: ~300-500 (je nach SlideCount)

**Kosten**: ~$0.0003 - $0.0005 pro Generation

---

### Step 2: Design System Generation
**Zweck**: Erstelle konsistentes Design basierend auf Brand Kit

```
Input: BrandKit, Style, ExistingSlides
Output: {
  colors: {
    primary: "#...",
    secondary: "#...",
    background: "#...",
    text: "#...",
    accent: "#..."
  },
  typography: {
    headline: { size: 56, weight: "bold" },
    subheadline: { size: 36, weight: "600" },
    body: { size: 24, weight: "normal" }
  },
  spacing: {
    padding: 60,
    gap: 24
  }
}
```

**API Call**: 1x OpenAI
- Model: gpt-4o-mini
- Input Tokens: ~400 (prompt + brand kit)
- Output Tokens: ~200

**Kosten**: ~$0.0002 pro Generation

---

### Step 3: Layout Generation (per Slide Type)
**Zweck**: Wähle/Generiere Layout-Template pro Slide

```
Input: SlideType, DesignSystem, CanvasDimensions
Output: {
  template: "hero-centered" | "two-column" | "list" | "quote" | "cta-bottom",
  regions: {
    headline: { x, y, width, height },
    body: { x, y, width, height },
    decorative?: [...]
  }
}
```

**Option A - Predefined Templates (Empfohlen)**
- Keine API Calls
- Templates im Code definiert
- AI wählt nur Template-ID

**Option B - AI-Generated Layouts**
- 1x API Call pro Slide
- Mehr Flexibilität, höhere Kosten

**Kosten Option A**: $0 (Templates)
**Kosten Option B**: ~$0.0002 pro Slide

---

### Step 4: Final Assembly + Validation
**Zweck**: Kombiniere Content + Design + Layout, validiere Ergebnis

```
Input: ContentOutline, DesignSystem, Layouts
Output: CarouselData (finales Schema)

Validation:
- Text passt in Regionen
- Keine Überlappungen
- Kontrast-Check (Text auf Background)
- Mindestabstände eingehalten
```

**API Call**: 1x OpenAI (für Refinement bei Validation-Fehlern)
- Model: gpt-4o-mini
- Input Tokens: ~800 (alles zusammen)
- Output Tokens: ~1000-2000 (vollständiges Carousel)

**Kosten**: ~$0.001 - $0.002 pro Generation

---

### Step 5: Iterative Refinement (Optional)
**Zweck**: Korrigiere Fehler aus Validation

```
Trigger: Validation-Fehler erkannt
- Textüberlappung
- Zu wenig Kontrast
- Elemente außerhalb Canvas

Action: Regeneriere betroffene Slides mit Fehler-Context
```

**API Call**: 0-3x pro Generation (nur bei Fehlern)
- Durchschnittlich: 0.5 Calls pro Generation

**Kosten**: ~$0.0005 durchschnittlich

---

## Gesamtkosten pro Carousel

### Minimale Pipeline (Option A - Templates)

| Step | API Calls | Tokens (in/out) | Kosten |
|------|-----------|-----------------|--------|
| 1. Content Outline | 1 | 600/400 | $0.0004 |
| 2. Design System | 1 | 400/200 | $0.0002 |
| 3. Layouts | 0 | - | $0 |
| 4. Assembly | 1 | 800/1500 | $0.0015 |
| 5. Refinement | 0.5 | 500/500 | $0.0003 |
| **Total** | **3.5** | **~4000** | **~$0.0024** |

### Maximale Pipeline (Option B - AI Layouts)

| Step | API Calls | Tokens (in/out) | Kosten |
|------|-----------|-----------------|--------|
| 1. Content Outline | 1 | 600/400 | $0.0004 |
| 2. Design System | 1 | 400/200 | $0.0002 |
| 3. Layouts (10 slides) | 10 | 3000/1000 | $0.002 |
| 4. Assembly | 1 | 800/1500 | $0.0015 |
| 5. Refinement | 1 | 500/500 | $0.0005 |
| **Total** | **14** | **~8000** | **~$0.0046** |

---

## Vergleich: Aktuell vs. Neu

| Metrik | Aktuell (v1) | Neu (v2 Min) | Neu (v2 Max) |
|--------|--------------|--------------|--------------|
| API Calls | 1 | 3.5 | 14 |
| Tokens | ~2000 | ~4000 | ~8000 |
| Kosten/Carousel | ~$0.001 | ~$0.0024 | ~$0.0046 |
| Qualität | Mittel | Hoch | Sehr Hoch |
| Konsistenz | Variabel | Hoch | Hoch |

**Kostensteigerung**: 2.4x - 4.6x für deutlich bessere Ergebnisse

---

## Credit-System Vorschlag

### Option 1: Einfache Credits
```
1 Credit = 1 Carousel Generation
Pro Plan: 50 Credits/Monat = €19.99
Extra Credits: €0.50 pro Credit
```

**Marge bei v2 (Template)**:
- Kosten: $0.0024 ≈ €0.0022
- Verkauf: €0.40 (bei 50 Credits für €19.99)
- Marge: €0.398 pro Generation = **99.5%**

### Option 2: Token-basierte Credits
```
1 Credit = 1000 Tokens
Carousel (v2 Template) = 4 Credits
Carousel (v2 AI Layout) = 8 Credits

Pro Plan: 200 Credits/Monat = €19.99
Extra Credits: €0.10 pro Credit
```

### Option 3: Tiered Quality
```
Basic Generation: 1 Credit (aktuelles v1)
Standard Generation: 2 Credits (v2 Template)
Premium Generation: 4 Credits (v2 AI Layout + mehr Refinement)

Pro Plan: 100 Credits/Monat
```

**Empfehlung**: Option 3 - Gibt Nutzern Kontrolle über Qualität/Kosten

---

## Implementierungs-Roadmap

### Phase 1: Multi-Step Pipeline
- [ ] Content Outline Schema + Generation
- [ ] Design System Schema + Generation
- [ ] Predefined Layout Templates
- [ ] Assembly Logic
- [ ] SSE Streaming für jeden Step

### Phase 2: Validation & Refinement
- [ ] Text-in-Region Validation
- [ ] Overlap Detection
- [ ] Contrast Checker
- [ ] Auto-Refinement Loop

### Phase 3: Credit System
- [ ] Database: user_credits Tabelle
- [ ] API: Credit-Check vor Generation
- [ ] API: Credit-Deduction nach Success
- [ ] UI: Credit-Anzeige + Kauf-Flow

---

## Token-Preise (Stand Januar 2025)

### OpenAI gpt-4o-mini
- Input: $0.15 / 1M tokens
- Output: $0.60 / 1M tokens

### OpenAI gpt-4o
- Input: $2.50 / 1M tokens
- Output: $10.00 / 1M tokens

### Anthropic Claude 3.5 Sonnet
- Input: $3.00 / 1M tokens
- Output: $15.00 / 1M tokens

**Empfehlung**: gpt-4o-mini für alle Steps außer eventuell Content Outline (könnte von gpt-4o profitieren)

---

## Risiken & Mitigations

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|------------|
| API Rate Limits | Mittel | Hoch | Queuing, Retry Logic |
| Validation Loop | Niedrig | Mittel | Max 3 Retries, Fallback |
| Inkonsistente Outputs | Mittel | Mittel | Structured Output, Few-Shot |
| Kosten-Explosion | Niedrig | Hoch | Hard Limits, Monitoring |

---

## Nächste Schritte

1. **Entscheidung**: Template-basiert (Option A) oder AI-Layouts (Option B)?
2. **Entscheidung**: Credit-System Modell (1, 2, oder 3)?
3. **Implementation**: Multi-Step Pipeline
4. **Testing**: A/B Test v1 vs v2 Qualität
