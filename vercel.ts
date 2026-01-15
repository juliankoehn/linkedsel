import type { VercelConfig } from '@vercel/config/v1'

export const config: VercelConfig = {
  framework: 'nextjs',
  buildCommand: 'pnpm run db:migrate && pnpm run build',
  installCommand: 'pnpm install',
}
