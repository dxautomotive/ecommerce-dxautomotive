import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Página não encontrada",
  description:
    "A página que você procura não existe ou foi movida. Volte para a loja DX Automotive.",
}

const QUICK_LINKS = [
  { label: "Multimídia", href: "/categories/multimidia", icon: "🚗" },
  { label: "Molduras", href: "/categories/molduras", icon: "🪞" },
  { label: "Câmera de Ré", href: "/categories/camera-de-re", icon: "📷" },
  { label: "Sensor", href: "/categories/sensor-de-estacionamento", icon: "🛞" },
] as const

export default function NotFound() {
  return (
    <main className="content-container py-16 small:py-24 flex flex-col items-center text-center">
      <span className="text-brand-primary text-xs uppercase tracking-[0.3em] font-bold">
        Erro 404
      </span>
      <h1 className="text-5xl small:text-7xl font-extrabold text-brand-text mt-4 leading-none">
        Página não encontrada
      </h1>
      <p className="text-brand-muted text-base small:text-lg mt-4 max-w-xl">
        A página que você tentou abrir não existe, foi removida ou o link está
        com erro. Que tal continuar navegando pela loja?
      </p>

      <div className="flex flex-wrap justify-center gap-3 mt-8">
        <LocalizedClientLink
          href="/"
          className="bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold px-6 py-3 rounded-md transition-colors"
        >
          Ir para a página inicial
        </LocalizedClientLink>
        <LocalizedClientLink
          href="/store"
          className="border border-brand-border hover:border-brand-primary text-brand-text hover:text-brand-primary font-semibold px-6 py-3 rounded-md transition-colors"
        >
          Ver todos os produtos
        </LocalizedClientLink>
      </div>

      <div className="mt-12 small:mt-16 w-full max-w-3xl">
        <p className="text-brand-muted text-sm uppercase tracking-wider mb-4">
          Ou explore por categoria
        </p>
        <div className="grid grid-cols-2 medium:grid-cols-4 gap-3">
          {QUICK_LINKS.map((l) => (
            <LocalizedClientLink
              key={l.href}
              href={l.href}
              className="group bg-brand-surface border border-brand-border hover:border-brand-primary rounded-lg p-4 flex flex-col items-center gap-2 transition-all hover:-translate-y-0.5"
            >
              <span className="text-3xl" aria-hidden="true">{l.icon}</span>
              <span className="text-brand-text text-sm font-semibold group-hover:text-brand-primary transition-colors">
                {l.label}
              </span>
            </LocalizedClientLink>
          ))}
        </div>
      </div>
    </main>
  )
}
