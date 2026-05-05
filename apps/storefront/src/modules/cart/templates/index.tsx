import { HttpTypes } from "@medusajs/types"

import EmptyCartMessage from "../components/empty-cart-message"
import FreeShippingBar from "../components/free-shipping-bar"
import SignInPrompt from "../components/sign-in-prompt"
import ItemsTemplate from "./items"
import Summary from "./summary"

const CartTemplate = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  if (!cart?.items?.length) {
    return <EmptyCartMessage />
  }

  return (
    <div className="content-container py-8 small:py-12" data-testid="cart-container">
      <div className="flex flex-col gap-2 mb-6">
        <span className="text-brand-primary text-xs uppercase tracking-[0.25em] font-semibold">
          Carrinho
        </span>
        <h1 className="text-3xl small:text-4xl font-extrabold text-brand-text">
          Meu carrinho
        </h1>
        <p className="text-brand-muted text-sm">
          Revise os produtos antes de finalizar a compra. Você pode ajustar
          quantidades, remover itens ou continuar comprando.
        </p>
      </div>

      <FreeShippingBar
        subtotal={cart.subtotal ?? 0}
        currency={cart.currency_code}
      />

      <div className="grid grid-cols-1 medium:grid-cols-[1fr_380px] gap-6 small:gap-10 mt-6">
        <div className="flex flex-col gap-6">
          {!customer && <SignInPrompt />}
          <div className="bg-brand-surface border border-brand-border rounded-lg p-4 small:p-6">
            <ItemsTemplate cart={cart} />
          </div>
        </div>

        <div className="medium:sticky medium:top-32 self-start">
          {cart && cart.region && <Summary cart={cart} />}
        </div>
      </div>
    </div>
  )
}

export default CartTemplate
