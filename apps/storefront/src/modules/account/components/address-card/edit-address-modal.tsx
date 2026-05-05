"use client"

import {
  deleteCustomerAddress,
  updateCustomerAddress,
} from "@lib/data/customer"
import useToggleState from "@lib/hooks/use-toggle-state"
import { HttpTypes } from "@medusajs/types"
import AddressFormFields from "@modules/account/components/address-form-fields"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Modal from "@modules/common/components/modal"
import Spinner from "@modules/common/icons/spinner"
import React, { useActionState, useEffect, useState } from "react"

type EditAddressProps = {
  region: HttpTypes.StoreRegion
  address: HttpTypes.StoreCustomerAddress
  isActive?: boolean
}

const EditAddress: React.FC<EditAddressProps> = ({
  region,
  address,
  isActive = false,
}) => {
  const [removing, setRemoving] = useState(false)
  const [successState, setSuccessState] = useState(false)
  const { state, open, close: closeModal } = useToggleState(false)

  const [formState, formAction] = useActionState(updateCustomerAddress, {
    success: false,
    error: null,
  } as { success: boolean; error: string | null })

  const close = () => {
    setSuccessState(false)
    closeModal()
  }

  useEffect(() => {
    if (successState) {
      close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [successState])

  useEffect(() => {
    if (formState.success) {
      setSuccessState(true)
    }
  }, [formState])

  const removeAddress = async () => {
    setRemoving(true)
    await deleteCustomerAddress(address.id)
    setRemoving(false)
  }

  return (
    <>
      <div
        className={`bg-brand-surface border rounded-xl p-5 small:p-6 min-h-[220px] h-full w-full flex flex-col justify-between transition-colors ${
          isActive
            ? "border-brand-primary"
            : "border-brand-border hover:border-brand-primary/40"
        }`}
        data-testid="address-container"
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-start justify-between gap-3 mb-1">
            <h3
              className="text-base font-extrabold text-brand-text"
              data-testid="address-name"
            >
              {address.first_name} {address.last_name}
            </h3>
            {isActive && (
              <span className="inline-flex items-center text-[10px] uppercase tracking-wider font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded">
                Padrão
              </span>
            )}
          </div>
          {address.company && (
            <p
              className="text-sm text-brand-muted"
              data-testid="address-company"
            >
              {address.company}
            </p>
          )}
          <div className="text-sm text-brand-muted leading-relaxed mt-1">
            <p data-testid="address-address">
              {address.address_1}
              {address.address_2 && <>, {address.address_2}</>}
            </p>
            <p data-testid="address-postal-city">
              {address.postal_code} · {address.city}
            </p>
            <p data-testid="address-province-country">
              {address.province && `${address.province.toUpperCase()} · `}
              {address.country_code?.toUpperCase()}
            </p>
            {address.phone && (
              <p className="mt-1 text-xs">📞 {address.phone}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-brand-border text-sm">
          <button
            className="text-brand-primary hover:text-brand-primary-hover font-semibold flex items-center gap-1.5 transition-colors"
            onClick={open}
            data-testid="address-edit-button"
          >
            <PencilIcon />
            Editar
          </button>
          <button
            className="text-brand-muted hover:text-brand-danger font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            onClick={removeAddress}
            disabled={removing}
            data-testid="address-delete-button"
          >
            {removing ? <Spinner /> : <TrashIcon />}
            {removing ? "Removendo…" : "Remover"}
          </button>
        </div>
      </div>

      <Modal isOpen={state} close={close} data-testid="edit-address-modal" size="large">
        <Modal.Title>Editar endereço</Modal.Title>
        <form action={formAction}>
          <input type="hidden" name="addressId" value={address.id} />
          <Modal.Body>
            <AddressFormFields region={region} defaults={address} />
            {formState.error && (
              <div className="mt-4 px-3 py-2 rounded bg-brand-danger/10 border border-brand-danger/30 text-brand-danger text-sm">
                {formState.error}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <button
              type="reset"
              onClick={close}
              className="bg-brand-bg border border-brand-border text-brand-text hover:bg-brand-surface text-sm font-semibold px-5 py-2.5 rounded-md transition-colors"
              data-testid="cancel-button"
            >
              Cancelar
            </button>
            <SubmitButton
              className="!bg-brand-primary hover:!bg-brand-primary-hover !text-white !rounded-md !px-6 !py-2.5 !text-sm !font-semibold !border-none"
              data-testid="save-button"
            >
              Salvar alterações
            </SubmitButton>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  )
}

const PencilIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
)

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
)

export default EditAddress
