"use client"

import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useSearchParams } from "next/navigation"
import PaymentButton from "../payment-button"
import StepCard from "../step-card"

const Review = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  const searchParams = useSearchParams()

  const isOpen = searchParams.get("step") === "review"

  const paidByGiftcard = !!(
    (cart as unknown as Record<string, unknown>)?.gift_cards &&
    ((cart as unknown as Record<string, unknown>)?.gift_cards as unknown[])?.length > 0 &&
    cart?.total === 0
  )

  const previousStepsCompleted =
    !!cart.shipping_address &&
    (cart.shipping_methods?.length ?? 0) > 0 &&
    (!!cart.payment_collection || paidByGiftcard)

  const state = isOpen
    ? previousStepsCompleted
      ? "open"
      : "locked"
    : "locked"

  return (
    <StepCard
      number="04"
      title="Revisar e finalizar"
      eyebrow="Tudo pronto?"
      state={state}
    >
      {isOpen && previousStepsCompleted ? (
        <div className="flex flex-col gap-y-5">
          <ul className="flex flex-col gap-2 text-sm">
            <ChecklistItem label="Endereço de entrega confirmado" />
            <ChecklistItem label="Forma de entrega selecionada" />
            <ChecklistItem
              label={
                paidByGiftcard
                  ? "Pagamento coberto por gift card"
                  : "Forma de pagamento selecionada"
              }
            />
          </ul>

          <div className="bg-brand-bg border border-brand-border rounded-lg p-4 small:p-5 text-xs text-brand-muted leading-relaxed">
            Ao clicar em <strong className="text-brand-text">Finalizar pedido</strong>, você confirma
            que leu e concorda com os{" "}
            <LocalizedClientLink
              href="/politicas/trocas-e-devolucoes"
              className="text-brand-primary hover:text-brand-primary-hover underline-offset-4 hover:underline"
            >
              Termos de venda e trocas
            </LocalizedClientLink>{" "}
            e com a{" "}
            <LocalizedClientLink
              href="/politicas/privacidade"
              className="text-brand-primary hover:text-brand-primary-hover underline-offset-4 hover:underline"
            >
              Política de privacidade da DX Automotive
            </LocalizedClientLink>
            .
          </div>

          <PaymentButton cart={cart} data-testid="submit-order-button" />

          <div className="flex items-center gap-2 text-xs text-brand-muted justify-center">
            <ShieldIcon />
            Pagamento processado em ambiente seguro · Loja oficial DX Automotive
          </div>
        </div>
      ) : (
        <p className="text-sm text-brand-muted">
          Conclua os passos anteriores para finalizar o pedido.
        </p>
      )}
    </StepCard>
  )
}

const ChecklistItem = ({ label }: { label: string }) => (
  <li className="flex items-center gap-2 text-brand-text">
    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-primary text-white flex-shrink-0">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
    {label}
  </li>
)

const ShieldIcon = () => (
  <svg
    width="14"
    height="14"
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

export default Review
