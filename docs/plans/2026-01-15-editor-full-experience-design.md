# Editor Full Experience Design

## Overview

Comprehensive upgrade of the LinkedSel editor for creating LinkedIn carousels with a professional, feature-rich experience comparable to Canva.

## 1. New Shapes & Lines

### New Element Types

**Arrow Element:**
```typescript
interface ArrowElement extends BaseElement {
  type: 'arrow'
  points: number[] // [x1, y1, x2, y2]
  stroke: string
  strokeWidth: number
  pointerLength: number
  pointerWidth: number
  pointerAtStart?: boolean
  pointerAtEnd?: boolean
  lineCap?: 'butt' | 'round' | 'square'
  dash?: number[]
}
```

**Line Element (enhance existing):**
```typescript
interface LineElement extends BaseElement {
  type: 'line'
  points: number[] // [x1, y1, x2, y2]
  stroke: string
  strokeWidth: number
  lineCap?: 'butt' | 'round' | 'square'
  dash?: number[] // e.g., [10, 5] for dashed
}
```

**Triangle Element:**
```typescript
interface TriangleElement extends BaseElement {
  type: 'triangle'
  fill: string
  stroke?: string
  strokeWidth?: number
  // Uses RegularPolygon with sides=3
}
```

**Star Element:**
```typescript
interface StarElement extends BaseElement {
  type: 'star'
  fill: string
  stroke?: string
  strokeWidth?: number
  numPoints: number // default 5
  innerRadius: number
  outerRadius: number
}
```

**Polygon Element:**
```typescript
interface PolygonElement extends BaseElement {
  type: 'polygon'
  fill: string
  stroke?: string
  strokeWidth?: number
  sides: number // 3=triangle, 5=pentagon, 6=hexagon
}
```

### Toolbar Extension

```
[Text] [Image] [Rect] [Circle] [▼ More] [Line] [Arrow]
                        └─ Triangle
                        └─ Star
                        └─ Polygon (with sides selector)
```

### Files to Create/Modify

- `src/stores/slides-store.ts` - Add new element types
- `src/components/editor/konva-elements/arrow-element.tsx` - New
- `src/components/editor/konva-elements/line-element.tsx` - New
- `src/components/editor/konva-elements/polygon-element.tsx` - New (triangle, star, polygon)
- `src/components/editor/toolbar.tsx` - Add shape dropdown

---

## 2. Colors & Gradients

### Fill Type

```typescript
type GradientStop = { offset: number; color: string }

type GradientFill = {
  type: 'linear' | 'radial'
  colorStops: GradientStop[]
  // Linear gradient direction
  start?: { x: number; y: number }
  end?: { x: number; y: number }
  // Radial gradient
  center?: { x: number; y: number }
  radius?: number
}

type Fill = string | GradientFill
```

### Color Presets

```typescript
const COLOR_PALETTES = {
  linkedin: ['#0A66C2', '#004182', '#70B5F9', '#9ECBFF', '#E7F3FF'],
  professional: ['#1a1a1a', '#4a4a4a', '#7a7a7a', '#e5e5e5', '#ffffff'],
  vibrant: ['#7C3AED', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'],
  pastel: ['#FDE68A', '#A7F3D0', '#BFDBFE', '#DDD6FE', '#FBCFE8'],
  dark: ['#111827', '#1F2937', '#374151', '#4B5563', '#6B7280'],
}
```

### Color Picker Component

```
┌─────────────────────────────┐
│ [Solid] [Gradient]          │
├─────────────────────────────┤
│ Brand Colors: ● ● ● ●       │
│ Recent:       ● ● ● ● ● ●   │
├─────────────────────────────┤
│ ┌─────────────────────┐     │
│ │   Color Spectrum    │     │
│ └─────────────────────┘     │
│ Hex: #3B82F6  Opacity: 100% │
└─────────────────────────────┘
```

### Files to Create/Modify

- `src/stores/canvas-store.ts` - Add recentColors, color palettes
- `src/components/editor/color-picker/index.tsx` - New
- `src/components/editor/color-picker/gradient-picker.tsx` - New
- `src/components/editor/color-picker/color-presets.tsx` - New
- `src/lib/colors.ts` - Color utility functions

---

## 3. Text Enhancements

### Extended TextElement

```typescript
interface TextElement extends BaseElement {
  type: 'text'
  text: string
  fontSize: number
  fontFamily: string
  fontWeight: string
  fontStyle: 'normal' | 'italic'
  textAlign: 'left' | 'center' | 'right'
  fill: string | GradientFill

  // New properties
  textDecoration?: 'none' | 'underline' | 'line-through'
  lineHeight?: number      // 0.8 - 2.5, default 1.2
  letterSpacing?: number   // -5 to +20, default 0

  // Text effects
  shadow?: {
    enabled: boolean
    offsetX: number
    offsetY: number
    blur: number
    color: string
  }

  // Text stroke/outline
  stroke?: string
  strokeWidth?: number
}
```

