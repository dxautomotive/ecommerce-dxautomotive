import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
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
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

// ─── Types ────────────────────────────────────────────────────────

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

// ─── Constants ────────────────────────────────────────────────────

const TEMPLATE = "home"
const DRAFT_DEBOUNCE_MS = 700

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

// ─── Main Component ───────────────────────────────────────────────

const PageBuilder = () => {
  const [manifests, setManifests] = useState<Manifest[]>([])
  const [template, setTemplate] = useState<PageTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sidebarView, setSidebarView] = useState<"list" | "settings">("list")
  const [collections, setCollections] = useState<Collection[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [dirty, setDirty] = useState(false)
  const [storefrontUrl, setStorefrontUrl] = useState("http://localhost:8001")
  const [iframeKey, setIframeKey] = useState(0)

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  // ─── Initial load ──────────────────────────────────────────────
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
        .then((j) => setCategories(j.product_categories ?? [])),
      fetch("/admin/page-builder/config", { credentials: "include" })
        .then((r) => r.json())
        .then((j) => { if (j.storefrontUrl) setStorefrontUrl(j.storefrontUrl) })
        .catch(() => {}),
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

  const previewUrl = `${storefrontUrl}/preview/home?countryCode=br`

  // ─── Draft auto-save (debounced) ──────────────────────────────
  const saveDraft = useCallback(async (tpl: PageTemplate) => {
    try {
      await fetch(`/admin/page-builder/${TEMPLATE}/draft`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template: tpl }),
      })
      iframeRef.current?.contentWindow?.postMessage({ type: "dx:refresh" }, "*")
    } catch {
      // silently ignore draft errors
    }
  }, [])

  useEffect(() => {
    if (!template || !dirty) return
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current)
    draftTimerRef.current = setTimeout(() => saveDraft(template), DRAFT_DEBOUNCE_MS)
    return () => {
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current)
    }
  }, [template, dirty, saveDraft])

  // ─── Mutations ────────────────────────────────────────────────
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
    const newSection: SectionInstance = { id: newId, type, settings, enabled: true }
    setTemplate((t) => {
      if (!t) return t
      return {
        ...t,
        sections: { ...t.sections, [newId]: newSection },
        order: [...t.order, newId],
      }
    })
    setSelectedId(newId)
    setSidebarView("settings")
    setDirty(true)
  }

  const removeSection = (id: string) => {
    if (!confirm("Remover este bloco do template?")) return
    setTemplate((t) => {
      if (!t) return t
      const newSections = { ...t.sections }
      delete newSections[id]
      return { ...t, sections: newSections, order: t.order.filter((x) => x !== id) }
    })
    if (selectedId === id) {
      setSelectedId(null)
      setSidebarView("list")
    }
    setDirty(true)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setTemplate((t) => {
      if (!t) return t
      const oldIdx = t.order.indexOf(active.id as string)
      const newIdx = t.order.indexOf(over.id as string)
      return { ...t, order: arrayMove(t.order, oldIdx, newIdx) }
    })
    setDirty(true)
  }

  const selectSection = (id: string) => {
    setSelectedId(id)
    setSidebarView("settings")
  }

  // ─── Save (publish) ───────────────────────────────────────────
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
      // Reload iframe to show published state
      setIframeKey((k) => k + 1)
      toast.success("Publicado com sucesso")
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        background: "var(--ui-bg-base)",
      }}
    >
      {/* ── Header ── */}
      <header
        style={{
          padding: "10px 16px",
          borderBottom: "1px solid var(--ui-border-base)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexShrink: 0,
        }}
      >
        <div>
          <Heading level="h1" style={{ fontSize: 15 }}>
            Editor da loja · Home
          </Heading>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {dirty && (
            <Badge color="orange" size="2xsmall">
              Não publicado
            </Badge>
          )}
          <Button
            onClick={save}
            isLoading={saving}
            disabled={!dirty}
            size="small"
          >
            Publicar
          </Button>
        </div>
      </header>

      {/* ── Body: sidebar + iframe ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ── Left sidebar ── */}
        <aside
          style={{
            width: 340,
            minWidth: 340,
            borderRight: "1px solid var(--ui-border-base)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: "var(--ui-bg-base)",
          }}
        >
          {/* Sidebar top bar */}
          <div
            style={{
              padding: "10px 14px",
              borderBottom: "1px solid var(--ui-border-base)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexShrink: 0,
            }}
          >
            {sidebarView === "settings" && selectedManifest ? (
              <>
                <button
                  type="button"
                  onClick={() => setSidebarView("list")}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "2px 6px 2px 0",
                    color: "var(--ui-fg-subtle)",
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  ← Voltar
                </button>
                <span
                  style={{
                    fontSize: 16,
                    lineHeight: 1,
                  }}
                  aria-hidden="true"
                >
                  {selectedManifest.icon}
                </span>
                <Text weight="plus" size="small" style={{ flex: 1, minWidth: 0 }}>
                  {selectedManifest.label}
                </Text>
              </>
            ) : (
              <>
                <Text weight="plus" size="small" style={{ flex: 1 }}>
                  Blocos ({template.order.length})
                </Text>
                <AddBlockMenu manifests={manifests} onAdd={addSection} />
              </>
            )}
          </div>

          {/* Sidebar content */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {sidebarView === "list" ? (
              /* ── Section list with DnD ── */
              template.order.length === 0 ? (
                <div
                  style={{
                    padding: "32px 20px",
                    textAlign: "center",
                  }}
                >
                  <Text size="small" style={{ color: "var(--ui-fg-subtle)" }}>
                    Nenhum bloco. Use "+ Adicionar bloco" para começar.
                  </Text>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={template.order}
                    strategy={verticalListSortingStrategy}
                  >
                    <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
                      {template.order.map((id) => {
                        const sec = template.sections[id]
                        if (!sec) return null
                        const manifest = manifestByType[sec.type]
                        return (
                          <SortableSection
                            key={id}
                            id={id}
                            sec={sec}
                            manifest={manifest}
                            isSelected={selectedId === id}
                            onSelect={selectSection}
                            onToggleEnabled={(v) =>
                              updateSection(id, { enabled: v })
                            }
                            onRemove={() => removeSection(id)}
                          />
                        )
                      })}
                    </ol>
                  </SortableContext>
                </DndContext>
              )
            ) : (
              /* ── Settings panel ── */
              selectedSection && selectedManifest ? (
                <div style={{ padding: "16px 16px 32px" }}>
                  {selectedManifest.settings.length === 0 ? (
                    <div
                      style={{
                        background: "var(--ui-bg-subtle)",
                        borderRadius: 6,
                        padding: "20px 16px",
                        textAlign: "center",
                      }}
                    >
                      <Text size="small" style={{ color: "var(--ui-fg-subtle)" }}>
                        Este bloco não tem configurações editáveis. Você pode
                        apenas ativar/desativar e reordenar.
                      </Text>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                      {selectedManifest.settings.map((def) => (
                        <SettingField
                          key={def.key}
                          def={def}
                          value={selectedSection.settings[def.key]}
                          onChange={(v) =>
                            updateSetting(selectedSection.id, def.key, v)
                          }
                          collections={collections}
                          categories={categories}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : null
            )}
          </div>
        </aside>

        {/* ── Right: iframe preview ── */}
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            background: "#e5e7eb",
            overflow: "hidden",
          }}
        >
          {/* Iframe toolbar */}
          <div
            style={{
              padding: "6px 12px",
              background: "var(--ui-bg-base)",
              borderBottom: "1px solid var(--ui-border-base)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexShrink: 0,
            }}
          >
            <Text size="xsmall" style={{ color: "var(--ui-fg-muted)", fontFamily: "monospace" }}>
              {previewUrl}
            </Text>
            <button
              type="button"
              title="Recarregar preview"
              onClick={() => setIframeKey((k) => k + 1)}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--ui-fg-subtle)",
                fontSize: 14,
                padding: "2px 6px",
              }}
            >
              ↺
            </button>
          </div>
          <iframe
            key={iframeKey}
            ref={iframeRef}
            src={previewUrl}
            style={{
              flex: 1,
              width: "100%",
              border: "none",
              background: "white",
            }}
            title="Preview da loja"
          />
        </main>
      </div>
    </div>
  )
}

