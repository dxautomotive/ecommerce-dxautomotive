import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    default: "DX Automotive — Tecnologia que transforma seu carro",
    template: "%s | DX Automotive",
  },
  description:
    "Multimídia, molduras, câmera de ré e sensor de estacionamento para o seu veículo. Frete para todo o Brasil, Pix com desconto e parcelamento em até 12x.",
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-mode="dark" className="dark">
      <body className="bg-brand-bg text-brand-text antialiased">
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
