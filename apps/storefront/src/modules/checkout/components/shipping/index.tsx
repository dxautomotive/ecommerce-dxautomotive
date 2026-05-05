"use client"

import { Radio, RadioGroup } from "@headlessui/react"
import { setShippingMethod } from "@lib/data/cart"
import { calculatePriceForShippingOption } from "@lib/data/fulfillment"
import { convertToLocale } from "@lib/util/money"
import { Loader } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import ErrorMessage from "@modules/checkout/components/error-message"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import StepCard from "../step-card"

const PICKUP_OPTION_ON = "__PICKUP_ON"
const PICKUP_OPTION_OFF = "__PICKUP_OFF"

type ShippingProps = {
  cart: HttpTypes.StoreCart
  availableShippingMethods: HttpTypes.StoreCartShippingOption[] | null
}

type FulfillmentSetMeta = {
  service_zone?: {
    fulfillment_set?: {
      type?: string
      location?: { address?: HttpTypes.StoreCartAddress }
    }
  }
}

function formatAddress(address?: HttpTypes.StoreCartAddress | null) {
  if (!address) return ""
  const parts: string[] = []
  if (address.address_1) parts.push(address.address_1)
  if (address.address_2) parts.push(address.address_2)
  if (address.postal_code || address.city) {
    parts.push(`${address.postal_code ?? ""} ${address.city ?? ""}`.trim())
  }
  if (address.province) parts.push(address.province.toUpperCase())
  return parts.join(" · ")
}

