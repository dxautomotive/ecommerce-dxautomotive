import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Heading } from "@modules/common/components/ui"

/**
 * Hero da home — primeira coisa que o usuário vê.
 * Identidade DX (PRD §2): bg dark, accent azul elétrico, tom técnico/premium.
 */
const Hero = () => {
  return (
    <section className="relative w-full overflow-hidden bg-brand-bg border-b border-brand-border">
      {/* Pattern de fundo (mais aprofundamos com banner real depois) */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 30%, rgba(0,102,255,0.25) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(0,102,255,0.15) 0%, transparent 50%)",
        }}
        aria-hidden="true"
      />
      <div className="relative content-container min-h-[60vh] small:min-h-[70vh] flex flex-col justify-center items-start gap-6 py-16 small:py-24">
        <span className="text-brand-primary text-xs uppercase tracking-[0.2em] font-semibold">
          DX Automotive
        </span>
        <Heading
          level="h1"
          className="text-4xl small:text-5xl medium:text-6xl leading-[1.1] text-brand-text font-bold max-w-4xl"
        >
          Tecnologia que transforma
          <br />
          <span className="text-brand-primary">o seu carro.</span>
        </Heading>
        <p className="text-brand-muted text-base small:text-lg max-w-2xl leading-relaxed">
          Multimídia com Android Auto e CarPlay, molduras originais por modelo,
          câmeras de ré e sensores de estacionamento. Frete para todo o Brasil,
          Pix com desconto e parcelamento em até 12x.
        </p>
        <div className="flex flex-wrap gap-3 mt-2">
          <LocalizedClientLink
            href="/store"
            className="bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold px-6 py-3 rounded transition-colors"
          >
            Ver produtos
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/categories/multimidia"
            className="border border-brand-border hover:border-brand-primary text-brand-text font-semibold px-6 py-3 rounded transition-colors"
          >
            Multimídia para meu carro
          </LocalizedClientLink>
        </div>
      </div>
    </section>
  )
}

export default Hero
