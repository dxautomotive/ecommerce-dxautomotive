"use client"

import React from "react"

type StepState = "open" | "completed" | "locked"

type StepCardProps = {
  number: string
  title: string
  eyebrow?: string
  state: StepState
  onEdit?: () => void
  editLabel?: string
  editTestId?: string
  children: React.ReactNode
}

/**
 * Card de step do checkout no padrão visual DX.
 *
 * - `state="open"`    → editor visível (children renderiza form)
 * - `state="completed"` → resumo do passo + botão Editar
 * - `state="locked"`  → opacidade 50% (passo anterior não concluído)
 */
const StepCard = ({
  number,
  title,
  eyebrow,
  state,
  onEdit,
  editLabel = "Editar",
  editTestId,
  children,
}: StepCardProps) => {
  return (
    <section
      className={`bg-brand-surface border rounded-xl overflow-hidden transition-opacity ${
        state === "locked"
          ? "border-brand-border opacity-50 pointer-events-none select-none"
          : "border-brand-border"
      }`}
    >
      <header className="flex items-center justify-between gap-4 px-5 small:px-7 py-4 border-b border-brand-border">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold flex-shrink-0 ${
              state === "completed"
                ? "bg-brand-primary text-white"
                : "bg-brand-bg border border-brand-border text-brand-text"
            }`}
            aria-hidden="true"
          >
            {state === "completed" ? <CheckIcon /> : number}
          </span>
          <div className="min-w-0">
            {eyebrow && (
              <span className="text-brand-primary text-[10px] uppercase tracking-[0.2em] font-bold block">
                {eyebrow}
              </span>
            )}
            <h2 className="text-lg small:text-xl font-extrabold text-brand-text truncate">
              {title}
            </h2>
          </div>
        </div>
        {state === "completed" && onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="text-brand-primary hover:text-brand-primary-hover text-sm font-semibold whitespace-nowrap"
            data-testid={editTestId}
          >
            {editLabel}
          </button>
        )}
      </header>

      <div className="p-5 small:p-7">{children}</div>
    </section>
  )
}

const CheckIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

export default StepCard
