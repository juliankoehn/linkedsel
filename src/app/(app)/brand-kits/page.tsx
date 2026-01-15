'use client'

import { Edit2, Loader2, Palette, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { useSubscription } from '@/hooks/use-subscription'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { type BrandColor, type BrandKit, DEFAULT_COLORS, DEFAULT_FONTS } from '@/types/brand-kit'

export default function BrandKitsPage() {
  const [brandKits, setBrandKits] = useState<BrandKit[]>([])
  const [selectedKit, setSelectedKit] = useState<BrandKit | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { hasSubscription } = useSubscription()
  const { toast } = useToast()

  // Fetch brand kits from API
  useEffect(() => {
    const fetchBrandKits = async () => {
      try {
        const response = await fetch('/api/brand-kits')
        if (response.ok) {
          const data = await response.json()
          setBrandKits(data.brandKits || [])
          if (data.brandKits?.length > 0) {
            setSelectedKit(data.brandKits[0])
          }
        }
      } catch (error) {
        console.error('Failed to fetch brand kits:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (hasSubscription) {
      fetchBrandKits()
    } else {
      setIsLoading(false)
    }
  }, [hasSubscription])

  const handleCreateKit = async () => {
    const newKit: BrandKit = {
      id: crypto.randomUUID(),
      name: 'Neues Brand Kit',
      colors: [...DEFAULT_COLORS],
      fonts: [...DEFAULT_FONTS],
      logoUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    try {
      const response = await fetch('/api/brand-kits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKit.name,
          colors: newKit.colors,
          fonts: newKit.fonts,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const createdKit = {
          ...newKit,
          id: data.brandKit.id,
        }
        setBrandKits([...brandKits, createdKit])
        setSelectedKit(createdKit)
        setIsEditing(true)
        toast({ title: 'Brand Kit erstellt' })
      } else {
        toast({
          title: 'Fehler',
          description: 'Brand Kit konnte nicht erstellt werden',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to create brand kit:', error)
      toast({
        title: 'Fehler',
        description: 'Verbindungsfehler',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteKit = async (id: string) => {
    if (!confirm('Brand Kit wirklich löschen?')) return

    try {
      const response = await fetch(`/api/brand-kits/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setBrandKits(brandKits.filter((kit) => kit.id !== id))
        if (selectedKit?.id === id) {
          setSelectedKit(brandKits[0] || null)
        }
        toast({ title: 'Brand Kit gelöscht' })
      }
    } catch (error) {
      console.error('Failed to delete brand kit:', error)
    }
  }

  const handleColorChange = (colorId: string, newHex: string) => {
    if (!selectedKit) return
    const updatedColors = selectedKit.colors.map((c) =>
      c.id === colorId ? { ...c, hex: newHex } : c
    )
    const updatedKit = { ...selectedKit, colors: updatedColors }
    setSelectedKit(updatedKit)
    setBrandKits(brandKits.map((k) => (k.id === selectedKit.id ? updatedKit : k)))
  }

  const handleSave = async () => {
    if (!selectedKit) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/brand-kits/${selectedKit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedKit.name,
          colors: selectedKit.colors,
          fonts: selectedKit.fonts,
        }),
      })

      if (response.ok) {
        toast({ title: 'Gespeichert' })
        setIsEditing(false)
      } else {
        toast({ title: 'Fehler beim Speichern', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Failed to save brand kit:', error)
      toast({ title: 'Verbindungsfehler', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  if (!hasSubscription) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brand Kits</h1>
          <p className="mt-1 text-gray-600">Speichere deine Markenfarben und Schriften</p>
        </div>

        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <Palette className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Brand Kits sind ein Pro Feature
          </h3>
          <p className="mt-2 text-gray-600">
            Mit Pro kannst du deine Markenfarben und Schriften speichern und mit einem Klick auf
            alle deine Carousels anwenden.
          </p>
          <div className="mt-6">
            <Button asChild>
              <a href="/pricing">Upgrade auf Pro</a>
            </Button>
          </div>
        </div>
      </div>
    )
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
          <h1 className="text-2xl font-bold text-gray-900">Brand Kits</h1>
          <p className="mt-1 text-gray-600">Speichere deine Markenfarben und Schriften</p>
        </div>
        <Button onClick={handleCreateKit}>
          <Plus className="mr-2 h-4 w-4" />
          Neues Brand Kit
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Brand Kit List */}
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-gray-900">Deine Brand Kits</h2>
          {brandKits.length === 0 ? (
            <p className="text-sm text-gray-500">Noch keine Brand Kits erstellt.</p>
          ) : (
            <div className="space-y-2">
              {brandKits.map((kit) => (
                <div
                  key={kit.id}
                  onClick={() => setSelectedKit(kit)}
                  className={cn(
                    'flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors',
                    selectedKit?.id === kit.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-1">
                      {kit.colors.slice(0, 3).map((color) => (
                        <div
                          key={color.id}
                          className="h-6 w-6 rounded-full border-2 border-white"
                          style={{ backgroundColor: color.hex }}
                        />
                      ))}
                    </div>
                    <span className="font-medium text-gray-900">{kit.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedKit(kit)
                        setIsEditing(true)
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteKit(kit.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Brand Kit Editor */}
        {selectedKit && (
          <div className="lg:col-span-2">
            <div className="rounded-lg border bg-white p-6">
              <div className="mb-6 flex items-center justify-between">
                <input
                  type="text"
                  value={selectedKit.name}
                  onChange={(e) => {
                    const updatedKit = { ...selectedKit, name: e.target.value }
                    setSelectedKit(updatedKit)
                    setBrandKits(brandKits.map((k) => (k.id === selectedKit.id ? updatedKit : k)))
                  }}
                  className="text-xl font-bold text-gray-900 focus:outline-none"
                  disabled={!isEditing}
                />
                <Button
                  variant={isEditing ? 'default' : 'outline'}
                  onClick={() => {
                    if (isEditing) {
                      handleSave()
                    } else {
                      setIsEditing(true)
                    }
                  }}
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isEditing ? 'Speichern' : 'Bearbeiten'}
                </Button>
              </div>

              {/* Colors */}
              <div className="mb-8">
                <h3 className="mb-4 text-sm font-medium text-gray-900">Farben</h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                  {selectedKit.colors.map((color) => (
                    <ColorPicker
                      key={color.id}
                      color={color}
                      onChange={(hex) => handleColorChange(color.id, hex)}
                      disabled={!isEditing}
                    />
                  ))}
                </div>
              </div>

              {/* Fonts */}
              <div>
                <h3 className="mb-4 text-sm font-medium text-gray-900">Schriften</h3>
                <div className="space-y-4">
                  {selectedKit.fonts.map((font) => (
                    <div
                      key={font.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div>
                        <p className="text-sm text-gray-500">{font.name}</p>
                        <p
                          className="text-lg"
                          style={{
                            fontFamily: font.family,
                            fontWeight: font.weight,
                          }}
                        >
                          {font.family}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface ColorPickerProps {
  color: BrandColor
  onChange: (hex: string) => void
  disabled?: boolean
}

function ColorPicker({ color, onChange, disabled }: ColorPickerProps) {
  return (
    <div className="text-center">
      <label className="block cursor-pointer">
        <div
          className="mx-auto mb-2 h-12 w-12 rounded-full border-2 border-gray-200 transition-transform hover:scale-110"
          style={{ backgroundColor: color.hex }}
        />
        <input
          type="color"
          value={color.hex}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
          disabled={disabled}
        />
      </label>
      <p className="text-xs text-gray-500">{color.name}</p>
      <p className="font-mono text-xs text-gray-400">{color.hex}</p>
    </div>
  )
}
