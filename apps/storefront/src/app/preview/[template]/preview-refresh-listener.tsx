"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function PreviewRefreshListener() {
  const router = useRouter()

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === "dx:refresh") {
        router.refresh()
      }
    }
    window.addEventListener("message", handler)
    return () => window.removeEventListener("message", handler)
  }, [router])

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "rgba(15, 23, 42, 0.92)",
        backdropFilter: "blur(4px)",
        color: "white",
        padding: "5px 14px",
        fontSize: "12px",
        fontFamily: "var(--font-inter, sans-serif)",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          background: "#34d399",
          borderRadius: "50%",
          display: "inline-block",
          boxShadow: "0 0 6px #34d399",
        }}
      />
      <span style={{ opacity: 0.7 }}>DX Editor</span>
      <span style={{ opacity: 0.4 }}>—</span>
      <span>Preview ao vivo</span>
    </div>
  )
}
