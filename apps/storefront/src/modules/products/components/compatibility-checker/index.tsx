"use client"

import { useEffect, useState } from "react"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9001"
const PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
const apiHeaders: HeadersInit | undefined = PUBLISHABLE_KEY
  ? { "x-publishable-api-key": PUBLISHABLE_KEY }
  : undefined

type Props = {
  productId: string
}

type CheckResult =
  | { status: "ok"; make: string; model: string; year: number }
  | { status: "not_found"; make: string; model: string; year: number }
  | null

/**
 * CompatibilityChecker v2.1 (seção 9.4 do guide).
 *
 * Verificador "Serve no meu carro?" — 3 selects em cascata (marca → modelo → ano)
 * + botão Verificar. Bate em `/store/vehicles` (cascade) e `/store/products/:id/vehicles`
 * pra confirmar se o veículo escolhido está na lista do produto.
 *
 * Renderizado na col 2 (info center) da PDP, logo abaixo do AiSummary.
 */
export default function CompatibilityChecker({ productId }: Props) {
  const [makes, setMakes] = useState<string[]>([])
  const [models, setModels] = useState<string[]>([])
  const [years, setYears] = useState<number[]>([])
  const [make, setMake] = useState("")
  const [model, setModel] = useState("")
  const [year, setYear] = useState("")
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<CheckResult>(null)

  useEffect(() => {
    fetch(`${BACKEND_URL}/store/vehicles`, { headers: apiHeaders })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.makes && setMakes(d.makes))
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!make) {
      setModels([])
      setModel("")
      return
    }
    fetch(
      `${BACKEND_URL}/store/vehicles?make=${encodeURIComponent(make)}`,
      { headers: apiHeaders }
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.models && setModels(d.models))
      .catch(() => undefined)
  }, [make])

  useEffect(() => {
    if (!make || !model) {
      setYears([])
      setYear("")
      return
    }
    fetch(
      `${BACKEND_URL}/store/vehicles?make=${encodeURIComponent(
        make
      )}&model=${encodeURIComponent(model)}`,
      { headers: apiHeaders }
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.years && setYears(d.years))
      .catch(() => undefined)
  }, [make, model])

  const handleVerify = async () => {
    if (!make || !model || !year) return
    setChecking(true)
    setResult(null)
    try {
      const res = await fetch(
        `${BACKEND_URL}/store/products/${productId}/vehicles`,
        { headers: apiHeaders }
      )
      if (!res.ok) {
        setResult({ status: "not_found", make, model, year: Number(year) })
        return
      }
      const data = (await res.json()) as {
        vehicles?: Array<{ make: string; model: string; year: number }>
      }
      const found = (data.vehicles ?? []).some(
        (v) =>
          v.make.toLowerCase() === make.toLowerCase() &&
          v.model.toLowerCase() === model.toLowerCase() &&
          v.year === Number(year)
      )
      setResult({
        status: found ? "ok" : "not_found",
        make,
        model,
        year: Number(year),
      })
    } catch {
      setResult({ status: "not_found", make, model, year: Number(year) })
    } finally {
      setChecking(false)
    }
  }

  const selectClass =
    "w-full bg-brand-surface border border-brand-border rounded-md text-brand-text text-[13px] px-3 py-2.5 focus:border-brand-primary/50 focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"

  return (
    <div className="bg-brand-surface-2 border border-brand-border rounded-xl p-5">
      <p className="text-[14px] font-bold text-brand-text mb-3.5 flex items-center gap-2">
        <CheckIcon />
        Serve no meu carro?
      </p>

      <div className="grid grid-cols-1 small:grid-cols-[1fr_1fr_1fr_auto] gap-2 small:items-end">
        <div>
          <label className="text-[12px] font-semibold text-brand-text-2 block mb-1">
            Marca
          </label>
          <select
            className={selectClass}
            value={make}
            onChange={(e) => setMake(e.target.value)}
          >
            <option value="">Selecione</option>
            {makes.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[12px] font-semibold text-brand-text-2 block mb-1">
            Modelo
          </label>
          <select
            className={selectClass}
            value={model}
            onChange={(e) => setModel(e.target.value)}
            disabled={!make}
          >
            <option value="">Selecione</option>
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[12px] font-semibold text-brand-text-2 block mb-1">
            Ano
          </label>
          <select
            className={selectClass}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            disabled={!model}
          >
            <option value="">Selecione</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={handleVerify}
          disabled={!make || !model || !year || checking}
          className="h-[42px] px-5 bg-grad-primary text-white font-bold text-[13px] rounded-md shadow-glow-sm hover:shadow-glow-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {checking ? "Verificando..." : "Verificar"}
        </button>
      </div>

      {result?.status === "ok" && (
        <div className="mt-3 bg-brand-success/8 border border-brand-success/20 rounded-md p-3 flex items-center gap-2.5">
          <span
            className="text-[20px] text-brand-success font-black"
            aria-hidden="true"
          >
            ✓
          </span>
          <div>
            <p className="text-[13px] font-bold text-brand-success">
              Compatibilidade confirmada!
            </p>
            <p className="text-[11px] text-brand-text-2">
              {result.make} {result.model} {result.year} — Plug & play.
            </p>
          </div>
        </div>
      )}

      {result?.status === "not_found" && (
        <div className="mt-3 bg-brand-warning/8 border border-brand-warning/20 rounded-md p-3 flex items-center gap-2.5">
          <span
            className="text-[20px] text-brand-warning font-black"
            aria-hidden="true"
          >
            !
          </span>
          <div>
            <p className="text-[13px] font-bold text-brand-warning">
              Não encontrado na lista do produto
            </p>
            <p className="text-[11px] text-brand-text-2">
              Fale com nosso vendedor pra confirmar a compatibilidade do{" "}
              {result.make} {result.model} {result.year}.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-brand-primary"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="9 12 12 15 16 10" />
    </svg>
  )
}
