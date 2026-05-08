import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Badge,
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
import { useEffect, useMemo, useState } from "react"

type SettingType =
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

type SettingDef = {
  key: string
  type: SettingType
  label: string
  hint?: string
  default?: unknown
  options?: Array<{ value: string; label: string }>
  min?: number
  max?: number
  itemSchema?: { fields: SettingDef[] }
  minItems?: number
  maxItems?: number
}

type BlockItem = Record<string, unknown> & { id: string }

type Manifest = {
  type: string
  label: string
  icon: string
  description: string
  settings: SettingDef[]
  allowMultiple?: boolean
}

type SectionInstance = {
  id: string
  type: string
  settings: Record<string, unknown>
  enabled: boolean
}

type PageTemplate = {
  sections: Record<string, SectionInstance>
  order: string[]
  updated_at?: string
}

type Collection = { id: string; title: string; handle: string }
type Category = { id: string; name: string; handle: string }

const TEMPLATE = "home"

const generateId = () => {
  const ts = Date.now().toString(36)
  const rnd = Math.random().toString(36).slice(2, 6)
  return `sec_${ts}_${rnd}`
}

const generateBlockId = () => {
  const ts = Date.now().toString(36)
  const rnd = Math.random().toString(36).slice(2, 4)
  return `blk_${ts}_${rnd}`
}

const PageBuilder = () => {
  const [manifests, setManifests] = useState<Manifest[]>([])
  const [template, setTemplate] = useState<PageTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [collections, setCollections] = useState<Collection[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [dirty, setDirty] = useState(false)

  // ─── Carregamento inicial ─────────────────────────────────────
  useEffect(() => {
    Promise.all([
      fetch("/admin/page-builder/manifests", { credentials: "include" })
        .then((r) => r.json())
        .then((j) => setManifests(j.manifests ?? [])),
      fetch(`/admin/page-builder/${TEMPLATE}`, { credentials: "include" })
        .then((r) => r.json())
        .then((j) => setTemplate(j.template ?? { sections: {}, order: [] })),
      fetch("/admin/collections?limit=100&fields=id,title,handle", {
        credentials: "include",
      })
        .then((r) => r.json())
        .then((j) => setCollections(j.collections ?? [])),
      fetch("/admin/product-categories?limit=100&fields=id,name,handle", {
        credentials: "include",
      })
        .then((r) => r.json())
        .then((j) =>
          setCategories(
            (j.product_categories ?? []).map(
              (c: { id: string; name: string; handle: string }) => c
            )
          )
        ),
    ]).finally(() => setLoading(false))
  }, [])

  const manifestByType = useMemo(() => {
    const map: Record<string, Manifest> = {}
    for (const m of manifests) map[m.type] = m
    return map
  }, [manifests])

  const selectedSection = selectedId ? template?.sections[selectedId] : null
  const selectedManifest = selectedSection
    ? manifestByType[selectedSection.type]
    : null

  // ─── Mutações no template ─────────────────────────────────────
  const updateSection = (id: string, patch: Partial<SectionInstance>) => {
    setTemplate((t) => {
      if (!t) return t
      return {
        ...t,
        sections: { ...t.sections, [id]: { ...t.sections[id], ...patch } },
      }
    })
    setDirty(true)
  }

  const updateSetting = (id: string, key: string, value: unknown) => {
    setTemplate((t) => {
      if (!t) return t
      const sec = t.sections[id]
      if (!sec) return t
      return {
        ...t,
        sections: {
          ...t.sections,
          [id]: { ...sec, settings: { ...sec.settings, [key]: value } },
        },
      }
    })
    setDirty(true)
  }

  const addSection = (type: string) => {
    const manifest = manifestByType[type]
    if (!manifest) return

    if (
      !manifest.allowMultiple &&
      template?.order.some((id) => template.sections[id]?.type === type)
    ) {
      toast.warning(`Já existe um bloco "${manifest.label}" no template`)
      return
    }

    const newId = generateId()
    const settings: Record<string, unknown> = {}
    for (const def of manifest.settings) {
      if (def.default !== undefined) settings[def.key] = def.default
    }
    const newSection: SectionInstance = {
      id: newId,
      type,
      settings,
      enabled: true,
    }
    setTemplate((t) => {
      if (!t) return t
      return {
        ...t,
        sections: { ...t.sections, [newId]: newSection },
        order: [...t.order, newId],
      }
    })
    setSelectedId(newId)
    setDirty(true)
  }

  const removeSection = (id: string) => {
    if (!confirm("Remover este bloco do template?")) return
    setTemplate((t) => {
      if (!t) return t
      const newSections = { ...t.sections }
      delete newSections[id]
      return {
        ...t,
        sections: newSections,
        order: t.order.filter((x) => x !== id),
      }
    })
    if (selectedId === id) setSelectedId(null)
    setDirty(true)
  }

  const moveSection = (id: string, direction: "up" | "down") => {
    setTemplate((t) => {
      if (!t) return t
      const idx = t.order.indexOf(id)
      if (idx < 0) return t
      const newIdx = direction === "up" ? idx - 1 : idx + 1
      if (newIdx < 0 || newIdx >= t.order.length) return t
      const newOrder = [...t.order]
      ;[newOrder[idx], newOrder[newIdx]] = [newOrder[newIdx], newOrder[idx]]
      return { ...t, order: newOrder }
    })
    setDirty(true)
  }

  // ─── Salvar ───────────────────────────────────────────────────
  const save = async () => {
    if (!template) return
    setSaving(true)
    try {
      const res = await fetch(`/admin/page-builder/${TEMPLATE}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.message ?? `HTTP ${res.status}`)
      }
      const j = await res.json()
      setTemplate(j.template)
      setDirty(false)
      toast.success("Template salvo com sucesso")
    } catch (e) {
      toast.error(`Erro ao salvar: ${e instanceof Error ? e.message : e}`)
    } finally {
      setSaving(false)
    }
  }

  // ─── Render ───────────────────────────────────────────────────
  if (loading) {
    return (
      <Container className="p-6">
        <Text>Carregando editor da loja…</Text>
      </Container>
    )
  }

  if (!template) {
    return (
      <Container className="p-6">
        <Text>Erro ao carregar template.</Text>
      </Container>
    )
  }

  return (
    <Container className="p-0">
      <header className="px-6 py-4 border-b border-ui-border-base flex items-center justify-between gap-4 flex-wrap">
        <div>
          <Heading level="h1">Editor da loja · Home</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Adicione, ative/desative, reordene e configure os blocos da
            página inicial. Salvo em <code>store.metadata.page_template_home</code>.
          </Text>
        </div>
        <div className="flex items-center gap-2">
          {dirty && (
            <Badge color="orange" size="2xsmall">
              Alterações não salvas
            </Badge>
          )}
          <Button
            onClick={save}
            isLoading={saving}
            disabled={!dirty}
            size="small"
          >
            Salvar e publicar
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] min-h-[calc(100vh-200px)]">
        {/* Coluna esquerda — lista de blocos */}
        <aside className="border-r border-ui-border-base flex flex-col">
          <div className="px-5 py-4 border-b border-ui-border-base">
            <div className="flex items-center justify-between gap-2">
              <Text weight="plus" size="small">
                Blocos da home ({template.order.length})
              </Text>
              <AddBlockMenu manifests={manifests} onAdd={addSection} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {template.order.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <Text size="small" className="text-ui-fg-subtle">
                  Nenhum bloco. Use "+ Adicionar bloco" pra começar.
                </Text>
              </div>
            ) : (
              <ol className="divide-y divide-ui-border-base">
                {template.order.map((id, i) => {
                  const sec = template.sections[id]
                  if (!sec) return null
                  const manifest = manifestByType[sec.type]
                  const isSelected = selectedId === id
                  return (
                    <li
                      key={id}
                      className={`px-4 py-3 cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-ui-bg-base-hover"
                          : "hover:bg-ui-bg-subtle"
                      }`}
                      onClick={() => setSelectedId(id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col gap-1 flex-shrink-0">
                          <button
                            type="button"
                            disabled={i === 0}
                            onClick={(e) => {
                              e.stopPropagation()
                              moveSection(id, "up")
                            }}
                            className="text-ui-fg-subtle hover:text-ui-fg-base disabled:opacity-30 text-sm"
                            aria-label="Mover para cima"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            disabled={i === template.order.length - 1}
                            onClick={(e) => {
                              e.stopPropagation()
                              moveSection(id, "down")
                            }}
                            className="text-ui-fg-subtle hover:text-ui-fg-base disabled:opacity-30 text-sm"
                            aria-label="Mover para baixo"
                          >
                            ▼
                          </button>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-lg" aria-hidden="true">
                              {manifest?.icon ?? "📄"}
                            </span>
                            <Text weight="plus" size="small" className="truncate">
                              {manifest?.label ?? sec.type}
                            </Text>
                            {!sec.enabled && (
                              <Badge color="grey" size="2xsmall">
                                Oculto
                              </Badge>
                            )}
                          </div>
                          <Text
                            size="xsmall"
                            className="text-ui-fg-muted truncate mt-0.5"
                          >
                            {summarize(sec, manifest)}
                          </Text>
                        </div>

                        <div className="flex flex-col gap-1.5 items-center flex-shrink-0">
                          <Switch
                            checked={sec.enabled}
                            onCheckedChange={(v) => updateSection(id, { enabled: v })}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeSection(id)
                            }}
                            className="text-ui-fg-muted hover:text-rose-500 text-xs"
                            aria-label="Remover"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ol>
            )}
          </div>
        </aside>

        {/* Coluna direita — settings */}
        <main className="flex flex-col">
          {!selectedSection || !selectedManifest ? (
            <div className="flex-1 flex items-center justify-center px-6 py-12 text-center">
              <div className="max-w-sm">
                <Heading level="h3" className="mb-2">
                  Nenhum bloco selecionado
                </Heading>
                <Text size="small" className="text-ui-fg-subtle">
                  Clique num bloco da lista à esquerda para editar suas
                  configurações. Ou adicione um bloco novo.
                </Text>
              </div>
            </div>
          ) : (
            <div className="px-6 py-5">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl" aria-hidden="true">
                      {selectedManifest.icon}
                    </span>
                    <Heading level="h2">{selectedManifest.label}</Heading>
                  </div>
                  <Text size="small" className="text-ui-fg-subtle mt-1">
                    {selectedManifest.description}
                  </Text>
                  <Text size="xsmall" className="text-ui-fg-muted font-mono mt-1">
                    id: {selectedSection.id} · tipo: {selectedSection.type}
                  </Text>
                </div>
              </div>

              {selectedManifest.settings.length === 0 ? (
                <div className="bg-ui-bg-subtle rounded-md px-4 py-6 text-center">
                  <Text size="small" className="text-ui-fg-subtle">
                    Este bloco não tem configurações editáveis. Você pode
                    apenas ativar/desativar e reordenar.
                  </Text>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-y-5 max-w-2xl">
                  {selectedManifest.settings.map((def) => (
                    <SettingField
                      key={def.key}
                      def={def}
                      value={selectedSection.settings[def.key]}
                      onChange={(v) => updateSetting(selectedSection.id, def.key, v)}
                      collections={collections}
                      categories={categories}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </Container>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────

const AddBlockMenu = ({
  manifests,
  onAdd,
}: {
  manifests: Manifest[]
  onAdd: (type: string) => void
}) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <Button
        size="small"
        variant="secondary"
        onClick={() => setOpen((s) => !s)}
      >
        + Adicionar bloco
      </Button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-full mt-1 z-20 w-72 bg-ui-bg-base border border-ui-border-base rounded-md shadow-lg max-h-[400px] overflow-y-auto">
            <ul className="divide-y divide-ui-border-base">
              {manifests.map((m) => (
                <li key={m.type}>
                  <button
                    type="button"
                    onClick={() => {
                      onAdd(m.type)
                      setOpen(false)
                    }}
                    className="w-full text-left px-3 py-2.5 hover:bg-ui-bg-base-hover transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg" aria-hidden="true">
                        {m.icon}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold">{m.label}</div>
                        <div className="text-xs text-ui-fg-muted">
                          {m.description}
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}

const SettingField = ({
  def,
  value,
  onChange,
  collections,
  categories,
}: {
  def: SettingDef
  value: unknown
  onChange: (v: unknown) => void
  collections: Collection[]
  categories: Category[]
}) => {
  const id = `setting-${def.key}`
  const baseLabel = (
    <Label htmlFor={id}>
      {def.label}
      {def.hint && (
        <span className="block text-ui-fg-muted text-xs font-normal mt-0.5">
          {def.hint}
        </span>
      )}
    </Label>
  )

  switch (def.type) {
    case "text":
    case "url":
      return (
        <div>
          {baseLabel}
          <Input
            id={id}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      )
    case "textarea":
      return (
        <div>
          {baseLabel}
          <Textarea
            id={id}
            rows={3}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      )
    case "boolean":
      return (
        <div className="flex items-center gap-3">
          <Switch
            id={id}
            checked={!!value}
            onCheckedChange={(v) => onChange(v)}
          />
          {baseLabel}
        </div>
      )
    case "number":
      return (
        <div>
          {baseLabel}
          <Input
            id={id}
            type="number"
            min={def.min}
            max={def.max}
            value={(value as number | undefined) ?? ""}
            onChange={(e) =>
              onChange(e.target.value === "" ? undefined : Number(e.target.value))
            }
          />
        </div>
      )
    case "color":
      return (
        <div>
          {baseLabel}
          <Input
            id={id}
            type="color"
            value={(value as string) ?? "#000000"}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      )
    case "collection_picker": {
      const SENTINEL = "__none__"
      const current = (value as string) || SENTINEL
      return (
        <div>
          {baseLabel}
          <Select
            value={current}
            onValueChange={(v) => onChange(v === SENTINEL ? "" : v)}
          >
            <Select.Trigger id={id}>
              <Select.Value placeholder="Selecione uma coleção…" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value={SENTINEL}>— Nenhuma —</Select.Item>
              {collections.map((c) => (
                <Select.Item key={c.handle} value={c.handle}>
                  {c.title} ({c.handle})
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
      )
    }
    case "category_picker": {
      const SENTINEL = "__none__"
      const current = (value as string) || SENTINEL
      return (
        <div>
          {baseLabel}
          <Select
            value={current}
            onValueChange={(v) => onChange(v === SENTINEL ? "" : v)}
          >
            <Select.Trigger id={id}>
              <Select.Value placeholder="Selecione uma categoria…" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value={SENTINEL}>— Todas —</Select.Item>
              {categories.map((c) => (
                <Select.Item key={c.handle} value={c.handle}>
                  {c.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
      )
    }
    case "select":
      return (
        <div>
          {baseLabel}
          <Select
            value={(value as string) ?? ""}
            onValueChange={(v) => onChange(v)}
          >
            <Select.Trigger id={id}>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              {(def.options ?? []).map((o) => (
                <Select.Item key={o.value} value={o.value}>
                  {o.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
      )
    case "block_array": {
      const items = Array.isArray(value) ? (value as BlockItem[]) : []
      const schema = def.itemSchema
      const canAdd = !def.maxItems || items.length < def.maxItems

      const addItem = () => {
        const newItem: BlockItem = { id: generateBlockId() }
        for (const f of schema?.fields ?? []) {
          if (f.default !== undefined) newItem[f.key] = f.default
        }
        onChange([...items, newItem])
      }

      const removeItem = (idx: number) => {
        onChange(items.filter((_, i) => i !== idx))
      }

      const moveItem = (idx: number, dir: "up" | "down") => {
        const arr = [...items]
        const to = dir === "up" ? idx - 1 : idx + 1
        if (to < 0 || to >= arr.length) return
        ;[arr[idx], arr[to]] = [arr[to], arr[idx]]
        onChange(arr)
      }

      const updateField = (idx: number, key: string, val: unknown) => {
        onChange(items.map((item, i) => (i === idx ? { ...item, [key]: val } : item)))
      }

      return (
        <div>
          {baseLabel}
          <div className="mt-2 space-y-3">
            {items.length === 0 && (
              <Text size="xsmall" className="text-ui-fg-muted italic">
                Nenhum item. Clique em "+ Adicionar" para começar.
              </Text>
            )}
            {items.map((item, idx) => (
              <div
                key={(item.id as string) || idx}
                className="border border-ui-border-base rounded-md p-3 bg-ui-bg-subtle"
              >
                <div className="flex items-center justify-between mb-3">
                  <Text weight="plus" size="xsmall">
                    Item {idx + 1}
                  </Text>
                  <div className="flex gap-1 items-center">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveItem(idx, "up")}
                      className="text-ui-fg-subtle hover:text-ui-fg-base disabled:opacity-30 text-xs px-1"
                      title="Mover para cima"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      disabled={idx === items.length - 1}
                      onClick={() => moveItem(idx, "down")}
                      className="text-ui-fg-subtle hover:text-ui-fg-base disabled:opacity-30 text-xs px-1"
                      title="Mover para baixo"
                    >
                      ▼
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="text-ui-fg-muted hover:text-rose-500 text-xs px-1 ml-1"
                      title="Remover item"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {(schema?.fields ?? []).map((fieldDef) => (
                    <SettingField
                      key={fieldDef.key}
                      def={fieldDef}
                      value={item[fieldDef.key]}
                      onChange={(v) => updateField(idx, fieldDef.key, v)}
                      collections={collections}
                      categories={categories}
                    />
                  ))}
                </div>
              </div>
            ))}
            {canAdd && (
              <Button
                variant="secondary"
                size="xsmall"
                type="button"
                onClick={addItem}
              >
                + Adicionar
              </Button>
            )}
          </div>
        </div>
      )
    }
    default:
      return (
        <div>
          {baseLabel}
          <Text size="small" className="text-ui-fg-muted">
            Tipo "{def.type}" não suportado pelo editor.
          </Text>
        </div>
      )
  }
}

const summarize = (sec: SectionInstance, manifest?: Manifest) => {
  if (!manifest) return ""
  const titleSetting = manifest.settings.find(
    (s) => (s.type === "text" || s.type === "textarea") && sec.settings[s.key]
  )
  if (titleSetting) {
    const v = sec.settings[titleSetting.key] as string
    return v.length > 60 ? v.slice(0, 60) + "…" : v
  }
  const blockSetting = manifest.settings.find((s) => s.type === "block_array")
  if (blockSetting) {
    const arr = sec.settings[blockSetting.key]
    const count = Array.isArray(arr) ? arr.length : 0
    return count > 0 ? `${count} ${count === 1 ? "item" : "itens"} configurados` : "Sem itens (usa padrão)"
  }
  return manifest.description
}

export const config = defineRouteConfig({
  label: "Editor da loja",
})

export default PageBuilder
