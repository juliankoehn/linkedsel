/**
 * AI Canvas Tools - OpenAI Function Definitions for canvas manipulation
 */

import type { ChatCompletionTool } from 'openai/resources/chat/completions'

// Tool definitions for OpenAI function calling
export const canvasTools: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'create_slide',
      description:
        'Creates a new slide in the carousel. Call this first before adding elements to a slide.',
      parameters: {
        type: 'object',
        properties: {
          backgroundColor: {
            type: 'string',
            description: 'Background color of the slide in hex format (e.g., #ffffff)',
          },
        },
        required: ['backgroundColor'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_text',
      description:
        'Adds a text element to the current slide. Use for headlines, body text, or call-to-actions.',
      parameters: {
        type: 'object',
        properties: {
          text: {
            type: 'string',
            description: 'The text content to display',
          },
          x: {
            type: 'number',
            description: 'X position from left edge (0-1080 for standard carousel)',
          },
          y: {
            type: 'number',
            description: 'Y position from top edge (0-1350 for portrait)',
          },
          width: {
            type: 'number',
            description: 'Width of the text box',
          },
          fontSize: {
            type: 'number',
            description: 'Font size in pixels (e.g., 64 for headlines, 32 for body)',
          },
          fontWeight: {
            type: 'string',
            enum: ['normal', 'bold', '500', '600', '700'],
            description: 'Font weight',
          },
          fontFamily: {
            type: 'string',
            description: 'Font family name (e.g., Inter, Arial)',
          },
          color: {
            type: 'string',
            description: 'Text color in hex format',
          },
          textAlign: {
            type: 'string',
            enum: ['left', 'center', 'right'],
            description: 'Text alignment',
          },
        },
        required: ['text', 'x', 'y', 'fontSize', 'color'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_rectangle',
      description:
        'Adds a rectangle shape to the current slide. Use for backgrounds, cards, or decorative elements.',
      parameters: {
        type: 'object',
        properties: {
          x: {
            type: 'number',
            description: 'X position from left edge',
          },
          y: {
            type: 'number',
            description: 'Y position from top edge',
          },
          width: {
            type: 'number',
            description: 'Width of the rectangle',
          },
          height: {
            type: 'number',
            description: 'Height of the rectangle',
          },
          fill: {
            type: 'string',
            description: 'Fill color in hex format',
          },
          cornerRadius: {
            type: 'number',
            description: 'Corner radius for rounded rectangles (0 for sharp corners)',
          },
          opacity: {
            type: 'number',
            description: 'Opacity from 0 to 1',
          },
        },
        required: ['x', 'y', 'width', 'height', 'fill'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_circle',
      description:
        'Adds a circle shape to the current slide. Use for decorative elements or icons.',
      parameters: {
        type: 'object',
        properties: {
          x: {
            type: 'number',
            description: 'X position of circle center',
          },
          y: {
            type: 'number',
            description: 'Y position of circle center',
          },
          radius: {
            type: 'number',
            description: 'Radius of the circle',
          },
          fill: {
            type: 'string',
            description: 'Fill color in hex format',
          },
          opacity: {
            type: 'number',
            description: 'Opacity from 0 to 1',
          },
        },
        required: ['x', 'y', 'radius', 'fill'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'complete_slide',
      description:
        'Signals that the current slide is complete and ready to be displayed. Call this after adding all elements to a slide.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
]

// Types for tool arguments
export interface CreateSlideArgs {
  backgroundColor: string
}

export interface AddTextArgs {
  text: string
  x: number
  y: number
  width?: number
  fontSize: number
  fontWeight?: string
  fontFamily?: string
  color: string
  textAlign?: 'left' | 'center' | 'right'
}

export interface AddRectangleArgs {
  x: number
  y: number
  width: number
  height: number
  fill: string
  cornerRadius?: number
  opacity?: number
}

export interface AddCircleArgs {
  x: number
  y: number
  radius: number
  fill: string
  opacity?: number
}

export type ToolName =
  | 'create_slide'
  | 'add_text'
  | 'add_rectangle'
  | 'add_circle'
  | 'complete_slide'

export type ToolArgs =
  | CreateSlideArgs
  | AddTextArgs
  | AddRectangleArgs
  | AddCircleArgs
  | Record<string, never>
