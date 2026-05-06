"use client"

import { useState } from "react"

/**
 * Form de newsletter no footer (variante leve do NewsletterPopup).
 * Não dispara popup nem exit-intent — só captura email com 1 clique.
 *
 * Hoje só armazena no estado local + mostra mensagem de sucesso.
 * Quando Resend estiver plugado, vai chamar /store/newsletter (a criar).
 */
const NewsletterFooter = () => {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle")

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error")
      return
    }
    // TODO: plugar /store/newsletter quando Resend estiver configurado
    await new Promise((r) => setTimeout(r, 400))
    setStatus("ok")
    setEmail("")
  }

  return (
    <div className="flex flex-col gap-y-3">
      <span className="text-brand-text font-semibold text-sm">
        Ofertas no seu e-mail
      </span>
      <p className="text-brand-muted text-xs leading-relaxed">
        Lançamentos, cupons e dicas de instalação. Sem spam — pode sair
        quando quiser.
      </p>

      {status === "ok" ? (
        <p
          role="status"
          className="bg-brand-success/10 border border-brand-success/30 text-brand-success text-xs rounded px-3 py-2"
        >
          ✓ E-mail cadastrado! Em breve você recebe nossas ofertas.
        </p>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-2">
          <div className="flex">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (status === "error") setStatus("idle")
              }}
              placeholder="seu@email.com.br"
              aria-label="E-mail para receber ofertas"
              className="flex-1 bg-brand-bg border border-brand-border focus:border-brand-primary text-brand-text placeholder:text-brand-muted text-sm rounded-l-md px-3 py-2 outline-none transition-colors"
              required
            />
            <button
              type="submit"
              className="bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold px-4 rounded-r-md transition-colors"
            >
              Cadastrar
            </button>
          </div>
          {status === "error" && (
            <p role="alert" className="text-brand-danger text-xs">
              E-mail inválido. Confira o formato.
            </p>
          )}
        </form>
      )}
    </div>
  )
}

export default NewsletterFooter
