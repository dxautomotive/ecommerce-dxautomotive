"use client"

import { useEffect, useState } from "react"
import {
  PAYMENT_CONFIG,
  buildInstallmentTable,
  formatMoney,
} from "@lib/util/payment-display"

type Tab = "cartao" | "pix" | "boleto"

type Props = {
  open: boolean
  onClose: () => void
  amount: number
  currency: string
}

/**
 * Modal de detalhamento das formas de pagamento com 3 abas:
 * - Cartão: tabela com 12 parcelas, marcando "sem juros" / "com juros"
 * - Pix: preço com desconto + benefícios
 * - Boleto: preço com desconto + prazo de compensação
 */
export default function ParcelamentoModal({
  open,
  onClose,
  amount,
  currency,
}: Props) {
  const [tab, setTab] = useState<Tab>("cartao")

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  if (!open) return null

  const fmt = (n: number) => formatMoney(n, currency)
  const pix = amount * (1 - PAYMENT_CONFIG.pixDiscount)
  const boleto = amount * (1 - PAYMENT_CONFIG.boletoDiscount)
  const installments = buildInstallmentTable(amount)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="parcelamento-title"
      className="fixed inset-0 z-[60] flex items-end small:items-center justify-center bg-black/70 backdrop-blur-sm p-0 small:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-brand-surface border border-brand-border rounded-t-2xl small:rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border">
          <h2
            id="parcelamento-title"
            className="text-lg font-bold text-brand-text"
          >
            Formas de pagamento
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="text-brand-muted hover:text-brand-text transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div role="tablist" aria-label="Abas de pagamento" className="flex border-b border-brand-border">
          {([
            { id: "cartao", label: "Cartão de crédito" },
            { id: "pix", label: "Pix" },
            { id: "boleto", label: "Boleto" },
          ] as const).map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              aria-controls={`tab-panel-${t.id}`}
              id={`tab-${t.id}`}
              onClick={() => setTab(t.id)}
              className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
                tab === t.id
                  ? "text-brand-primary border-b-2 border-brand-primary"
                  : "text-brand-muted hover:text-brand-text"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto p-6">
          {tab === "cartao" && (
            <div
              id="tab-panel-cartao"
              role="tabpanel"
              aria-labelledby="tab-cartao"
              className="flex flex-col gap-3"
            >
              <p className="text-sm text-brand-muted">
                Pague em até{" "}
                <strong className="text-brand-text">
                  {PAYMENT_CONFIG.maxInstallmentsNoInterest}x sem juros
                </strong>{" "}
                no cartão. Acima disso, juros de{" "}
                {(PAYMENT_CONFIG.monthlyInterestRate * 100).toFixed(2)}% ao mês.
              </p>
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-brand-muted text-xs uppercase tracking-wider border-b border-brand-border">
                      <th className="text-left py-2 px-2">Parcelas</th>
                      <th className="text-right py-2 px-2">Valor da parcela</th>
                      <th className="text-right py-2 px-2 hidden small:table-cell">Total</th>
                      <th className="text-right py-2 px-2">Juros</th>
                    </tr>
                  </thead>
                  <tbody>
                    {installments.map((row) => (
                      <tr key={row.n} className="border-b border-brand-border/40">
                        <td className="py-2 px-2 text-brand-text font-medium">{row.n}x</td>
                        <td className="py-2 px-2 text-right text-brand-text">
                          {fmt(row.value)}
                        </td>
                        <td className="py-2 px-2 text-right text-brand-muted hidden small:table-cell">
                          {fmt(row.total)}
                        </td>
                        <td className="py-2 px-2 text-right">
                          {row.hasInterest ? (
                            <span className="text-brand-warning">com juros</span>
                          ) : (
                            <span className="text-brand-success">sem juros</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-brand-muted mt-2">
                Aceitamos Visa, Mastercard, Elo, American Express, Hipercard e Discover.
              </p>
            </div>
          )}

          {tab === "pix" && (
            <div
              id="tab-panel-pix"
              role="tabpanel"
              aria-labelledby="tab-pix"
              className="flex flex-col gap-4"
            >
              <div className="bg-brand-pix/10 border border-brand-pix/30 rounded-lg p-4 flex items-start gap-3">
                <span className="text-3xl" aria-hidden="true">⚡</span>
                <div>
                  <p className="text-brand-text font-semibold">
                    {fmt(pix)}{" "}
                    <span className="text-brand-pix text-sm font-bold uppercase ml-1">
                      à vista
                    </span>
                  </p>
                  <p className="text-sm text-brand-muted mt-1">
                    Você economiza <strong>{fmt(amount - pix)}</strong> pagando no Pix.
                  </p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-brand-muted">
                <li className="flex gap-2">
                  <span className="text-brand-success">✓</span> Aprovação imediata e
                  envio antecipado.
                </li>
                <li className="flex gap-2">
                  <span className="text-brand-success">✓</span> Desconto exclusivo de{" "}
                  {Math.round(PAYMENT_CONFIG.pixDiscount * 100)}% sobre o valor cheio.
                </li>
                <li className="flex gap-2">
                  <span className="text-brand-success">✓</span> 100% seguro: o QR code
                  expira em 30 minutos.
                </li>
              </ul>
            </div>
          )}

          {tab === "boleto" && (
            <div
              id="tab-panel-boleto"
              role="tabpanel"
              aria-labelledby="tab-boleto"
              className="flex flex-col gap-4"
            >
              <div className="bg-brand-warning/10 border border-brand-warning/30 rounded-lg p-4 flex items-start gap-3">
                <span className="text-3xl" aria-hidden="true">🧾</span>
                <div>
                  <p className="text-brand-text font-semibold">
                    {fmt(boleto)}{" "}
                    <span className="text-brand-warning text-sm font-bold uppercase ml-1">
                      à vista
                    </span>
                  </p>
                  <p className="text-sm text-brand-muted mt-1">
                    Desconto de{" "}
                    {Math.round(PAYMENT_CONFIG.boletoDiscount * 100)}% no boleto bancário.
                  </p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-brand-muted">
                <li className="flex gap-2">
                  <span className="text-brand-success">✓</span> Compensação em 1 a 3
                  dias úteis.
                </li>
                <li className="flex gap-2">
                  <span className="text-brand-success">✓</span> Pague em qualquer banco,
                  app ou casa lotérica.
                </li>
                <li className="flex gap-2">
                  <span className="text-brand-warning">!</span> O envio só ocorre após
                  a confirmação do pagamento.
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