### Google Fonts

Pre-loaded fonts (subset for performance):
- Inter, Roboto, Open Sans, Montserrat, Poppins
- Playfair Display, Merriweather, Lora
- Oswald, Bebas Neue, Anton
- Fira Code, JetBrains Mono

```typescript
const FONT_OPTIONS = [
  { name: 'Inter', weights: ['400', '500', '600', '700'] },
  { name: 'Roboto', weights: ['400', '500', '700'] },
  { name: 'Montserrat', weights: ['400', '500', '600', '700', '800'] },
  // ...
]
```

### Files to Create/Modify

- `src/stores/slides-store.ts` - Extend TextElement
- `src/components/editor/konva-elements/text-element.tsx` - Add shadow, stroke
- `src/components/editor/toolbar.tsx` - Add text decoration buttons
- `src/components/editor/font-picker.tsx` - New
- `src/app/layout.tsx` - Add Google Fonts link

---

## 4. Alignment & Layout Tools

### Store Actions

```typescript
interface SlidesActions {
  // ... existing

  // Alignment
  alignElements: (
    ids: string[],
    alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'
  ) => void

  // Distribution
  distributeElements: (
    ids: string[],
    direction: 'horizontal' | 'vertical'
  ) => void

  // Grouping
  groupElements: (ids: string[]) => string // returns group id
  ungroupElements: (groupId: string) => void

  // Utility
  matchSize: (ids: string[], property: 'width' | 'height') => void
}
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+G` | Group selected elements |
| `Cmd+Shift+G` | Ungroup |
| `Cmd+D` | Duplicate selection |
| `Cmd+L` | Lock/Unlock |
| `Cmd+[` | Send backward |
| `Cmd+]` | Bring forward |
| `Cmd+Shift+[` | Send to back |
| `Cmd+Shift+]` | Bring to front |

### Alignment Toolbar

```
│ Align: [⫷][⫿][⫸] [⊤][⊡][⊥] │ Distribute: [↔][↕] │
```

Only visible when elements are selected. Distribute only when ≥3 elements selected.

### Files to Create/Modify

- `src/stores/slides-store.ts` - Add alignment/distribute actions
- `src/components/editor/alignment-toolbar.tsx` - New
- `src/components/editor/konva-canvas.tsx` - Add keyboard shortcuts
- `src/lib/konva/alignment-utils.ts` - New

---

## 5. Properties Panel (Right Sidebar)

### Component Structure

```
src/components/editor/properties-panel/
  index.tsx              # Main container, shows based on selection
  position-section.tsx   # X, Y, W, H, Rotation
  appearance-section.tsx # Fill, Stroke, Opacity
  typography-section.tsx # Font, Size, Weight, Align (text only)
  effects-section.tsx    # Shadow, Outline (text only)
  layer-section.tsx      # Lock, Visibility, Z-order
```

### Panel Layout

```
┌─────────────────────────────┐
│ [Element Type]            ✕ │
├─────────────────────────────┤
│ Position                    │
│ X: [___]    Y: [___]        │
│ W: [___]    H: [___]   🔗   │
│ Rotation: [___°]            │
├─────────────────────────────┤
│ Appearance                  │
│ Fill:    [Color Picker]     │
│ Stroke:  [Color Picker]     │
│ Width:   [___]              │
├─────────────────────────────┤
│ Opacity: [━━━━━━━●━━] 100%  │
├─────────────────────────────┤
│ Layer                       │
│ [🔓] [👁] [⬆][↑][↓][⬇]      │
└─────────────────────────────┘
```

### Integration

- Panel appears on right side when element(s) selected
- Closes when clicking empty canvas
- Updates in real-time as properties change
- Supports multi-selection (shows common properties)

### Files to Create

- `src/components/editor/properties-panel/index.tsx`
- `src/components/editor/properties-panel/position-section.tsx`
- `src/components/editor/properties-panel/appearance-section.tsx`
- `src/components/editor/properties-panel/typography-section.tsx`
- `src/components/editor/properties-panel/effects-section.tsx`
- `src/components/editor/properties-panel/layer-section.tsx`

---

## 6. Icons & Graphics

### Icon Element

```typescript
interface IconElement extends BaseElement {
  type: 'icon'
  iconName: string  // Lucide icon name, e.g., 'rocket', 'target'
  fill: string
  stroke?: string
  strokeWidth?: number
}
```

