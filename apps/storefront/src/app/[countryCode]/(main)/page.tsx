import { Metadata } from "next"

import { getRegion } from "@lib/data/regions"
import DynamicHomepage from "@modules/page-builder/components/dynamic-homepage"

export const revalidate = 60

export const metadata: Metadata = {
  title: "DX Automotive — Tecnologia que transforma seu carro",
  description:
    "Loja oficial DX Automotive: centrais multimídia, molduras, câmera de ré e sensor de estacionamento. Frete para todo o Brasil, Pix com desconto e parcelamento em 12x.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params

  const region = await getRegion(countryCode)
  if (!region) return null

  // A home agora é 100% dirigida pelo /app/page-builder.
  // Editar blocos / settings / ordem é feito direto no admin.
  return <DynamicHomepage countryCode={countryCode} />
}
