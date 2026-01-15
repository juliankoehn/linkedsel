'use client'

import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'
import { FileText, Loader2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { useToast } from '@/hooks/use-toast'

interface Project {
  id: string
  name: string
  thumbnail_url: string | null
  updated_at: string
}

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm('Möchtest du dieses Projekt wirklich löschen?')) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        toast({
          title: 'Gelöscht',
          description: 'Das Projekt wurde gelöscht.',
        })
        router.refresh()
      } else {
        toast({
          title: 'Fehler',
          description: 'Das Projekt konnte nicht gelöscht werden.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to delete project:', error)
      toast({
        title: 'Fehler',
        description: 'Verbindungsfehler beim Löschen.',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Link
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
        <h3 className="truncate font-medium text-gray-900">{project.name}</h3>
        <p className="mt-1 text-sm text-gray-500">
          Bearbeitet{' '}
          {formatDistanceToNow(new Date(project.updated_at), {
            addSuffix: true,
            locale: de,
          })}
        </p>
      </div>

      {/* Delete button */}
      <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="rounded-full bg-white p-2 shadow hover:bg-red-50 hover:text-red-600"
          title="Projekt löschen"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>
      </div>
    </Link>
  )
}
