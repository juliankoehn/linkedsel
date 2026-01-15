'use client'

import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'
import { FileText, Loader2, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'

interface Project {
  id: string
  name: string
  thumbnail_url: string | null
  created_at: string
  updated_at: string
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || [])
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleDelete = async (projectId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm('Möchtest du dieses Projekt wirklich löschen?')) return

    setDeletingId(projectId)
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== projectId))
      }
    } catch (error) {
      console.error('Failed to delete project:', error)
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-600">
            Willkommen zurück! Hier sind deine Projekte.
          </p>
        </div>
        <Button asChild>
          <Link href="/editor">
            <Plus className="mr-2 h-4 w-4" />
            Neues Carousel
          </Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Keine Projekte
          </h3>
          <p className="mt-2 text-gray-600">
            Erstelle dein erstes LinkedIn Carousel.
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link href="/editor">
                <Plus className="mr-2 h-4 w-4" />
                Carousel erstellen
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/editor?project=${project.id}`}
              className="group relative overflow-hidden rounded-lg border bg-white transition-shadow hover:shadow-lg"
            >
              {/* Thumbnail */}
              <div className="aspect-[4/5] bg-gray-100">
                {project.thumbnail_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={project.thumbnail_url}
                    alt={project.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <FileText className="h-12 w-12 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="truncate font-medium text-gray-900">
                  {project.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Bearbeitet{' '}
                  {formatDistanceToNow(new Date(project.updated_at), {
                    addSuffix: true,
                    locale: de,
                  })}
                </p>
              </div>

              {/* Actions */}
              <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={(e) => handleDelete(project.id, e)}
                  disabled={deletingId === project.id}
                  className="rounded-full bg-white p-2 shadow hover:bg-red-50 hover:text-red-600"
                  title="Projekt löschen"
                >
                  {deletingId === project.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </Link>
          ))}

          {/* New project card */}
          <Link
            href="/editor"
            className="flex aspect-[4/5] items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-gray-400 hover:bg-gray-100"
          >
            <div className="text-center">
              <Plus className="mx-auto h-8 w-8 text-gray-400" />
              <span className="mt-2 block text-sm font-medium text-gray-600">
                Neues Carousel
              </span>
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}
