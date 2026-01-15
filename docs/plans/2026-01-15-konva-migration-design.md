# Konva.js Migration Design

**Date:** 2026-01-15
**Status:** Approved
**Approach:** Big Bang Migration

## Overview

Migrate the canvas editor from Fabric.js to Konva.js (react-konva) for better React integration, declarative rendering, and built-in features like snapping and transformers.

## Architecture

```
src/
├── stores/
│   ├── canvas-store.ts      # Stage config, zoom, pan, grid, guidelines
│   ├── slides-store.ts      # Slide data, elements CRUD
│   ├── selection-store.ts   # Selected IDs, multi-select state
│   ├── history-store.ts     # Undo/redo stack
│   └── project-store.ts     # Project metadata, save state
├── components/editor/
│   ├── konva-canvas.tsx     # Main Stage component
│   ├── konva-elements/      # Element renderers
│   │   ├── text-element.tsx
│   │   ├── image-element.tsx
│   │   ├── shape-element.tsx
│   │   └── group-element.tsx
│   ├── snapping/
│   │   ├── snap-lines.tsx   # Visual guidelines
│   │   └── use-snapping.ts  # Snap calculation hook
│   ├── selection/
│   │   ├── transformer.tsx  # Multi-select transformer
│   │   └── selection-rect.tsx
│   └── text-editor/
│       └── text-overlay.tsx # HTML overlay for editing
└── lib/
    └── konva/
        ├── snap-utils.ts    # Snap point calculations
        ├── export-utils.ts  # PDF export
        └── transform-utils.ts
```

## Store Design

### canvas-store.ts
```typescript
interface CanvasState {
  stageRef: RefObject<Konva.Stage> | null
  zoom: number
  pan: { x: number; y: number }
  gridEnabled: boolean
  snapEnabled: boolean
  guidelines: Guideline[]
}

interface CanvasActions {
  setStageRef: (ref: RefObject<Konva.Stage>) => void
  setZoom: (zoom: number) => void
  setPan: (pan: { x: number; y: number }) => void
  toggleGrid: () => void
  toggleSnap: () => void
  setGuidelines: (guidelines: Guideline[]) => void
  clearGuidelines: () => void
}
```

### slides-store.ts
```typescript
interface SlidesState {
  slides: Slide[]
  currentSlideIndex: number
}

interface Slide {
  id: string
  elements: CanvasElement[]
  background: string
}

interface CanvasElement {
  id: string
  type: 'text' | 'image' | 'rect' | 'circle' | 'line' | 'group'
  x: number
  y: number
  width: number
  height: number
  rotation: number
  // Type-specific props
  [key: string]: any
}

interface SlidesActions {
  addSlide: () => void
  deleteSlide: (index: number) => void
  duplicateSlide: (index: number) => void
  reorderSlides: (from: number, to: number) => void
  setCurrentSlide: (index: number) => void

  // Element CRUD
  addElement: (element: CanvasElement) => void
  updateElement: (id: string, updates: Partial<CanvasElement>) => void
  deleteElement: (id: string) => void
  duplicateElement: (id: string) => void

  // Bulk operations
  updateElements: (updates: { id: string; changes: Partial<CanvasElement> }[]) => void
  deleteElements: (ids: string[]) => void
}
```

### selection-store.ts
```typescript
interface SelectionState {
  selectedIds: string[]
  isMultiSelecting: boolean
  selectionRect: { x: number; y: number; width: number; height: number } | null
}

interface SelectionActions {
  select: (id: string) => void
  addToSelection: (id: string) => void
  removeFromSelection: (id: string) => void
  selectMultiple: (ids: string[]) => void
  clearSelection: () => void
  setSelectionRect: (rect: SelectionState['selectionRect']) => void
}
```

### history-store.ts
```typescript
interface HistoryState {
  past: Slide[][]
  future: Slide[][]
  canUndo: boolean
  canRedo: boolean
}

interface HistoryActions {
  pushState: (slides: Slide[]) => void
  undo: () => Slide[] | null
  redo: () => Slide[] | null
  clear: () => void
}
```

### project-store.ts
```typescript
interface ProjectState {
  id: string | null
  name: string
  brandKitId: string | null
  isDirty: boolean
  lastSaved: Date | null
}

interface ProjectActions {
  setProject: (project: Partial<ProjectState>) => void
  markDirty: () => void
  markClean: () => void
}
```

