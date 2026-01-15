'use client'

import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignHorizontalSpaceAround,
  AlignStartHorizontal,
  AlignStartVertical,
  AlignVerticalSpaceAround,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useHistoryStore } from '@/stores/history-store'
import { useProjectStore } from '@/stores/project-store'
import { useSelectionStore } from '@/stores/selection-store'
import { useSlidesStore } from '@/stores/slides-store'

export function AlignmentToolbar() {
  const { selectedIds } = useSelectionStore()
  const { slides, alignElements, distributeElements } = useSlidesStore()
  const { pushState } = useHistoryStore()

  const handleAlign = (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (selectedIds.length < 2) return
    pushState(slides)
    alignElements(selectedIds, alignment)
    useProjectStore.getState().markDirty()
  }

  const handleDistribute = (direction: 'horizontal' | 'vertical') => {
    if (selectedIds.length < 3) return
    pushState(slides)
    distributeElements(selectedIds, direction)
    useProjectStore.getState().markDirty()
  }

  // Don't show if less than 2 elements selected
  if (selectedIds.length < 2) return null

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-0.5">
        {/* Horizontal alignment */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleAlign('left')}
            >
              <AlignStartHorizontal className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Align left</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleAlign('center')}
            >
              <AlignCenterHorizontal className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Align center</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleAlign('right')}
            >
              <AlignEndHorizontal className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Align right</TooltipContent>
        </Tooltip>

        <div className="mx-1 h-4 w-px bg-gray-200" />

        {/* Vertical alignment */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleAlign('top')}
            >
              <AlignStartVertical className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Align top</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleAlign('middle')}
            >
              <AlignCenterVertical className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Align middle</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleAlign('bottom')}
            >
              <AlignEndVertical className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Align bottom</TooltipContent>
        </Tooltip>

        {/* Distribute - only show if 3+ elements */}
        {selectedIds.length >= 3 && (
          <>
            <div className="mx-1 h-4 w-px bg-gray-200" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleDistribute('horizontal')}
                >
                  <AlignHorizontalSpaceAround className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Distribute horizontally</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleDistribute('vertical')}
                >
                  <AlignVerticalSpaceAround className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Distribute vertically</TooltipContent>
            </Tooltip>
          </>
        )}
      </div>
    </TooltipProvider>
  )
}