// ─── SortableSection ──────────────────────────────────────────────

type SortableSectionProps = {
  id: string
  sec: SectionInstance
  manifest?: Manifest
  isSelected: boolean
  onSelect: (id: string) => void
  onToggleEnabled: (v: boolean) => void
  onRemove: () => void
}

function SortableSection({
  id,
  sec,
  manifest,
  isSelected,
  onSelect,
  onToggleEnabled,
  onRemove,
}: SortableSectionProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(id)}
    >
      <div
        style={{
          padding: "10px 12px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          cursor: "pointer",
          background: isSelected
            ? "var(--ui-bg-base-hover)"
            : "transparent",
          borderBottom: "1px solid var(--ui-border-base)",
          transition: "background 0.1s",
        }}
      >
        {/* Drag handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "none",
            border: "none",
            cursor: "grab",
            color: "var(--ui-fg-subtle)",
            padding: "2px 4px",
            fontSize: 14,
            lineHeight: 1,
            flexShrink: 0,
          }}
          aria-label="Arrastar"
        >
          ⠿
        </button>

        {/* Icon */}
        <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>
          {manifest?.icon ?? "📄"}
        </span>

        {/* Label + summary */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Text
              weight="plus"
              size="small"
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
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
            style={{
              color: "var(--ui-fg-muted)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              marginTop: 2,
            }}
          >
            {summarize(sec, manifest)}
          </Text>
        </div>

        {/* Controls */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            alignItems: "center",
            flexShrink: 0,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Switch
            checked={sec.enabled}
            onCheckedChange={onToggleEnabled}
          />
          <button
            type="button"
            onClick={onRemove}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--ui-fg-muted)",
              fontSize: 11,
              padding: "1px 4px",
            }}
            aria-label="Remover"
          >
            ✕
          </button>
        </div>
      </div>
    </li>
  )
}

