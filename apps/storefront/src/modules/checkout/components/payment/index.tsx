"use client"

import { RadioGroup } from "@headlessui/react"
import { isStripeLike, paymentInfoMap } from "@lib/constants"
import { initiatePaymentSession } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import ErrorMessage from "@modules/checkout/components/error-message"
import { StripeCardContainer } from "@modules/checkout/components/payment-container"
import MercadoPagoMockup from "@modules/checkout/components/mercadopago-mockup"
import { CreditCard } from "@medusajs/icons"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import StepCard from "../step-card"

const Payment = ({
  cart,
  availablePaymentMethods,
}: {
  cart: HttpTypes.StoreCart
  availablePaymentMethods: { id: string }[]
}) => {
  const activeSession = cart.payment_collection?.payment_sessions?.find(
    (paymentSession) => paymentSession.status === "pending"
  )

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cardBrand, setCardBrand] = useState<string | null>(null)
  const [cardComplete, setCardComplete] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? ""
  )

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "payment"

  const setPaymentMethod = async (method: string) => {
    setError(null)
    setSelectedPaymentMethod(method)
    if (isStripeLike(method)) {
      await initiatePaymentSession(cart, { provider_id: method })
    }
  }

  const paidByGiftcard = !!(
    (cart as unknown as Record<string, unknown>)?.gift_cards &&
    ((cart as unknown as Record<string, unknown>)?.gift_cards as unknown[])?.length > 0 &&
    cart?.total === 0
  )

  const paymentReady =
    (activeSession && (cart?.shipping_methods?.length ?? 0) !== 0) ||
    paidByGiftcard

  const previousCompleted =
    !!cart?.shipping_address &&
    !!cart?.billing_address &&
    !!cart?.email &&
    (cart?.shipping_methods?.length ?? 0) > 0

  const completed = !isOpen && paymentReady
  const state = isOpen
    ? "open"
    : completed
    ? "completed"
    : previousCompleted
    ? "open"
    : "locked"

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)
      return params.toString()
    },
    [searchParams]
  )

  const handleEdit = () => {
    router.push(pathname + "?" + createQueryString("step", "payment"), {
      scroll: false,
    })
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const shouldInputCard =
        isStripeLike(selectedPaymentMethod) && !activeSession
      const checkActiveSession =
        activeSession?.provider_id === selectedPaymentMethod

      if (!checkActiveSession) {
        await initiatePaymentSession(cart, {
          provider_id: selectedPaymentMethod,
        })
      }

      if (!shouldInputCard) {
        return router.push(
          pathname + "?" + createQueryString("step", "review"),
          { scroll: false }
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  const cartTotal = cart?.total ?? 0
  const showMpPreview = selectedPaymentMethod === "pp_system_default"
  const noProviders = !paidByGiftcard && (availablePaymentMethods?.length ?? 0) === 0

  return (
    <StepCard
      number="03"
      title="Forma de pagamento"
      eyebrow="Como pagar"
      state={state}
      onEdit={handleEdit}
      editTestId="edit-payment-button"
    >
      {isOpen ? (
        <div className="flex flex-col gap-y-5">
          {paidByGiftcard ? (
            <div className="bg-brand-bg border border-brand-border rounded-lg p-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-brand-success/10 text-brand-success">
                <CreditCard />
              </span>
              <div>
                <p className="text-brand-text font-semibold text-sm">Pago com gift card</p>
                <p className="text-xs text-brand-muted">
                  Saldo cobre o valor total do pedido. Sem cobrança adicional.
                </p>
              </div>
            </div>
          ) : noProviders ? (
            <div className="bg-brand-bg border border-brand-border rounded-lg p-5">
              <p className="text-sm text-brand-muted">
                Nenhum método de pagamento configurado para esta região. Entre em contato pelo WhatsApp.
              </p>
            </div>
          ) : (
            <RadioGroup
              value={selectedPaymentMethod}
              onChange={(value: string) => setPaymentMethod(value)}
              className="flex flex-col gap-3"
              data-testid="payment-method-list"
            >
              {availablePaymentMethods.map((paymentMethod) => {
                const info = paymentInfoMap[paymentMethod.id]
                const isSelected = paymentMethod.id === selectedPaymentMethod

                if (isStripeLike(paymentMethod.id)) {
                  return (
                    <div
                      key={paymentMethod.id}
                      className={`border rounded-lg overflow-hidden transition-colors ${
                        isSelected
                          ? "bg-brand-primary/5 border-brand-primary"
                          : "bg-brand-bg border-brand-border"
                      }`}
                    >
                      <StripeCardContainer
                        paymentProviderId={paymentMethod.id}
                        selectedPaymentOptionId={selectedPaymentMethod}
                        paymentInfoMap={paymentInfoMap}
                        setCardBrand={setCardBrand}
                        setError={setError}
                        setCardComplete={setCardComplete}
                      />
                    </div>
                  )
                }

                return (
                  <RadioGroup.Option
                    key={paymentMethod.id}
                    value={paymentMethod.id}
                    className={`flex items-start gap-3 cursor-pointer p-4 small:p-5 border rounded-lg transition-colors ${
                      isSelected
                        ? "bg-brand-primary/5 border-brand-primary"
                        : "bg-brand-bg border-brand-border hover:border-brand-primary/40"
                    }`}
                    data-testid={`payment-method-${paymentMethod.id}`}
                  >
                    <RadioDot checked={isSelected} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-brand-text font-semibold text-sm">
                          {info?.title ?? paymentMethod.id}
                        </span>
                        <span className="text-brand-muted">{info?.icon}</span>
                      </div>
                      {info?.description && (
                        <p className="text-xs text-brand-muted mt-1">
                          {info.description}
                        </p>
                      )}
                    </div>
                  </RadioGroup.Option>
                )
              })}
            </RadioGroup>
          )}

          {showMpPreview && (
            <div className="border-t border-brand-border pt-5">
              <p className="text-xs text-brand-muted mb-3">
                Preview do checkout MercadoPago — UI já está pronta. A integração real é ativada
                assim que as credenciais estiverem configuradas.
              </p>
              <MercadoPagoMockup
                amount={cartTotal}
                currency={cart?.currency_code ?? "brl"}
              />
            </div>
          )}

          <ErrorMessage
            error={error}
            data-testid="payment-method-error-message"
          />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              isLoading ||
              (isStripeLike(selectedPaymentMethod) && !cardComplete) ||
              (!selectedPaymentMethod && !paidByGiftcard)
            }
            data-testid="submit-payment-button"
            className="w-full small:w-fit small:self-end bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-md px-8 py-3 transition-colors"
          >
            {isLoading
              ? "Salvando…"
              : !activeSession && isStripeLike(selectedPaymentMethod)
              ? "Inserir dados do cartão"
              : "Revisar pedido →"}
          </button>
        </div>
      ) : completed && cart && activeSession ? (
        <div className="grid grid-cols-1 small:grid-cols-2 gap-6 text-sm" data-testid="payment-method-summary">
          <div>
            <h4 className="text-brand-text font-semibold mb-2">Método</h4>
            <p className="text-brand-muted">
              {paymentInfoMap[activeSession?.provider_id]?.title ||
                activeSession?.provider_id}
            </p>
          </div>
          <div>
            <h4 className="text-brand-text font-semibold mb-2">Detalhes</h4>
            <div className="flex items-center gap-2 text-brand-muted" data-testid="payment-details-summary">
              <span className="inline-flex items-center justify-center h-7 px-2 bg-brand-bg border border-brand-border rounded text-brand-text">
                {paymentInfoMap[selectedPaymentMethod]?.icon || <CreditCard />}
              </span>
              <span>
                {isStripeLike(selectedPaymentMethod) && cardBrand
                  ? cardBrand
                  : "Você concluirá o pagamento na próxima etapa"}
              </span>
            </div>
          </div>
        </div>
      ) : completed && paidByGiftcard ? (
        <div className="text-sm">
          <h4 className="text-brand-text font-semibold mb-2">Método</h4>
          <p className="text-brand-muted">Gift card</p>
        </div>
      ) : (
        <p className="text-sm text-brand-muted">
          Conclua os passos anteriores para continuar.
        </p>
      )}
    </StepCard>
  )
}

const RadioDot = ({ checked }: { checked: boolean }) => (
  <span
    className={`flex items-center justify-center w-5 h-5 rounded-full border flex-shrink-0 mt-0.5 transition-colors ${
      checked
        ? "border-brand-primary bg-brand-primary/20"
        : "border-brand-border bg-brand-bg"
    }`}
  >
    {checked && <span className="w-2.5 h-2.5 rounded-full bg-brand-primary" />}
  </span>
)

export default Payment