## Snapping System

### Snap Points
Each element exposes snap points:
- Center point
- 4 corners
- 4 edge midpoints (9 points total)

### Snap Targets
- Other elements' snap points
- Canvas center lines
- Grid lines (when enabled)

### Algorithm
```typescript
function calculateSnap(
  draggingElement: CanvasElement,
  allElements: CanvasElement[],
  threshold: number = 5
): { x: number; y: number; guidelines: Guideline[] } {
  const snapPoints = getSnapPoints(draggingElement)
  const targetPoints = allElements
    .filter(el => el.id !== draggingElement.id)
    .flatMap(getSnapPoints)

  let snapX: number | null = null
  let snapY: number | null = null
  const guidelines: Guideline[] = []

  for (const point of snapPoints) {
    for (const target of targetPoints) {
      if (Math.abs(point.x - target.x) < threshold && snapX === null) {
        snapX = target.x - (point.x - draggingElement.x)
        guidelines.push({ type: 'vertical', position: target.x })
      }
      if (Math.abs(point.y - target.y) < threshold && snapY === null) {
        snapY = target.y - (point.y - draggingElement.y)
        guidelines.push({ type: 'horizontal', position: target.y })
      }
    }
  }

  return {
    x: snapX ?? draggingElement.x,
    y: snapY ?? draggingElement.y,
    guidelines
  }
}
```

### Visual Guidelines
```tsx
const SnapLines = () => {
  const { guidelines } = useCanvasStore()

  return (
    <>
      {guidelines.map((guide, i) => (
        <Line
          key={i}
          points={guide.type === 'vertical'
            ? [guide.position, 0, guide.position, stageHeight]
            : [0, guide.position, stageWidth, guide.position]
          }
          stroke="#0066ff"
          strokeWidth={1}
          dash={[4, 4]}
        />
      ))}
    </>
  )
}
```

## Multi-Select & Grouping

### Selection Methods
1. Click + Shift: Add to selection
2. Drag rectangle: Select all intersecting
3. Cmd/Ctrl + A: Select all

### Transformer
```tsx
const SelectionTransformer = () => {
  const { selectedIds } = useSelectionStore()
  const transformerRef = useRef<Konva.Transformer>(null)

  useEffect(() => {
    if (transformerRef.current) {
      const nodes = selectedIds.map(id =>
        stageRef.current?.findOne(`#${id}`)
      ).filter(Boolean)
      transformerRef.current.nodes(nodes)
    }
  }, [selectedIds])

  return (
    <Transformer
      ref={transformerRef}
      boundBoxFunc={(oldBox, newBox) => {
        // Constrain minimum size
        if (newBox.width < 5 || newBox.height < 5) return oldBox
        return newBox
      }}
    />
  )
}
```

### Grouping
```typescript
// Cmd/Ctrl + G to group
groupSelected: () => {
  const selectedElements = getSelectedElements()
  const bounds = calculateBounds(selectedElements)

  const group: CanvasElement = {
    id: nanoid(),
    type: 'group',
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    rotation: 0,
    children: selectedElements.map(el => ({
      ...el,
      x: el.x - bounds.x,
      y: el.y - bounds.y
    }))
  }

  // Remove originals, add group
  deleteElements(selectedElements.map(e => e.id))
  addElement(group)
  select(group.id)
}

// Cmd/Ctrl + Shift + G to ungroup
ungroupSelected: () => {
  const group = getSelectedElements()[0]
  if (group.type !== 'group') return

  const children = group.children.map(child => ({
    ...child,
    id: nanoid(),
    x: child.x + group.x,
    y: child.y + group.y
  }))

  deleteElement(group.id)
  children.forEach(addElement)
  selectMultiple(children.map(c => c.id))
}
```

## Text Editing

### Approach
HTML overlay positioned over canvas element for native text editing experience.

```tsx
const TextOverlay = () => {
  const { editingTextId } = useSelectionStore()
  const element = useElement(editingTextId)
  const stageRef = useCanvasStore(s => s.stageRef)

  if (!editingTextId || !element) return null

  const stage = stageRef?.current
  const transform = stage?.getAbsoluteTransform()
  const pos = transform?.point({ x: element.x, y: element.y })

  return (
    <div
      contentEditable
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        width: element.width * zoom,
        height: element.height * zoom,
        transform: `rotate(${element.rotation}deg)`,
        fontSize: element.fontSize * zoom,
        fontFamily: element.fontFamily,
        color: element.fill,
        // Match element styling exactly
      }}
      onBlur={(e) => {
        updateElement(editingTextId, { text: e.target.innerText })
        setEditingTextId(null)
      }}
    />
  )
}
```

### Activation
- Double-click text element: Enter edit mode
- Click outside or press Escape: Exit edit mode
- During edit: Konva Text hidden, HTML overlay shown

## Image Handling

### Loading
```tsx
import { useImage } from 'react-konva-utils'

