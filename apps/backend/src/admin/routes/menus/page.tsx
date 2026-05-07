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
  Tooltip,
  toast,
} from "@medusajs/ui"
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"

// ─── Tipos ────────────────────────────────────────────────────────

type ItemType =
  | "link"
  | "external"
  | "home"
  | "search"
  | "catalog"
  | "category"
  | "collection"
  | "product"
  | "policy"

type MenuRow = {
  id: string
  handle: string
  label: string
  position: number
  item_count: number
  is_default: boolean
  created_at: string
}

type MenuItem = {
  id: string
  menu_id: string
  parent_item_id: string | null
  label: string
  type: ItemType
  target_id: string | null
  target_url: string | null
  position: number
  open_in_new_tab: boolean
}

type MenuItemTree = MenuItem & {
  children: MenuItemTree[]
}

type MenuDetail = MenuRow & {
  items: MenuItemTree[]
}

type Collection = { id: string; title: string; handle: string }
type Category = { id: string; name: string; handle: string }
type Product = { id: string; title: string; handle: string }

const TYPE_LABEL: Record<ItemType, string> = {
  link: "Link interno",
  external: "Link externo",
  home: "Página inicial",
  search: "Busca",
  catalog: "Catálogo (todos os produtos)",
  category: "Categoria",
  collection: "Coleção",
  product: "Produto",
  policy: "Política",
}

const TYPE_COLOR: Record<
  ItemType,
  "blue" | "green" | "purple" | "orange" | "red" | "grey"
> = {
  link: "blue",
  external: "orange",
  home: "grey",
  search: "grey",
  catalog: "grey",
  category: "green",
  collection: "purple",
  product: "red",
  policy: "blue",
}

const POLICIES: Array<{ slug: string; label: string }> = [
  { slug: "privacidade", label: "Política de privacidade" },
  { slug: "trocas-e-devolucoes", label: "Trocas e devoluções" },
  { slug: "entrega", label: "Política de entrega" },
  { slug: "garantia", label: "Garantia" },
]

const MAX_DEPTH = 3 // níveis: 0 (root) · 1 (child) · 2 (grandchild)
const INDENT_WIDTH = 32 // px por nível visual

type ItemFormState = {
  label: string
  labelTouched: boolean
  type: ItemType
  parent_item_id: string | null
  target_id: string
  target_url: string
  open_in_new_tab: boolean
}

const blankItemForm: ItemFormState = {
  label: "",
  labelTouched: false,
  type: "link",
  parent_item_id: null,
  target_id: "",
  target_url: "",
  open_in_new_tab: false,
}

const HANDLE_RX = /^[a-z0-9][a-z0-9-]*$/

const slugify = (s: string): string =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")

// ─── Utils de árvore ─────────────────────────────────────────────

type FlatNode = MenuItem & { depth: number }

const flattenTree = (items: MenuItemTree[]): FlatNode[] => {
  const out: FlatNode[] = []
  const walk = (nodes: MenuItemTree[], depth: number) => {
    for (const n of nodes) {
      const { children, ...rest } = n
      out.push({ ...rest, depth })
      if (children?.length) walk(children, depth + 1)
    }
  }
  walk(items, 0)
  return out
}

/**
 * Dado o estado pós-drag (active sobre over) + delta horizontal, calcula
 * profundidade desejada e novo parent_item_id. Replica o pattern do exemplo
 * oficial dnd-kit "tree".
 */
const projectDrop = (
  items: FlatNode[],
  activeId: string,
  overId: string,
  deltaX: number
): { newParentId: string | null; depth: number; overIdx: number } | null => {
  const activeIdx = items.findIndex((i) => i.id === activeId)
  const overIdx = items.findIndex((i) => i.id === overId)
  if (activeIdx < 0 || overIdx < 0) return null

  const reordered = arrayMove(items, activeIdx, overIdx)
  const newActiveIdx = reordered.findIndex((i) => i.id === activeId)
  const previous = newActiveIdx > 0 ? reordered[newActiveIdx - 1] : null
  const next =
    newActiveIdx < reordered.length - 1 ? reordered[newActiveIdx + 1] : null

  const dragDepth = Math.round(deltaX / INDENT_WIDTH)
  let projectedDepth = items[activeIdx].depth + dragDepth

  const maxAllowed = previous ? previous.depth + 1 : 0
  const minAllowed = next ? next.depth : 0
  if (projectedDepth > maxAllowed) projectedDepth = maxAllowed
  if (projectedDepth < minAllowed) projectedDepth = minAllowed
  if (projectedDepth < 0) projectedDepth = 0
  if (projectedDepth > MAX_DEPTH - 1) projectedDepth = MAX_DEPTH - 1

  let newParentId: string | null = null
  if (projectedDepth > 0 && previous) {
    if (previous.depth === projectedDepth) {
      newParentId = previous.parent_item_id
    } else if (previous.depth === projectedDepth - 1) {
      newParentId = previous.id
    } else {
      // Sobe na cadeia de previous até encontrar profundidade desejada
      let cur: FlatNode | undefined = previous
      while (cur && cur.depth >= projectedDepth) {
        const p = reordered.find((n) => n.id === cur!.parent_item_id)
        if (!p) break
        cur = p
      }
      newParentId =
        cur && cur.depth === projectedDepth - 1 ? cur.id : null
    }
  }

  return { newParentId, depth: projectedDepth, overIdx: newActiveIdx }
}

