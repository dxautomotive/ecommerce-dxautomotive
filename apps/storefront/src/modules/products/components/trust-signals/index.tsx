/**
 * TrustSignals canônico (seção 13 do guide v2.1).
 *
 * Grid 4 colunas com `gap-px bg-brand-border` criando divisores sutis.
 * Usado em larguras cheias (carrinho, landings, depois de uma seção
 * de produtos). Para a buy box estreita da PDP existe o trust signals
 * vertical inline em `<BuyBox>` (seção 9.1).
 *
 * Em mobile/medium o grid degrada para 2 colunas.
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
    <div className="grid grid-cols-2 large:grid-cols-4 gap-px bg-brand-border rounded-xl overflow-hidden">
      {items.map(({ icon, label, sub, bg }) => (
        <div
          key={label}
          className="bg-brand-surface px-4 py-4 flex items-center gap-3"
        >
          <div
            className={`w-9 h-9 rounded-md flex items-center justify-center text-[20px] flex-shrink-0 ${bg}`}
            aria-hidden="true"
          >
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-brand-text leading-tight">
              {label}
            </p>
            <p className="text-[11px] text-brand-text-2 leading-tight">
              {sub}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default TrustSignals
