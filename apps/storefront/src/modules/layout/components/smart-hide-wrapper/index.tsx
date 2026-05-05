"use client"

import { useEffect, useRef, useState } from "react"

type Props = {
  /** Distância máxima do topo onde o header sempre fica visível (px). Default 80. */
  topThreshold?: number
  /** Delta mínimo de scroll para acionar hide/show (px). Evita "tremor" em micro-rolagens. Default 8. */
  deltaThreshold?: number
  children: React.ReactNode
}

/**
 * Smart-hide wrapper para o header do storefront.
 *
 * Comportamento:
 *  - Topo da página (scrollY < topThreshold): sempre visível
 *  - Rola para BAIXO (delta > deltaThreshold): esconde (translateY(-100%))
 *  - Rola para CIMA (delta < -deltaThreshold): mostra
 *
 * Performance: usa requestAnimationFrame para throttle do scroll listener
 * e comparação de delta com a última leitura, evitando setState em
 * cada pixel.
 *
 * Acessibilidade: o header continua presente no DOM (não usa display:none),
 * apenas saindo do viewport via transform — leitores de tela e foco do
 * teclado seguem funcionando.
 */
const SmartHideWrapper = ({
  topThreshold = 80,
  deltaThreshold = 8,
  children,
}: Props) => {
  const [hidden, setHidden] = useState(false)
  const lastY = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    lastY.current = window.scrollY

    const onScroll = () => {
      if (ticking.current) return
      ticking.current = true
      requestAnimationFrame(() => {
        const y = window.scrollY
        const delta = y - lastY.current

        if (y <= topThreshold) {
          setHidden(false)
        } else if (delta > deltaThreshold) {
          setHidden(true)
        } else if (delta < -deltaThreshold) {
          setHidden(false)
        }

        lastY.current = y
        ticking.current = false
      })
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [topThreshold, deltaThreshold])

  return (
    <div
      className={`sticky top-0 inset-x-0 z-50 transition-transform duration-300 ease-in-out will-change-transform ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      {children}
    </div>
  )
}

export default SmartHideWrapper
