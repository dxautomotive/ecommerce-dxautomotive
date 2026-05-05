import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SUGGESTIONS = [
  { label: "Multimídia", href: "/categories/multimidia" },
  { label: "Molduras", href: "/categories/molduras" },
  { label: "Câmera de Ré", href: "/categories/camera-de-re" },
  { label: "Sensor de Estacionamento", href: "/categories/sensor-de-estacionamento" },
] as const

export default function EmptyCartMessage() {
  return (
    <div
      className="content-container py-16 small:py-24 flex flex-col items-center text-center"
      data-testid="empty-cart-message"
    >
      <div className="w-20 h-20 rounded-full bg-brand-primary/15 border border-brand-primary/30 flex items-center justify-center mb-6">
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#0066FF"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      </div>
      <h1 className="text-3xl small:text-4xl font-extrabold text-brand-text">
        Seu carrinho está vazio
      </h1>
      <p className="text-brand-muted mt-3 max-w-md">
        Que tal começar olhando algumas categorias? Tem multimídia, moldura,
        câmera e sensor para todos os modelos populares.
      </p>

      <LocalizedClientLink
        href="/store"
        className="mt-6 bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold px-6 py-3 rounded-md transition-colors"
      >
        Ver produtos
      </LocalizedClientLink>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((s) => (
          <LocalizedClientLink
            key={s.href}
            href={s.href}
            className="text-sm px-4 py-2 rounded-full border border-brand-border hover:border-brand-primary text-brand-text hover:text-brand-primary transition-colors"
          >
            {s.label}
          </LocalizedClientLink>
        ))}
      </div>
    </div>
  )
}
