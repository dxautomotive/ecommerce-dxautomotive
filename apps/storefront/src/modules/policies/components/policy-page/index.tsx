import LocalizedClientLink from "@modules/common/components/localized-client-link"

type Props = {
  eyebrow?: string
  title: string
  intro?: string
  /** Última atualização — exibida no topo */
  updatedAt?: string
  children: React.ReactNode
}

const POLICIES = [
  { slug: "garantia", label: "Garantia" },
  { slug: "trocas-e-devolucoes", label: "Trocas e devoluções" },
  { slug: "entrega", label: "Prazo de entrega" },
  { slug: "privacidade", label: "Privacidade" },
] as const

/**
 * Layout compartilhado das páginas de política. Server component.
 * Mantém todas as 4 páginas (garantia, trocas, entrega, privacidade) com
 * mesma diagramação: breadcrumb, eyebrow, título, intro, data de atualização,
 * sidebar com links pra outras políticas, content em prose dark.
 */
export default function PolicyPage({
  eyebrow = "Políticas da loja",
  title,
  intro,
  updatedAt,
  children,
}: Props) {
  return (
    <>
      <nav
        aria-label="Caminho de navegação"
        className="content-container py-4 text-xs text-brand-muted"
      >
        <ol className="flex items-center gap-2 flex-wrap">
          <li>
            <LocalizedClientLink href="/" className="hover:text-brand-text transition-colors">
              Início
            </LocalizedClientLink>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <LocalizedClientLink href="/politicas" className="hover:text-brand-text transition-colors">
              Políticas
            </LocalizedClientLink>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-brand-text font-medium">{title}</li>
        </ol>
      </nav>

      <div className="content-container pb-16 grid grid-cols-1 medium:grid-cols-[260px_1fr] gap-8">
        <aside className="medium:sticky medium:top-32 self-start">
          <div className="bg-brand-surface border border-brand-border rounded-lg p-5">
            <h2 className="text-brand-text font-bold text-sm uppercase tracking-wider mb-3">
              Políticas
            </h2>
            <nav aria-label="Outras políticas">
              <ul className="flex flex-col gap-1.5">
                {POLICIES.map((p) => (
                  <li key={p.slug}>
                    <LocalizedClientLink
                      href={`/politicas/${p.slug}`}
                      className="block px-3 py-2 rounded text-sm text-brand-muted hover:bg-brand-bg hover:text-brand-text transition-colors"
                    >
                      {p.label}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="bg-brand-surface border border-brand-border rounded-lg p-5 mt-4">
            <h3 className="text-brand-text font-bold text-sm mb-2">
              Ainda com dúvida?
            </h3>
            <p className="text-brand-muted text-xs mb-3">
              Fale direto com nosso atendimento pelo WhatsApp.
            </p>
            <LocalizedClientLink
              href="/atacado"
              className="text-brand-primary hover:text-brand-primary-hover text-sm font-semibold"
            >
              Falar com a equipe →
            </LocalizedClientLink>
          </div>
        </aside>

        <article className="bg-brand-surface border border-brand-border rounded-lg p-6 small:p-10">
          <header className="mb-6 pb-6 border-b border-brand-border">
            {eyebrow && (
              <span className="text-brand-primary text-xs uppercase tracking-[0.25em] font-bold">
                {eyebrow}
              </span>
            )}
            <h1 className="text-3xl small:text-4xl font-extrabold text-brand-text mt-2">
              {title}
            </h1>
            {intro && (
              <p className="text-brand-muted text-base mt-3 leading-relaxed">
                {intro}
              </p>
            )}
            {updatedAt && (
              <p className="text-brand-muted text-xs mt-3 uppercase tracking-wider">
                Última atualização: {updatedAt}
              </p>
            )}
          </header>

          <div className="prose prose-invert max-w-none text-brand-muted leading-relaxed [&_h2]:text-brand-text [&_h2]:font-bold [&_h2]:text-xl [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-brand-text [&_h3]:font-semibold [&_h3]:text-base [&_h3]:mt-6 [&_h3]:mb-2 [&_strong]:text-brand-text [&_a]:text-brand-primary [&_a]:no-underline hover:[&_a]:underline [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-3 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-3 [&_li]:my-1 [&_p]:my-3">
            {children}
          </div>
        </article>
      </div>
    </>
  )
}
