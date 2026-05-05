import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import CheckoutTotals from "@modules/checkout/components/checkout-totals"
import DiscountCode from "@modules/checkout/components/discount-code"
import { HttpTypes } from "@medusajs/types"

const CheckoutSummary = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  const itemCount = cart.items?.reduce((sum, i) => sum + (i.quantity ?? 0), 0) ?? 0

  return (
    <aside className="small:sticky small:top-24 flex flex-col gap-y-4 py-8 small:py-0">
      <div className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden">
        <header className="px-5 small:px-6 py-4 border-b border-brand-border">
          <span className="text-brand-primary text-[10px] uppercase tracking-[0.2em] font-bold">
            Resumo
          </span>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-extrabold text-brand-text">
              Seu pedido
            </h2>
            <span className="text-xs text-brand-muted">
              {itemCount} {itemCount === 1 ? "item" : "itens"}
            </span>
          </div>
        </header>

        <div className="p-5 small:p-6 flex flex-col gap-5">
          <div>
            <ItemsPreviewTemplate cart={cart} />
          </div>

          <div className="border-t border-brand-border pt-5">
            <DiscountCode cart={cart} />
          </div>

          <div className="border-t border-brand-border pt-5">
            <CheckoutTotals totals={cart} />
          </div>
        </div>
      </div>

      <TrustBlock />
    </aside>
  )
}

const TrustBlock = () => (
  <div className="bg-brand-surface border border-brand-border rounded-xl p-4 small:p-5 flex flex-col gap-2 text-xs text-brand-muted">
    <div className="flex items-center gap-2 text-brand-text font-semibold text-sm">
      <ShieldIcon /> Compra 100% segura
    </div>
    <p>
      Seus dados trafegam criptografados (SSL). Nota fiscal eletrônica enviada por
      e-mail e WhatsApp.
    </p>
    <p className="border-t border-brand-border pt-2 mt-1">
      Dúvidas? Fale com a gente pelo WhatsApp <strong className="text-brand-text">(45) 99999-0000</strong> de
      segunda a sábado.
    </p>
  </div>
)

const ShieldIcon = () => (
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
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

export default CheckoutSummary
