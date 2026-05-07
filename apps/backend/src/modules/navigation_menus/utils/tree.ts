/**
 * Helpers de árvore pra menu items. Profundidade máxima permitida = 3 níveis
 * (Shopify-parity): root (0) → child (1) → grandchild (2). Item nível 3+ é
 * rejeitado nos endpoints POST/PATCH.
 */

export const MAX_DEPTH = 3

export type FlatItem = {
  id: string
  parent_item_id: string | null
}

/**
 * Calcula a profundidade de um item dentro da hierarquia plana.
 * Root = 0, child de root = 1, grandchild = 2.
 *
 * Retorna -1 quando `itemId` não existe na lista (defensivo).
 * Tem guard contra ciclos: se ultrapassar MAX_DEPTH * 2, retorna Infinity.
 */
export function computeDepth(items: FlatItem[], itemId: string): number {
  const byId = new Map(items.map((i) => [i.id, i]))
  let depth = 0
  let cur = byId.get(itemId)
  if (!cur) return -1
  while (cur.parent_item_id) {
    depth++
    if (depth > MAX_DEPTH * 2) return Infinity // ciclo defensivo
    const parent = byId.get(cur.parent_item_id)
    if (!parent) return depth
    cur = parent
  }
  return depth
}

/**
 * Altura da subárvore enraizada em `itemId`. Folha = 0; nó com 1 nível de
 * filhos = 1; etc. Usado pra recusar mover sub-árvores que não cabem.
 */
export function subtreeHeight(items: FlatItem[], itemId: string): number {
  const childrenByParent = new Map<string, FlatItem[]>()
  for (const it of items) {
    if (it.parent_item_id) {
      const arr = childrenByParent.get(it.parent_item_id) ?? []
      arr.push(it)
      childrenByParent.set(it.parent_item_id, arr)
    }
  }
  const recurse = (id: string, guard: number): number => {
    if (guard > MAX_DEPTH * 2) return Infinity
    const kids = childrenByParent.get(id) ?? []
    if (kids.length === 0) return 0
    let max = 0
    for (const k of kids) {
      const h = recurse(k.id, guard + 1) + 1
      if (h > max) max = h
    }
    return max
  }
  return recurse(itemId, 0)
}

/**
 * Verifica se mover `itemId` para sob `newParentId` (null = virar root)
 * mantém a árvore dentro do limite de MAX_DEPTH níveis.
 *
 * Profundidade resultante do item movido: (depth do novo parent) + 1.
 * Profundidade do mais profundo descendente: depth + altura da subárvore.
 * Aceita se total < MAX_DEPTH (root=0, então MAX_DEPTH=3 → aceita 0..2).
 */
export function canMoveWithinDepth(
  items: FlatItem[],
  itemId: string,
  newParentId: string | null
): { ok: true } | { ok: false; reason: string } {
  const newParentDepth =
    newParentId === null ? -1 : computeDepth(items, newParentId)
  if (newParentDepth === Infinity) {
    return { ok: false, reason: "Ciclo detectado na árvore" }
  }
  if (newParentId !== null && newParentDepth < 0) {
    return { ok: false, reason: "parent_item_id não encontrado" }
  }
  const movedDepth = newParentDepth + 1
  const height = subtreeHeight(items, itemId)
  if (height === Infinity) {
    return { ok: false, reason: "Ciclo detectado na subárvore" }
  }
  const deepest = movedDepth + height
  if (deepest > MAX_DEPTH - 1) {
    return {
      ok: false,
      reason: `Excede o limite de ${MAX_DEPTH} níveis (esse movimento criaria ${deepest + 1} níveis)`,
    }
  }
  // Bloqueia mover pra dentro de descendente (ciclo)
  if (newParentId !== null) {
    let cur: string | null | undefined = newParentId
    const byId = new Map(items.map((i) => [i.id, i]))
    while (cur) {
      if (cur === itemId) {
        return { ok: false, reason: "Não pode mover um item pra dentro de si mesmo" }
      }
      cur = byId.get(cur)?.parent_item_id ?? null
    }
  }
  return { ok: true }
}
