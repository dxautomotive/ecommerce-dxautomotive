"use client"

import { forwardRef, useState } from "react"

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  /** classes Tailwind aplicadas no input em si (sem o wrapper) */
  inputClassName?: string
}

/**
 * Input de senha com toggle "olho" pra mostrar/ocultar.
 * Mantém todos os atributos nativos de input (name, required, autoComplete, ...)
 * — só adiciona o botão de visibility do lado direito.
 */
const PasswordInput = forwardRef<HTMLInputElement, Props>(function PasswordInput(
  { inputClassName, ...rest },
  ref
) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative w-full">
      <input
        {...rest}
        ref={ref}
        type={visible ? "text" : "password"}
        className={`${inputClassName ?? defaultInputClass} pr-10`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex items-center justify-center w-10 text-brand-muted hover:text-brand-text transition-colors"
        tabIndex={-1}
      >
        {visible ? <EyeOff /> : <Eye />}
      </button>
    </div>
  )
})

const defaultInputClass =
  "w-full bg-brand-bg border border-brand-border focus:border-brand-primary text-brand-text placeholder:text-brand-muted text-sm rounded px-3 py-2.5 outline-none transition-colors"

function Eye() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOff() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

export default PasswordInput
