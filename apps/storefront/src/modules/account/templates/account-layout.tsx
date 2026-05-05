import React from "react"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

import AccountNav from "../components/account-nav"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({ customer, children }) => {
  return (
    <div className="content-container py-8 small:py-12" data-testid="account-page">
      <div className="flex flex-col gap-2 mb-6">
        <span className="text-brand-primary text-xs uppercase tracking-[0.25em] font-semibold">
          Minha conta
        </span>
        <h1 className="text-3xl small:text-4xl font-extrabold text-brand-text">
          {customer ? `Olá, ${customer.first_name || "cliente"}` : "Bem-vindo"}
        </h1>
      </div>

      {customer ? (
        <div className="grid grid-cols-1 medium:grid-cols-[280px_1fr] gap-6 small:gap-10">
          <AccountNav customer={customer} />
          <div className="min-w-0">{children}</div>
        </div>
      ) : (
        <div>{children}</div>
      )}

      <div className="mt-12 small:mt-16 grid grid-cols-1 small:grid-cols-2 gap-4 bg-brand-surface border border-brand-border rounded-xl p-6 small:p-8">
        <div>
          <h3 className="text-brand-text font-bold text-lg">
            Precisa de ajuda?
          </h3>
          <p className="text-brand-muted text-sm mt-2">
            Tire dúvidas sobre pedidos, garantia, troca ou compatibilidade direto
            com nosso atendimento. Atendemos de seg. a sáb. das 9h às 18h.
          </p>
        </div>
        <div className="flex small:justify-end items-center gap-3 flex-wrap">
          <LocalizedClientLink
            href="/atacado"
            className="bg-brand-whatsapp hover:bg-[#1da851] text-white font-semibold px-5 py-2.5 rounded transition-colors"
          >
            Falar pelo WhatsApp
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/politicas"
            className="border border-brand-border hover:border-brand-primary text-brand-text hover:text-brand-primary font-semibold px-5 py-2.5 rounded transition-colors"
          >
            Ver políticas
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout
