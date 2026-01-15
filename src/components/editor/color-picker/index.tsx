'use client'

import { useCallback, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

// Debounce helper
function useDebouncedCallback<T extends (...args: any[]) => void>(callback: T, delay: number): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    }) as T,
    [callback, delay]
  )
}

// Color presets for LinkedIn content
const COLOR_PALETTES = {
  linkedin: {
    name: 'LinkedIn',
    colors: ['#0A66C2', '#004182', '#70B5F9', '#9ECBFF', '#E7F3FF'],
  },
  professional: {
    name: 'Professional',
    colors: ['#1a1a1a', '#4a4a4a', '#7a7a7a', '#e5e5e5', '#ffffff'],
  },
  vibrant: {
    name: 'Vibrant',
    colors: ['#7C3AED', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'],
  },
  pastel: {
    name: 'Pastel',
    colors: ['#FDE68A', '#A7F3D0', '#BFDBFE', '#DDD6FE', '#FBCFE8'],
  },
  dark: {
    name: 'Dark',
    colors: ['#111827', '#1F2937', '#374151', '#4B5563', '#6B7280'],
  },
}

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
  recentColors?: string[]
  onRecentColorAdd?: (color: string) => void
}

export function ColorPicker({
  value,
  onChange,
  label,
  recentColors = [],
  onRecentColorAdd,
}: ColorPickerProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const [previewColor, setPreviewColor] = useState(value)

  const handleColorChange = useCallback(
    (color: string) => {
      onChange(color)
      setInputValue(color)
      setPreviewColor(color)
      if (onRecentColorAdd && !recentColors.includes(color)) {
        onRecentColorAdd(color)
      }
    },
    [onChange, onRecentColorAdd, recentColors]
  )

  // Debounced version for native color picker (fires on every pixel move)
  const debouncedOnChange = useDebouncedCallback(onChange, 50)

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setInputValue(newValue)
      // Only update if valid hex color
      if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
        handleColorChange(newValue)
      }
    },
    [handleColorChange]
  )

  const handleNativeColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const color = e.target.value
      setPreviewColor(color)
      setInputValue(color)
      debouncedOnChange(color)
    },
    [debouncedOnChange]
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-full justify-start gap-2 px-2"
          role="combobox"
          aria-expanded={open}
        >
          <div className="h-4 w-4 rounded border" style={{ backgroundColor: previewColor }} />
          <span className="flex-1 truncate text-left text-xs">{label || previewColor}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-3">
          {/* Color palettes */}
          {Object.entries(COLOR_PALETTES).map(([key, palette]) => (
            <div key={key}>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">{palette.name}</p>
              <div className="flex gap-1">
                {palette.colors.map((color) => (
                  <button
                    key={color}
                    className={cn(
                      'h-6 w-6 rounded border transition-transform hover:scale-110',
                      value === color && 'ring-2 ring-primary ring-offset-1'
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorChange(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Recent colors */}
          {recentColors.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">Recent</p>
              <div className="flex flex-wrap gap-1">
                {recentColors.slice(0, 8).map((color) => (
                  <button
                    key={color}
                    className={cn(
                      'h-6 w-6 rounded border transition-transform hover:scale-110',
                      value === color && 'ring-2 ring-primary ring-offset-1'
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorChange(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Custom color input */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Custom</p>
            <div className="flex gap-2">
              <input
                type="color"
                value={value}
                onChange={handleNativeColorChange}
                className="h-8 w-8 cursor-pointer rounded border p-0.5"
              />
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="#000000"
                className="h-8 flex-1 rounded border px-2 text-xs uppercase"
                maxLength={7}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Simple color button for inline use
interface ColorButtonProps {
  value: string
  onChange: (color: string) => void
  className?: string
}

export function ColorButton({ value, onChange, className }: ColorButtonProps) {
  const [previewColor, setPreviewColor] = useState(value)
  const debouncedOnChange = useDebouncedCallback(onChange, 50)

  const handleNativeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const color = e.target.value
      setPreviewColor(color)
      debouncedOnChange(color)
    },
    [debouncedOnChange]
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn('h-7 w-7 rounded border border-gray-200 p-0.5', className)}
          title={value}
        >
          <div className="h-full w-full rounded" style={{ backgroundColor: previewColor }} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-3">
          {Object.entries(COLOR_PALETTES).map(([key, palette]) => (
            <div key={key}>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">{palette.name}</p>
              <div className="flex gap-1">
                {palette.colors.map((color) => (
                  <button
                    key={color}
                    className={cn(
                      'h-6 w-6 rounded border transition-transform hover:scale-110',
                      value === color && 'ring-2 ring-primary ring-offset-1'
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      setPreviewColor(color)
                      onChange(color)
                    }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          ))}
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Custom</p>
            <input
              type="color"
              value={previewColor}
              onChange={handleNativeChange}
              className="h-8 w-full cursor-pointer rounded border p-0.5"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { COLOR_PALETTES }
