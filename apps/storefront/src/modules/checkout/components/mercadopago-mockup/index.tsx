"use client"

import { useEffect, useMemo, useState } from "react"
import {
  PAYMENT_CONFIG,
  buildInstallmentTable,
  formatMoney,
} from "@lib/util/payment-display"
import CountdownTimer from "@modules/common/components/countdown-timer"

type Tab = "pix" | "cartao" | "boleto"

type Props = {
  amount: number
  currency: string
  /** Callback opcional quando o método é selecionado (placeholder até integrarmos a API real do MP) */
  onSelect?: (method: Tab) => void
}

/**
 * Mockup visual do checkout de pagamento estilo MercadoPago.
 * 3 abas (Pix · Cartão · Boleto) com:
 *  - Pix: QR code placeholder + código copia-e-cola + countdown 30 min
 *  - Cartão: form de número/nome/validade/CVV + selector de parcelas
 *  - Boleto: preview do boleto + linha digitável
 *
 * Ainda não integrado com SDK do MP — a integração real virá quando o
 * cliente fornecer credenciais e tivermos a Hetzner pra os webhooks.
 * Por ora a UI já tá pronta para receber os dados quando pluggar.
 */
export default function MercadoPagoMockup({ amount, currency, onSelect }: Props) {
  const [tab, setTab] = useState<Tab>("pix")
  const fmt = (n: number) => formatMoney(n, currency)

  useEffect(() => {
    onSelect?.(tab)
  }, [tab, onSelect])

  const pixAmount = amount * (1 - PAYMENT_CONFIG.pixDiscount)
  const boletoAmount = amount * (1 - PAYMENT_CONFIG.boletoDiscount)
  const installments = buildInstallmentTable(amount)
  const pixExpiresAt = useMemo(() => {
    return new Date(Date.now() + 30 * 60 * 1000).toISOString()
  }, [])

  return (
    <div
      className="bg-brand-surface border border-brand-border rounded-xl p-4 small:p-6"
      data-testid="payment-mp-mockup"
    >
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <span className="text-brand-primary text-xs uppercase tracking-[0.25em] font-bold">
            Pagamento
          </span>
          <h3 className="text-brand-text text-lg small:text-xl font-bold mt-1">
            Como você prefere pagar?
          </h3>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs text-brand-muted">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-brand-success"
            aria-hidden="true"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Processado por MercadoPago
        </span>
      </div>

      <div role="tablist" aria-label="Métodos de pagamento" className="grid grid-cols-3 gap-2 mb-5">
        <TabButton id="pix" label="Pix" hint={`-${Math.round(PAYMENT_CONFIG.pixDiscount * 100)}%`} active={tab === "pix"} onClick={() => setTab("pix")} />
        <TabButton id="cartao" label="Cartão" hint={`até ${PAYMENT_CONFIG.maxInstallments}x`} active={tab === "cartao"} onClick={() => setTab("cartao")} />
        <TabButton id="boleto" label="Boleto" hint={`-${Math.round(PAYMENT_CONFIG.boletoDiscount * 100)}%`} active={tab === "boleto"} onClick={() => setTab("boleto")} />
      </div>

      {tab === "pix" && (
        <div role="tabpanel" id="panel-pix" aria-labelledby="tab-pix" className="flex flex-col gap-4">
          <div className="bg-brand-pix/10 border border-brand-pix/30 rounded-lg p-4 flex items-center gap-4">
            <div className="text-3xl" aria-hidden="true">⚡</div>
            <div>
              <p className="text-brand-text font-bold text-lg">
                {fmt(pixAmount)}
              </p>
              <p className="text-brand-muted text-xs">
                Você economiza {fmt(amount - pixAmount)} pagando no Pix
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 small:grid-cols-[200px_1fr] gap-4 items-center">
            <div className="bg-white p-4 rounded-lg flex items-center justify-center">
              <QrPlaceholder />
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-brand-text text-sm font-semibold mb-1">
                  Pix copia-e-cola
                </p>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value="00020126360014BR.GOV.BCB.PIX0114+5548000000000…"
                    aria-label="Código Pix copia-e-cola"
                    className="flex-1 bg-brand-bg border border-brand-border text-brand-muted text-xs rounded px-3 py-2 font-mono outline-none"
                  />
                  <button
                    type="button"
                    className="bg-brand-pix hover:opacity-90 text-white text-xs font-bold uppercase px-3 rounded transition-opacity"
                    onClick={(e) => {
                      const input = (e.currentTarget.previousElementSibling as HTMLInputElement)
                      input.select()
                      try {
                        navigator.clipboard.writeText(input.value)
                      } catch {
                        document.execCommand("copy")
                      }
                    }}
                  >
                    Copiar
                  </button>
                </div>
              </div>
              <CountdownTimer
                endsAt={pixExpiresAt}
                eyebrow="Expira em"
                size="sm"
                showDays={false}
                variant="warning"
              />
            </div>
          </div>

          <ol className="bg-brand-bg border border-brand-border rounded-lg p-4 text-xs text-brand-muted space-y-1.5">
            <li>
              <strong className="text-brand-text">1.</strong> Abra o app do seu
              banco e escolha pagar via Pix.
            </li>
            <li>
              <strong className="text-brand-text">2.</strong> Escaneie o QR ou
              cole o código copia-e-cola.
            </li>
            <li>
              <strong className="text-brand-text">3.</strong> Confirme o
              pagamento. A confirmação é automática em segundos.
            </li>
          </ol>
        </div>
      )}

      {tab === "cartao" && (
        <div role="tabpanel" id="panel-cartao" aria-labelledby="tab-cartao" className="flex flex-col gap-4">
          <div className="grid grid-cols-1 small:grid-cols-[1fr_2fr] gap-4">
            <FieldGroup label="Número do cartão">
              <input
                type="text"
                inputMode="numeric"
                placeholder="0000 0000 0000 0000"
                aria-label="Número do cartão"
                className={inputClass}
                disabled
              />
            </FieldGroup>
          </div>
          <FieldGroup label="Nome impresso no cartão">
            <input
              type="text"
              placeholder="JOÃO DA SILVA"
              aria-label="Nome no cartão"
              className={inputClass + " uppercase"}
              disabled
            />
          </FieldGroup>
          <div className="grid grid-cols-2 gap-3">
            <FieldGroup label="Validade">
              <input
                type="text"
                inputMode="numeric"
                placeholder="MM/AA"
                aria-label="Validade"
                className={inputClass}
                disabled
              />
            </FieldGroup>
            <FieldGroup label="CVV">
              <input
                type="text"
                inputMode="numeric"
                placeholder="000"
                aria-label="CVV"
                className={inputClass}
                disabled
              />
            </FieldGroup>
          </div>
          <FieldGroup label="Parcelas">
            <select className={inputClass} disabled>
              {installments.map((row) => (
                <option key={row.n}>
                  {row.n}x de {fmt(row.value)}
                  {row.hasInterest ? " (com juros)" : " sem juros"}
                </option>
              ))}
            </select>
          </FieldGroup>
          <p className="text-xs text-brand-muted">
            ⓘ Mockup visual — a integração real com MercadoPago entra na Sessão 10
            (precisa da VPS Hetzner ativa para os webhooks de confirmação).
          </p>
        </div>
      )}

      {tab === "boleto" && (
        <div role="tabpanel" id="panel-boleto" aria-labelledby="tab-boleto" className="flex flex-col gap-4">
          <div className="bg-brand-warning/10 border border-brand-warning/30 rounded-lg p-4">
            <p className="text-brand-text font-bold text-lg">{fmt(boletoAmount)}</p>
            <p className="text-brand-muted text-xs mt-1">
              Você economiza {fmt(amount - boletoAmount)} pagando no boleto.
              Compensação em 1 a 3 dias úteis.
            </p>
          </div>

          <div className="bg-white text-black rounded-lg p-4 small:p-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-3">
              <strong className="font-bold text-sm">DX AUTOMOTIVE</strong>
              <span className="text-xs text-gray-500">Vencimento: 3 dias úteis</span>
            </div>
            <div className="font-mono text-sm tracking-tight">
              23793.39001 28080.110042 50001.234567 8 12340000017290
            </div>
            <div className="mt-3 h-12 bg-[repeating-linear-gradient(90deg,#000_0_2px,transparent_2px_5px,#000_5px_8px,transparent_8px_12px)]" aria-hidden="true" />
          </div>

          <div className="flex flex-col small:flex-row gap-2">
            <button
              type="button"
              disabled
              className="flex-1 bg-brand-primary text-white text-sm font-semibold py-2.5 rounded transition-colors disabled:opacity-50"
            >
              Baixar boleto (PDF)
            </button>
            <button
              type="button"
              disabled
              className="flex-1 border border-brand-border text-brand-text text-sm font-semibold py-2.5 rounded transition-colors disabled:opacity-50"
            >
              Copiar linha digitável
            </button>
          </div>
          <p className="text-xs text-brand-muted">
            ⓘ Mockup visual — geração de boleto real entra na Sessão 10.
          </p>
        </div>
      )}
    </div>
  )
}

