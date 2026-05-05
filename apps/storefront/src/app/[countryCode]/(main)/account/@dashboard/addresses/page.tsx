import { Metadata } from "next"
import { notFound } from "next/navigation"

import AddressBook from "@modules/account/components/address-book"

import { retrieveCustomer } from "@lib/data/customer"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "Endereços",
  description: "Gerencie seus endereços salvos",
}

export default async function Addresses(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params
  const customer = await retrieveCustomer()
  const region = await getRegion(countryCode)

  if (!customer || !region) {
    notFound()
  }

  const count = customer.addresses?.length ?? 0

  return (
    <div className="w-full" data-testid="addresses-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-2">
        <span className="text-brand-primary text-[10px] uppercase tracking-[0.2em] font-bold">
          Minha conta
        </span>
        <h1 className="text-2xl small:text-3xl font-extrabold text-brand-text">
          Endereços salvos
        </h1>
        <p className="text-sm text-brand-muted max-w-xl">
          Adicione endereços que você usa com frequência para agilizar o
          checkout.{" "}
          {count > 0 ? (
            <>
              Você tem{" "}
              <strong className="text-brand-text">{count}</strong>{" "}
              {count === 1 ? "endereço salvo" : "endereços salvos"}.
            </>
          ) : (
            <>Comece adicionando seu primeiro endereço.</>
          )}
        </p>
      </div>
      <AddressBook customer={customer} region={region} />
    </div>
  )
}
