"use client"

import { Toaster as SonnerToaster } from "sonner"

/**
 * Toaster DX — wrapper do `sonner` com tema light v3.0 aplicado.
 *
 * Uso (em qualquer client component):
 *   import { toast } from "sonner"
 *   toast.success("Produto adicionado ao carrinho!", { description: "..." })
 *   toast.error("Erro ao processar pagamento")
 *   toast("Pix expira em 28:47", { icon: "⚡" })
 */
const Toaster = () => {
  return (
    <SonnerToaster
      position="top-right"
      theme="light"
      richColors={false}
      toastOptions={{
        style: {
          background: "#FFFFFF",
          border: "1.5px solid #E2E8F0",
          color: "#0A0F1A",
          borderRadius: "12px",
          fontFamily: "var(--font-inter), Inter, sans-serif",
          boxShadow: "0 12px 32px rgba(15, 23, 42, .12)",
        },
      }}
    />
  )
}

export default Toaster
