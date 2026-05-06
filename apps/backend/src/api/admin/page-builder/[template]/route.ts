import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateStoresWorkflow } from "@medusajs/medusa/core-flows"
import { findManifest } from "../../../../page-builder/manifests"
import type { PageTemplate, SectionInstance } from "../../../../page-builder/types"

const ALLOWED_TEMPLATES = ["home"] as const

function metadataKey(template: string) {
  return `page_template_${template}`
}

/**
 * GET /admin/page-builder/:template
 *
 * Lê o template do `store.metadata` (chave `page_template_<template>`).
 * Retorna `{ template: null }` se nunca foi configurado — o admin
 * mostra estado vazio com botão "Criar template a partir do default".
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const tpl = req.params.template
  if (!ALLOWED_TEMPLATES.includes(tpl as (typeof ALLOWED_TEMPLATES)[number])) {
    return res.status(404).json({ error: "template_not_supported" })
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: stores } = await query.graph({
    entity: "store",
    fields: ["id", "metadata"],
  })
  const store = stores[0]
  if (!store) return res.status(500).json({ error: "no_store" })

  const meta = (store.metadata ?? {}) as Record<string, unknown>
  const template = (meta[metadataKey(tpl)] as PageTemplate | undefined) ?? null
  return res.json({ template, store_id: store.id })
}

type PutBody = {
  template: PageTemplate
}

/**
 * PUT /admin/page-builder/:template
 *
 * Salva o template. Validações:
 *   - cada `sections[id].type` precisa existir no catálogo de manifests
 *   - cada chave de `settings` precisa existir no manifest
 *   - `order` só pode conter ids que existem em `sections`
 */
export async function PUT(
  req: MedusaRequest<PutBody>,
  res: MedusaResponse
) {
  const tpl = req.params.template
  if (!ALLOWED_TEMPLATES.includes(tpl as (typeof ALLOWED_TEMPLATES)[number])) {
    return res.status(404).json({ error: "template_not_supported" })
  }

  const incoming = req.body?.template
  if (!incoming || typeof incoming !== "object") {
    return res
      .status(400)
      .json({ error: "validation_error", message: "template ausente no body" })
  }

  const sections = (incoming.sections ?? {}) as Record<string, SectionInstance>
  const order = Array.isArray(incoming.order) ? incoming.order : []

  // Valida cada section
  for (const id of Object.keys(sections)) {
    const sec = sections[id]
    if (!sec || sec.id !== id) {
      return res.status(400).json({
        error: "validation_error",
        message: `section ${id} mal formada`,
      })
    }
    const manifest = findManifest(sec.type)
    if (!manifest) {
      return res.status(400).json({
        error: "validation_error",
        message: `tipo de section desconhecido: ${sec.type}`,
      })
    }
    // Não validamos os tipos dos valores aqui — o admin já valida no form.
    // Apenas garante que só chaves declaradas sejam salvas.
    const allowedKeys = new Set(manifest.settings.map((s) => s.key))
    const filtered: Record<string, unknown> = {}
    for (const k of Object.keys(sec.settings ?? {})) {
      if (allowedKeys.has(k)) filtered[k] = sec.settings![k]
    }
    sections[id] = { ...sec, settings: filtered }
  }

  // Valida order
  const validOrder = order.filter((id) => sections[id])

  const sanitized: PageTemplate = {
    sections,
    order: validOrder,
    updated_at: new Date().toISOString(),
  }

  // Persiste no store.metadata
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: stores } = await query.graph({
    entity: "store",
    fields: ["id", "metadata"],
  })
  const store = stores[0]
  if (!store) return res.status(500).json({ error: "no_store" })

  const newMeta: Record<string, unknown> = {
    ...((store.metadata ?? {}) as Record<string, unknown>),
    [metadataKey(tpl)]: sanitized,
  }

  await updateStoresWorkflow(req.scope).run({
    input: {
      selector: { id: store.id },
      update: { metadata: newMeta },
    },
  })

  return res.json({ template: sanitized })
}
