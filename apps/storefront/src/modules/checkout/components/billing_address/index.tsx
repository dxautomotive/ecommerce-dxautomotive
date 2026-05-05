"use client"

import { HttpTypes } from "@medusajs/types"
import React, { useMemo, useState } from "react"

const inputClass =
  "w-full bg-brand-bg border border-brand-border focus:border-brand-primary text-brand-text placeholder:text-brand-muted text-sm rounded px-3 py-2.5 outline-none transition-colors disabled:opacity-60"

function Field({
  label,
  htmlFor,
  hint,
  required,
  children,
  className,
}: {
  label: string
  htmlFor: string
  hint?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <label htmlFor={htmlFor} className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <span className="text-brand-text text-sm font-medium">
        {label}
        {required && <span className="text-brand-danger ml-0.5">*</span>}
      </span>
      {children}
      {hint && <span className="text-xs text-brand-muted">{hint}</span>}
    </label>
  )
}

const UF_LIST = [
  "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA",
  "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN",
  "RO", "RR", "RS", "SC", "SE", "SP", "TO",
]

function formatCep(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 8)
  if (d.length <= 5) return d
  return `${d.slice(0, 5)}-${d.slice(5)}`
}

function formatPhone(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

const BillingAddress = ({ cart }: { cart: HttpTypes.StoreCart | null }) => {
  const [formData, setFormData] = useState<Record<string, string>>({
    "billing_address.first_name": cart?.billing_address?.first_name || "",
    "billing_address.last_name": cart?.billing_address?.last_name || "",
    "billing_address.address_1": cart?.billing_address?.address_1 || "",
    "billing_address.address_2": cart?.billing_address?.address_2 || "",
    "billing_address.company": cart?.billing_address?.company || "",
    "billing_address.postal_code": cart?.billing_address?.postal_code || "",
    "billing_address.city": cart?.billing_address?.city || "",
    "billing_address.country_code":
      cart?.billing_address?.country_code || "br",
    "billing_address.province": cart?.billing_address?.province || "",
    "billing_address.phone": cart?.billing_address?.phone
      ? formatPhone(cart.billing_address.phone)
      : "",
  })
  const [cepLoading, setCepLoading] = useState(false)
  const [cepError, setCepError] = useState<string | null>(null)

  const showCountryField = useMemo(
    () => (cart?.region?.countries?.length ?? 0) > 1,
    [cart?.region]
  )

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    let value = e.target.value
    if (e.target.name === "billing_address.postal_code") {
      value = formatCep(value)
    } else if (e.target.name === "billing_address.phone") {
      value = formatPhone(value)
    }
    setFormData({ ...formData, [e.target.name]: value })
  }

  const handleCepBlur = async () => {
    const cep = formData["billing_address.postal_code"].replace(/\D/g, "")
    if (cep.length !== 8) return
    setCepLoading(true)
    setCepError(null)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      if (data.erro) {
        setCepError("CEP não encontrado.")
        return
      }
      setFormData((prev) => ({
        ...prev,
        "billing_address.address_1":
          prev["billing_address.address_1"] ||
          [data.logradouro, data.bairro].filter(Boolean).join(", "),
        "billing_address.city": data.localidade || prev["billing_address.city"],
        "billing_address.province": data.uf || prev["billing_address.province"],
        "billing_address.country_code": "br",
      }))
    } catch {
      setCepError("Erro ao consultar o CEP. Preencha manualmente.")
    } finally {
      setCepLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-y-6">
      <div className="grid grid-cols-1 small:grid-cols-2 gap-4">
        <Field label="Nome" htmlFor="billing_address.first_name" required>
          <input
            id="billing_address.first_name"
            name="billing_address.first_name"
            autoComplete="given-name"
            value={formData["billing_address.first_name"]}
            onChange={handleChange}
            required
            className={inputClass}
            data-testid="billing-first-name-input"
          />
        </Field>
        <Field label="Sobrenome" htmlFor="billing_address.last_name" required>
          <input
            id="billing_address.last_name"
            name="billing_address.last_name"
            autoComplete="family-name"
            value={formData["billing_address.last_name"]}
            onChange={handleChange}
            required
            className={inputClass}
            data-testid="billing-last-name-input"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 small:grid-cols-3 gap-4">
        <Field
          label="CEP"
          htmlFor="billing_address.postal_code"
          required
          hint={cepLoading ? "Consultando CEP…" : cepError ?? "Preenche o resto do endereço automaticamente."}
        >
          <input
            id="billing_address.postal_code"
            name="billing_address.postal_code"
            autoComplete="postal-code"
            inputMode="numeric"
            placeholder="00000-000"
            maxLength={9}
            value={formData["billing_address.postal_code"]}
            onChange={handleChange}
            onBlur={handleCepBlur}
            required
            className={inputClass}
            data-testid="billing-postal-input"
          />
        </Field>
        <Field
          label="Endereço"
          htmlFor="billing_address.address_1"
          hint="Rua, número e bairro"
          required
          className="small:col-span-2"
        >
          <input
            id="billing_address.address_1"
            name="billing_address.address_1"
            autoComplete="address-line1"
            placeholder="Av. Brasil, 1234, Centro"
            value={formData["billing_address.address_1"]}
            onChange={handleChange}
            required
            className={inputClass}
            data-testid="billing-address-input"
          />
        </Field>
      </div>

      <Field label="Complemento" htmlFor="billing_address.address_2" hint="Apto, bloco, ponto de referência (opcional)">
        <input
          id="billing_address.address_2"
          name="billing_address.address_2"
          autoComplete="address-line2"
          placeholder="Apto 302, fundos, próximo ao mercado…"
          value={formData["billing_address.address_2"]}
          onChange={handleChange}
          className={inputClass}
          data-testid="billing-address2-input"
        />
      </Field>

      <div className="grid grid-cols-1 small:grid-cols-3 gap-4">
        <Field
          label="Cidade"
          htmlFor="billing_address.city"
          required
          className="small:col-span-2"
        >
          <input
            id="billing_address.city"
            name="billing_address.city"
            autoComplete="address-level2"
            value={formData["billing_address.city"]}
            onChange={handleChange}
            required
            className={inputClass}
            data-testid="billing-city-input"
          />
        </Field>
        <Field label="Estado (UF)" htmlFor="billing_address.province" required>
          <select
            id="billing_address.province"
            name="billing_address.province"
            autoComplete="address-level1"
            value={formData["billing_address.province"]}
            onChange={handleChange}
            required
            className={inputClass}
            data-testid="billing-province-input"
          >
            <option value="">UF</option>
            {UF_LIST.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {showCountryField && (
        <Field label="País" htmlFor="billing_address.country_code" required>
          <select
            id="billing_address.country_code"
            name="billing_address.country_code"
            autoComplete="country"
            value={formData["billing_address.country_code"]}
            onChange={handleChange}
            required
            className={inputClass}
            data-testid="billing-country-select"
          >
            {cart?.region?.countries?.map((c) => (
              <option key={c.iso_2} value={c.iso_2}>
                {c.display_name ?? c.name}
              </option>
            ))}
          </select>
        </Field>
      )}

      <Field
        label="Telefone (opcional)"
        htmlFor="billing_address.phone"
        hint="Pode ser usado para confirmação de pagamento"
      >
        <input
          id="billing_address.phone"
          name="billing_address.phone"
          type="tel"
          autoComplete="tel"
          inputMode="numeric"
          placeholder="(00) 00000-0000"
          value={formData["billing_address.phone"]}
          onChange={handleChange}
          className={inputClass}
          data-testid="billing-phone-input"
        />
      </Field>
    </div>
  )
}

export default BillingAddress