function TabButton({
  id,
  label,
  hint,
  active,
  onClick,
}: {
  id: Tab
  label: string
  hint: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      aria-controls={`panel-${id}`}
      id={`tab-${id}`}
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-0.5 px-3 py-3 rounded-lg border-2 transition-all text-sm font-semibold ${
        active
          ? "border-brand-primary bg-brand-primary/10 text-brand-text"
          : "border-brand-border bg-brand-bg text-brand-muted hover:border-brand-muted hover:text-brand-text"
      }`}
    >
      <span>{label}</span>
      <span className={`text-[10px] uppercase tracking-wider ${active ? "text-brand-primary" : "text-brand-muted"}`}>
        {hint}
      </span>
    </button>
  )
}

function FieldGroup({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-brand-text text-sm font-medium">{label}</span>
      {children}
    </label>
  )
}

const inputClass =
  "w-full bg-brand-bg border border-brand-border focus:border-brand-primary text-brand-text placeholder:text-brand-muted text-sm rounded px-3 py-2.5 outline-none transition-colors disabled:opacity-50"

function QrPlaceholder() {
  // QR fictício — desenho gerado em SVG (não é um QR real, é só placeholder visual)
  const cells = 25
  const filled = (i: number, j: number) => {
    // padrão pseudo-aleatório determinístico
    const v = (i * 7 + j * 13 + (i ^ j) * 5) % 17
    return v < 8
  }
  return (
    <svg width="160" height="160" viewBox={`0 0 ${cells} ${cells}`} aria-hidden="true">
      <rect width={cells} height={cells} fill="white" />
      {Array.from({ length: cells }).map((_, i) =>
        Array.from({ length: cells }).map((_, j) =>
          filled(i, j) ? <rect key={`${i}-${j}`} x={i} y={j} width={1} height={1} fill="black" /> : null
        )
      )}
      {/* finder corners */}
      {[
        [0, 0],
        [cells - 7, 0],
        [0, cells - 7],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width={7} height={7} fill="white" />
          <rect x={x} y={y} width={7} height={1} fill="black" />
          <rect x={x} y={y + 6} width={7} height={1} fill="black" />
          <rect x={x} y={y} width={1} height={7} fill="black" />
          <rect x={x + 6} y={y} width={1} height={7} fill="black" />
          <rect x={x + 2} y={y + 2} width={3} height={3} fill="black" />
        </g>
      ))}
    </svg>
  )
}