// ─── Página ──────────────────────────────────────────────────────

const MenusPage = () => {
  // ─── URL state (deep-linking) ──────────────────────────────────
  // Padrão canônico do projeto: toda navegação com state interno reflete na
  // URL pra que F5 reabra exatamente a mesma view. Detalhes em
  // [[Padroes Canonicos/URL State no Admin]] (Obsidian).
  //
  //  /app/menus                                 → lista
  //  /app/menus?new=1                           → lista + form "novo menu"
  //  /app/menus?menu=<id>                       → editor de items
  //  /app/menus?menu=<id>&item=<itemId>         → editor + form lateral edit
  //  /app/menus?menu=<id>&item=__new__          → editor + form criando root
  //  /app/menus?menu=<id>&item=__new__&parent=<itemId>  → criando filho
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedMenuId = searchParams.get("menu")
  const editingItemId = searchParams.get("item")
  const newItemParent = searchParams.get("parent")
  const creatingMenu = searchParams.get("new") === "1"

  /** Patcheia query params; null em valor remove o param. */
  const updateUrl = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams)
    for (const [k, v] of Object.entries(changes)) {
      if (v === null || v === "") next.delete(k)
      else next.set(k, v)
    }
    setSearchParams(next)
  }

  const [menus, setMenus] = useState<MenuRow[]>([])
  const [loading, setLoading] = useState(true)
  const [menuDetail, setMenuDetail] = useState<MenuDetail | null>(null)

  const [newMenuLabel, setNewMenuLabel] = useState("")
  const [newMenuHandle, setNewMenuHandle] = useState("")
  const [handleTouched, setHandleTouched] = useState(false)

  const [itemForm, setItemForm] = useState<ItemFormState>(blankItemForm)
  const [savingItem, setSavingItem] = useState(false)

  const [collections, setCollections] = useState<Collection[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])

  // Bubble do estado dirty do MenuTree pra desabilitar ações ao redor que
  // poderiam conflitar com o rascunho de ordem.
  const [treeDirty, setTreeDirty] = useState(false)

  const reloadMenus = async () => {
    const r = await fetch("/admin/menus", { credentials: "include" })
    const j = await r.json()
    setMenus(j.menus ?? [])
  }

  useEffect(() => {
    Promise.all([
      reloadMenus(),
      fetch("/admin/collections?limit=200&fields=id,title,handle", {
        credentials: "include",
      })
        .then((r) => r.json())
        .then((j) => setCollections(j.collections ?? [])),
      fetch("/admin/product-categories?limit=200&fields=id,name,handle", {
        credentials: "include",
      })
        .then((r) => r.json())
        .then((j) => setCategories(j.product_categories ?? [])),
      fetch("/admin/products?limit=200&fields=id,title,handle", {
        credentials: "include",
      })
        .then((r) => r.json())
        .then((j) => setProducts(j.products ?? [])),
    ]).finally(() => setLoading(false))
  }, [])

  const reloadMenuDetail = async (menuId: string) => {
    const r = await fetch(`/admin/menus/${menuId}`, { credentials: "include" })
    if (!r.ok) {
      toast.error("Falha ao carregar menu")
      updateUrl({ menu: null, item: null, parent: null })
      return
    }
    const j = await r.json()
    setMenuDetail(j.menu)
  }

  useEffect(() => {
    if (!selectedMenuId) {
      setMenuDetail(null)
      return
    }
    reloadMenuDetail(selectedMenuId)
  }, [selectedMenuId])

  // Sincroniza itemForm com o ?item= da URL (carrega valores ao entrar via F5
  // ou colar link com estado preservado)
  useEffect(() => {
    if (!editingItemId) {
      setItemForm(blankItemForm)
      return
    }
    if (editingItemId === "__new__") {
      setItemForm({ ...blankItemForm, parent_item_id: newItemParent })
      return
    }
    if (!menuDetail) return
    const found = findItemInTree(menuDetail.items, editingItemId)
    if (!found) return
    setItemForm({
      label: found.label,
      labelTouched: true,
      type: found.type,
      parent_item_id: found.parent_item_id,
      target_id: found.target_id ?? "",
      target_url: found.target_url ?? "",
      open_in_new_tab: found.open_in_new_tab,
    })
  }, [editingItemId, newItemParent, menuDetail])

  // ─── Auto-slugify do handle (modo lista, criar menu) ────────────
  const computedHandle = handleTouched ? newMenuHandle : slugify(newMenuLabel)
  const handleConflict = useMemo(
    () =>
      computedHandle.length > 0 &&
      menus.some((m) => m.handle === computedHandle),
    [menus, computedHandle]
  )
  const handleValid = HANDLE_RX.test(computedHandle)

  const resetCreateMenuForm = () => {
    updateUrl({ new: null })
    setNewMenuLabel("")
    setNewMenuHandle("")
    setHandleTouched(false)
  }

  const handleCreateMenu = async () => {
    const label = newMenuLabel.trim()
    const handle = computedHandle.trim()
    if (!label) {
      toast.error("Informe o nome do menu")
      return
    }
    if (!handle || !handleValid) {
      toast.error("Handle inválido (use letras minúsculas, números e hífens)")
      return
    }
    if (handleConflict) {
      toast.error("Já existe um menu com esse handle")
      return
    }
    const r = await fetch("/admin/menus", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle, label }),
    })
    if (!r.ok) {
      const j = await r.json().catch(() => ({}))
      toast.error(j.message ?? "Falha ao criar menu")
      return
    }
    const j = await r.json()
    toast.success(j.created ? "Menu criado" : "Menu já existia, reutilizado")
    setNewMenuLabel("")
    setNewMenuHandle("")
    setHandleTouched(false)
    await reloadMenus()
    updateUrl({ new: null, menu: j.menu.id, item: null, parent: null })
  }

  const handleDeleteMenu = async (menuId: string) => {
    if (!confirm("Excluir esse menu e todos os seus items?")) return
    const r = await fetch(`/admin/menus/${menuId}`, {
      method: "DELETE",
      credentials: "include",
    })
    if (!r.ok) {
      const j = await r.json().catch(() => ({}))
      toast.error(j.message ?? "Falha ao excluir menu")
      return
    }
    toast.success("Menu excluído")
    updateUrl({ menu: null, item: null, parent: null })
    await reloadMenus()
  }

  // ─── Form de item (URL state) ──────────────────────────────────
  const startEditItem = (item: MenuItem) => {
    updateUrl({ item: item.id, parent: null })
  }

  const startNewItem = (parentId: string | null = null) => {
    updateUrl({ item: "__new__", parent: parentId })
  }

  const cancelItemForm = () => {
    updateUrl({ item: null, parent: null })
  }

  const fillLabelFromResource = (next: ItemFormState): ItemFormState => {
    if (next.labelTouched && next.label.trim()) return next
    let resourceLabel = ""
    if (next.type === "category") {
      resourceLabel = categories.find((c) => c.id === next.target_id)?.name ?? ""
    } else if (next.type === "collection") {
      resourceLabel =
        collections.find((c) => c.id === next.target_id)?.title ?? ""
    } else if (next.type === "product") {
      resourceLabel = products.find((p) => p.id === next.target_id)?.title ?? ""
    } else if (next.type === "policy") {
      const slug = next.target_url.replace(/^\/politicas\//, "")
      resourceLabel = POLICIES.find((p) => p.slug === slug)?.label ?? ""
    } else if (next.type === "home") {
      resourceLabel = "Início"
    } else if (next.type === "search") {
      resourceLabel = "Buscar"
    } else if (next.type === "catalog") {
      resourceLabel = "Todos os produtos"
    }
    return resourceLabel ? { ...next, label: resourceLabel } : next
  }

  const handleTypeChange = (v: ItemType) => {
    setItemForm((prev) =>
      fillLabelFromResource({
        ...prev,
        type: v,
        target_id: "",
        target_url:
          v === "policy"
            ? ""
            : v === "home"
              ? "/"
              : v === "search"
                ? "/search"
                : v === "catalog"
                  ? "/store"
                  : "",
      })
    )
  }

  const handleSaveItem = async () => {
    if (!selectedMenuId || !menuDetail) return
    if (!itemForm.label.trim()) {
      toast.error("Label é obrigatório")
      return
    }
    const isUrlType =
      itemForm.type === "link" ||
      itemForm.type === "external" ||
      itemForm.type === "policy"
    const isResourceType =
      itemForm.type === "category" ||
      itemForm.type === "collection" ||
      itemForm.type === "product"

    if (isUrlType && !itemForm.target_url.trim()) {
      toast.error(
        itemForm.type === "policy"
          ? "Selecione uma política"
          : "URL é obrigatória para link/externo"
      )
      return
    }
    if (isResourceType && !itemForm.target_id.trim()) {
      toast.error("Selecione o alvo")
      return
    }

    setSavingItem(true)
    try {
      const payload = {
        label: itemForm.label.trim(),
        type: itemForm.type,
        parent_item_id: itemForm.parent_item_id,
        target_id: isResourceType ? itemForm.target_id.trim() : null,
        target_url: isUrlType ? itemForm.target_url.trim() : null,
        open_in_new_tab: itemForm.open_in_new_tab,
      }

      const url =
        editingItemId === "__new__"
          ? `/admin/menus/${selectedMenuId}/items`
          : `/admin/menu-items/${editingItemId}`
      const method = editingItemId === "__new__" ? "POST" : "PATCH"

      const r = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!r.ok) {
        const j = await r.json().catch(() => ({}))
        toast.error(j.message ?? "Falha ao salvar item")
        return
      }
      toast.success(editingItemId === "__new__" ? "Item criado" : "Item atualizado")
      cancelItemForm()
      await reloadMenuDetail(selectedMenuId)
      await reloadMenus()
    } finally {
      setSavingItem(false)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!selectedMenuId) return
    if (!confirm("Excluir esse item?")) return
    const r = await fetch(`/admin/menu-items/${itemId}`, {
      method: "DELETE",
      credentials: "include",
    })
    if (!r.ok) {
      toast.error("Falha ao excluir item")
      return
    }
    toast.success("Item excluído")
    if (editingItemId === itemId) cancelItemForm()
    await reloadMenuDetail(selectedMenuId)
    await reloadMenus()
  }

  // ─── Save da ordem (modo rascunho) ─────────────────────────────
  // O MenuTree mantém o reorder em estado local. Aqui só persistimos quando
  // o cliente clica "Salvar" no banner. Recebe todas as updates já com
  // positions normalizadas (0,1,2… por parent) e parent_item_id correto.
  const handleSaveOrder = async (
    updates: Array<{
      id: string
      position: number
      parent_item_id: string | null
    }>
  ) => {
    if (!selectedMenuId || !menuDetail) return
    const results = await Promise.all(
      updates.map((u) =>
        fetch(`/admin/menu-items/${u.id}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            position: u.position,
            parent_item_id: u.parent_item_id,
          }),
        })
      )
    )
    const failed = results.find((r) => !r.ok)
    if (failed) {
      const j = await failed.json().catch(() => ({}))
      toast.error(j.message ?? "Não foi possível salvar a nova ordem")
      return
    }
    toast.success("Ordem do menu salva")
    await reloadMenuDetail(selectedMenuId)
  }

  // ─── Render ──────────────────────────────────────────────────
  if (loading) {
    return (
      <Container>
        <Text className="text-ui-fg-muted">Carregando…</Text>
      </Container>
    )
  }

  // Modo editor
  if (selectedMenuId && menuDetail) {
    const isDefault = menuDetail.is_default
    return (
      <Container className="p-0">
        <div className="border-ui-border-base flex items-center justify-between border-b p-6">
          <div className="flex items-center gap-x-3">
            <Button
              variant="secondary"
              size="small"
              onClick={() =>
                updateUrl({ menu: null, item: null, parent: null })
              }
            >
              ← Voltar
            </Button>
            <div>
              <div className="flex items-center gap-x-2">
                <Heading level="h2">{menuDetail.label}</Heading>
                {isDefault && (
                  <Badge size="2xsmall" color="blue">
                    Padrão
                  </Badge>
                )}
              </div>
              <Text size="small" className="text-ui-fg-muted">
                handle: <code>{menuDetail.handle}</code>
              </Text>
            </div>
          </div>
          <div className="flex items-center gap-x-2">
            <Button onClick={() => startNewItem(null)} disabled={treeDirty}>
              + Novo item
            </Button>
            {isDefault ? (
              <Tooltip content="Menu padrão do sistema — não pode ser excluído. Edite os items pra customizar.">
                <Button variant="danger" disabled>
                  Excluir menu
                </Button>
              </Tooltip>
            ) : (
              <Button
                variant="danger"
                onClick={() => handleDeleteMenu(menuDetail.id)}
                disabled={treeDirty}
              >
                Excluir menu
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-[1fr_360px]">
          <div>
            {menuDetail.items.length === 0 ? (
              <div className="border-ui-border-base rounded-lg border border-dashed p-8 text-center">
                <Text className="text-ui-fg-muted">
                  Nenhum item ainda. Clique em "+ Novo item" pra começar.
                </Text>
              </div>
            ) : (
              <MenuTree
                items={menuDetail.items}
                onEdit={startEditItem}
                onDelete={handleDeleteItem}
                onAddChild={(parentId) => startNewItem(parentId)}
                onSaveOrder={handleSaveOrder}
                onDirtyChange={setTreeDirty}
                resolveTarget={(it) =>
                  resolveTargetLabel(it, categories, collections, products)
                }
              />
            )}
          </div>

          {editingItemId && (
            <ItemForm
              isNew={editingItemId === "__new__"}
              parentLabel={
                itemForm.parent_item_id
                  ? findItemLabel(menuDetail.items, itemForm.parent_item_id)
                  : null
              }
              form={itemForm}
              setForm={setItemForm}
              onTypeChange={handleTypeChange}
              fillLabelFromResource={fillLabelFromResource}
              categories={categories}
              collections={collections}
              products={products}
              onSave={handleSaveItem}
              onCancel={cancelItemForm}
              saving={savingItem}
            />
          )}
        </div>
      </Container>
    )
  }

  // Modo lista
  return (
    <Container className="p-0">
      <div className="border-ui-border-base flex items-center justify-between border-b p-6">
        <div>
          <Heading level="h2">Menus</Heading>
          <Text size="small" className="text-ui-fg-muted">
            Gerencie os menus de navegação do site (header, footer, mobile…).
          </Text>
        </div>
        <Button onClick={() => updateUrl({ new: "1" })}>+ Novo menu</Button>
      </div>

      {creatingMenu && (
        <div className="border-ui-border-base bg-ui-bg-subtle border-b p-6">
          <Heading level="h3" className="mb-3">
            Novo menu
          </Heading>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <Label className="mb-1 block">Nome</Label>
              <Input
                value={newMenuLabel}
                onChange={(e) => setNewMenuLabel(e.target.value)}
                placeholder="Menu principal"
                autoFocus
              />
              <Text size="xsmall" className="text-ui-fg-muted mt-1">
                Como o menu aparece no admin.
              </Text>
            </div>
            <div>
              <Label className="mb-1 block">
                Handle (slug, único){" "}
                {!handleTouched && newMenuLabel && (
                  <span className="text-ui-fg-muted text-xs font-normal">
                    · gerado do nome
                  </span>
                )}
              </Label>
              <Input
                value={computedHandle}
                onChange={(e) => {
                  setHandleTouched(true)
                  setNewMenuHandle(slugify(e.target.value))
                }}
                placeholder="menu-principal"
              />
              <div className="mt-1 flex items-center gap-x-2">
                {computedHandle.length > 0 && handleValid && !handleConflict && (
                  <Badge size="2xsmall" color="green">
                    ✓ Disponível
                  </Badge>
                )}
                {computedHandle.length > 0 && !handleValid && (
                  <Badge size="2xsmall" color="red">
                    ✗ Inválido
                  </Badge>
                )}
                {handleConflict && (
                  <Badge size="2xsmall" color="red">
                    ✗ Já existe
                  </Badge>
                )}
                <Text size="xsmall" className="text-ui-fg-muted">
                  Identificador usado pelo storefront (não muda depois).
                </Text>
              </div>
            </div>
          </div>
          <div className="mt-3 flex gap-x-2">
            <Button
              onClick={handleCreateMenu}
              disabled={
                !newMenuLabel.trim() || !handleValid || handleConflict
              }
            >
              Criar
            </Button>
            <Button variant="secondary" onClick={resetCreateMenuForm}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <div className="p-6">
        {menus.length === 0 && (
          <div className="border-ui-border-base rounded-lg border border-dashed p-12 text-center">
            <Text className="text-ui-fg-muted">
              Nenhum menu cadastrado. Clique em "+ Novo menu" pra começar.
            </Text>
          </div>
        )}
        <div className="space-y-2">
          {menus.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() =>
                updateUrl({ menu: m.id, item: null, parent: null, new: null })
              }
              className="border-ui-border-base hover:bg-ui-bg-subtle flex w-full items-center justify-between rounded-lg border p-4 text-left transition"
            >
              <div>
                <div className="flex items-center gap-x-2">
                  <Text weight="plus">{m.label}</Text>
                  <Badge size="2xsmall">{m.handle}</Badge>
                  {m.is_default && (
                    <Badge size="2xsmall" color="blue">
                      Padrão
                    </Badge>
                  )}
                </div>
                <Text size="small" className="text-ui-fg-muted">
                  {m.item_count} {m.item_count === 1 ? "item" : "items"}
                </Text>
              </div>
              <Text size="small" className="text-ui-fg-muted">
                Editar →
              </Text>
            </button>
          ))}
        </div>
      </div>
    </Container>
  )
}

// ─── Tree (drag-drop) ────────────────────────────────────────────

/** Recalcula `depth` de cada FlatNode baseado na cadeia de parent_item_id. */
const recalcDepths = (flat: FlatNode[]): FlatNode[] => {
  const byId = new Map(flat.map((n) => [n.id, n]))
  const depthOf = (id: string, guard = 0): number => {
    if (guard > MAX_DEPTH * 2) return Infinity
    const n = byId.get(id)
    if (!n || !n.parent_item_id) return 0
    return 1 + depthOf(n.parent_item_id, guard + 1)
  }
  return flat.map((n) => ({ ...n, depth: depthOf(n.id) }))
}

const MenuTree = ({
  items,
  onEdit,
  onDelete,
  onAddChild,
  onSaveOrder,
  onDirtyChange,
  resolveTarget,
}: {
  items: MenuItemTree[]
  onEdit: (item: MenuItem) => void
  onDelete: (id: string) => void
  onAddChild: (parentId: string) => void
  onSaveOrder: (
    updates: Array<{
      id: string
      position: number
      parent_item_id: string | null
    }>
  ) => void | Promise<void>
  onDirtyChange?: (dirty: boolean) => void
  resolveTarget: (item: MenuItem) => string
}) => {
  // Modo rascunho: state local com a árvore enquanto o user arrasta. Só
  // persiste quando ele clicar Salvar. `dirty=true` segura o sync com props.
  const [localFlat, setLocalFlat] = useState<FlatNode[]>(() =>
    flattenTree(items)
  )
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)

  // Sincroniza com props quando não há rascunho (reload do servidor, troca de menu)
  useEffect(() => {
    if (!dirty) {
      setLocalFlat(flattenTree(items))
    }
  }, [items, dirty])

  // Bubble do estado dirty pro componente pai (desabilita "+ Novo item" etc)
  useEffect(() => {
    onDirtyChange?.(dirty)
  }, [dirty, onDirtyChange])

  const [activeId, setActiveId] = useState<string | null>(null)
  const [projection, setProjection] = useState<{
    newParentId: string | null
    depth: number
    overIdx: number
  } | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id))
  }

  const handleDragMove = (event: DragMoveEvent) => {
    const overId = event.over?.id ? String(event.over.id) : null
    if (!overId) {
      setProjection(null)
      return
    }
    const proj = projectDrop(
      localFlat,
      String(event.active.id),
      overId,
      event.delta.x
    )
    setProjection(proj)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const activeIdStr = String(event.active.id)
    const overId = event.over?.id ? String(event.over.id) : null
    setActiveId(null)
    setProjection(null)
    if (!overId) return
    const proj = projectDrop(localFlat, activeIdStr, overId, event.delta.x)
    if (!proj) return
    // Atualiza só o estado local — sem rede. Persiste só com botão Salvar.
    const sourceIdx = localFlat.findIndex((n) => n.id === activeIdStr)
    const reordered = arrayMove(localFlat, sourceIdx, proj.overIdx).map((n) =>
      n.id === activeIdStr ? { ...n, parent_item_id: proj.newParentId } : n
    )
    setLocalFlat(recalcDepths(reordered))
    setDirty(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Deriva position 0..N por parent na ordem visual atual
      const counters = new Map<string, number>()
      const updates = localFlat.map((n) => {
        const parentKey = n.parent_item_id ?? "__root__"
        const idx = counters.get(parentKey) ?? 0
        counters.set(parentKey, idx + 1)
        return {
          id: n.id,
          position: idx,
          parent_item_id: n.parent_item_id ?? null,
        }
      })
      await onSaveOrder(updates)
      setDirty(false)
    } finally {
      setSaving(false)
    }
  }

  const handleDiscard = () => {
    setLocalFlat(flattenTree(items))
    setDirty(false)
  }

  const activeItem = activeId ? localFlat.find((n) => n.id === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        setActiveId(null)
        setProjection(null)
      }}
    >
      {dirty && (
        <div className="border-ui-border-base bg-ui-bg-highlight sticky top-0 z-10 mb-3 flex items-center justify-between rounded-lg border p-3 shadow-sm">
          <div>
            <Text weight="plus">Você tem alterações de ordem não salvas</Text>
            <Text size="xsmall" className="text-ui-fg-muted">
              Edição de items está bloqueada até você salvar ou descartar.
            </Text>
          </div>
          <div className="flex gap-x-2">
            <Button
              variant="secondary"
              onClick={handleDiscard}
              disabled={saving}
            >
              Descartar
            </Button>
            <Button onClick={handleSave} isLoading={saving} disabled={saving}>
              Salvar ordem
            </Button>
          </div>
        </div>
      )}
      <SortableContext
        items={localFlat.map((f) => f.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="space-y-1">
          {localFlat.map((node) => {
            const projectedDepth =
              projection && activeId === node.id ? projection.depth : node.depth
            return (
              <SortableTreeItem
                key={node.id}
                node={node}
                depth={projectedDepth}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddChild={onAddChild}
                resolveTarget={resolveTarget}
                disabled={dirty}
              />
            )
          })}
        </ul>
      </SortableContext>
      <DragOverlay>
        {activeItem ? (
          <div className="border-ui-border-base bg-ui-bg-base rounded-lg border p-3 opacity-90 shadow-lg">
            <Text weight="plus">{activeItem.label}</Text>
            <Text size="xsmall" className="text-ui-fg-muted">
              {TYPE_LABEL[activeItem.type]}
            </Text>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

const SortableTreeItem = ({
  node,
  depth,
  onEdit,
  onDelete,
  onAddChild,
  resolveTarget,
  disabled = false,
}: {
  node: FlatNode
  depth: number
  onEdit: (item: MenuItem) => void
  onDelete: (id: string) => void
  onAddChild: (parentId: string) => void
  resolveTarget: (item: MenuItem) => string
  /** Quando há rascunho de drag, desabilita os botões de ação pra evitar mistura. */
  disabled?: boolean
}) => {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({ id: node.id })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    paddingLeft: depth * INDENT_WIDTH,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <li ref={setNodeRef} style={style} className="list-none">
      <div
        className={
          depth === 0
            ? "border-ui-border-base bg-ui-bg-base rounded-lg border"
            : "border-ui-border-base bg-ui-bg-subtle rounded-lg border border-dashed"
        }
      >
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-x-3">
            <button
              type="button"
              ref={setActivatorNodeRef}
              {...attributes}
              {...listeners}
              className="text-ui-fg-muted hover:text-ui-fg-base cursor-grab active:cursor-grabbing"
              aria-label="Arrastar pra reordenar"
            >
              ⠿
            </button>
            <div>
              <div className="flex items-center gap-x-2">
                <Text weight="plus">{node.label}</Text>
                <Badge size="2xsmall" color={TYPE_COLOR[node.type]}>
                  {TYPE_LABEL[node.type]}
                </Badge>
                {node.open_in_new_tab && (
                  <Badge size="2xsmall" color="grey">
                    ↗ nova aba
                  </Badge>
                )}
              </div>
              <Text size="xsmall" className="text-ui-fg-muted">
                {resolveTarget(node)}
              </Text>
            </div>
          </div>
          <div className="flex items-center gap-x-2">
            {depth < MAX_DEPTH - 1 && (
              <Button
                size="small"
                variant="secondary"
                onClick={() => onAddChild(node.id)}
                disabled={disabled}
              >
                + sub
              </Button>
            )}
            <Button
              size="small"
              variant="secondary"
              onClick={() => onEdit(node)}
              disabled={disabled}
            >
              Editar
            </Button>
            <Button
              size="small"
              variant="danger"
              onClick={() => onDelete(node.id)}
              disabled={disabled}
            >
              Excluir
            </Button>
          </div>
        </div>
      </div>
    </li>
  )
}

// ─── Form lateral ────────────────────────────────────────────────

const ItemForm = ({
  isNew,
  parentLabel,
  form,
  setForm,
  onTypeChange,
  fillLabelFromResource,
  categories,
  collections,
  products,
  onSave,
  onCancel,
  saving,
}: {
  isNew: boolean
  parentLabel: string | null
  form: ItemFormState
  setForm: React.Dispatch<React.SetStateAction<ItemFormState>>
  onTypeChange: (v: ItemType) => void
  fillLabelFromResource: (next: ItemFormState) => ItemFormState
  categories: Category[]
  collections: Collection[]
  products: Product[]
  onSave: () => void
  onCancel: () => void
  saving: boolean
}) => {
  return (
    <div className="border-ui-border-base h-fit rounded-lg border p-4">
      <Heading level="h3" className="mb-4">
        {isNew ? "Novo item" : "Editar item"}
      </Heading>

      <div className="space-y-3">
        {/* Tipo PRIMEIRO */}
        <div>
          <Label className="mb-1 block">Tipo</Label>
          <Select
            value={form.type}
            onValueChange={(v) => onTypeChange(v as ItemType)}
          >
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              {(Object.keys(TYPE_LABEL) as ItemType[]).map((t) => (
                <Select.Item key={t} value={t}>
                  {TYPE_LABEL[t]}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>

        {form.type === "category" && (
          <div>
            <Label className="mb-1 block">Categoria</Label>
            <Select
              value={form.target_id}
              onValueChange={(v) =>
                setForm((prev) =>
                  fillLabelFromResource({ ...prev, target_id: v })
                )
              }
            >
              <Select.Trigger>
                <Select.Value placeholder="Selecione…" />
              </Select.Trigger>
              <Select.Content>
                {categories.map((c) => (
                  <Select.Item key={c.id} value={c.id}>
                    {c.name}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
        )}

        {form.type === "collection" && (
          <div>
            <Label className="mb-1 block">Coleção</Label>
            <Select
              value={form.target_id}
              onValueChange={(v) =>
                setForm((prev) =>
                  fillLabelFromResource({ ...prev, target_id: v })
                )
              }
            >
              <Select.Trigger>
                <Select.Value placeholder="Selecione…" />
              </Select.Trigger>
              <Select.Content>
                {collections.map((c) => (
                  <Select.Item key={c.id} value={c.id}>
                    {c.title}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
        )}

        {form.type === "product" && (
          <div>
            <Label className="mb-1 block">Produto</Label>
            <Select
              value={form.target_id}
              onValueChange={(v) =>
                setForm((prev) =>
                  fillLabelFromResource({ ...prev, target_id: v })
                )
              }
            >
              <Select.Trigger>
                <Select.Value placeholder="Selecione um produto…" />
              </Select.Trigger>
              <Select.Content>
                {products.map((p) => (
                  <Select.Item key={p.id} value={p.id}>
                    {p.title}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
        )}

        {form.type === "policy" && (
          <div>
            <Label className="mb-1 block">Política</Label>
            <Select
              value={form.target_url}
              onValueChange={(v) =>
                setForm((prev) =>
                  fillLabelFromResource({ ...prev, target_url: v })
                )
              }
            >
              <Select.Trigger>
                <Select.Value placeholder="Selecione…" />
              </Select.Trigger>
              <Select.Content>
                {POLICIES.map((p) => (
                  <Select.Item key={p.slug} value={`/politicas/${p.slug}`}>
                    {p.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
        )}

        {(form.type === "link" || form.type === "external") && (
          <div>
            <Label className="mb-1 block">URL</Label>
            <Input
              value={form.target_url}
              onChange={(e) =>
                setForm({ ...form, target_url: e.target.value })
              }
              placeholder={
                form.type === "external" ? "https://exemplo.com.br" : "/atacado"
              }
            />
          </div>
        )}

        {(form.type === "home" ||
          form.type === "search" ||
          form.type === "catalog") && (
          <Text size="small" className="text-ui-fg-muted">
            Aponta automaticamente para{" "}
            <code>
              {form.type === "home"
                ? "/"
                : form.type === "search"
                  ? "/search"
                  : "/store"}
            </code>
            .
          </Text>
        )}

        <div>
          <Label className="mb-1 block">Label</Label>
          <Input
            value={form.label}
            onChange={(e) =>
              setForm({ ...form, label: e.target.value, labelTouched: true })
            }
            placeholder="Ex: Multimídia"
          />
          <Text size="xsmall" className="text-ui-fg-muted mt-1">
            Preenchido automaticamente ao escolher o recurso. Pode sobrescrever.
          </Text>
        </div>

        <div className="flex items-center justify-between">
          <Label>Abrir em nova aba</Label>
          <Switch
            checked={form.open_in_new_tab}
            onCheckedChange={(v) => setForm({ ...form, open_in_new_tab: v })}
          />
        </div>

        {isNew && parentLabel && (
          <Text size="small" className="text-ui-fg-muted">
            Item será criado como filho de: {parentLabel}
          </Text>
        )}

        <div className="flex gap-x-2 pt-2">
          <Button onClick={onSave} disabled={saving} isLoading={saving}>
            Salvar
          </Button>
          <Button variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────

const findItemInTree = (
  items: MenuItemTree[],
  id: string
): MenuItemTree | null => {
  for (const it of items) {
    if (it.id === id) return it
    if (it.children?.length) {
      const f = findItemInTree(it.children, id)
      if (f) return f
    }
  }
  return null
}

const findItemLabel = (items: MenuItemTree[], id: string): string | null =>
  findItemInTree(items, id)?.label ?? null

const resolveTargetLabel = (
  item: MenuItem,
  categories: Category[],
  collections: Collection[],
  products: Product[]
): string => {
  if (item.type === "link" || item.type === "external") {
    return item.target_url ?? "—"
  }
  if (item.type === "home") return "/"
  if (item.type === "search") return "/search"
  if (item.type === "catalog") return "/store"
  if (item.type === "policy") return item.target_url ?? "—"
  if (item.type === "category") {
    const c = categories.find((x) => x.id === item.target_id)
    return c
      ? `${c.name} (/${c.handle})`
      : `⚠ categoria não encontrada (${item.target_id ?? "?"})`
  }
  if (item.type === "collection") {
    const c = collections.find((x) => x.id === item.target_id)
    return c
      ? `${c.title} (/${c.handle})`
      : `⚠ coleção não encontrada (${item.target_id ?? "?"})`
  }
  if (item.type === "product") {
    const p = products.find((x) => x.id === item.target_id)
    return p
      ? `${p.title} (/${p.handle})`
      : `⚠ produto não encontrado (${item.target_id ?? "?"})`
  }
  return "—"
}

export const config = defineRouteConfig({
  label: "Menus",
})

export default MenusPage
