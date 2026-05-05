import { Metadata } from "next"
import MercadoPagoMockup from "@modules/checkout/components/mercadopago-mockup"
import { getRegion } from "@lib/data/regions"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Preview do Checkout (MercadoPago)",
  description:
    "Página de preview visual do checkout estilo MercadoPago — uso interno DX.",
  robots: { index: false, follow: false },
}

/**
 * Página de **preview interno** do mockup do MercadoPago.
 * Não está no menu — só acessível via URL direta para o cliente avaliar
 * o visual antes da integração real (que entra na Sessão 10 com VPS).
 *
 * Use http://localhost:8001/br/preview/checkout para ver.
 */
export default async function CheckoutPreview(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const region = await getRegion(countryCode)
  if (!region) notFound()

  // Valor de exemplo (R$ 1.899,00 — Central Multimídia Toyota Corolla)
  const exampleAmount = 1899

  return (
    <main className="content-container py-8 small:py-12">
      <div className="mb-6">
        <span className="inline-block bg-brand-warning/15 border border-brand-warning/30 text-brand-warning text-xs uppercase tracking-wider font-bold px-2.5 py-1 rounded">
          Preview interno · não público
        </span>
        <h1 className="text-3xl small:text-4xl font-extrabold text-brand-text mt-3">
          Checkout · MercadoPago (mockup)
        </h1>
        <p className="text-brand-muted mt-2 max-w-2xl">
          Demonstração visual do passo de pagamento do checkout. As 3 abas (Pix,
          Cartão, Boleto) seguem a paleta DX e a hierarquia visual prevista no
          PRD §6.5. A integração real com a SDK do MercadoPago + webhooks entra
          na Sessão 10 quando a VPS Hetzner estiver ativa.
        </p>
      </div>

      <div className="max-w-3xl">
        <MercadoPagoMockup
          amount={exampleAmount}
          currency={region.currency_code}
        />
      </div>

      <div className="mt-8 max-w-3xl bg-brand-surface border border-brand-border rounded-lg p-5 small:p-6">
        <h2 className="text-brand-text font-bold text-lg mb-3">
          Próximos passos da integração (Sessão 10)
        </h2>
        <ul className="space-y-2 text-sm text-brand-muted">
          <li className="flex gap-2">
            <span className="text-brand-primary">●</span>
            Plugar a SDK <code className="bg-brand-bg px-1.5 py-0.5 rounded text-xs text-brand-text">mercadopago-js</code> no front + criar
            preference no backend Medusa
          </li>
          <li className="flex gap-2">
            <span className="text-brand-primary">●</span>
            Endpoint <code className="bg-brand-bg px-1.5 py-0.5 rounded text-xs text-brand-text">/store/payment/mercadopago/webhook</code> recebendo
            confirmações em <strong className="text-brand-text">URL pública</strong> (Hetzner)
          </li>
          <li className="flex gap-2">
            <span className="text-brand-primary">●</span>
            Geração real de QR/copia-e-cola via API do MP
          </li>
          <li className="flex gap-2">
            <span className="text-brand-primary">●</span>
            Geração real de boleto via API do MP (PDF + linha digitável)
          </li>
          <li className="flex gap-2">
            <span className="text-brand-primary">●</span>
            Tokenização de cartão lado-cliente (não passamos número de cartão pelo nosso backend)
          </li>
        </ul>
      </div>
    </main>
  )
}
