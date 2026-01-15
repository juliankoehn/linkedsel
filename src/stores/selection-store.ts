import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface SelectionRect {
  x: number
  y: number
  width: number
  height: number
}

interface SelectionState {
  selectedIds: string[]
  isMultiSelecting: boolean
  selectionRect: SelectionRect | null
  editingTextId: string | null
}

interface SelectionActions {
  select: (id: string) => void
  addToSelection: (id: string) => void
  removeFromSelection: (id: string) => void
  selectMultiple: (ids: string[]) => void
  toggleSelection: (id: string) => void
  clearSelection: () => void
  setSelectionRect: (rect: SelectionRect | null) => void
  setIsMultiSelecting: (isSelecting: boolean) => void
  setEditingTextId: (id: string | null) => void
  isSelected: (id: string) => boolean
  hasSelection: () => boolean
  reset: () => void
}

type SelectionStore = SelectionState & SelectionActions

const initialState: SelectionState = {
  selectedIds: [],
  isMultiSelecting: false,
  selectionRect: null,
  editingTextId: null,
}

export const useSelectionStore = create<SelectionStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      select: (id) => {
        set({ selectedIds: [id], editingTextId: null })
      },

      addToSelection: (id) => {
        set((state) => {
          if (state.selectedIds.includes(id)) return state
          return { selectedIds: [...state.selectedIds, id] }
        })
      },

      removeFromSelection: (id) => {
        set((state) => ({
          selectedIds: state.selectedIds.filter((selectedId) => selectedId !== id),
        }))
      },

      selectMultiple: (ids) => {
        set({ selectedIds: ids, editingTextId: null })
      },

      toggleSelection: (id) => {
        const { selectedIds } = get()
        if (selectedIds.includes(id)) {
          set({ selectedIds: selectedIds.filter((selectedId) => selectedId !== id) })
        } else {
          set({ selectedIds: [...selectedIds, id] })
        }
      },

      clearSelection: () => {
        set({ selectedIds: [], editingTextId: null })
      },

      setSelectionRect: (rect) => {
        set({ selectionRect: rect })
      },

      setIsMultiSelecting: (isSelecting) => {
        set({ isMultiSelecting: isSelecting })
      },

      setEditingTextId: (id) => {
        set({ editingTextId: id })
      },

      isSelected: (id) => {
        return get().selectedIds.includes(id)
      },

      hasSelection: () => {
        return get().selectedIds.length > 0
      },

      reset: () => set(initialState),
    }),
    { name: 'selection-store' }
  )
)
