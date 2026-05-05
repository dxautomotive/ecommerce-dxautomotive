import LocalizedClientLink from "@modules/common/components/localized-client-link"

const STEPS = [
  { id: "address", label: "Endereço" },
  { id: "delivery", label: "Entrega" },
  { id: "payment", label: "Pagamento" },
  { id: "review", label: "Revisão" },
] as const

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full bg-brand-bg relative small:min-h-screen text-brand-text">
      <header className="border-b border-brand-border bg-brand-bg/95 backdrop-blur sticky top-0 z-30">
        <div className="content-container flex h-16 items-center justify-between gap-4">
          <LocalizedClientLink
            href="/cart"
            className="text-brand-muted hover:text-brand-text flex items-center gap-2 text-sm transition-colors"
            data-testid="back-to-cart-link"
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
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span className="hidden small:inline">Voltar para o carrinho</span>
            <span className="small:hidden">Voltar</span>
          </LocalizedClientLink>

          <LocalizedClientLink
            href="/"
            className="text-brand-text font-extrabold tracking-wider uppercase text-base small:text-lg"
            data-testid="store-link"
          >
            <span className="text-brand-primary">DX</span> Automotive
          </LocalizedClientLink>

          <div className="hidden small:flex items-center gap-2 text-xs text-brand-muted">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-brand-success"
              aria-hidden="true"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Checkout seguro · SSL
          </div>
        </div>

        <div className="hidden small:block border-t border-brand-border/50">
          <div className="content-container py-3">
            <ol className="flex items-center gap-2 text-xs">
              {STEPS.map((s, i) => (
                <li key={s.id} className="flex items-center gap-2">
                  <span className="text-brand-muted uppercase tracking-wider">
                    <span className="text-brand-primary font-bold">
                      {(i + 1).toString().padStart(2, "0")}
                    </span>
                    <span className="ml-1.5">{s.label}</span>
                  </span>
                  {i < STEPS.length - 1 && (
                    <span className="text-brand-border" aria-hidden="true">
                      ·
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </header>

      <div className="relative" data-testid="checkout-container">
        {children}
      </div>

      <footer className="border-t border-brand-border py-6 mt-8">
        <div className="content-container text-center text-xs text-brand-muted">
          © {new Date().getFullYear()} DX Automotive — Grupo Dr. Farol Toledo
        </div>
      </footer>
    </div>
  )
}
