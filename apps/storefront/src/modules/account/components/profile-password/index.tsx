"use client"

import React from "react"
import AccountInfo from "../account-info"
import PasswordInput from "@modules/common/components/password-input"
import { HttpTypes } from "@medusajs/types"

type MyInformationProps = {
  customer: HttpTypes.StoreCustomer
}

const ProfilePassword: React.FC<MyInformationProps> = ({
  customer: _customer,
}) => {
  const [successState, setSuccessState] = React.useState(false)

  // TODO: integrar com action server-side de atualização de senha quando
  // o Medusa expor a rota correspondente.
  const updatePassword = async () => {
    console.info("Password update is not implemented")
  }

  const clearState = () => {
    setSuccessState(false)
  }

  return (
    <form
      action={updatePassword}
      onReset={() => clearState()}
      className="w-full"
    >
      <AccountInfo
        label="Senha"
        currentInfo={<span>A senha não é exibida por motivos de segurança</span>}
        isSuccess={successState}
        isError={false}
        errorMessage={undefined}
        clearState={clearState}
        data-testid="account-password-editor"
      >
        <div className="grid grid-cols-1 small:grid-cols-3 gap-3">
          <Field label="Senha atual" htmlFor="old_password">
            <PasswordInput
              id="old_password"
              name="old_password"
              required
              autoComplete="current-password"
              data-testid="old-password-input"
            />
          </Field>
          <Field label="Nova senha" htmlFor="new_password">
            <PasswordInput
              id="new_password"
              name="new_password"
              required
              minLength={8}
              autoComplete="new-password"
              data-testid="new-password-input"
            />
          </Field>
          <Field label="Confirmar senha" htmlFor="confirm_password">
            <PasswordInput
              id="confirm_password"
              name="confirm_password"
              required
              autoComplete="new-password"
              data-testid="confirm-password-input"
            />
          </Field>
        </div>
      </AccountInfo>
    </form>
  )
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-1.5">
      <span className="text-brand-text text-sm font-medium">{label}</span>
      {children}
    </label>
  )
}

export default ProfilePassword
