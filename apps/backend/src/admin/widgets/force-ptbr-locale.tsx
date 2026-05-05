import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"

// Garante que o admin sempre abra em pt-BR.
//
// Por que isso existe:
// 1. O Medusa Dashboard 2.14.2 não persiste a escolha de idioma no banco
//    (o `Edit Profile` só chama `i18n.changeLanguage(code)` localmente —
//    ver profile-edit-MN5QXZPS.mjs:66-79). A preferência só vive em
//    cookie/localStorage `lng`.
// 2. O `Accept-Language: pt-BR` do navegador não bate com a chave `ptBR`
//    (sem hífen) usada pelo Medusa em `supportedLngs`. Sem cookie, cai
//    no fallback `en`.
//
// Este widget é invisível (retorna null). Renderiza nas zonas pré-login,
// pré-orders e pré-profile — qualquer um delas é o primeiro mount após
// um cookie limpo, então o changeLanguage roda lá. O LanguageDetector
// do i18next grava em cookie + localStorage automaticamente.

const ForcePtBrLocale = () => {
  const { i18n } = useTranslation()

  useEffect(() => {
    if (i18n.language !== "ptBR") {
      void i18n.changeLanguage("ptBR")
    }
  }, [i18n])

  return null
}

export const config = defineWidgetConfig({
  zone: ["login.before", "order.list.before", "profile.details.before"],
})

export default ForcePtBrLocale