const ImageElement = ({ element }) => {
  const [image, status] = useImage(element.src, 'anonymous')

  if (status === 'loading') {
    return <Rect {...element} fill="#f0f0f0" />
  }

  return (
    <KonvaImage
      id={element.id}
      image={image}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      rotation={element.rotation}
      filters={element.filters?.map(f => Konva.Filters[f])}
    />
  )
}
```

### Filters
Built-in Konva filters:
- `Brighten` - brightness adjustment
- `Contrast` - contrast adjustment
- `Grayscale` - convert to grayscale
- `Sepia` - sepia tone
- `Blur` - gaussian blur
- `HSL` - hue/saturation/lightness

Applied via `filters` prop array. Element must be cached for filters to work.

## PDF Export

### Flow
1. Iterate through slides
2. Render each slide to stage
3. Export stage as high-res PNG (2x pixelRatio)
4. Compose PNGs into PDF using jsPDF

```typescript
async function exportToPDF(
  slides: Slide[],
  stageRef: RefObject<Konva.Stage>,
  options: { watermark: boolean }
): Promise<Blob> {
  const images: string[] = []
  const { width, height } = getSlideSize()

  for (const slide of slides) {
    // Render slide (handled by React re-render)
    await new Promise(resolve => setTimeout(resolve, 100))

    const dataUrl = stageRef.current!.toDataURL({
      pixelRatio: 2,
      mimeType: 'image/png'
    })
    images.push(dataUrl)
  }

  // Compose PDF
  const pdf = new jsPDF({
    orientation: width > height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [width, height]
  })

  for (let i = 0; i < images.length; i++) {
    if (i > 0) pdf.addPage()
    pdf.addImage(images[i], 'PNG', 0, 0, width, height)

    if (options.watermark) {
      addWatermark(pdf, width, height)
    }
  }

  return pdf.output('blob')
}
```

## Migration Steps

1. **Install dependencies**
   ```bash
   pnpm add konva react-konva react-konva-utils
   pnpm remove fabric
   ```

2. **Create new store files**
   - canvas-store.ts
   - slides-store.ts
   - selection-store.ts
   - history-store.ts
   - project-store.ts

3. **Build canvas component**
   - konva-canvas.tsx with Stage/Layer
   - Element renderers for each type
   - Snapping hook and guidelines

4. **Implement selection**
   - Transformer component
   - Multi-select rectangle
   - Keyboard shortcuts

5. **Text editing overlay**
   - HTML contentEditable overlay
   - Position syncing with zoom/pan

6. **Image handling**
   - useImage hook integration
   - Filter application

7. **Update toolbar/sidebar**
   - Connect to new stores
   - Update action handlers

8. **Export functionality**
   - Update PDF export
   - PNG export

9. **Remove old code**
   - Delete fabric-based editor.ts store
   - Delete old canvas.tsx
   - Remove fabric dependency

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Cmd/Ctrl + A | Select all |
| Cmd/Ctrl + G | Group selected |
| Cmd/Ctrl + Shift + G | Ungroup |
| Cmd/Ctrl + Z | Undo |
| Cmd/Ctrl + Shift + Z | Redo |
| Cmd/Ctrl + C | Copy |
| Cmd/Ctrl + V | Paste |
| Cmd/Ctrl + D | Duplicate |
| Delete/Backspace | Delete selected |
| Escape | Deselect / Exit edit mode |
| Arrow keys | Nudge selected (1px) |
| Shift + Arrow | Nudge selected (10px) |
