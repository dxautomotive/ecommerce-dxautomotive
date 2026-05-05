/**
 * Configuração centralizada de display de pagamento BR (Pix, Boleto, parcelas).
 * Em uma sessão futura virá da Store metadata do Medusa ou de variáveis de ambiente.
 * Por ora, valores fixos plausíveis para o setor automotivo.
 */
export const PAYMENT_CONFIG = {
  /** Desconto aplicado ao pagar via Pix, em fração (0.10 = 10% off) */
  pixDiscount: 0.1,
  /** Desconto aplicado ao pagar via Boleto, em fração */
  boletoDiscount: 0.05,
  /** Maior número de parcelas sem juros */
  maxInstallmentsNoInterest: 6,
  /** Limite total de parcelas no cartão */
  maxInstallments: 12,
  /** Taxa de juros mensal aplicada nas parcelas acima de `maxInstallmentsNoInterest` */
  monthlyInterestRate: 0.0299,
  /** Threshold de frete grátis em centavos (R$ 500,00 = 50000) */
  freeShippingThreshold: 50000,
} as const

export type Currency = string

const formatBRL = (n: number, currency: Currency = "BRL") =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(n)

export function formatMoney(amount: number | undefined | null, currency: Currency = "BRL") {
  if (amount == null || isNaN(amount)) return ""
  return formatBRL(amount, currency)
}

/**
 * Calcula a tabela de parcelamento com juros compostos a partir da `monthlyInterestRate`.
 * Parcelas até `maxInstallmentsNoInterest` ficam sem juros.
 */
export function buildInstallmentTable(
  amount: number,
  cfg = PAYMENT_CONFIG
): { n: number; value: number; total: number; hasInterest: boolean }[] {
  if (!amount || amount <= 0) return []
  const out: { n: number; value: number; total: number; hasInterest: boolean }[] = []
  for (let n = 1; n <= cfg.maxInstallments; n++) {
    if (n <= cfg.maxInstallmentsNoInterest) {
      out.push({ n, value: amount / n, total: amount, hasInterest: false })
    } else {
      const i = cfg.monthlyInterestRate
      // Tabela Price: PMT = PV * i / (1 - (1+i)^-n)
      const pmt = (amount * i) / (1 - Math.pow(1 + i, -n))
      const total = pmt * n
      out.push({ n, value: pmt, total, hasInterest: true })
    }
  }
  return out
}

/** Retorna a parcela "default" exibida em destaque no card e no header de produto */
export function getDefaultInstallment(amount: number, cfg = PAYMENT_CONFIG) {
  const table = buildInstallmentTable(amount, cfg)
  // queremos a maior parcela sem juros
  const lastNoInterest = table
    .filter((t) => !t.hasInterest)
    .pop()
  return lastNoInterest ?? table[0]
}
