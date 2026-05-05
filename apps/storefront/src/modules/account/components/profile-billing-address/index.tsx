"use client"

import { addCustomerAddress, updateCustomerAddress } from "@lib/data/customer"
import { HttpTypes } from "@medusajs/types"
import AddressFormFields from "@modules/account/components/address-form-fields"
import React, { useActionState, useEffect, useMemo } from "react"
import AccountInfo from "../account-info"

type Props = {
  customer: HttpTypes.StoreCustomer
  regions: HttpTypes.StoreRegion[]
}

const ProfileBillingAddress: React.FC<Props> = ({ customer, regions }) => {
  // O AddressFormFields espera uma única region; usamos a região BR principal
  // (ou a primeira disponível). O backend resolve o country_code corretamente
  // a partir do form data.
  const region = useMemo(() => {
    const br = regions.find((r) =>
      r.countries?.some((c) => c.iso_2?.toLowerCase() === "br")
    )
    return br ?? regions[0]
  }, [regions])

  const [successState, setSuccessState] = React.useState(false)

  const billingAddress = customer.addresses?.find(
    (addr) => addr.is_default_billing
  )

  const initialState: Record<string, unknown> = {
    isDefaultBilling: true,
    isDefaultShipping: false,
    error: false,
    success: false,
  }

  if (billingAddress) {
    initialState.addressId = billingAddress.id
  }

  const [state, formAction] = useActionState(
    billingAddress ? updateCustomerAddress : addCustomerAddress,
    initialState
  )

  const clearState = () => {
    setSuccessState(false)
  }

  useEffect(() => {
    setSuccessState(!!state.success)
  }, [state])

  const currentInfo = useMemo(() => {
    if (!billingAddress) {
      return (
        <span className="text-brand-muted italic">
          Nenhum endereço de cobrança cadastrado
        </span>
      )
    }

    return (
      <div className="flex flex-col gap-0.5 text-brand-text" data-testid="current-info">
        <span className="font-semibold">
          {billingAddress.first_name} {billingAddress.last_name}
        </span>
        {billingAddress.company && (
          <span className="text-brand-muted text-xs">{billingAddress.company}</span>
        )}
        <span className="text-brand-muted">
          {billingAddress.address_1}
          {billingAddress.address_2 ? `, ${billingAddress.address_2}` : ""}
        </span>
        <span className="text-brand-muted">
          {billingAddress.postal_code} · {billingAddress.city}
          {billingAddress.province && ` · ${billingAddress.province.toUpperCase()}`}
        </span>
      </div>
    )
  }, [billingAddress])

  return (
    <form action={formAction} onReset={() => clearState()} className="w-full">
      <input type="hidden" name="addressId" value={billingAddress?.id ?? ""} />
      <input type="hidden" name="is_default_billing" value="true" />
      <AccountInfo
        label="Endereço de cobrança"
        currentInfo={currentInfo}
        isSuccess={successState}
        isError={!!state.error}
        clearState={clearState}
        data-testid="account-billing-address-editor"
      >
        <AddressFormFields
          region={region}
          defaults={billingAddress ?? undefined}
          testIdPrefix="billing"
        />
      </AccountInfo>
    </form>
  )
}

export default ProfileBillingAddress
