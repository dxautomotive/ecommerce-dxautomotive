"use client"

import { useRouter, useParams } from "next/navigation"
import { FormEvent, useState } from "react"

/**
 * Input de busca centralizado no header — abre /[country]/store?q=...
 * O Medusa não tem search nativo de produto via storefront API, então
 * por ora só redireciona para a /store filtrando por título client-side
 * (próxima sessão: integrar Algolia/MeiliSearch).
 */
export default function SearchInput() {
  const router = useRouter()
  const params = useParams()
  const countryCode = (params.countryCode as string) || "br"
  const [q, setQ] = useState("")

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const term = q.trim()
    const target = term
      ? `/${countryCode}/store?q=${encodeURIComponent(term)}`
      : `/${countryCode}/store`
    router.push(target)
  }

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      className="hidden small:flex items-center w-full max-w-xl"
    >
      <div className="relative flex w-full">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Busque por marca, modelo ou produto…"
          aria-label="Buscar produtos"
          className="w-full bg-brand-surface border border-brand-border focus:border-brand-primary text-brand-text placeholder:text-brand-muted text-sm rounded-l-md px-4 py-2.5 outline-none transition-colors"
        />
        <button
          type="submit"
          aria-label="Buscar"
          className="bg-brand-primary hover:bg-brand-primary-hover text-white px-4 rounded-r-md flex items-center justify-center transition-colors"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </div>
    </form>
  )
}
