import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Help = () => {
  return (
    <div className="bg-brand-surface border border-brand-border rounded-xl p-5 small:p-6">
      <h3 className="text-base font-extrabold text-brand-text mb-2">
        Precisa de ajuda?
      </h3>
      <p className="text-sm text-brand-muted mb-4">
        Tire dúvidas sobre seu pedido, garantia, troca ou entrega direto com
        nosso atendimento. Atendemos de seg. a sáb. das 9h às 18h.
      </p>
      <div className="flex flex-wrap gap-2">
        <a
          href="https://wa.me/5548000000000?text=Ol%C3%A1!%20Tenho%20uma%20d%C3%BAvida%20sobre%20meu%20pedido."
          target="_blank"
          rel="noopener noreferrer"
          className="bg-brand-success hover:opacity-90 text-white text-sm font-semibold px-4 py-2 rounded-md transition-opacity"
        >
          Falar pelo WhatsApp
        </a>
        <LocalizedClientLink
          href="/politicas/trocas-e-devolucoes"
          className="bg-brand-bg border border-brand-border text-brand-text hover:bg-brand-surface text-sm font-semibold px-4 py-2 rounded-md transition-colors"
        >
          Trocas e devoluções
        </LocalizedClientLink>
        <LocalizedClientLink
          href="/politicas/garantia"
          className="bg-brand-bg border border-brand-border text-brand-text hover:bg-brand-surface text-sm font-semibold px-4 py-2 rounded-md transition-colors"
        >
          Garantia
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default Help
