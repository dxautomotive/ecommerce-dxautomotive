"use client"

import { useState } from "react"

const DEFAULT_NUMBER = "5548000000000"

const PRODUCT_INTERESTS = [
  { value: "multimidia", label: "Multimídia (centrais Android Auto / CarPlay)" },
  { value: "molduras", label: "Molduras de painel" },
  { value: "camera", label: "Câmera de ré" },
  { value: "sensor", label: "Sensor de estacionamento" },
  { value: "outros", label: "Outros / mix" },
] as const

const QUANTITIES = [
  { value: "5-10", label: "5 a 10 unidades" },
  { value: "11-50", label: "11 a 50 unidades" },
  { value: "51-100", label: "51 a 100 unidades" },
  { value: "100+", label: "Acima de 100 unidades" },
] as const

type FormData = {
  nome: string
  empresa: string
  whatsapp: string
  email: string
  produto: string
  quantidade: string
  mensagem: string
}

const empty: FormData = {
  nome: "",
  empresa: "",
  whatsapp: "",
  email: "",
  produto: "",
  quantidade: "",
  mensagem: "",
}

/**
 * Formulário B2B de atacado. No submit:
 *  1) Valida campos obrigatórios (nome, whatsapp, produto, quantidade)
 *  2) Monta mensagem estruturada e abre WhatsApp em nova aba
 *  3) (próxima sessão) também envia para email do lojista via API
 *
 * O número de WhatsApp e o email destino virão de envs do Next em prod.
 */
export default function AtacadoForm() {
  const [data, setData] = useState<FormData>(empty)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [submitted, setSubmitted] = useState(false)

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) => {
    setData((d) => ({ ...d, [k]: v }))
    setErrors((e) => ({ ...e, [k]: undefined }))
  }

  const validate = () => {
    const e: typeof errors = {}
    if (!data.nome.trim()) e.nome = "Informe seu nome"
    if (!data.whatsapp.replace(/\D/g, "")) e.whatsapp = "Informe o WhatsApp"
    else if (data.whatsapp.replace(/\D/g, "").length < 10)
      e.whatsapp = "Telefone incompleto"
    if (!data.produto) e.produto = "Selecione um produto"
    if (!data.quantidade) e.quantidade = "Selecione uma quantidade"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!validate()) return

    const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || DEFAULT_NUMBER
    const productLabel =
      PRODUCT_INTERESTS.find((p) => p.value === data.produto)?.label ?? data.produto
    const qtyLabel =
      QUANTITIES.find((q) => q.value === data.quantidade)?.label ?? data.quantidade

    const lines = [
      "Olá! Vim pelo formulário de atacado da DX Automotive.",
      "",
      `*Nome:* ${data.nome}`,
      data.empresa ? `*Empresa:* ${data.empresa}` : null,
      `*WhatsApp:* ${data.whatsapp}`,
      data.email ? `*E-mail:* ${data.email}` : null,
      `*Produto:* ${productLabel}`,
      `*Quantidade:* ${qtyLabel}`,
      data.mensagem ? `*Mensagem:* ${data.mensagem}` : null,
    ].filter(Boolean) as string[]

    const text = encodeURIComponent(lines.join("\n"))
    const url = `https://wa.me/${number}?text=${text}`
    window.open(url, "_blank", "noopener,noreferrer")
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="bg-brand-success/10 border border-brand-success/30 rounded-lg p-6 small:p-8 text-center">
        <span className="text-5xl" aria-hidden="true">✅</span>
        <h2 className="text-brand-text font-bold text-xl mt-3">
          Pedido de cotação enviado!
        </h2>
        <p className="text-brand-muted mt-2">
          Abrimos o WhatsApp com sua mensagem. Se a aba não abriu
          automaticamente, verifique se seu navegador bloqueou popups.
        </p>
        <p className="text-brand-muted text-sm mt-4">
          Nossa equipe responde em até <strong className="text-brand-text">2 horas úteis</strong>.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false)
            setData(empty)
          }}
          className="mt-4 text-brand-primary hover:text-brand-primary-hover text-sm font-semibold"
        >
          Enviar nova cotação
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="bg-brand-surface border border-brand-border rounded-lg p-6 small:p-8 flex flex-col gap-4">
      <Field label="Nome completo" error={errors.nome} required>
        <input
          type="text"
          value={data.nome}
          onChange={(e) => set("nome", e.target.value)}
          aria-invalid={!!errors.nome}
          className={inputClass(!!errors.nome)}
          placeholder="João da Silva"
        />
      </Field>

      <Field label="Empresa">
        <input
          type="text"
          value={data.empresa}
          onChange={(e) => set("empresa", e.target.value)}
          className={inputClass(false)}
          placeholder="Auto Center Silva (opcional)"
        />
      </Field>

      <div className="grid grid-cols-1 small:grid-cols-2 gap-4">
        <Field label="WhatsApp" error={errors.whatsapp} required>
          <input
            type="tel"
            value={data.whatsapp}
            onChange={(e) => set("whatsapp", maskPhone(e.target.value))}
            aria-invalid={!!errors.whatsapp}
            className={inputClass(!!errors.whatsapp)}
            placeholder="(11) 99999-0000"
          />
        </Field>
        <Field label="E-mail">
          <input
            type="email"
            value={data.email}
            onChange={(e) => set("email", e.target.value)}
            className={inputClass(false)}
            placeholder="seu@email.com.br (opcional)"
          />
        </Field>
      </div>

      <Field label="Produto de interesse" error={errors.produto} required>
        <select
          value={data.produto}
          onChange={(e) => set("produto", e.target.value)}
          aria-invalid={!!errors.produto}
          className={inputClass(!!errors.produto)}
        >
          <option value="">Selecione…</option>
          {PRODUCT_INTERESTS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Quantidade estimada" error={errors.quantidade} required>
        <select
          value={data.quantidade}
          onChange={(e) => set("quantidade", e.target.value)}
          aria-invalid={!!errors.quantidade}
          className={inputClass(!!errors.quantidade)}
        >
          <option value="">Selecione…</option>
          {QUANTITIES.map((q) => (
            <option key={q.value} value={q.value}>
              {q.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Mensagem">
        <textarea
          rows={4}
          value={data.mensagem}
          onChange={(e) => set("mensagem", e.target.value)}
          className={inputClass(false) + " resize-y min-h-[100px]"}
          placeholder="Modelo do veículo, detalhes específicos, prazo… (opcional)"
        />
      </Field>

      <button
        type="submit"
        className="bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold py-3.5 rounded-md transition-colors mt-2"
      >
        Enviar cotação pelo WhatsApp
      </button>

      <p className="text-xs text-brand-muted text-center">
        Ao enviar, você concorda com a nossa{" "}
        <a href="/br/politicas/privacidade" className="text-brand-primary hover:underline">
          política de privacidade
        </a>
        .
      </p>
    </form>
  )
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-brand-text text-sm font-medium">
        {label}
        {required && <span className="text-brand-danger ml-0.5">*</span>}
      </span>
      {children}
      {error && (
        <span role="alert" className="text-brand-danger text-xs">
          {error}
        </span>
      )}
    </label>
  )
}

function inputClass(hasError: boolean) {
  return [
    "w-full bg-brand-bg border rounded px-3 py-2.5 text-brand-text text-sm outline-none transition-colors",
    "placeholder:text-brand-muted",
    hasError
      ? "border-brand-danger focus:border-brand-danger"
      : "border-brand-border focus:border-brand-primary",
  ].join(" ")
}

function maskPhone(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}
