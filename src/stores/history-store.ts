import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Slide } from './slides-store'

const MAX_HISTORY = 50

interface HistoryState {
  past: Slide[][]
  future: Slide[][]
}

interface HistoryActions {
  pushState: (slides: Slide[]) => void
  undo: () => Slide[] | null
  redo: () => Slide[] | null
  canUndo: () => boolean
  canRedo: () => boolean
  clear: () => void
  reset: () => void
}

type HistoryStore = HistoryState & HistoryActions

// Deep clone slides to avoid mutation issues
const cloneSlides = (slides: Slide[]): Slide[] => {
  return JSON.parse(JSON.stringify(slides))
}

const initialState: HistoryState = {
  past: [],
  future: [],
}

export const useHistoryStore = create<HistoryStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      pushState: (slides) => {
        const cloned = cloneSlides(slides)
        set((state) => ({
          past: [...state.past.slice(-(MAX_HISTORY - 1)), cloned],
          future: [], // Clear future on new action
        }))
      },

      undo: () => {
        const { past } = get()
        if (past.length === 0) return null

        const newPast = [...past]
        const previousState = newPast.pop()

        if (!previousState) return null

        set((state) => ({
          past: newPast,
          future: state.future, // We'll push current to future in the caller
        }))

        return previousState
      },

      redo: () => {
        const { future } = get()
        if (future.length === 0) return null

        const newFuture = [...future]
        const nextState = newFuture.shift()

        if (!nextState) return null

        set({ future: newFuture })

        return nextState
      },

      canUndo: () => get().past.length > 0,

      canRedo: () => get().future.length > 0,

      clear: () => set({ past: [], future: [] }),

      reset: () => set(initialState),
    }),
    { name: 'history-store' }
  )
)

// Helper hook to use undo/redo with slides store
export const useUndoRedo = () => {
  const { pushState, undo, redo, canUndo, canRedo, past, future } = useHistoryStore()

  return {
    saveState: pushState,
    undo,
    redo,
    canUndo: canUndo(),
    canRedo: canRedo(),
    historyLength: past.length,
    futureLength: future.length,
  }
}
