"use client"

import { Toaster as SonnerToaster } from "sonner"

/**
 * Toaster DX — wrapper do `sonner` com tema dark v2.1 aplicado.
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
      theme="dark"
      richColors={false}
      toastOptions={{
        style: {
          background: "#111E34",
          border: "1.5px solid #1A2540",
          color: "#E8F0F8",
          borderRadius: "12px",
          fontFamily: "var(--font-inter), Inter, sans-serif",
        },
        className: "shadow-lg",
      }}
    />
  )
}

export default Toaster
