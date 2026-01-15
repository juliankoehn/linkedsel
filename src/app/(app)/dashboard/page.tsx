import { FileText, Plus } from 'lucide-react'
import Link from 'next/link'

import { ProjectCard } from '@/components/dashboard/project-card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'

interface Project {
  id: string
  name: string
  thumbnail_url: string | null
  created_at: string
  updated_at: string
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let projects: Project[] = []

  if (user) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch projects:', error)
    } else {
      projects = data || []
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-600">Willkommen zurück! Hier sind deine Projekte.</p>
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
          <h3 className="mt-4 text-lg font-medium text-gray-900">Keine Projekte</h3>
          <p className="mt-2 text-gray-600">Erstelle dein erstes LinkedIn Carousel.</p>
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
            <ProjectCard key={project.id} project={project} />
          ))}

          {/* New project card */}
          <Link
            href="/editor"
            className="flex aspect-[4/5] items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-gray-400 hover:bg-gray-100"
          >
            <div className="text-center">
              <Plus className="mx-auto h-8 w-8 text-gray-400" />
              <span className="mt-2 block text-sm font-medium text-gray-600">Neues Carousel</span>
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}
