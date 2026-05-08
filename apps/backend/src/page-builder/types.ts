/**
 * Sistema de page builder estilo Shopify para o storefront DX.
 *
 * Cada **section** é um componente React fixo no código do storefront
 * (Hero, BenefitsBar, FeaturedProducts, etc). O lojista, no admin,
 * **instancia** uma section, define **settings** (texto, cor, qual
 * coleção, quantos produtos) e ordena.
 *
 * O JSON resultante vive em `store.metadata.page_templates.<template>`
 * — sem migration, sem novo module. O storefront lê via
 * `/store/page-builder/<template>` e renderiza dinamicamente.
 *
 * Fonte da verdade dos manifests: este arquivo + `./manifests.ts`.
 */

export type SettingType =
  | "text"
  | "textarea"
  | "boolean"
  | "number"
  | "color"
  | "url"
  | "collection_picker"
  | "category_picker"
  | "select"
  | "block_array"

export type SettingDef = {
  key: string
  type: SettingType
  label: string
  hint?: string
  default?: unknown
  /** Para `select` apenas */
  options?: Array<{ value: string; label: string }>
  /** Para `number` */
  min?: number
  max?: number
  /** Para `block_array` — schema dos campos de cada item */
  itemSchema?: { fields: SettingDef[] }
  minItems?: number
  maxItems?: number
}

export type SectionManifest = {
  /** Identificador estável do tipo (ex: "hero-carousel"). Não muda nunca. */
  type: string
  /** Nome amigável exibido no admin. */
  label: string
  /** Emoji/ícone exibido no admin. */
  icon: string
  /** Descrição curta exibida no admin (max 120 chars). */
  description: string
  /** Schema dos campos editáveis. Pode ser vazio (section sem settings). */
  settings: SettingDef[]
  /** Pode aparecer mais de 1 vez no template? (ex: featured-collection-block sim) */
  allowMultiple?: boolean
}

export type SectionInstance = {
  /** ID único da instância (ex: `sec_xxx`). Estável entre saves. */
  id: string
  /** Aponta para `SectionManifest.type`. */
  type: string
  /** Valores configurados pelo lojista. Validados contra o manifest. */
  settings: Record<string, unknown>
  /** Se `false`, a section fica oculta no storefront mas continua no template. */
  enabled: boolean
}

export type PageTemplate = {
  /** Lista de instâncias indexada pelo id. */
  sections: Record<string, SectionInstance>
  /** Ordem de renderização (ids). Sections fora dessa lista não renderizam. */
  order: string[]
  /** Timestamp da última modificação no admin. */
  updated_at?: string
}

export type PageBuilderConfig = {
  page_templates: {
    home?: PageTemplate
    [otherTemplate: string]: PageTemplate | undefined
  }
}

/** Cria uma instância nova de section com defaults aplicados a partir do manifest. */
export function instantiateSection(
  manifest: SectionManifest,
  id: string
): SectionInstance {
  const settings: Record<string, unknown> = {}
  for (const def of manifest.settings) {
    if (def.default !== undefined) {
      settings[def.key] = def.default
    }
  }
  return { id, type: manifest.type, settings, enabled: true }
}

/** Gera id de instância único (ex: `sec_lkj2_3a8`). */
export function generateSectionId(): string {
  const ts = Date.now().toString(36)
  const rnd = Math.random().toString(36).slice(2, 6)
  return `sec_${ts}_${rnd}`
}
