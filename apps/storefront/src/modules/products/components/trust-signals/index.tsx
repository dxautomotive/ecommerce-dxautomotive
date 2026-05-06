/**
 * TrustSignals v2.1 (KaBuM-inspired).
 *
 * Grid 2x2 (mobile) → 4 colunas (desktop) com fundo `gap-px` que
 * mostra divisores sutis entre cards. Cada card tem ícone grande
 * em quadrado com bg tintado da cor semântica.
 *
 * Renderizado logo abaixo do CTA "Adicionar ao carrinho" na PDP
 * para reforçar confiança no momento da decisão de compra.
 */
const items = [
  {
    icon: "🚚",
    label: "Frete grátis",
    sub: "Acima de R$ 499",
    bg: "bg-brand-primary/10",
  },
  {
    icon: "⚡",
    label: "Pix 10% off",
    sub: "Aprovação imediata",
    bg: "bg-brand-pix/10",
  },
  {
    icon: "🛡️",
    label: "Garantia 2 anos",
    sub: "Direto com a loja",
    bg: "bg-brand-success/10",
  },
  {
    icon: "💬",
    label: "WhatsApp",
    sub: "Seg–Sáb 8h–18h",
    bg: "bg-brand-wpp/10",
  },
] as const

const TrustSignals = () => {
  return (
    <div className="grid grid-cols-2 gap-px bg-brand-border rounded-xl overflow-hidden mt-3">
      {items.map(({ icon, label, sub, bg }) => (
        <div
          key={label}
          className="bg-brand-surface px-4 py-3.5 flex items-center gap-3"
        >
          <div
            className={`w-9 h-9 rounded-md flex items-center justify-center text-[20px] flex-shrink-0 ${bg}`}
            aria-hidden="true"
          >
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-brand-text leading-tight truncate">
              {label}
            </p>
            <p className="text-[11px] text-brand-text-2 leading-tight truncate">
              {sub}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default TrustSignals
