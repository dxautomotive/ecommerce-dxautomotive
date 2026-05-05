"use client"

import { useActionState } from "react"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signup } from "@lib/data/customer"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(
    signup as (state: string | null, formData: FormData) => Promise<string | null>,
    null as string | null
  )

  return (
    <div
      className="bg-brand-surface border border-brand-border rounded-xl p-6 small:p-8 w-full"
      data-testid="register-page"
    >
      <div className="mb-6">
        <span className="text-brand-primary text-xs uppercase tracking-[0.25em] font-bold">
          Novo cliente
        </span>
        <h1 className="text-2xl small:text-3xl font-extrabold text-brand-text mt-2">
          Criar conta na DX Automotive
        </h1>
        <p className="text-brand-muted text-sm mt-2">
          Acesso ao histórico de pedidos, endereços salvos e cupons exclusivos.
        </p>
      </div>

      <form className="flex flex-col gap-3" action={formAction}>
        <div className="grid grid-cols-1 small:grid-cols-2 gap-3">
          <Field label="Nome" htmlFor="first_name">
            <input
              id="first_name"
              name="first_name"
              required
              autoComplete="given-name"
              data-testid="first-name-input"
              placeholder="João"
              className={inputClass}
            />
          </Field>
          <Field label="Sobrenome" htmlFor="last_name">
            <input
              id="last_name"
              name="last_name"
              required
              autoComplete="family-name"
              data-testid="last-name-input"
              placeholder="Silva"
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="E-mail" htmlFor="email">
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            data-testid="email-input"
            placeholder="seu@email.com.br"
            className={inputClass}
          />
        </Field>

        <Field label="WhatsApp / Telefone" htmlFor="phone" optional>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            data-testid="phone-input"
            placeholder="(11) 99999-0000"
            className={inputClass}
          />
        </Field>

        <Field label="Senha" htmlFor="password">
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            minLength={8}
            data-testid="password-input"
            placeholder="Mínimo 8 caracteres"
            className={inputClass}
          />
        </Field>

        <ErrorMessage error={message} data-testid="register-error" />

        <p className="text-xs text-brand-muted mt-2 leading-relaxed">
          Ao criar uma conta, você concorda com nossa{" "}
          <LocalizedClientLink
            href="/politicas/privacidade"
            className="text-brand-primary hover:underline"
          >
            Política de Privacidade
          </LocalizedClientLink>{" "}
          e nossas{" "}
          <LocalizedClientLink
            href="/politicas/trocas-e-devolucoes"
            className="text-brand-primary hover:underline"
          >
            condições de uso
          </LocalizedClientLink>
          .
        </p>

        <button
          type="submit"
          data-testid="register-button"
          className="bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold py-3 rounded-md transition-colors mt-2"
        >
          Criar minha conta
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-brand-border text-center text-sm">
        <p className="text-brand-muted">
          Já tem conta?{" "}
          <button
            type="button"
            onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
            className="text-brand-primary hover:text-brand-primary-hover font-semibold"
          >
            Entrar
          </button>
        </p>
      </div>
    </div>
  )
}

const inputClass =
  "w-full bg-brand-bg border border-brand-border focus:border-brand-primary text-brand-text placeholder:text-brand-muted text-sm rounded px-3 py-2.5 outline-none transition-colors"

function Field({
  label,
  htmlFor,
  optional,
  children,
}: {
  label: string
  htmlFor: string
  optional?: boolean
  children: React.ReactNode
}) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-1.5">
      <span className="text-brand-text text-sm font-medium">
        {label}
        {optional && (
          <span className="text-brand-muted font-normal text-xs ml-1">
            (opcional)
          </span>
        )}
      </span>
      {children}
    </label>
  )
}

export default Register