// ─── AddBlockMenu ─────────────────────────────────────────────────

const AddBlockMenu = ({
  manifests,
  onAdd,
}: {
  manifests: Manifest[]
  onAdd: (type: string) => void
}) => {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: "relative" }}>
      <Button
        size="xsmall"
        variant="secondary"
        onClick={() => setOpen((s) => !s)}
      >
        + Adicionar
      </Button>
      {open && (
        <>
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 10,
            }}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "100%",
              marginTop: 4,
              zIndex: 20,
              width: 260,
              background: "var(--ui-bg-base)",
              border: "1px solid var(--ui-border-base)",
              borderRadius: 8,
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              maxHeight: 360,
              overflowY: "auto",
            }}
          >
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {manifests.map((m) => (
                <li
                  key={m.type}
                  style={{ borderBottom: "1px solid var(--ui-border-base)" }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onAdd(m.type)
                      setOpen(false)
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 12px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                    }}
                  >
                    <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>
                      {m.icon}
                    </span>
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--ui-fg-base)",
                        }}
                      >
                        {m.label}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--ui-fg-muted)",
                          marginTop: 2,
                        }}
                      >
                        {m.description}
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

// ─── SettingField ─────────────────────────────────────────────────

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
        <span
          style={{
            display: "block",
            color: "var(--ui-fg-muted)",
            fontSize: 11,
            fontWeight: 400,
            marginTop: 2,
          }}
        >
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
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
              onChange(
                e.target.value === "" ? undefined : Number(e.target.value)
              )
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
      const removeItem = (idx: number) => onChange(items.filter((_, i) => i !== idx))
      const moveItem = (idx: number, dir: "up" | "down") => {
        const arr = [...items]
        const to = dir === "up" ? idx - 1 : idx + 1
        if (to < 0 || to >= arr.length) return
        ;[arr[idx], arr[to]] = [arr[to], arr[idx]]
        onChange(arr)
      }
      const updateField = (idx: number, key: string, val: unknown) =>
        onChange(items.map((item, i) => (i === idx ? { ...item, [key]: val } : item)))

      return (
        <div>
          {baseLabel}
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 10 }}>
            {items.length === 0 && (
              <Text
                size="xsmall"
                style={{ color: "var(--ui-fg-muted)", fontStyle: "italic" }}
              >
                Nenhum item. Clique em "+ Adicionar" para começar.
              </Text>
            )}
            {items.map((item, idx) => (
              <div
                key={(item.id as string) || idx}
                style={{
                  border: "1px solid var(--ui-border-base)",
                  borderRadius: 6,
                  padding: 12,
                  background: "var(--ui-bg-subtle)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <Text weight="plus" size="xsmall">
                    Item {idx + 1}
                  </Text>
                  <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveItem(idx, "up")}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--ui-fg-subtle)",
                        opacity: idx === 0 ? 0.3 : 1,
                        fontSize: 11,
                        padding: "2px 4px",
                      }}
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      disabled={idx === items.length - 1}
                      onClick={() => moveItem(idx, "down")}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--ui-fg-subtle)",
                        opacity: idx === items.length - 1 ? 0.3 : 1,
                        fontSize: 11,
                        padding: "2px 4px",
                      }}
                    >
                      ▼
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--ui-fg-muted)",
                        fontSize: 11,
                        padding: "2px 6px",
                        marginLeft: 4,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
          <Text size="small" style={{ color: "var(--ui-fg-muted)" }}>
            Tipo "{def.type}" não suportado.
          </Text>
        </div>
      )
  }
}

// ─── Helpers ──────────────────────────────────────────────────────

const summarize = (sec: SectionInstance, manifest?: Manifest) => {
  if (!manifest) return ""
  const titleSetting = manifest.settings.find(
    (s) => (s.type === "text" || s.type === "textarea") && sec.settings[s.key]
  )
  if (titleSetting) {
    const v = sec.settings[titleSetting.key] as string
    return v.length > 55 ? v.slice(0, 55) + "…" : v
  }
  const blockSetting = manifest.settings.find((s) => s.type === "block_array")
  if (blockSetting) {
    const arr = sec.settings[blockSetting.key]
    const count = Array.isArray(arr) ? arr.length : 0
    return count > 0
      ? `${count} ${count === 1 ? "item" : "itens"}`
      : "Sem itens (usa padrão)"
  }
  return manifest.description
}

export const config = defineRouteConfig({
  label: "Editor da loja",
})

export default PageBuilder
