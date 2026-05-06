import { Suspense } from "react"

import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import AnnouncementBar from "@modules/layout/components/announcement-bar"
import CartButton from "@modules/layout/components/cart-button"
import SearchInput from "@modules/layout/components/search-input"
import SideMenu from "@modules/layout/components/side-menu"

const PRIMARY_LINKS = [
  { label: "Multimídia", href: "/categories/multimidia" },
  { label: "Molduras", href: "/categories/molduras" },
  { label: "Câmera de Ré", href: "/categories/camera-de-re" },
  { label: "Sensor", href: "/categories/sensor-de-estacionamento" },
  { label: "Coleções", href: "/colecoes" },
  { label: "Atacado", href: "/atacado" },
] as const

const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5548000000000"
const WHATSAPP_HUMAN = "(48) 0000-0000"
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Olá! Tenho uma dúvida sobre os produtos."
)}`

export default async function Nav() {
  const [regions, locales, currentLocale] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
  ])

  return (
    <div className="relative inset-x-0 z-50">
      <AnnouncementBar />
      <header className="bg-brand-bg border-b border-brand-border">
        <div className="content-container">
          {/* Linha principal: Menu mobile · Logo · Busca · Conta · Carrinho */}
          <div className="flex items-center justify-between gap-4 py-3 small:py-4">
            <div className="flex items-center gap-3 small:hidden">
              <SideMenu
                regions={regions}
                locales={locales}
                currentLocale={currentLocale}
              />
            </div>

            <LocalizedClientLink
              href="/"
              className="text-brand-text font-extrabold tracking-wider uppercase text-lg small:text-xl whitespace-nowrap"
              data-testid="nav-store-link"
              aria-label="DX Automotive — voltar para a página inicial"
            >
              <span className="text-brand-primary">DX</span> Automotive
            </LocalizedClientLink>

            <div className="flex-1 hidden small:flex justify-center">
              <SearchInput />
            </div>

            <div className="flex items-center gap-4 small:gap-6 text-sm">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden small:flex items-center gap-2 text-brand-muted hover:text-brand-success transition-colors"
                data-testid="nav-whatsapp-link"
                aria-label="Falar conosco pelo WhatsApp"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M17.5 14.4c-.3-.2-1.7-.8-2-.9s-.5-.2-.7.2-.8.9-1 1.1c-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.4.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.7-.9-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4s-1 1-1 2.4 1 2.8 1.2 3c.1.2 2 3 4.7 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 2-1.3.2-.7.2-1.2.1-1.3-.1-.1-.3-.2-.6-.4z" />
                  <path d="M20.5 3.5C18.3 1.2 15.3 0 12.1 0 5.5 0 .1 5.4.1 12c0 2.1.5 4.2 1.6 6L0 24l6.2-1.6c1.8 1 3.8 1.5 5.9 1.5 6.6 0 12-5.4 12-12 0-3.2-1.2-6.2-3.6-8.4zm-8.4 18.5c-1.9 0-3.7-.5-5.3-1.5l-.4-.2-3.7 1 1-3.6-.2-.4c-1.1-1.7-1.6-3.7-1.6-5.7 0-5.6 4.6-10.1 10.1-10.1 2.7 0 5.2 1.1 7.1 3 1.9 1.9 2.9 4.4 2.9 7.1 0 5.5-4.4 9.4-9.9 9.4z" />
                </svg>
                <div className="hidden medium:flex flex-col leading-tight">
                  <span className="text-[10px] uppercase tracking-wider text-brand-muted">
                    WhatsApp
                  </span>
                  <span className="text-sm font-bold text-brand-text">
                    {WHATSAPP_HUMAN}
                  </span>
                </div>
              </a>

              <LocalizedClientLink
                href="/account"
                className="hidden small:flex items-center gap-2 text-brand-muted hover:text-brand-text transition-colors"
                data-testid="nav-account-link"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span className="hidden medium:inline">Minha conta</span>
              </LocalizedClientLink>

              <Suspense
                fallback={
                  <LocalizedClientLink
                    className="flex items-center gap-2 text-brand-muted hover:text-brand-text transition-colors"
                    href="/cart"
                    data-testid="nav-cart-link"
                    aria-label="Ver carrinho"
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                    <span className="hidden medium:inline">Carrinho (0)</span>
                  </LocalizedClientLink>
                }
              >
                <CartButton />
              </Suspense>
            </div>
          </div>

          {/* Linha secundária — categorias rápidas (apenas desktop) */}
          <nav
            aria-label="Categorias principais"
            className="hidden small:flex items-center gap-1 py-2 border-t border-brand-border/60 -mt-px"
          >
            <div className="flex items-center gap-1">
              <SideMenu
                regions={regions}
                locales={locales}
                currentLocale={currentLocale}
              />
            </div>
            <div className="h-4 w-px bg-brand-border mx-3" />
            <ul className="flex items-center gap-1 flex-wrap">
              {PRIMARY_LINKS.map((l) => (
                <li key={l.href}>
                  <LocalizedClientLink
                    href={l.href}
                    className="px-3 py-1.5 text-sm text-brand-muted hover:text-brand-text hover:bg-brand-surface rounded transition-colors"
                  >
                    {l.label}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Busca em mobile (linha extra) */}
          <div className="small:hidden pb-3">
            <MobileSearch />
          </div>
        </div>
      </header>
    </div>
  )
}

// Wrapper simples só pra reaproveitar o SearchInput em mobile (mostra sempre)
function MobileSearch() {
  return (
    <form
      action="/br/store"
      method="get"
      role="search"
      className="flex items-center w-full"
    >
      <div className="relative flex w-full">
        <input
          type="search"
          name="q"
          placeholder="Buscar produtos…"
          aria-label="Buscar produtos"
          className="w-full bg-brand-surface border border-brand-border focus:border-brand-primary text-brand-text placeholder:text-brand-muted text-sm rounded-l-md px-3 py-2 outline-none transition-colors"
        />
        <button
          type="submit"
          aria-label="Buscar"
          className="bg-brand-primary hover:bg-brand-primary-hover text-white px-3 rounded-r-md flex items-center justify-center transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </div>
    </form>
  )
}
