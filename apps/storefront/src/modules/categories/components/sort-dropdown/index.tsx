"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import type { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const OPTIONS: { value: SortOptions; label: string }[] = [
  { value: "created_at", label: "Mais recentes" },
  { value: "price_asc", label: "Menor preço" },
  { value: "price_desc", label: "Maior preço" },
]

type Props = { defaultValue: SortOptions }

export default function SortDropdown({ defaultValue }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const value = (params.get("sortBy") as SortOptions) || defaultValue

  const onChange = (v: string) => {
    const sp = new URLSearchParams(params.toString())
    if (v === "created_at") sp.delete("sortBy")
    else sp.set("sortBy", v)
    router.push(`${pathname}?${sp.toString()}`, { scroll: false })
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-brand-muted">Ordenar:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-brand-surface border border-brand-border focus:border-brand-primary text-brand-text rounded px-3 py-2 outline-none transition-colors"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}
