'use client'

import { Coins } from 'lucide-react'

import { cn } from '@/lib/utils'

interface CreditDisplayProps {
  credits: number
  variant?: 'default' | 'compact'
  className?: string
}

export function CreditDisplay({ credits, variant = 'default', className }: CreditDisplayProps) {
  const isLow = credits < 5
  const isEmpty = credits === 0

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
          isEmpty
            ? 'bg-red-100 text-red-700'
            : isLow
              ? 'bg-amber-100 text-amber-700'
              : 'bg-purple-100 text-purple-700',
          className
        )}
      >
        <Coins className="h-3 w-3" />
        <span>{credits}</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border px-3 py-2',
        isEmpty
          ? 'border-red-200 bg-red-50'
          : isLow
            ? 'border-amber-200 bg-amber-50'
            : 'border-purple-200 bg-purple-50',
        className
      )}
    >
      <Coins
        className={cn(
          'h-4 w-4',
          isEmpty ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-purple-500'
        )}
      />
      <div className="flex flex-col">
        <span
          className={cn(
            'text-sm font-semibold',
            isEmpty ? 'text-red-700' : isLow ? 'text-amber-700' : 'text-purple-700'
          )}
        >
          {credits} Credit{credits !== 1 ? 's' : ''}
        </span>
        <span
          className={cn(
            'text-xs',
            isEmpty ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-purple-600'
          )}
        >
          {isEmpty ? 'Keine Credits verfügbar' : isLow ? 'Wenige Credits übrig' : 'Verfügbar'}
        </span>
      </div>
    </div>
  )
}
