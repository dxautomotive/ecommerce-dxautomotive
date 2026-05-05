import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SignInPrompt = () => {
  return (
    <div className="bg-brand-surface border border-brand-border rounded-lg p-4 small:p-5 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-start gap-3 flex-1 min-w-[200px]">
        <div className="w-10 h-10 rounded-full bg-brand-primary/15 border border-brand-primary/30 flex items-center justify-center flex-shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0066FF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div>
          <h2 className="text-brand-text font-semibold text-sm small:text-base">
            Já tem conta?
          </h2>
          <p className="text-brand-muted text-xs small:text-sm mt-0.5">
            Entre para ver seus pedidos, endereços e finalizar mais rápido.
          </p>
        </div>
      </div>
      <LocalizedClientLink
        href="/account"
        data-testid="sign-in-button"
        className="bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold px-4 py-2 rounded transition-colors"
      >
        Entrar
      </LocalizedClientLink>
    </div>
  )
}

export default SignInPrompt