### Icon Picker Modal

```
┌─────────────────────────────────────┐
│ Icons                             ✕ │
├─────────────────────────────────────┤
│ 🔍 Search icons...                  │
├─────────────────────────────────────┤
│ Recent: [⭐] [🎯] [📈] [🚀]         │
├─────────────────────────────────────┤
│ Categories:                         │
│ [All] [Arrows] [Business] [Social]  │
│ [Tech] [People] [Charts] [Media]    │
├─────────────────────────────────────┤
│ ┌───┬───┬───┬───┬───┬───┬───┬───┐  │
│ │ ☑ │ ✓ │ ★ │ → │ ● │ ◆ │ ▶ │ ♦ │  │
│ ├───┼───┼───┼───┼───┼───┼───┼───┤  │
│ │ 💡│ 🎯│ 📈│ 🚀│ 💬│ ⚡│ 🔥│ ✨│  │
│ └───┴───┴───┴───┴───┴───┴───┴───┘  │
└─────────────────────────────────────┘
```

### Implementation

Using Lucide React (already installed):
- Export icon as SVG path
- Render as Konva.Path or Konva.Shape
- Allow fill/stroke customization

### Icon Categories

```typescript
const ICON_CATEGORIES = {
  arrows: ['arrow-right', 'arrow-left', 'arrow-up', 'arrow-down', 'chevron-right', ...],
  business: ['briefcase', 'building', 'calendar', 'clock', 'dollar-sign', ...],
  social: ['linkedin', 'twitter', 'share', 'heart', 'message-circle', ...],
  tech: ['code', 'database', 'cloud', 'server', 'terminal', ...],
  people: ['user', 'users', 'user-check', 'user-plus', ...],
  charts: ['bar-chart', 'line-chart', 'pie-chart', 'trending-up', ...],
  media: ['image', 'video', 'music', 'mic', 'camera', ...],
}
```

### Files to Create

- `src/components/editor/icon-picker/index.tsx`
- `src/components/editor/icon-picker/icon-grid.tsx`
- `src/components/editor/icon-picker/icon-categories.ts`
- `src/components/editor/konva-elements/icon-element.tsx`
- `src/stores/slides-store.ts` - Add IconElement type

---

## 7. Export Enhancements

### Export Options

```typescript
interface ExportOptions {
  format: 'pdf' | 'png' | 'jpg'
  quality: number        // 0.1 - 1.0 for jpg
  pixelRatio: 1 | 2 | 3  // Resolution multiplier
  slides: 'all' | 'current' | number[]
  includeWatermark: boolean
}
```

### Export Modal

```
┌─────────────────────────────┐
│ Export                    ✕ │
├─────────────────────────────┤
│ Format: [PDF ▼]             │
│                             │
│ Slides:                     │
│ ○ All slides                │
│ ○ Current slide only        │
│ ○ Custom range              │
│                             │
│ Quality: [High ▼]           │
│ (Standard / High / Print)   │
│                             │
│ □ Include watermark         │
│   (Premium: can disable)    │
├─────────────────────────────┤
│        [Cancel] [Export]    │
└─────────────────────────────┘
```

### Files to Create/Modify

- `src/hooks/use-export.ts` - Extend with PNG/JPG, options
- `src/components/editor/export-modal.tsx` - New

---

## Implementation Order

### Phase 1: Core Shapes (Priority: High)
1. Line element with dash support
2. Arrow element
3. Update toolbar with new shapes

### Phase 2: Colors (Priority: High)
4. Color picker component with presets
5. Gradient support in store
6. Apply gradients to shapes

### Phase 3: Text (Priority: Medium)
7. Text decoration (underline, strikethrough)
8. Text shadow effect
9. Line height & letter spacing
10. Font picker with Google Fonts

### Phase 4: Layout (Priority: Medium)
11. Alignment tools
12. Distribute functions
13. Keyboard shortcuts for grouping

### Phase 5: Properties Panel (Priority: Medium)
14. Panel structure
15. Position/Size inputs
16. Appearance controls
17. Layer controls

### Phase 6: Icons (Priority: Low)
18. Icon element type
19. Icon picker modal
20. Lucide integration

### Phase 7: Export (Priority: Low)
21. PNG/JPG export
22. Export options modal

---

## Performance Considerations

1. **Lazy load** Google Fonts - only load when font picker opens
2. **Virtualize** icon grid - render only visible icons
3. **Debounce** property panel inputs - avoid excessive re-renders
4. **Memoize** Konva elements - use React.memo for element components
5. **Batch** store updates - use updateElements for multi-element changes
