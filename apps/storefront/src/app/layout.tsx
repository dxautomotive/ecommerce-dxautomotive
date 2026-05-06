import Toaster from "@modules/common/components/toaster"
import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Barlow_Condensed, Inter } from "next/font/google"
import "styles/globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
})

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["700", "800"],
})

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
    <html
      lang="pt-BR"
      data-mode="light"
      className={`${inter.variable} ${barlow.variable}`}
    >
      <body className="bg-brand-bg text-brand-text antialiased font-sans">
        <main className="relative">{props.children}</main>
        <Toaster />
      </body>
    </html>
  )
}
