import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps } from "@medusajs/framework/types"
import {
  Button,
  Container,
  Heading,
  Input,
  Label,
  Select,
  Switch,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useEffect, useState } from "react"

type Collection = {
  id: string
  metadata?: Record<string, unknown> | null
}

type Meta = {
  subtitle: string
  image_url: string
  gradient_from: string
  gradient_to: string
  gradient_deg: number
  cta_label: string
  cta_url: string
  layout: "vertical" | "horizontal"
  is_featured: boolean
  display_order: number
}

const DEFAULTS: Meta = {
  subtitle: "",
  image_url: "",
  gradient_from: "#1e40af",
  gradient_to: "#0ea5e9",
  gradient_deg: 135,
  cta_label: "Ver tudo →",
  cta_url: "",
  layout: "vertical",
  is_featured: false,
  display_order: 99,
}

/**
 * Widget na página de detalhe da coleção (zone product_collection.details.after).
 *
 * Edita os custom fields que o storefront DX consome via `metadata` (jsonb)
 * para renderizar `<FeaturedCollection>` com gradient, CTA, layout e
 * controle de "aparece na home".
 *
 * Salva em PATCH /admin/collections/:id com { metadata: {...} }.
 */
const CollectionMetaEditor = ({ data }: DetailWidgetProps<Collection>) => {
  const collectionId = data.id

  const fromMetadata = (m: Record<string, unknown> | null | undefined): Meta => ({
    subtitle: typeof m?.subtitle === "string" ? m.subtitle : DEFAULTS.subtitle,
    image_url: typeof m?.image_url === "string" ? m.image_url : DEFAULTS.image_url,
    gradient_from:
      typeof m?.gradient_from === "string"
        ? m.gradient_from
        : DEFAULTS.gradient_from,
    gradient_to:
      typeof m?.gradient_to === "string" ? m.gradient_to : DEFAULTS.gradient_to,
    gradient_deg:
      typeof m?.gradient_deg === "number"
        ? m.gradient_deg
        : DEFAULTS.gradient_deg,
    cta_label:
      typeof m?.cta_label === "string" ? m.cta_label : DEFAULTS.cta_label,
    cta_url: typeof m?.cta_url === "string" ? m.cta_url : DEFAULTS.cta_url,
    layout:
      m?.layout === "horizontal" ? "horizontal" : DEFAULTS.layout,
    is_featured:
      typeof m?.is_featured === "boolean"
        ? m.is_featured
        : DEFAULTS.is_featured,
    display_order:
      typeof m?.display_order === "number"
        ? m.display_order
        : DEFAULTS.display_order,
  })

  const [meta, setMeta] = useState<Meta>(fromMetadata(data.metadata))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setMeta(fromMetadata(data.metadata))
  }, [data.metadata])

  const set = <K extends keyof Meta>(k: K, v: Meta[K]) =>
    setMeta((p) => ({ ...p, [k]: v }))

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/admin/collections/${collectionId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metadata: {
            ...((data.metadata ?? {}) as Record<string, unknown>),
            ...meta,
          },
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.message ?? `HTTP ${res.status}`)
      }
      toast.success("Metadata DX salvo com sucesso")
    } catch (e) {
      toast.error(`Erro ao salvar: ${e instanceof Error ? e.message : e}`)
    } finally {
      setSaving(false)
    }
  }

  const previewBg = `linear-gradient(${meta.gradient_deg}deg, ${meta.gradient_from}, ${meta.gradient_to})`

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">Apresentação no storefront DX</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          Define como esta coleção aparece na home e na página de coleção do
          storefront. Salvo em <code>metadata</code>.
        </Text>
      </div>

      <div className="px-6 py-4 grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-4">
        <div className="lg:col-span-2">
          <Label htmlFor="subtitle">Subtítulo (max 120 chars)</Label>
          <Textarea
            id="subtitle"
            rows={2}
            maxLength={120}
            value={meta.subtitle}
            onChange={(e) => set("subtitle", e.target.value)}
            placeholder="Ex: O que mais sai da prateleira"
          />
        </div>

        <div className="lg:col-span-2">
          <Label htmlFor="image_url">URL da imagem hero (opcional)</Label>
          <Input
            id="image_url"
            type="url"
            value={meta.image_url}
            onChange={(e) => set("image_url", e.target.value)}
            placeholder="https://media.dxautomotive.com.br/colecoes/x.jpg"
          />
        </div>

        <div>
          <Label htmlFor="gradient_from">Cor inicial do gradient</Label>
          <Input
            id="gradient_from"
            type="color"
            value={meta.gradient_from}
            onChange={(e) => set("gradient_from", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="gradient_to">Cor final do gradient</Label>
          <Input
            id="gradient_to"
            type="color"
            value={meta.gradient_to}
            onChange={(e) => set("gradient_to", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="gradient_deg">Ângulo do gradient (graus)</Label>
          <Input
            id="gradient_deg"
            type="number"
            min={0}
            max={360}
            value={meta.gradient_deg}
            onChange={(e) =>
              set("gradient_deg", parseInt(e.target.value, 10) || 0)
            }
          />
        </div>
        <div>
          <Label>Preview</Label>
          <div
            className="rounded-md border border-ui-border-base h-10 w-full"
            style={{ background: previewBg }}
            aria-hidden="true"
          />
        </div>

        <div>
          <Label htmlFor="cta_label">Texto do CTA</Label>
          <Input
            id="cta_label"
            value={meta.cta_label}
            onChange={(e) => set("cta_label", e.target.value)}
            placeholder="Ver tudo →"
          />
        </div>
        <div>
          <Label htmlFor="cta_url">URL do CTA (opcional)</Label>
          <Input
            id="cta_url"
            value={meta.cta_url}
            onChange={(e) => set("cta_url", e.target.value)}
            placeholder="(em branco usa /colecoes/<handle>)"
          />
        </div>

        <div>
          <Label htmlFor="layout">Layout dos cards</Label>
          <Select
            value={meta.layout}
            onValueChange={(v) =>
              set("layout", v === "horizontal" ? "horizontal" : "vertical")
            }
          >
            <Select.Trigger id="layout">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="vertical">Vertical (grade)</Select.Item>
              <Select.Item value="horizontal">Horizontal (scroll)</Select.Item>
            </Select.Content>
          </Select>
        </div>
        <div>
          <Label htmlFor="display_order">Ordem na home</Label>
          <Input
            id="display_order"
            type="number"
            min={0}
            max={999}
            value={meta.display_order}
            onChange={(e) =>
              set("display_order", parseInt(e.target.value, 10) || 0)
            }
          />
        </div>

        <div className="lg:col-span-2 flex items-center gap-3 pt-2">
          <Switch
            id="is_featured"
            checked={meta.is_featured}
            onCheckedChange={(v) => set("is_featured", v)}
          />
          <Label htmlFor="is_featured" className="cursor-pointer">
            Aparece como bloco em destaque na home
          </Label>
        </div>
      </div>

      <div className="px-6 py-4 flex justify-end">
        <Button onClick={save} isLoading={saving}>
          Salvar apresentação
        </Button>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product_collection.details.after",
})

export default CollectionMetaEditor
