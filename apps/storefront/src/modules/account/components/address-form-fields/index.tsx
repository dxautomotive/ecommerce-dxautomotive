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

type Props = {
  region: HttpTypes.StoreRegion
  defaults?: Partial<HttpTypes.StoreCustomerAddress>
  testIdPrefix?: string
}

/**
 * Campos compartilhados para os modais de adicionar/editar endereço da
 * conta. Mesmo padrão visual e funcional do `<ShippingAddress>` do
 * checkout: dark, ViaCEP autopreencher, máscaras, select de 27 UFs.
 *
 * Nomes dos inputs (sem prefixo) batem com os esperados pelas server
 * actions `addCustomerAddress` / `updateCustomerAddress`.
 */
const AddressFormFields = ({ region, defaults, testIdPrefix }: Props) => {
  const t = (s: string) => (testIdPrefix ? `${testIdPrefix}-${s}` : s)

  const [form, setForm] = useState({
    first_name: defaults?.first_name ?? "",
    last_name: defaults?.last_name ?? "",
    address_1: defaults?.address_1 ?? "",
    address_2: defaults?.address_2 ?? "",
    company: defaults?.company ?? "",
    postal_code: defaults?.postal_code ?? "",
    city: defaults?.city ?? "",
    province: defaults?.province ?? "",
    country_code: defaults?.country_code ?? "br",
    phone: defaults?.phone ? formatPhone(defaults.phone) : "",
  })
  const [cepLoading, setCepLoading] = useState(false)
  const [cepError, setCepError] = useState<string | null>(null)

  const showCountryField = useMemo(
    () => (region?.countries?.length ?? 0) > 1,
    [region]
  )

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    let value = e.target.value
    const name = e.target.name as keyof typeof form
    if (name === "postal_code") value = formatCep(value)
    if (name === "phone") value = formatPhone(value)
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleCepBlur = async () => {
    const cep = form.postal_code.replace(/\D/g, "")
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
      setForm((prev) => ({
        ...prev,
        address_1:
          prev.address_1 ||
          [data.logradouro, data.bairro].filter(Boolean).join(", "),
        city: data.localidade || prev.city,
        province: data.uf || prev.province,
        country_code: "br",
      }))
    } catch {
      setCepError("Erro ao consultar o CEP. Preencha manualmente.")
    } finally {
      setCepLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 small:grid-cols-2 gap-4">
        <Field label="Nome" htmlFor="first_name" required>
          <input
            id="first_name"
            name="first_name"
            autoComplete="given-name"
            value={form.first_name}
            onChange={handleChange}
            required
            className={inputClass}
            data-testid={t("first-name-input")}
          />
        </Field>
        <Field label="Sobrenome" htmlFor="last_name" required>
          <input
            id="last_name"
            name="last_name"
            autoComplete="family-name"
            value={form.last_name}
            onChange={handleChange}
            required
            className={inputClass}
            data-testid={t("last-name-input")}
          />
        </Field>
      </div>

      <Field label="Empresa" htmlFor="company" hint="Opcional — para envios para CNPJ">
        <input
          id="company"
          name="company"
          autoComplete="organization"
          value={form.company}
          onChange={handleChange}
          className={inputClass}
          data-testid={t("company-input")}
        />
      </Field>

      <div className="grid grid-cols-1 small:grid-cols-3 gap-4">
        <Field
          label="CEP"
          htmlFor="postal_code"
          required
          hint={cepLoading ? "Consultando CEP…" : cepError ?? "Preenche o resto do endereço automaticamente."}
        >
          <input
            id="postal_code"
            name="postal_code"
            autoComplete="postal-code"
            inputMode="numeric"
            placeholder="00000-000"
            maxLength={9}
            value={form.postal_code}
            onChange={handleChange}
            onBlur={handleCepBlur}
            required
            className={inputClass}
            data-testid={t("postal-code-input")}
          />
        </Field>
        <Field
          label="Endereço"
          htmlFor="address_1"
          hint="Rua, número e bairro"
          required
          className="small:col-span-2"
        >
          <input
            id="address_1"
            name="address_1"
            autoComplete="address-line1"
            placeholder="Av. Brasil, 1234, Centro"
            value={form.address_1}
            onChange={handleChange}
            required
            className={inputClass}
            data-testid={t("address-1-input")}
          />
        </Field>
      </div>

      <Field label="Complemento" htmlFor="address_2" hint="Apto, bloco, ponto de referência (opcional)">
        <input
          id="address_2"
          name="address_2"
          autoComplete="address-line2"
          placeholder="Apto 302, fundos, próximo ao mercado…"
          value={form.address_2}
          onChange={handleChange}
          className={inputClass}
          data-testid={t("address-2-input")}
        />
      </Field>

      <div className="grid grid-cols-1 small:grid-cols-3 gap-4">
        <Field
          label="Cidade"
          htmlFor="city"
          required
          className="small:col-span-2"
        >
          <input
            id="city"
            name="city"
            autoComplete="address-level2"
            value={form.city}
            onChange={handleChange}
            required
            className={inputClass}
            data-testid={t("city-input")}
          />
        </Field>
        <Field label="Estado (UF)" htmlFor="province" required>
          <select
            id="province"
            name="province"
            autoComplete="address-level1"
            value={form.province}
            onChange={handleChange}
            required
            className={inputClass}
            data-testid={t("state-input")}
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

      {showCountryField ? (
        <Field label="País" htmlFor="country_code" required>
          <select
            id="country_code"
            name="country_code"
            autoComplete="country"
            value={form.country_code}
            onChange={handleChange}
            required
            className={inputClass}
            data-testid={t("country-select")}
          >
            {region?.countries?.map((c) => (
              <option key={c.iso_2} value={c.iso_2}>
                {c.display_name ?? c.name}
              </option>
            ))}
          </select>
        </Field>
      ) : (
        <input type="hidden" name="country_code" value={form.country_code} />
      )}

      <Field
        label="Celular / WhatsApp"
        htmlFor="phone"
        hint="Para acompanhamento de entregas"
      >
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          inputMode="numeric"
          placeholder="(00) 00000-0000"
          value={form.phone}
          onChange={handleChange}
          className={inputClass}
          data-testid={t("phone-input")}
        />
      </Field>
    </div>
  )
}

export default AddressFormFields
