"use client"

import { HttpTypes } from "@medusajs/types"
import { mapKeys } from "lodash"
import React, { useEffect, useMemo, useState } from "react"
import AddressSelect from "../address-select"

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

const ShippingAddress = ({
  customer,
  cart,
  checked,
  onChange,
}: {
  customer: HttpTypes.StoreCustomer | null
  cart: HttpTypes.StoreCart | null
  checked: boolean
  onChange: () => void
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({
    "shipping_address.first_name": cart?.shipping_address?.first_name || "",
    "shipping_address.last_name": cart?.shipping_address?.last_name || "",
    "shipping_address.address_1": cart?.shipping_address?.address_1 || "",
    "shipping_address.address_2": cart?.shipping_address?.address_2 || "",
    "shipping_address.company": cart?.shipping_address?.company || "",
    "shipping_address.postal_code": cart?.shipping_address?.postal_code || "",
    "shipping_address.city": cart?.shipping_address?.city || "",
    "shipping_address.country_code":
      cart?.shipping_address?.country_code || "br",
    "shipping_address.province": cart?.shipping_address?.province || "",
    "shipping_address.phone": cart?.shipping_address?.phone
      ? formatPhone(cart.shipping_address.phone)
      : "",
    email: cart?.email || "",
  })
  const [cepLoading, setCepLoading] = useState(false)
  const [cepError, setCepError] = useState<string | null>(null)

  const countriesInRegion = useMemo(
    () => cart?.region?.countries?.map((c) => c.iso_2),
    [cart?.region]
  )
  const addressesInRegion = useMemo(
    () =>
      customer?.addresses.filter(
        (a) => a.country_code && countriesInRegion?.includes(a.country_code)
      ),
    [customer?.addresses, countriesInRegion]
  )
  const showCountryField =
    countriesInRegion && countriesInRegion.length > 1

  const setFormAddress = (
    address?: HttpTypes.StoreCartAddress,
    email?: string
  ) => {
    if (address) {
      setFormData((prev) => ({
        ...prev,
        "shipping_address.first_name": address?.first_name || "",
        "shipping_address.last_name": address?.last_name || "",
        "shipping_address.address_1": address?.address_1 || "",
        "shipping_address.address_2": address?.address_2 || "",
        "shipping_address.company": address?.company || "",
        "shipping_address.postal_code": address?.postal_code || "",
        "shipping_address.city": address?.city || "",
        "shipping_address.country_code": address?.country_code || "br",
        "shipping_address.province": address?.province || "",
        "shipping_address.phone": address?.phone ? formatPhone(address.phone) : "",
      }))
    }
    if (email) {
      setFormData((prev) => ({ ...prev, email }))
    }
  }

  useEffect(() => {
    if (cart && cart.shipping_address) {
      setFormAddress(cart.shipping_address, cart.email ?? undefined)
    }
    if (cart && !cart.email && customer?.email) {
      setFormAddress(undefined, customer.email)
    }
  }, [cart])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    let value = e.target.value
    if (e.target.name === "shipping_address.postal_code") {
      value = formatCep(value)
    } else if (e.target.name === "shipping_address.phone") {
      value = formatPhone(value)
    }
    setFormData({ ...formData, [e.target.name]: value })
  }

  const handleCepBlur = async () => {
    const cep = formData["shipping_address.postal_code"].replace(/\D/g, "")
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
        "shipping_address.address_1":
          prev["shipping_address.address_1"] ||
          [data.logradouro, data.bairro].filter(Boolean).join(", "),
        "shipping_address.city": data.localidade || prev["shipping_address.city"],
        "shipping_address.province": data.uf || prev["shipping_address.province"],
        "shipping_address.country_code": "br",
      }))
    } catch {
      setCepError("Erro ao consultar o CEP. Preencha manualmente.")
    } finally {
      setCepLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-y-6">
      {customer && (addressesInRegion?.length || 0) > 0 && (
        <div className="bg-brand-bg border border-brand-border rounded-lg p-4">
          <p className="text-sm text-brand-text mb-3">
            Olá {customer.first_name}, usar um endereço já salvo?
          </p>
          <AddressSelect
            addresses={customer.addresses}
            addressInput={
              mapKeys(formData, (_, key) =>
                key.replace("shipping_address.", "")
              ) as unknown as HttpTypes.StoreCartAddress
            }
            onSelect={setFormAddress}
          />
        </div>
      )}

      <div className="grid grid-cols-1 small:grid-cols-2 gap-4">
        <Field label="Nome" htmlFor="shipping_address.first_name" required>
          <input
            id="shipping_address.first_name"
            name="shipping_address.first_name"
            autoComplete="given-name"
            value={formData["shipping_address.first_name"]}
            onChange={handleChange}
            required
            className={inputClass}
            data-testid="shipping-first-name-input"
          />
        </Field>
        <Field label="Sobrenome" htmlFor="shipping_address.last_name" required>
          <input
            id="shipping_address.last_name"
            name="shipping_address.last_name"
            autoComplete="family-name"
            value={formData["shipping_address.last_name"]}
            onChange={handleChange}
            required
            className={inputClass}
            data-testid="shipping-last-name-input"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 small:grid-cols-3 gap-4">
        <Field
          label="CEP"
          htmlFor="shipping_address.postal_code"
          required
          hint={cepLoading ? "Consultando CEP…" : cepError ?? "Preenche o resto do endereço automaticamente."}
        >
          <input
            id="shipping_address.postal_code"
            name="shipping_address.postal_code"
            autoComplete="postal-code"
            inputMode="numeric"
            placeholder="00000-000"
            maxLength={9}
            value={formData["shipping_address.postal_code"]}
            onChange={handleChange}
            onBlur={handleCepBlur}
            required
            className={inputClass}
            data-testid="shipping-postal-code-input"
          />
        </Field>
        <Field
          label="Endereço"
          htmlFor="shipping_address.address_1"
          hint="Rua, número e bairro"
          required
          className="small:col-span-2"
        >
          <input
            id="shipping_address.address_1"
            name="shipping_address.address_1"
            autoComplete="address-line1"
            placeholder="Av. Brasil, 1234, Centro"
            value={formData["shipping_address.address_1"]}
            onChange={handleChange}
            required
            className={inputClass}
            data-testid="shipping-address-input"
          />
        </Field>
      </div>

      <Field label="Complemento" htmlFor="shipping_address.address_2" hint="Apto, bloco, ponto de referência (opcional)">
        <input
          id="shipping_address.address_2"
          name="shipping_address.address_2"
          autoComplete="address-line2"
          placeholder="Apto 302, fundos, próximo ao mercado…"
          value={formData["shipping_address.address_2"]}
          onChange={handleChange}
          className={inputClass}
          data-testid="shipping-address2-input"
        />
      </Field>

      <div className="grid grid-cols-1 small:grid-cols-3 gap-4">
        <Field
          label="Cidade"
          htmlFor="shipping_address.city"
          required
          className="small:col-span-2"
        >
          <input
            id="shipping_address.city"
            name="shipping_address.city"
            autoComplete="address-level2"
            value={formData["shipping_address.city"]}
            onChange={handleChange}
            required
            className={inputClass}
            data-testid="shipping-city-input"
          />
        </Field>
        <Field label="Estado (UF)" htmlFor="shipping_address.province" required>
          <select
            id="shipping_address.province"
            name="shipping_address.province"
            autoComplete="address-level1"
            value={formData["shipping_address.province"]}
            onChange={handleChange}
            required
            className={inputClass}
            data-testid="shipping-province-input"
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
        <Field label="País" htmlFor="shipping_address.country_code" required>
          <select
            id="shipping_address.country_code"
            name="shipping_address.country_code"
            autoComplete="country"
            value={formData["shipping_address.country_code"]}
            onChange={handleChange}
            required
            className={inputClass}
            data-testid="shipping-country-select"
          >
            {cart?.region?.countries?.map((c) => (
              <option key={c.iso_2} value={c.iso_2}>
                {c.display_name ?? c.name}
              </option>
            ))}
          </select>
        </Field>
      ) : (
        // País escondido quando a região só atende um país (ex: BR-only) —
        // ainda assim o valor precisa ir no FormData, senão o setAddresses
        // redireciona para `/null/checkout?...`. Cobre o bug pré-existente
        // identificado na Sessão 10-prep B.
        <input
          type="hidden"
          name="shipping_address.country_code"
          value={formData["shipping_address.country_code"]}
        />
      )}

      <div className="bg-brand-bg border border-brand-border rounded-lg p-4 flex items-start gap-3">
        <input
          id="same_as_billing"
          name="same_as_billing"
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="mt-0.5 h-4 w-4 rounded border-brand-border bg-brand-bg accent-brand-primary"
          data-testid="billing-address-checkbox"
        />
        <label htmlFor="same_as_billing" className="text-sm text-brand-text cursor-pointer">
          Endereço de cobrança é o mesmo da entrega
        </label>
      </div>

      <div className="grid grid-cols-1 small:grid-cols-2 gap-4">
        <Field label="E-mail" htmlFor="email" required hint="Para receber o comprovante e o status do pedido">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com.br"
            value={formData.email}
            onChange={handleChange}
            required
            className={inputClass}
            data-testid="shipping-email-input"
          />
        </Field>
        <Field
          label="Celular / WhatsApp"
          htmlFor="shipping_address.phone"
          hint="Para acompanhamento da entrega"
        >
          <input
            id="shipping_address.phone"
            name="shipping_address.phone"
            type="tel"
            autoComplete="tel"
            inputMode="numeric"
            placeholder="(00) 00000-0000"
            value={formData["shipping_address.phone"]}
            onChange={handleChange}
            className={inputClass}
            data-testid="shipping-phone-input"
          />
        </Field>
      </div>
    </div>
  )
}

export default ShippingAddress
