import LocalizedClientLink from "@modules/common/components/localized-client-link"

/**
 * Bloco "Garantia 2 anos" destacado na PDP, com 4 colunas explicando
 * cobertura, prazo, forma de acionar e SAC. Inspirado no padrão
 * Kitssom ("2 ANOS Garantia Direto com a Loja"), que comunica
 * confiança em ticket alto.
 *
 * Renderizado entre o ProductTabs e os RelatedProducts.
 */
const GuaranteeHighlight = () => {
  return (
    <section className="content-container my-12 small:my-16">
      <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden">
        <header className="px-6 small:px-10 py-6 small:py-8 border-b border-brand-border bg-gradient-to-r from-brand-success/15 to-transparent">
          <div className="flex items-start gap-4">
            <span className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-full bg-brand-success/15 text-brand-success">
              <ShieldCheck />
            </span>
            <div>
              <span className="text-brand-success text-[10px] uppercase tracking-[0.25em] font-bold block">
                Garantia DX Automotive
              </span>
              <h2 className="text-xl small:text-2xl font-extrabold text-brand-text mt-1 leading-tight">
                2 anos de garantia direto com a loja
              </h2>
              <p className="text-sm text-brand-muted mt-1 max-w-2xl">
                Você não precisa lidar com a fábrica do exterior. Se der
                qualquer problema, fala com a gente — a DX resolve.
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 small:grid-cols-2 medium:grid-cols-4 divide-y small:divide-y-0 small:divide-x divide-brand-border">
          <Pillar
            icon={<CheckCircle />}
            title="O que cobre"
            text="Defeitos de fabricação, falha de hardware e problemas de software dentro do prazo."
          />
          <Pillar
            icon={<Clock />}
            title="Prazo"
            text="24 meses a partir da data de compra. Conta a nota fiscal eletrônica que você recebe."
          />
          <Pillar
            icon={<MessageCircle />}
            title="Como acionar"
            text="Manda mensagem no WhatsApp com o número do pedido. Nossa equipe orienta o passo a passo."
          />
          <Pillar
            icon={<Truck />}
            title="Trocas"
            text="Defeito comprovado? A gente envia o produto novo e o reverso é por nossa conta."
          />
        </div>

        <footer className="px-6 small:px-10 py-4 border-t border-brand-border bg-brand-bg flex flex-col small:flex-row items-start small:items-center justify-between gap-3 text-sm">
          <p className="text-brand-muted">
            Política completa, prazos e exceções na página de Garantia.
          </p>
          <div className="flex flex-wrap gap-2">
            <LocalizedClientLink
              href="/politicas/garantia"
              className="bg-brand-bg border border-brand-border text-brand-text hover:border-brand-primary text-sm font-semibold px-4 py-2 rounded-md transition-colors"
            >
              Ver política completa
            </LocalizedClientLink>
            <a
              href="https://wa.me/5548000000000?text=Ol%C3%A1!%20Tenho%20uma%20d%C3%BAvida%20sobre%20a%20garantia."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-brand-success hover:opacity-90 text-white text-sm font-semibold px-4 py-2 rounded-md transition-opacity"
            >
              Falar pelo WhatsApp
            </a>
          </div>
        </footer>
      </div>
    </section>
  )
}

const ShieldCheck = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
)

const Pillar = ({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode
  title: string
  text: string
}) => (
  <div className="px-6 small:px-7 py-6 flex flex-col gap-2">
    <span className="text-brand-primary">{icon}</span>
    <h3 className="text-brand-text font-bold text-sm">{title}</h3>
    <p className="text-brand-muted text-xs leading-relaxed">{text}</p>
  </div>
)

const CheckCircle = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const Clock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const MessageCircle = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
)

const Truck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
)

export default GuaranteeHighlight
