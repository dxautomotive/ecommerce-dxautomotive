import { login } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import PasswordInput from "@modules/common/components/password-input"
import { useActionState } from "react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, null)

  return (
    <div
      className="bg-brand-surface border border-brand-border rounded-xl p-6 small:p-8 w-full"
      data-testid="login-page"
    >
      <div className="mb-6">
        <span className="text-brand-primary text-xs uppercase tracking-[0.25em] font-bold">
          Acesso
        </span>
        <h1 className="text-2xl small:text-3xl font-extrabold text-brand-text mt-2">
          Entrar na sua conta
        </h1>
        <p className="text-brand-muted text-sm mt-2">
          Acompanhe seus pedidos, salve endereços e finalize compras mais rápido.
        </p>
      </div>

      <form className="flex flex-col gap-3" action={formAction}>
        <Field label="E-mail" htmlFor="email">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="seu@email.com.br"
            data-testid="email-input"
            className={inputClass}
          />
        </Field>

        <Field label="Senha" htmlFor="password">
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            data-testid="password-input"
          />
        </Field>

        <ErrorMessage error={message} data-testid="login-error-message" />

        <button
          type="submit"
          data-testid="sign-in-button"
          className="bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold py-3 rounded-md transition-colors mt-2"
        >
          Entrar
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-brand-border text-center text-sm">
        <p className="text-brand-muted">
          Ainda não tem conta?{" "}
          <button
            type="button"
            onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
            className="text-brand-primary hover:text-brand-primary-hover font-semibold"
            data-testid="register-button"
          >
            Criar minha conta
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

export default Login
