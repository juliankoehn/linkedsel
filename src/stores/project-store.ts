import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { FormatPreset } from './canvas-store'
import type { Slide } from './slides-store'

export interface SerializedProject {
  format: FormatPreset
  slides: Slide[]
}

interface ProjectState {
  id: string | null
  name: string
  brandKitId: string | null
  isDirty: boolean
  isSaving: boolean
  lastSaved: Date | null
  hasWatermark: boolean
}

interface ProjectActions {
  setProject: (project: Partial<ProjectState>) => void
  setName: (name: string) => void
  setBrandKitId: (id: string | null) => void
  markDirty: () => void
  markClean: () => void
  setIsSaving: (isSaving: boolean) => void
  setHasWatermark: (hasWatermark: boolean) => void

  // API operations
  saveProject: (
    format: FormatPreset,
    slides: Slide[]
  ) => Promise<{ id: string } | { error: string }>
  loadProject: (
    projectId: string
  ) => Promise<{ data: SerializedProject; name: string } | { error: string }>

  reset: () => void
}

type ProjectStore = ProjectState & ProjectActions

const initialState: ProjectState = {
  id: null,
  name: 'New Carousel',
  brandKitId: null,
  isDirty: false,
  isSaving: false,
  lastSaved: null,
  hasWatermark: true,
}

export const useProjectStore = create<ProjectStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setProject: (project) => set(project),

      setName: (name) => set({ name, isDirty: true }),

      setBrandKitId: (id) => set({ brandKitId: id }),

      markDirty: () => set({ isDirty: true }),

      markClean: () => set({ isDirty: false, lastSaved: new Date() }),

      setIsSaving: (isSaving) => set({ isSaving }),

      setHasWatermark: (hasWatermark) => set({ hasWatermark }),

      saveProject: async (format, slides) => {
        const { id, name, isSaving } = get()
        if (isSaving) return id ? { id } : { error: 'Already saving' }

        set({ isSaving: true })

        try {
          const data: SerializedProject = { format, slides }

          if (id) {
            // Update existing project
            const response = await fetch(`/api/projects/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, data }),
            })

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}))
              set({ isSaving: false })
              return { error: errorData.error || `Server error (${response.status})` }
            }

            set({ isDirty: false, isSaving: false, lastSaved: new Date() })
            return { id }
          } else {
            // Create new project
            const response = await fetch('/api/projects', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, data }),
            })

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}))
              set({ isSaving: false })
              return { error: errorData.error || `Server error (${response.status})` }
            }

            const result = await response.json()
            const newId = result.project.id

            set({
              id: newId,
              isDirty: false,
              isSaving: false,
              lastSaved: new Date(),
            })

            return { id: newId }
          }
        } catch (error) {
          console.error('Failed to save project:', error)
          set({ isSaving: false })
          return {
            error: error instanceof Error ? error.message : 'Unknown error',
          }
        }
      },

      loadProject: async (projectId) => {
        try {
          const response = await fetch(`/api/projects/${projectId}`)

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            return { error: errorData.error || `Server error (${response.status})` }
          }

          const result = await response.json()
          const project = result.project

          set({
            id: project.id,
            name: project.name,
            isDirty: false,
            lastSaved: project.updated_at ? new Date(project.updated_at) : null,
          })

          if (project.data && typeof project.data === 'object') {
            return {
              data: project.data as SerializedProject,
              name: project.name,
            }
          }

          return { error: 'Invalid project data' }
        } catch (error) {
          console.error('Failed to load project:', error)
          return {
            error: error instanceof Error ? error.message : 'Unknown error',
          }
        }
      },

      reset: () => set(initialState),
    }),
    { name: 'project-store' }
  )
)
