/**
 * Bloco compacto de sinais de confiança que aparece logo abaixo do
 * botão "Adicionar ao carrinho" na PDP. 4 ícones em linha, mobile-first.
 *
 * Inspirado no padrão usado por concorrentes de ticket alto que
 * convertem bem (Kitssom faz parecido) — reforça confiança no momento
 * exato da decisão de compra.
 */
const TrustSignals = () => {
  return (
    <div className="grid grid-cols-2 gap-2 mt-3">
      <Signal
        icon={<ShieldIcon />}
        title="Compra segura"
        subtitle="SSL · dados criptografados"
      />
      <Signal
        icon={<GuaranteeIcon />}
        title="Garantia 2 anos"
        subtitle="Direto com a loja"
      />
      <Signal
        icon={<PixIcon />}
        title="-10% no Pix"
        subtitle="Aprovação imediata"
      />
      <Signal
        icon={<TruckIcon />}
        title="Envio Brasil todo"
        subtitle="PAC e SEDEX"
      />
    </div>
  )
}

const Signal = ({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
}) => (
  <div className="bg-brand-bg border border-brand-border rounded-md px-2.5 py-2 flex items-start gap-2 min-w-0">
    <span className="text-brand-primary flex-shrink-0 mt-0.5">{icon}</span>
    <div className="min-w-0 flex-1">
      <div className="text-[11px] font-bold text-brand-text leading-tight">
        {title}
      </div>
      <div className="text-[10px] text-brand-muted leading-tight">
        {subtitle}
      </div>
    </div>
  </div>
)

const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
)

const GuaranteeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </svg>
)

const PixIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)

const TruckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
)

export default TrustSignals
