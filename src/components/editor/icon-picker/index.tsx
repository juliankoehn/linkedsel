'use client'

import { Search, Smile } from 'lucide-react'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

// Popular icons organized by category - these are the only ones we show by default
const ICON_CATEGORIES: Record<string, string[]> = {
  Social: [
    'Facebook',
    'Twitter',
    'Instagram',
    'Linkedin',
    'Youtube',
    'Github',
    'Share2',
    'MessageCircle',
    'Heart',
    'ThumbsUp',
    'Send',
  ],
  UI: [
    'Menu',
    'X',
    'ChevronDown',
    'ChevronRight',
    'ChevronLeft',
    'ChevronUp',
    'ArrowRight',
    'ArrowLeft',
    'ArrowUp',
    'ArrowDown',
    'Plus',
    'Minus',
    'Check',
    'Search',
    'Settings',
    'User',
    'Mail',
    'Phone',
  ],
  Arrows: [
    'ArrowRight',
    'ArrowLeft',
    'ArrowUp',
    'ArrowDown',
    'ArrowUpRight',
    'ArrowUpLeft',
    'ArrowDownRight',
    'ArrowDownLeft',
    'MoveRight',
    'MoveLeft',
    'MoveUp',
    'MoveDown',
    'CornerDownRight',
    'CornerUpRight',
    'TrendingUp',
    'TrendingDown',
  ],
  Symbols: [
    'Star',
    'Heart',
    'Sparkles',
    'Zap',
    'Sun',
    'Moon',
    'Cloud',
    'Flag',
    'Award',
    'Trophy',
    'Target',
    'Lightbulb',
    'Rocket',
    'Fire',
    'Shield',
    'Lock',
    'Unlock',
    'Key',
    'Bell',
  ],
  Business: [
    'Briefcase',
    'Building',
    'Building2',
    'DollarSign',
    'Euro',
    'CreditCard',
    'Wallet',
    'PiggyBank',
    'TrendingUp',
    'BarChart',
    'PieChart',
    'LineChart',
    'Users',
    'UserPlus',
    'Handshake',
    'Landmark',
    'Store',
    'ShoppingCart',
  ],
  Media: [
    'Play',
    'Pause',
    'SkipBack',
    'SkipForward',
    'Volume2',
    'VolumeX',
    'Image',
    'Video',
    'Camera',
    'Mic',
    'Music',
    'Radio',
    'Film',
    'Monitor',
    'Tv',
    'Headphones',
    'Speaker',
    'Podcast',
  ],
}

// Get all unique icons from categories
const ALL_CATEGORY_ICONS = [...new Set(Object.values(ICON_CATEGORIES).flat())]

// Cache for dynamically loaded icon components
const iconCache = new Map<string, React.ComponentType<any>>()

// Dynamically load a single icon
async function loadIcon(iconName: string): Promise<React.ComponentType<any> | null> {
  if (iconCache.has(iconName)) {
    return iconCache.get(iconName)!
  }

  try {
    const module = await import('lucide-react')
    const IconComponent = (module as any)[iconName]
    if (IconComponent) {
      iconCache.set(iconName, IconComponent)
      return IconComponent
    }
  } catch {
    // Icon not found
  }
  return null
}

// Icon component that loads dynamically
const DynamicIcon = memo(function DynamicIcon({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const [Icon, setIcon] = useState<React.ComponentType<any> | null>(
    () => iconCache.get(name) || null
  )

  useEffect(() => {
    if (!Icon) {
      loadIcon(name).then(setIcon)
    }
  }, [name, Icon])

  if (!Icon) {
    return <div className={cn('animate-pulse bg-gray-200 rounded', className)} />
  }

  return <Icon className={className} />
})

interface IconPickerProps {
  onSelectIcon: (iconName: string) => void
}

export function IconPicker({ onSelectIcon }: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<string[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Search icons dynamically
  useEffect(() => {
    if (!search) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    const searchLower = search.toLowerCase()

    // First check category icons for quick results
    const categoryMatches = ALL_CATEGORY_ICONS.filter((name) =>
      name.toLowerCase().includes(searchLower)
    )

    if (categoryMatches.length > 0) {
      setSearchResults(categoryMatches.slice(0, 50))
      setIsSearching(false)
      return
    }

    // If no category matches, do async search through all icons
    const doSearch = async () => {
      try {
        const module = await import('lucide-react')
        const allNames = Object.keys(module).filter(
          (key) =>
            key !== 'default' &&
            key !== 'createLucideIcon' &&
            typeof (module as any)[key] === 'function' &&
            key.toLowerCase().includes(searchLower)
        )
        setSearchResults(allNames.slice(0, 50))
      } catch {
        setSearchResults([])
      }
      setIsSearching(false)
    }

    const timeout = setTimeout(doSearch, 300)
    return () => clearTimeout(timeout)
  }, [search])

  // Get icons to display
  const displayedIcons = useMemo(() => {
    if (search) return searchResults
    if (selectedCategory) return ICON_CATEGORIES[selectedCategory] || []
    return ALL_CATEGORY_ICONS
  }, [search, selectedCategory, searchResults])

  const handleSelect = useCallback(
    (iconName: string) => {
      onSelectIcon(iconName)
      setOpen(false)
      setSearch('')
    },
    [onSelectIcon]
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" title="Add icon">
          <Smile className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search icons..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setSelectedCategory(null)
              }}
              className="pl-9 h-9"
            />
          </div>
        </div>

        {!search && (
          <div className="flex flex-wrap gap-1 p-2 border-b">
            <Button
              variant={selectedCategory === null ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {Object.keys(ICON_CATEGORIES).map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        )}

        <div className="max-h-64 overflow-auto p-2">
          {isSearching ? (
            <p className="text-sm text-gray-500 text-center py-4">Searching...</p>
          ) : displayedIcons.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No icons found</p>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {displayedIcons.map((iconName) => (
                <button
                  key={iconName}
                  onClick={() => handleSelect(iconName)}
                  className={cn(
                    'flex items-center justify-center p-2 rounded hover:bg-gray-100 transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500'
                  )}
                  title={iconName}
                >
                  <DynamicIcon name={iconName} className="h-5 w-5" />
                </button>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
