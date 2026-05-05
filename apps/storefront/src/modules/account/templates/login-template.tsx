"use client"

import { useState } from "react"

import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
}

const LoginTemplate = () => {
  const [currentView, setCurrentView] = useState<string>("sign-in")

  return (
    <div className="content-container py-10 small:py-16 grid grid-cols-1 medium:grid-cols-2 gap-8 small:gap-12 items-start">
      <aside className="hidden medium:flex flex-col gap-5">
        <span className="text-brand-primary text-xs uppercase tracking-[0.3em] font-bold">
          DX Automotive
        </span>
        <h2 className="text-3xl small:text-4xl font-extrabold text-brand-text leading-tight">
          Sua loja de tecnologia automotiva.
        </h2>
        <p className="text-brand-muted leading-relaxed">
          Multimídia, molduras, câmeras e sensores compatíveis com os principais
          modelos do mercado brasileiro. Frete pra todo o Brasil, Pix com
          desconto e parcelamento em até 12x.
        </p>

        <ul className="mt-2 space-y-3 text-sm">
          {[
            "Acompanhamento de pedidos em tempo real",
            "Endereços salvos para finalizar mais rápido",
            "Cupom de boas-vindas no e-mail",
            "Histórico completo de compras",
          ].map((item) => (
            <li key={item} className="flex gap-2 text-brand-muted">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0066FF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="flex-shrink-0 mt-0.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </aside>

      <div>
        {currentView === "sign-in" ? (
          <Login setCurrentView={setCurrentView as any} />
        ) : (
          <Register setCurrentView={setCurrentView as any} />
        )}
      </div>
    </div>
  )
}

export default LoginTemplate
