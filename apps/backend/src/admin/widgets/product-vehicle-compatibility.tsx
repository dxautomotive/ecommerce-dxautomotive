import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps } from "@medusajs/framework/types"
import {
  Container,
  Heading,
  Text,
  Badge,
  Button,
  Input,
  Select,
} from "@medusajs/ui"
import { useEffect, useMemo, useState } from "react"

type Vehicle = {
  id: string
  make: string
  model: string
  year: number
  trim: string | null
  body_type: string | null
  slug: string
}

type Product = { id: string }

const YEARS = Array.from({ length: 35 }, (_, i) => 2026 - i)

const ProductVehicleCompatibility = ({ data }: DetailWidgetProps<Product>) => {
  const productId = data.id

  const [linked, setLinked] = useState<Vehicle[]>([])
  const [available, setAvailable] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [creating, setCreating] = useState(false)
  const [newMake, setNewMake] = useState("")
  const [newModel, setNewModel] = useState("")
  const [newYear, setNewYear] = useState<number>(YEARS[0])
  const [error, setError] = useState<string | null>(null)

  const loadLinked = async () => {
    const res = await fetch(`/admin/products/${productId}/vehicles`, {
      credentials: "include",
    })
    if (res.ok) {
      const j = await res.json()
      setLinked(j.vehicles ?? [])
    }
  }

  const loadAvailable = async (q?: string) => {
    const qs = q ? `?q=${encodeURIComponent(q)}` : ""
    const res = await fetch(`/admin/vehicles${qs}`, { credentials: "include" })
    if (res.ok) {
      const j = await res.json()
      setAvailable(j.vehicles ?? [])
    }
  }

  useEffect(() => {
    Promise.all([loadLinked(), loadAvailable()]).finally(() => setLoading(false))
  }, [productId])

  useEffect(() => {
    const t = setTimeout(() => loadAvailable(search), 250)
    return () => clearTimeout(t)
  }, [search])

  const linkedIds = useMemo(() => new Set(linked.map((v) => v.id)), [linked])
  const visibleAvailable = available.filter((v) => !linkedIds.has(v.id))

  const link = async (vehicle: Vehicle) => {
    setError(null)
    const res = await fetch(`/admin/products/${productId}/vehicles`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehicle_ids: [vehicle.id] }),
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      setError(j.message ?? "Erro ao vincular veículo")
      return
    }
    setLinked((prev) => [...prev, vehicle])
  }

  const unlink = async (vehicle: Vehicle) => {
    setError(null)
    const res = await fetch(`/admin/products/${productId}/vehicles`, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehicle_ids: [vehicle.id] }),
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      setError(j.message ?? "Erro ao desvincular veículo")
      return
    }
    setLinked((prev) => prev.filter((v) => v.id !== vehicle.id))
  }

  const createVehicle = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!newMake.trim() || !newModel.trim()) {
      setError("Marca e modelo são obrigatórios")
      return
    }
    const res = await fetch("/admin/vehicles", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        make: newMake.trim(),
        model: newModel.trim(),
        year: newYear,
      }),
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      if (res.status === 409 && j.vehicle) {
        // Já existe — só vincula
        await link(j.vehicle)
        setNewMake("")
        setNewModel("")
        setCreating(false)
        return
      }
      setError(j.message ?? "Erro ao cadastrar veículo")
      return
    }
    const j = await res.json()
    await link(j.vehicle)
    setAvailable((prev) => [j.vehicle, ...prev])
    setNewMake("")
    setNewModel("")
    setCreating(false)
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Compatibilidade veicular</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Veículos para os quais este produto serve. Aparece no filtro
            marca/modelo/ano da loja e no bloco de compatibilidade da página
            do produto.
          </Text>
        </div>
        <Button
          variant="secondary"
          size="small"
          onClick={() => setCreating((s) => !s)}
        >
          {creating ? "Cancelar" : "Cadastrar novo veículo"}
        </Button>
      </div>

      {creating && (
        <form onSubmit={createVehicle} className="px-6 py-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[140px]">
            <Text size="small" className="text-ui-fg-subtle mb-1">Marca</Text>
            <Input
              value={newMake}
              onChange={(e) => setNewMake(e.target.value)}
              placeholder="Toyota"
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <Text size="small" className="text-ui-fg-subtle mb-1">Modelo</Text>
            <Input
              value={newModel}
              onChange={(e) => setNewModel(e.target.value)}
              placeholder="Corolla"
            />
          </div>
          <div className="min-w-[100px]">
            <Text size="small" className="text-ui-fg-subtle mb-1">Ano</Text>
            <Select
              value={String(newYear)}
              onValueChange={(v) => setNewYear(parseInt(v, 10))}
            >
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {YEARS.map((y) => (
                  <Select.Item key={y} value={String(y)}>{y}</Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
          <Button type="submit" size="small">Cadastrar e vincular</Button>
        </form>
      )}

      {error && (
        <div className="px-6 py-3 text-sm text-rose-500">{error}</div>
      )}

      <div className="px-6 py-4">
        <Text size="small" weight="plus" className="mb-3">
          Veículos vinculados ({linked.length})
        </Text>
        {loading ? (
          <Text size="small" className="text-ui-fg-subtle">Carregando…</Text>
        ) : linked.length === 0 ? (
          <Text size="small" className="text-ui-fg-subtle italic">
            Nenhum veículo vinculado ainda.
          </Text>
        ) : (
          <div className="flex flex-wrap gap-2">
            {linked.map((v) => (
              <Badge
                key={v.id}
                color="green"
                size="small"
                className="cursor-pointer"
                onClick={() => unlink(v)}
                title="Clique para remover"
              >
                {v.make} {v.model} {v.year}
                {v.trim ? ` ${v.trim}` : ""} ✕
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-3 gap-4">
          <Text size="small" weight="plus">
            Adicionar veículo existente
          </Text>
          <Input
            placeholder="Buscar por marca, modelo ou ano…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>
        {visibleAvailable.length === 0 ? (
          <Text size="small" className="text-ui-fg-subtle italic">
            {search
              ? "Nenhum veículo encontrado. Use 'Cadastrar novo veículo' acima."
              : "Não há veículos cadastrados. Cadastre o primeiro acima."}
          </Text>
        ) : (
          <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto">
            {visibleAvailable.slice(0, 50).map((v) => (
              <Badge
                key={v.id}
                color="grey"
                size="small"
                className="cursor-pointer hover:opacity-80"
                onClick={() => link(v)}
                title="Clique para vincular"
              >
                + {v.make} {v.model} {v.year}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductVehicleCompatibility
