import React from "react"

type Props = {
  icon: string | React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

/**
 * Empty state padronizado v2.1 — usado em carrinho vazio, sem pedidos,
 * sem endereços, sem avaliações, busca sem resultado, etc.
 *
 * Visual: card com border-dashed em surface-2, ícone grande em
 * border-2 (sutil, não compete com texto), título extrabold,
 * descrição em text-2.
 */
const EmptyState = ({ icon, title, description, action }: Props) => {
  return (
    <div className="bg-brand-surface-2 border border-dashed border-brand-border-2 rounded-xl px-8 py-12 text-center">
      <div
        className="text-[42px] text-brand-border-2 mb-3.5 leading-none"
        aria-hidden="true"
      >
        {icon}
      </div>
      <h3 className="text-[18px] font-black text-brand-text mb-1.5">
        {title}
      </h3>
      {description && (
        <p className="text-[13px] text-brand-text-2 mb-5 max-w-md mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}

export default EmptyState
