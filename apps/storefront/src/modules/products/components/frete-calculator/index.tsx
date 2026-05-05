"use client"

import { useState } from "react"

type Quote = {
  service: string
  days: string
  price: string
}

type Props = {
  /** Peso do produto em gramas; se null, usa default 2000g */
  weightGrams?: number | null
}

/**
 * Calculadora de frete por CEP:
 * 1) Valida CEP com ViaCEP (https://viacep.com.br/) — gratuito, sem auth
 * 2) Estima frete usando uma tabela simples por região do estado
 *    (próxima sessão troca por API real dos Correios)
 *
 * O servidor Medusa pode estimar frete via shipping options reais quando
 * o backend tiver fulfillment provider Correios configurado — por ora,
 * é uma estimativa client-side suficiente para a página de produto.
 */
export default function FreteCalculator({ weightGrams }: Props) {
  const [cep, setCep] = useState("")
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [city, setCity] = useState<string | null>(null)
  const [quotes, setQuotes] = useState<Quote[] | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    setQuotes(null)
    setCity(null)
    const clean = cep.replace(/\D/g, "")
    if (clean.length !== 8) {
      setErr("CEP inválido. Digite os 8 dígitos.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
      if (!res.ok) throw new Error("Falha ao consultar CEP")
      const data = await res.json()
      if (data.erro) {
        setErr("CEP não encontrado.")
        return
      }
      setCity(`${data.localidade} / ${data.uf}`)
      setQuotes(estimate(data.uf, weightGrams ?? 2000))
    } catch (e) {
      setErr("Erro ao consultar CEP. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-brand-surface border border-brand-border rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-brand-primary"
          aria-hidden="true"
        >
          <rect x="1" y="3" width="15" height="13" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
        <p className="text-brand-text font-semibold text-sm">Calcular frete e prazo</p>
      </div>

      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          inputMode="numeric"
          maxLength={9}
          value={cep}
          onChange={(e) => setCep(formatCep(e.target.value))}
          placeholder="00000-000"
          aria-label="Digite seu CEP"
          className="flex-1 bg-brand-bg border border-brand-border focus:border-brand-primary rounded px-3 py-2 text-brand-text text-sm outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-50 text-white text-sm font-semibold px-4 rounded transition-colors"
        >
          {loading ? "Calculando…" : "Calcular"}
        </button>
      </form>

      <a
        href="https://buscacepinter.correios.com.br/app/endereco/index.php"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-brand-muted hover:text-brand-text underline-offset-4 hover:underline self-start"
      >
        Não sei meu CEP
      </a>

      {err && (
        <p role="alert" className="text-brand-danger text-sm">
          {err}
        </p>
      )}

      {city && quotes && (
        <div className="border-t border-brand-border pt-3 flex flex-col gap-2">
          <p className="text-xs text-brand-muted">
            Entrega em <strong className="text-brand-text">{city}</strong>:
          </p>
          <table className="w-full text-sm">
            <tbody>
              {quotes.map((q) => (
                <tr key={q.service} className="border-b border-brand-border/40 last:border-0">
                  <td className="py-1.5 text-brand-text font-medium">{q.service}</td>
                  <td className="py-1.5 text-brand-muted text-xs">{q.days}</td>
                  <td className="py-1.5 text-right text-brand-text font-semibold">
                    {q.price}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-brand-muted">
            Estimativa baseada no CEP. Valor final calculado no checkout.
          </p>
        </div>
      )}
    </div>
  )
}

function formatCep(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 8)
  if (d.length <= 5) return d
  return `${d.slice(0, 5)}-${d.slice(5)}`
}

/**
 * Estimativa simples de frete por região (placeholder até API Correios real).
 * Origem do estoque: Toledo / PR.
 */
function estimate(uf: string, weightGrams: number): Quote[] {
  const regions: Record<string, "sul" | "sudeste" | "nordeste" | "norte" | "centroeste"> = {
    PR: "sul", SC: "sul", RS: "sul",
    SP: "sudeste", RJ: "sudeste", MG: "sudeste", ES: "sudeste",
    BA: "nordeste", PE: "nordeste", CE: "nordeste", RN: "nordeste",
    PB: "nordeste", AL: "nordeste", SE: "nordeste", PI: "nordeste", MA: "nordeste",
    AM: "norte", PA: "norte", AC: "norte", RO: "norte", RR: "norte", AP: "norte", TO: "norte",
    GO: "centroeste", MT: "centroeste", MS: "centroeste", DF: "centroeste",
  }
  const region = regions[uf.toUpperCase()] ?? "sudeste"

  const base = {
    sul: { pac: 22, pacDays: "5 a 8", sedex: 38, sedexDays: "2 a 3" },
    sudeste: { pac: 28, pacDays: "5 a 9", sedex: 48, sedexDays: "3 a 4" },
    nordeste: { pac: 38, pacDays: "8 a 14", sedex: 68, sedexDays: "5 a 7" },
    norte: { pac: 52, pacDays: "12 a 20", sedex: 92, sedexDays: "7 a 10" },
    centroeste: { pac: 32, pacDays: "7 a 12", sedex: 56, sedexDays: "4 a 6" },
  }[region]

  const weightFactor = Math.max(1, weightGrams / 2000)
  const pacPrice = base.pac * weightFactor
  const sedexPrice = base.sedex * weightFactor
  const fmt = (n: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n)

  return [
    { service: "PAC (Correios)", days: `${base.pacDays} dias úteis`, price: fmt(pacPrice) },
    { service: "SEDEX (Correios)", days: `${base.sedexDays} dias úteis`, price: fmt(sedexPrice) },
  ]
}
