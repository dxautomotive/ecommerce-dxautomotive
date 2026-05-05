"use client"

import { setAddresses } from "@lib/data/cart"
import useToggleState from "@lib/hooks/use-toggle-state"
import compareAddresses from "@lib/util/compare-addresses"
import { HttpTypes } from "@medusajs/types"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useActionState } from "react"
import BillingAddress from "../billing_address"
import ErrorMessage from "../error-message"
import ShippingAddress from "../shipping-address"
import StepCard from "../step-card"
import { SubmitButton } from "../submit-button"

const Addresses = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "address"

  const { state: sameAsBilling, toggle: toggleSameAsBilling } = useToggleState(
    cart?.shipping_address && cart?.billing_address
      ? compareAddresses(cart?.shipping_address, cart?.billing_address)
      : true
  )

  const handleEdit = () => {
    router.push(pathname + "?step=address")
  }

  const [message, formAction] = useActionState(setAddresses, null)

  const completed = !isOpen && !!cart?.shipping_address

  return (
    <StepCard
      number="01"
      title="Endereço de entrega"
      eyebrow="Onde entregar"
      state={isOpen ? "open" : completed ? "completed" : "locked"}
      onEdit={handleEdit}
      editTestId="edit-address-button"
    >
      {isOpen ? (
        <form action={formAction} className="flex flex-col gap-y-8">
          <ShippingAddress
            customer={customer}
            checked={sameAsBilling}
            onChange={toggleSameAsBilling}
            cart={cart}
          />

          {!sameAsBilling && (
            <div className="bg-brand-bg border border-brand-border rounded-lg p-5 small:p-6 flex flex-col gap-6">
              <div>
                <span className="text-brand-primary text-[10px] uppercase tracking-[0.2em] font-bold">
                  Cobrança
                </span>
                <h3 className="text-lg font-extrabold text-brand-text mt-1">
                  Endereço de cobrança
                </h3>
                <p className="text-sm text-brand-muted mt-1">
                  Usado para emissão da nota fiscal e validação no pagamento.
                </p>
              </div>
              <BillingAddress cart={cart} />
            </div>
          )}

          <ErrorMessage error={message} data-testid="address-error-message" />

          <SubmitButton
            className="w-full small:w-fit small:self-end !bg-brand-primary !text-white hover:!bg-brand-primary-hover !rounded-md !px-8 !py-3 !text-sm !font-semibold !border-none"
            data-testid="submit-address-button"
          >
            Continuar para entrega →
          </SubmitButton>
        </form>
      ) : completed && cart?.shipping_address ? (
        <div className="grid grid-cols-1 small:grid-cols-3 gap-6 text-sm">
          <div data-testid="shipping-address-summary">
            <h4 className="text-brand-text font-semibold mb-2">Entregar para</h4>
            <p className="text-brand-muted leading-relaxed">
              {cart.shipping_address.first_name}{" "}
              {cart.shipping_address.last_name}
              <br />
              {cart.shipping_address.address_1}
              {cart.shipping_address.address_2 && (
                <>
                  <br />
                  {cart.shipping_address.address_2}
                </>
              )}
              <br />
              {cart.shipping_address.postal_code} ·{" "}
              {cart.shipping_address.city}/
              {cart.shipping_address.province?.toUpperCase()}
            </p>
          </div>

          <div data-testid="shipping-contact-summary">
            <h4 className="text-brand-text font-semibold mb-2">Contato</h4>
            <p className="text-brand-muted leading-relaxed">
              {cart.email && <>{cart.email}<br /></>}
              {cart.shipping_address.phone || "Sem telefone informado"}
            </p>
          </div>

          <div data-testid="billing-address-summary">
            <h4 className="text-brand-text font-semibold mb-2">Cobrança</h4>
            {sameAsBilling ? (
              <p className="text-brand-muted leading-relaxed">
                Mesmo endereço da entrega.
              </p>
            ) : (
              <p className="text-brand-muted leading-relaxed">
                {cart.billing_address?.first_name}{" "}
                {cart.billing_address?.last_name}
                <br />
                {cart.billing_address?.address_1}
                <br />
                {cart.billing_address?.postal_code} ·{" "}
                {cart.billing_address?.city}/
                {cart.billing_address?.province?.toUpperCase()}
              </p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-brand-muted">
          Conclua os passos anteriores para continuar.
        </p>
      )}
    </StepCard>
  )
}

export default Addresses
