/**
 * Espelho dos types do backend `apps/backend/src/page-builder/types.ts`.
 *
 * Mantemos uma cópia client-side pra evitar dependência cross-package.
 * Quando o backend mudar a forma do payload, atualize aqui também.
 */

export type SectionInstance = {
  id: string
  type: string
  settings: Record<string, unknown>
  enabled: boolean
}

export type PageTemplate = {
  sections: Record<string, SectionInstance>
  order: string[]
  updated_at?: string
}
