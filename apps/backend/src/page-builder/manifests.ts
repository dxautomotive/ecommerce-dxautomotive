import type { SectionManifest } from "./types"

/**
 * Catálogo de sections disponíveis para o lojista no editor da loja.
 *
 * Adicionar uma section nova exige:
 *   1. Criar/ter o componente React no storefront
 *   2. Adicionar o `type` ao `SECTION_MAP` do storefront
 *   3. Adicionar o manifest aqui
 *
 * Para que o admin saiba os tipos disponíveis, o endpoint
 * `/admin/page-builder/manifests` retorna esta lista.
 */
export const SECTION_MANIFESTS: SectionManifest[] = [
  {
    type: "hero-carousel",
    label: "Carrossel principal",
    icon: "🎯",
    description:
      "Banner rotativo no topo da home com slides personalizáveis.",
    settings: [],
  },
  {
    type: "benefits-bar",
    label: "Barra de benefícios",
    icon: "✨",
    description:
      "4 ícones com benefícios (Pix, parcelamento, frete, garantia).",
    settings: [],
  },
  {
    type: "category-showcase",
    label: "Vitrine de categorias",
    icon: "🗂️",
    description:
      "Círculos de categorias configuráveis — selecione, reordene e personalize cada item.",
    settings: [
      {
        key: "eyebrow",
        type: "text",
        label: "Eyebrow (rótulo pequeno)",
        default: "PARA O SEU CARRO",
      },
      {
        key: "title",
        type: "text",
        label: "Título principal",
        default: "Encontre o que precisa",
      },
      {
        key: "description",
        type: "textarea",
        label: "Descrição curta",
        default:
          "Equipamentos selecionados para os principais modelos do mercado brasileiro. Compatibilidade verificada por veículo.",
      },
      {
        key: "blocks",
        type: "block_array",
        label: "Categorias exibidas",
        hint: "Adicione e reordene as categorias que aparecem nos círculos. Vazio = usa as 4 categorias padrão.",
        default: [],
        maxItems: 8,
        itemSchema: {
          fields: [
            {
              key: "category_handle",
              type: "category_picker",
              label: "Categoria",
            },
            {
              key: "emoji",
              type: "text",
              label: "Emoji",
              default: "📦",
              hint: "Um emoji representativo (ex: 🚗, 📷, 🛞)",
            },
            {
              key: "gradient",
              type: "select",
              label: "Cor do círculo",
              default: "from-blue-500 to-blue-800",
              options: [
                { value: "from-blue-500 to-blue-800", label: "Azul" },
                { value: "from-purple-500 to-indigo-700", label: "Roxo" },
                { value: "from-emerald-500 to-teal-700", label: "Verde" },
                { value: "from-amber-400 to-orange-600", label: "Laranja" },
                { value: "from-rose-500 to-pink-700", label: "Rosa" },
                { value: "from-cyan-500 to-sky-700", label: "Ciano" },
                { value: "from-slate-600 to-slate-800", label: "Cinza" },
              ],
            },
            {
              key: "pitch",
              type: "text",
              label: "Subtítulo",
              hint: "Texto abaixo do nome (ex: Android Auto, CarPlay e GPS)",
              default: "",
            },
            {
              key: "custom_link",
              type: "url",
              label: "Link personalizado (opcional)",
              hint: "Vazio = link automático para a categoria selecionada",
              default: "",
            },
          ],
        },
      },
    ],
  },
  {
    type: "flash-sale-banner",
    label: "Banner de promoção relâmpago",
    icon: "⚡",
    description: "Cronômetro regressivo com destaque de oferta.",
    settings: [
      {
        key: "title",
        type: "text",
        label: "Título da promo",
        default: "Black Week DX",
      },
      {
        key: "subtitle",
        type: "textarea",
        label: "Subtítulo",
        default:
          "Até 25% off + Pix com 10% adicional em centrais multimídia",
      },
      {
        key: "cta_label",
        type: "text",
        label: "Texto do botão",
        default: "Aproveitar agora",
      },
      {
        key: "cta_url",
        type: "url",
        label: "URL do botão",
        default: "/store",
      },
      {
        key: "ends_at_iso",
        type: "text",
        label: "Termina em (ISO 8601)",
        hint: "Ex: 2026-12-01T23:59:59-03:00",
        default: "",
      },
    ],
  },
  {
    type: "featured-products",
    label: "Vitrine de produtos",
    icon: "🛒",
    description:
      "Grid de produtos com eyebrow + título + CTA 'Ver todos'.",
    allowMultiple: true,
    settings: [
      {
        key: "eyebrow",
        type: "text",
        label: "Eyebrow",
        default: "Mais procurados",
      },
      {
        key: "title",
        type: "text",
        label: "Título",
        default: "Produtos em destaque",
      },
      {
        key: "description",
        type: "textarea",
        label: "Descrição",
        default:
          "Os equipamentos mais vendidos da loja, prontos para envio imediato.",
      },
      {
        key: "limit",
        type: "number",
        label: "Quantos produtos",
        min: 4,
        max: 24,
        default: 8,
      },
      {
        key: "see_all_href",
        type: "url",
        label: "URL do 'Ver todos'",
        default: "/store",
      },
      {
        key: "category_handle",
        type: "category_picker",
        label: "Filtrar por categoria (opcional)",
        hint: "Vazio = todos os produtos",
      },
    ],
  },
  {
    type: "featured-collection-block",
    label: "Coleção em destaque",
    icon: "✨",
    description:
      "Bloco grande com gradient + produtos de uma coleção específica. As coleções são gerenciadas em /app/collections.",
    allowMultiple: true,
    settings: [
      {
        key: "collection_handle",
        type: "collection_picker",
        label: "Coleção a exibir",
        hint: "Selecione uma coleção (gradient e CTA vêm dos metadados dela).",
      },
      {
        key: "limit",
        type: "number",
        label: "Quantos produtos",
        min: 4,
        max: 16,
        default: 8,
      },
    ],
  },
  {
    type: "promotion-blocks",
    label: "Blocos promocionais",
    icon: "🎁",
    description: "3 cards de promoção (atacado / garantia / Pix).",
    settings: [],
  },
  {
    type: "testimonials",
    label: "Depoimentos",
    icon: "💬",
    description: "Carrossel de depoimentos de clientes.",
    settings: [],
  },
  {
    type: "why-dx-section",
    label: "Por que a DX?",
    icon: "🛡️",
    description:
      "4 pilares de confiança com visual dark premium (garantia, Pix, frete, plug & play).",
    settings: [
      {
        key: "eyebrow",
        type: "text",
        label: "Eyebrow",
        default: "Por que a DX Automotive?",
      },
      {
        key: "title",
        type: "text",
        label: "Título",
        default: "Tecnologia automotiva sem complicação",
      },
      {
        key: "description",
        type: "textarea",
        label: "Descrição",
        default:
          "Mais de 200 modelos compatíveis, suporte humano no WhatsApp e entrega rápida para qualquer estado do Brasil.",
      },
    ],
  },
]

export function findManifest(type: string): SectionManifest | undefined {
  return SECTION_MANIFESTS.find((m) => m.type === type)
}
