"use client"

import { useEffect, useState } from "react"

const STORAGE_KEY = "dx:newsletter-popup-v1"
const DELAY_MS = 12_000 // 12s no site antes de mostrar

type Status = "idle" | "submitting" | "success" | "error"

/**
 * Popup de newsletter que aparece:
 *  - Após 12s no site (primeira visita)
 *  - OU em "exit intent" (mouse subindo pra fora da viewport)
 *
 * Só dispara uma vez por usuário (localStorage).
 * Submit do form ainda é placeholder — em sessão futura conecta com
 * o Resend / ConvertaFlow / Mailchimp.
 */
export default function NewsletterPopup() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<Status>("idle")

  useEffect(() => {
    if (typeof window === "undefined") return
    if (localStorage.getItem(STORAGE_KEY)) return

    let triggered = false
    const trigger = () => {
      if (triggered) return
      triggered = true
      setOpen(true)
    }

    const timer = setTimeout(trigger, DELAY_MS)
    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !triggered) trigger()
    }
    document.addEventListener("mouseleave", onLeave)

    return () => {
      clearTimeout(timer)
      document.removeEventListener("mouseleave", onLeave)
    }
  }, [])

  const dismiss = () => {
    setOpen(false)
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, String(Date.now()))
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes("@")) {
      setStatus("error")
      return
    }
    setStatus("submitting")
    try {
      // TODO: integrar com endpoint de newsletter quando Resend estiver
      // configurado no backend. Por ora simula sucesso para UX.
      await new Promise((r) => setTimeout(r, 600))
      setStatus("success")
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, String(Date.now()))
      }
    } catch {
      setStatus("error")
    }
  }

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="newsletter-popup-title"
      className="fixed inset-0 z-[70] flex items-end small:items-center justify-center bg-black/70 backdrop-blur-sm p-0 small:p-4"
      onClick={dismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-brand-surface border border-brand-border rounded-t-2xl small:rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl"
      >
        <div className="relative bg-gradient-to-br from-brand-primary/30 via-brand-surface to-brand-bg p-6 small:p-8">
          <button
            type="button"
            onClick={dismiss}
            aria-label="Fechar popup"
            className="absolute top-3 right-3 text-brand-muted hover:text-brand-text transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {status === "success" ? (
            <div className="flex flex-col items-center text-center gap-3 py-6">
              <span className="text-5xl" aria-hidden="true">🎉</span>
              <h2 id="newsletter-popup-title" className="text-brand-text text-xl font-bold">
                Inscrição confirmada!
              </h2>
              <p className="text-brand-muted text-sm">
                Você vai receber em primeira mão as ofertas e lançamentos da
                DX Automotive.
              </p>
              <button
                type="button"
                onClick={dismiss}
                className="mt-2 bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold px-5 py-2 rounded transition-colors"
              >
                Continuar comprando
              </button>
            </div>
          ) : (
            <>
              <span className="text-brand-primary text-xs uppercase tracking-[0.25em] font-bold">
                Cupom exclusivo
              </span>
              <h2
                id="newsletter-popup-title"
                className="text-brand-text text-2xl font-extrabold leading-tight mt-1"
              >
                5% off na sua primeira compra
              </h2>
              <p className="text-brand-muted text-sm mt-2">
                Cadastre seu e-mail e receba o cupom + ofertas em multimídia,
                molduras e câmeras.
              </p>

              <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com.br"
                  aria-label="Seu e-mail"
                  className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary text-brand-text placeholder:text-brand-muted text-sm rounded px-4 py-3 outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-50 text-white font-semibold py-3 rounded transition-colors"
                >
                  {status === "submitting" ? "Enviando…" : "Quero o cupom →"}
                </button>
                {status === "error" && (
                  <p role="alert" className="text-brand-danger text-xs">
                    Verifique o e-mail e tente novamente.
                  </p>
                )}
              </form>

              <p className="text-brand-muted text-[10px] mt-3">
                Sem spam. Você pode cancelar a qualquer momento.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
