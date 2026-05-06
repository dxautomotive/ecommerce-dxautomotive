import Image from "next/image"
import { listCategories } from "@lib/data/categories"
import { Text, clx } from "@modules/common/components/ui"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import NewsletterFooter from "@modules/layout/components/newsletter-footer"

const PAYMENT_METHODS = [
  { src: "/payment/pix.png", alt: "Pix" },
  { src: "/payment/visa.png", alt: "Visa" },
  { src: "/payment/mastercard.png", alt: "Mastercard" },
  { src: "/payment/elo.png", alt: "Elo" },
  { src: "/payment/amex.png", alt: "American Express" },
  { src: "/payment/hipercard.png", alt: "Hipercard" },
  { src: "/payment/discover.png", alt: "Discover" },
  { src: "/payment/boleto.png", alt: "Boleto bancário" },
] as const

const SECURITY_SEALS = [
  { src: "/security/ssl.svg", alt: "SSL Seguro" },
  { src: "/security/google-site-seguro-pt.svg", alt: "Google Site Seguro" },
  { src: "/security/reclame-aqui.svg", alt: "Reclame Aqui" },
] as const

export default async function Footer() {
  const productCategories = await listCategories()

  return (
    <footer className="border-t border-brand-border w-full bg-brand-surface mt-16">
      <div className="content-container flex flex-col w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 py-16">
          <div className="space-y-4">
            <LocalizedClientLink
              href="/"
              className="text-brand-text font-bold uppercase text-lg block"
            >
              <span className="text-brand-primary">DX</span> Automotive
            </LocalizedClientLink>
            <p className="text-brand-muted text-sm leading-relaxed">
              Tecnologia que transforma seu carro. Multimídia, molduras, câmera
              de ré e sensor de estacionamento com entrega para todo o Brasil.
            </p>
            <p className="text-brand-muted text-xs">
              Atendimento: seg. a sáb. 9h às 18h
            </p>
          </div>

          {productCategories && productCategories.length > 0 && (
            <div className="flex flex-col gap-y-3">
              <span className="text-brand-text font-semibold text-sm">
                Categorias
              </span>
              <ul className="grid grid-cols-1 gap-2" data-testid="footer-categories">
                {productCategories.slice(0, 6).map((c) => {
                  if (c.parent_category) return null
                  const children =
                    c.category_children?.map((child) => ({
                      name: child.name,
                      handle: child.handle,
                      id: child.id,
                    })) || null
                  return (
                    <li
                      className="flex flex-col gap-2 text-brand-muted text-sm"
                      key={c.id}
                    >
                      <LocalizedClientLink
                        className={clx(
                          "hover:text-brand-text transition-colors",
                          children && "font-semibold"
                        )}
                        href={`/categories/${c.handle}`}
                        data-testid="category-link"
                      >
                        {c.name}
                      </LocalizedClientLink>
                      {children && (
                        <ul className="grid grid-cols-1 ml-3 gap-2">
                          {children.map((child) => (
                            <li key={child.id}>
                              <LocalizedClientLink
                                className="hover:text-brand-text transition-colors"
                                href={`/categories/${child.handle}`}
                                data-testid="category-link"
                              >
                                {child.name}
                              </LocalizedClientLink>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          <div className="flex flex-col gap-y-3">
            <span className="text-brand-text font-semibold text-sm">
              Atendimento
            </span>
            <ul className="grid grid-cols-1 gap-y-2 text-brand-muted text-sm">
              <li>
                <LocalizedClientLink
                  href="/atacado"
                  className="hover:text-brand-text transition-colors"
                >
                  Compra em volume
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/politicas/garantia"
                  className="hover:text-brand-text transition-colors"
                >
                  Garantia
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/politicas/trocas-e-devolucoes"
                  className="hover:text-brand-text transition-colors"
                >
                  Trocas e devoluções
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/politicas/entrega"
                  className="hover:text-brand-text transition-colors"
                >
                  Prazo de entrega
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/politicas/privacidade"
                  className="hover:text-brand-text transition-colors"
                >
                  Privacidade
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          <NewsletterFooter />
        </div>

        <div className="flex flex-col gap-y-6 border-t border-brand-border py-8">
          <div className="flex flex-col gap-y-2">
            <span className="text-brand-muted text-xs uppercase tracking-wider">
              Formas de pagamento
            </span>
            <div className="flex flex-wrap items-center gap-3">
              {PAYMENT_METHODS.map((p) => (
                <div
                  key={p.alt}
                  className="bg-white rounded p-1.5 flex items-center justify-center"
                  style={{ width: 44, height: 28 }}
                >
                  <Image
                    src={p.src}
                    alt={p.alt}
                    width={36}
                    height={20}
                    style={{ objectFit: "contain" }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-y-2">
            <span className="text-brand-muted text-xs uppercase tracking-wider">
              Segurança
            </span>
            <div className="flex flex-wrap items-center gap-4">
              {SECURITY_SEALS.map((s) => (
                <div
                  key={s.alt}
                  className="bg-white rounded p-1.5 flex items-center justify-center"
                  style={{ height: 32 }}
                >
                  <Image
                    src={s.src}
                    alt={s.alt}
                    width={64}
                    height={24}
                    style={{ objectFit: "contain", height: 22, width: "auto" }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row w-full mb-8 justify-between items-start sm:items-center gap-4 text-brand-muted">
          <Text className="text-xs">
            © {new Date().getFullYear()} DX Automotive — Grupo Dr. Farol
            Toledo. Todos os direitos reservados.
          </Text>
          <Text className="text-xs">CNPJ a definir</Text>
        </div>
      </div>
    </footer>
  )
}