const Shipping: React.FC<ShippingProps> = ({
  cart,
  availableShippingMethods,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPrices, setIsLoadingPrices] = useState(true)
  const [showPickupOptions, setShowPickupOptions] = useState<string>(PICKUP_OPTION_OFF)
  const [calculatedPricesMap, setCalculatedPricesMap] = useState<
    Record<string, number>
  >({})
  const [error, setError] = useState<string | null>(null)
  const [shippingMethodId, setShippingMethodId] = useState<string | null>(
    cart.shipping_methods?.at(-1)?.shipping_option_id || null
  )

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "delivery"
  const completed = !isOpen && (cart.shipping_methods?.length ?? 0) > 0
  const previousCompleted =
    !!cart?.shipping_address && !!cart?.billing_address && !!cart?.email
  const state = isOpen
    ? "open"
    : completed
    ? "completed"
    : previousCompleted
    ? "open"
    : "locked"

  const _shippingMethods = availableShippingMethods?.filter(
    (sm) => (sm as unknown as FulfillmentSetMeta).service_zone?.fulfillment_set?.type !== "pickup"
  )
  const _pickupMethods = availableShippingMethods?.filter(
    (sm) => (sm as unknown as FulfillmentSetMeta).service_zone?.fulfillment_set?.type === "pickup"
  )
  const hasPickupOptions = !!_pickupMethods?.length

  useEffect(() => {
    setIsLoadingPrices(true)
    if (_shippingMethods?.length) {
      const promises = _shippingMethods
        .filter((sm) => sm.price_type === "calculated")
        .map((sm) => calculatePriceForShippingOption(sm.id, cart.id))

      if (promises.length) {
        Promise.allSettled(promises).then((res) => {
          const pricesMap: Record<string, number> = {}
          res
            .filter((r) => r.status === "fulfilled")
            .forEach((p) => {
              if (p.value?.id) {
                pricesMap[p.value.id] = p.value.amount ?? 0
              }
            })
          setCalculatedPricesMap(pricesMap)
          setIsLoadingPrices(false)
        })
      } else {
        setIsLoadingPrices(false)
      }
    } else {
      setIsLoadingPrices(false)
    }

    if (_pickupMethods?.find((m) => m.id === shippingMethodId)) {
      setShowPickupOptions(PICKUP_OPTION_ON)
    }
  }, [availableShippingMethods])

  const handleEdit = () => {
    router.push(pathname + "?step=delivery", { scroll: false })
  }

  const handleSubmit = () => {
    router.push(pathname + "?step=payment", { scroll: false })
  }

  const handleSetShippingMethod = async (
    id: string,
    variant: "shipping" | "pickup"
  ) => {
    setError(null)
    if (variant === "pickup") setShowPickupOptions(PICKUP_OPTION_ON)
    else setShowPickupOptions(PICKUP_OPTION_OFF)

    let currentId: string | null = null
    setIsLoading(true)
    setShippingMethodId((prev) => {
      currentId = prev
      return id
    })

    await setShippingMethod({ cartId: cart.id, shippingMethodId: id })
      .catch((err) => {
        setShippingMethodId(currentId)
        setError(err.message)
      })
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  return (
    <StepCard
      number="02"
      title="Forma de entrega"
      eyebrow="Como receber"
      state={state}
      onEdit={handleEdit}
      editTestId="edit-delivery-button"
    >
      {isOpen ? (
        <>
          <div className="mb-4">
            <p className="text-sm text-brand-muted">
              Escolha como prefere receber o pedido. O prazo começa a contar após a confirmação do pagamento.
            </p>
          </div>

          <div data-testid="delivery-options-container" className="flex flex-col gap-3">
            {hasPickupOptions && (
              <RadioGroup
                value={showPickupOptions}
                onChange={(_value) => {
                  const id = _pickupMethods.find(
                    (option) => !option.insufficient_inventory
                  )?.id
                  if (id) handleSetShippingMethod(id, "pickup")
                }}
              >
                <Radio
                  value={PICKUP_OPTION_ON}
                  data-testid="delivery-option-radio"
                  className={`flex items-center justify-between cursor-pointer p-4 small:p-5 border rounded-lg transition-colors ${
                    showPickupOptions === PICKUP_OPTION_ON
                      ? "bg-brand-primary/5 border-brand-primary"
                      : "bg-brand-bg border-brand-border hover:border-brand-primary/40"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <RadioDot checked={showPickupOptions === PICKUP_OPTION_ON} />
                    <div>
                      <span className="block text-brand-text font-semibold text-sm">
                        Retirar na loja
                      </span>
                      <span className="block text-xs text-brand-muted">
                        Sem custo. Você combina o melhor horário.
                      </span>
                    </div>
                  </div>
                  <span className="text-brand-text font-bold text-sm">Grátis</span>
                </Radio>
              </RadioGroup>
            )}

            {(!_shippingMethods || _shippingMethods.length === 0) ? (
              <div className="bg-brand-bg border border-brand-border rounded-lg p-5 text-center">
                <p className="text-sm text-brand-muted">
                  Nenhuma opção de entrega disponível para este endereço. Entre em contato pelo WhatsApp.
                </p>
              </div>
            ) : (
              <RadioGroup
                value={shippingMethodId}
                onChange={(v) => {
                  if (v) return handleSetShippingMethod(v, "shipping")
                }}
              >
                {_shippingMethods?.map((option) => {
                  const isDisabled =
                    option.price_type === "calculated" &&
                    !isLoadingPrices &&
                    typeof calculatedPricesMap[option.id] !== "number"
                  const isSelected = option.id === shippingMethodId

                  return (
                    <Radio
                      key={option.id}
                      value={option.id}
                      data-testid="delivery-option-radio"
                      disabled={isDisabled}
                      className={`flex items-center justify-between cursor-pointer p-4 small:p-5 border rounded-lg mb-2 last:mb-0 transition-colors ${
                        isSelected
                          ? "bg-brand-primary/5 border-brand-primary"
                          : "bg-brand-bg border-brand-border hover:border-brand-primary/40"
                      } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <RadioDot checked={isSelected} />
                        <div>
                          <span className="block text-brand-text font-semibold text-sm">
                            {option.name}
                          </span>
                          <span className="block text-xs text-brand-muted">
                            {option.price_type === "calculated"
                              ? "Prazo conforme transportadora"
                              : "Entrega via Correios"}
                          </span>
                        </div>
                      </div>
                      <span className="text-brand-text font-bold text-sm whitespace-nowrap">
                        {option.price_type === "flat" ? (
                          convertToLocale({
                            amount: option.amount!,
                            currency_code: cart?.currency_code,
                          })
                        ) : calculatedPricesMap[option.id] ? (
                          convertToLocale({
                            amount: calculatedPricesMap[option.id],
                            currency_code: cart?.currency_code,
                          })
                        ) : isLoadingPrices ? (
                          <Loader className="text-brand-muted" />
                        ) : (
                          "—"
                        )}
                      </span>
                    </Radio>
                  )
                })}
              </RadioGroup>
            )}
          </div>

          {showPickupOptions === PICKUP_OPTION_ON && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-brand-text mb-3">
                Escolha a loja de retirada
              </h4>
              <RadioGroup
                value={shippingMethodId}
                onChange={(v) => {
                  if (v) return handleSetShippingMethod(v, "pickup")
                }}
              >
                {_pickupMethods?.map((option) => {
                  const isSelected = option.id === shippingMethodId
                  return (
                    <Radio
                      key={option.id}
                      value={option.id}
                      disabled={option.insufficient_inventory}
                      data-testid="delivery-option-radio"
                      className={`flex items-start justify-between cursor-pointer p-4 small:p-5 border rounded-lg mb-2 last:mb-0 transition-colors ${
                        isSelected
                          ? "bg-brand-primary/5 border-brand-primary"
                          : "bg-brand-bg border-brand-border hover:border-brand-primary/40"
                      } ${option.insufficient_inventory ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <RadioDot checked={isSelected} />
                        <div>
                          <span className="block text-brand-text font-semibold text-sm">
                            {option.name}
                          </span>
                          <span className="block text-xs text-brand-muted">
                            {formatAddress(
                              (option as unknown as FulfillmentSetMeta).service_zone?.fulfillment_set?.location?.address
                            )}
                          </span>
                        </div>
                      </div>
                      <span className="text-brand-text font-bold text-sm whitespace-nowrap">
                        {convertToLocale({
                          amount: option.amount!,
                          currency_code: cart?.currency_code,
                        })}
                      </span>
                    </Radio>
                  )
                })}
              </RadioGroup>
            </div>
          )}

          <ErrorMessage
            error={error}
            data-testid="delivery-option-error-message"
          />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !cart.shipping_methods?.[0]}
            data-testid="submit-delivery-option-button"
            className="mt-6 w-full small:w-fit small:self-end bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-md px-8 py-3 transition-colors"
          >
            {isLoading ? "Salvando…" : "Continuar para pagamento →"}
          </button>
        </>
      ) : completed ? (
        <div className="text-sm" data-testid="shipping-method-summary">
          <h4 className="text-brand-text font-semibold mb-2">Método escolhido</h4>
          <p className="text-brand-muted">
            <strong className="text-brand-text font-semibold">
              {cart.shipping_methods!.at(-1)!.name}
            </strong>{" "}
            ·{" "}
            {convertToLocale({
              amount: cart.shipping_methods!.at(-1)!.amount!,
              currency_code: cart?.currency_code,
            })}
          </p>
        </div>
      ) : (
        <p className="text-sm text-brand-muted">
          Conclua o passo anterior para continuar.
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

export default Shipping
