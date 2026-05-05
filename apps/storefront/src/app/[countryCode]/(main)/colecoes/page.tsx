import { Metadata } from "next"

import { listCollections } from "@lib/data/collections"
import { getDXMeta } from "@lib/util/collection-meta"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Coleções",
  description:
    "Coleções da DX Automotive — mais vendidos, lançamentos, linha premium e promoções.",
}

export default async function CollectionsIndexPage() {
  const { collections } = await listCollections({ limit: "100" })

  return (
    <div className="content-container py-8 small:py-12">
      <header className="mb-8">
        <span className="text-brand-primary text-[10px] uppercase tracking-[0.25em] font-bold">
          Explore
        </span>
        <h1 className="text-3xl small:text-4xl font-extrabold text-brand-text mt-2">
          Coleções DX Automotive
        </h1>
        <p className="text-sm text-brand-muted mt-2 max-w-2xl">
          Agrupamentos pensados para facilitar sua escolha — do mais vendido aos
          últimos lançamentos, passando pela linha premium e pelas promoções da
          semana.
        </p>
      </header>

      {collections.length === 0 ? (
        <div className="bg-brand-surface border border-brand-border rounded-xl p-12 text-center">
          <p className="text-brand-text font-semibold">
            Nenhuma coleção cadastrada ainda
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 small:grid-cols-2 medium:grid-cols-3 gap-4 small:gap-6">
          {collections.map((c) => {
            const meta = getDXMeta(c)
            const gradient = `linear-gradient(${meta.gradient_deg ?? 135}deg, ${
              meta.gradient_from ?? "#1e40af"
            }, ${meta.gradient_to ?? "#0ea5e9"})`
            return (
              <LocalizedClientLink
                key={c.id}
                href={`/colecoes/${c.handle}`}
                className="block rounded-xl overflow-hidden border border-brand-border hover:border-brand-primary transition-colors group"
              >
                <div
                  className="aspect-[16/9] flex items-end p-5 small:p-6"
                  style={{ background: gradient }}
                >
                  <div>
                    <h2 className="text-white text-xl small:text-2xl font-extrabold leading-tight">
                      {c.title}
                    </h2>
                    {meta.subtitle && (
                      <p className="text-white/85 text-sm mt-1 line-clamp-2">
                        {meta.subtitle}
                      </p>
                    )}
                  </div>
                </div>
                <div className="bg-brand-surface px-5 py-3 flex items-center justify-between text-sm">
                  <span className="text-brand-muted">Ver produtos</span>
                  <span className="text-brand-primary font-semibold group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </LocalizedClientLink>
            )
          })}
        </div>
      )}
    </div>
  )
}
