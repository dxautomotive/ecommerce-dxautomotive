const BADGES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    title: "Frete para todo o Brasil",
    desc: "Despacho em até 24h após confirmação do pagamento",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
    title: "Garantia",
    desc: "Cobertura de fábrica em todos os produtos",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
      </svg>
    ),
    title: "Trocas e devoluções",
    desc: "7 dias após o recebimento, conforme CDC",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: "Pagamento seguro",
    desc: "Ambiente certificado SSL e checkout MercadoPago",
  },
] as const

/**
 * Quatro badges de confiança visualmente discretos exibidos abaixo do
 * painel de compra na página de produto. Aumenta sensação de segurança.
 */
export default function TrustBadges() {
  return (
    <div className="grid grid-cols-2 small:grid-cols-4 gap-3">
      {BADGES.map((b) => (
        <div
          key={b.title}
          className="bg-brand-surface border border-brand-border rounded-lg p-3 flex flex-col gap-1.5"
        >
          <span className="text-brand-primary">{b.icon}</span>
          <p className="text-brand-text text-xs font-semibold leading-tight">
            {b.title}
          </p>
          <p className="text-brand-muted text-[11px] leading-snug">{b.desc}</p>
        </div>
      ))}
    </div>
  )
}
