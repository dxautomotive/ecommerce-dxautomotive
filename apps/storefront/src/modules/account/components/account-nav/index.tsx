"use client"

import { signout } from "@lib/data/customer"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { usePathname } from "next/navigation"

const NAV_ITEMS = [
  { href: "/account", label: "Visão geral", icon: "home" },
  { href: "/account/orders", label: "Meus pedidos", icon: "package" },
  { href: "/account/addresses", label: "Endereços", icon: "pin" },
  { href: "/account/profile", label: "Meus dados", icon: "user" },
] as const

const AccountNav = ({
  customer,
}: {
  customer: HttpTypes.StoreCustomer | null
}) => {
  const route = usePathname()

  const handleLogout = async () => {
    await signout()
  }

  const isActive = (href: string) => route === href

  return (
    <aside data-testid="account-nav" className="medium:sticky medium:top-32">
      <div className="bg-brand-surface border border-brand-border rounded-xl p-5">
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-brand-border">
          <div className="w-10 h-10 rounded-full bg-brand-primary/15 border border-brand-primary/30 text-brand-primary font-bold flex items-center justify-center">
            {(customer?.first_name?.[0] || "?").toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-brand-text text-sm font-semibold truncate">
              Olá, {customer?.first_name || "cliente"}
            </p>
            <p className="text-brand-muted text-xs truncate">
              {customer?.email}
            </p>
          </div>
        </div>

        <nav aria-label="Menu da conta">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <LocalizedClientLink
                  href={item.href}
                  data-testid={`${item.icon}-link`}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                    isActive(item.href)
                      ? "bg-brand-primary/15 text-brand-primary border border-brand-primary/30 font-semibold"
                      : "text-brand-muted hover:text-brand-text hover:bg-brand-bg border border-transparent"
                  }`}
                >
                  <NavIcon name={item.icon} />
                  {item.label}
                </LocalizedClientLink>
              </li>
            ))}
            <li className="border-t border-brand-border mt-2 pt-2">
              <button
                type="button"
                onClick={handleLogout}
                data-testid="logout-button"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-brand-muted hover:text-brand-danger hover:bg-brand-bg transition-colors"
              >
                <NavIcon name="logout" />
                Sair
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  )
}

function NavIcon({ name }: { name: string }) {
  const props = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  }
  switch (name) {
    case "home":
      return (
        <svg {...props}>
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2h-4a2 2 0 01-2-2v-5h-2v5a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
      )
    case "package":
      return (
        <svg {...props}>
          <path d="M16.5 9.4l-9-5.19" />
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      )
    case "pin":
      return (
        <svg {...props}>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      )
    case "user":
      return (
        <svg {...props}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    case "logout":
      return (
        <svg {...props}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      )
    default:
      return null
  }
}

export default AccountNav
