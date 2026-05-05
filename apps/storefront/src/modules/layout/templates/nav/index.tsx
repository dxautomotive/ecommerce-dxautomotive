import { Suspense } from "react"

import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import AnnouncementBar from "@modules/layout/components/announcement-bar"
import SearchInput from "@modules/layout/components/search-input"

const PRIMARY_LINKS = [
  { label: "Multimídia", href: "/categories/multimidia" },
  { label: "Molduras", href: "/categories/molduras" },
  { label: "Câmera de Ré", href: "/categories/camera-de-re" },
  { label: "Sensor", href: "/categories/sensor-de-estacionamento" },
  { label: "Atacado", href: "/atacado" },
] as const

export default async function Nav() {
  const [regions, locales, currentLocale] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
  ])

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <AnnouncementBar />
      <header className="bg-brand-bg/95 backdrop-blur border-b border-brand-border">
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
