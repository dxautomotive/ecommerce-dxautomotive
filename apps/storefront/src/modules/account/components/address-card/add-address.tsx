"use client"

import { addCustomerAddress } from "@lib/data/customer"
import useToggleState from "@lib/hooks/use-toggle-state"
import { HttpTypes } from "@medusajs/types"
import AddressFormFields from "@modules/account/components/address-form-fields"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Modal from "@modules/common/components/modal"
import { useActionState, useEffect, useState } from "react"

const AddAddress = ({
  region,
}: {
  region: HttpTypes.StoreRegion
  addresses: HttpTypes.StoreCustomerAddress[]
}) => {
  const [successState, setSuccessState] = useState(false)
  const { state, open, close: closeModal } = useToggleState(false)

  const [formState, formAction] = useActionState(addCustomerAddress, {
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

  return (
    <>
      <button
        className="bg-brand-surface border border-dashed border-brand-border hover:border-brand-primary hover:bg-brand-primary/5 rounded-xl p-6 min-h-[220px] h-full w-full flex flex-col items-center justify-center gap-3 text-brand-muted hover:text-brand-text transition-colors"
        onClick={open}
        data-testid="add-address-button"
      >
        <span className="flex items-center justify-center w-12 h-12 rounded-full bg-brand-bg border border-brand-border">
          <PlusIcon />
        </span>
        <span className="text-sm font-semibold">Adicionar novo endereço</span>
        <span className="text-xs text-brand-muted">
          Salve para reutilizar em compras futuras
        </span>
      </button>

      <Modal isOpen={state} close={close} data-testid="add-address-modal" size="large">
        <Modal.Title>Adicionar endereço</Modal.Title>
        <form action={formAction}>
          <Modal.Body>
            <AddressFormFields region={region} />
            {formState.error && (
              <div
                className="mt-4 px-3 py-2 rounded bg-brand-danger/10 border border-brand-danger/30 text-brand-danger text-sm"
                data-testid="address-error"
              >
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
              Salvar endereço
            </SubmitButton>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  )
}

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

export default AddAddress
