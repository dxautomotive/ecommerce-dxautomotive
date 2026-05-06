# DX Automotive — Contexto para criação do Design System

> Documento gerado em 2026-05-06 com **estado atual** do código de produção.
> Objetivo: alimentar IA (Claude.ai) na criação de um design system formal.
> A IA deve **propor refinamentos** mantendo o que já funciona, expandindo
> tokens e padrões consistentes. **Não recomeçar do zero** — evoluir.

## 1. Quem é o DX Automotive

- **Negócio:** e-commerce de acessórios automotivos do grupo Dr. Farol Toledo
- **Categorias atuais:** Multimídia (centrais Android), Molduras, Câmera de ré, Sensor de estacionamento
- **Ticket médio:** R$ 1.500–8.000 (alto)
- **Público:** B2C dono de carro popular (Toyota, Honda, VW, Hyundai) **+ B2B revendedor/instalador**
- **Diferencial declarado no PRD:** filtro marca+modelo+ano completo, verificador de compatibilidade por produto, WhatsApp como canal de venda prioritário, atacado integrado, design forte (não-template)
- **Concorrentes-referência:** kitssom.com.br, reidasmultimidias.com.br
- **Idioma:** sempre pt-BR para conteúdo do usuário; código/identificadores em inglês
- **Tom:** confiança técnica + agilidade brasileira. Não pomposo; direto e útil. Vocabulário automotivo correto (chicote, plug & play, fitment, CarPlay, CAN-BUS).

## 2. Stack técnica (relevante pra design)

- **Frontend:** Next.js 15 (App Router) + React 19 + TypeScript + **Tailwind CSS** + `@medusajs/ui-preset`
- **Backend admin:** Medusa.js v2 dashboard (React + Tailwind + Radix UI via `@medusajs/ui`)
- **Renderização storefront:** SSR/RSC; Tailwind via JIT
- **Tema:** **dark sempre**, sem light mode previsto
- **Mobile-first**: a maioria dos clientes finais navega em celular

## 3. Paleta de cores oficial (PRD §2 — aprovada)

> Tokens definidos em `apps/storefront/tailwind.config.js` e `apps/storefront/src/styles/globals.css`.
> Usar **somente** os tokens `brand-*`. Não inventar cor avulsa.

### Tokens primários
```css
--brand-bg:            #0A0A0A   /* fundo principal — preto quase puro */
--brand-surface:       #141414   /* cards, modais, header */
--brand-border:        #222222   /* divisórias e contornos sutis */
--brand-primary:       #0066FF   /* azul DX — CTA primário, eyebrow */
--brand-primary-hover: #0052CC   /* hover do azul primário */
--brand-text:          #FFFFFF   /* texto principal (alto contraste) */
--brand-muted:         #A0A0A0   /* texto secundário, hints, descrições */
```

### Tokens semânticos
```css
--brand-success:  #00C851  /* verde — sucesso, garantia, "à vista" */
--brand-warning:  #FF6B00  /* laranja — promoção, alerta, badges Sob encomenda */
--brand-danger:   #FF3D3D  /* vermelho — erro, exclusão, urgência */
```

### Tokens BR-específicos
```css
--brand-pix:           #32BCAD  /* verde-água oficial Pix */
--brand-whatsapp:      #25D366  /* verde oficial WhatsApp */
--brand-whatsapp-hover:#1DA851
```

### Como usar
- `bg-brand-bg` é o fundo do site inteiro
- `bg-brand-surface` é tudo que é "card" ou "elevado"
- `border-brand-border` é a cor padrão de toda divisória
- `text-brand-text` para texto principal, `text-brand-muted` para secundário
- `text-brand-primary` para eyebrows e links
- **Nunca usar** `bg-white` ou `bg-gray-*` em tela do cliente final
- Para overlays/transparências: `bg-brand-primary/5`, `bg-brand-success/10`, etc.

## 4. Tipografia

- **Família:** `Inter` com fallback para system fonts
- **Pesos usados:** 400 (regular), 500 (medium), 600 (semibold), 700 (bold), **800 (extrabold)** para títulos principais
- `font-feature-settings: "ss01", "ss02", "cv01", "cv11"` ativados (números tabular, alternates)

### Escala efetiva

| Uso | Tailwind | Tamanho | Peso |
|---|---|---|---|
| H1 página inteira | `text-3xl small:text-5xl font-extrabold` | 30/48px | 800 |
| H1 página média | `text-2xl small:text-3xl font-extrabold` | 24/30px | 800 |
| H2 seção | `text-3xl small:text-4xl font-extrabold` | 30/36px | 800 |
| H2 card | `text-lg small:text-xl font-extrabold` | 18/20px | 800 |
| H3 sub-bloco | `text-base font-extrabold` | 16px | 800 |
| Eyebrow | `text-[10px] uppercase tracking-[0.2em] font-bold text-brand-primary` | 10px | 700 |
| Body | `text-sm leading-6 text-brand-text` | 14px | 400 |
| Body small | `text-xs text-brand-muted` | 12px | 400 |
| Hint | `text-[11px] text-brand-muted` | 11px | 400 |
| Preço grande | `text-xl small:text-2xl font-extrabold` | 20/24px | 800 |
| Preço total checkout | `text-xl font-extrabold` | 20px | 800 |

### Padrão de composição "header de seção"
Sempre que for um bloco grande, usar o trio:
```tsx
<span className="text-brand-primary text-[10px] uppercase tracking-[0.2em] font-bold">
  Eyebrow curto
</span>
<h2 className="text-2xl small:text-3xl font-extrabold text-brand-text mt-2 leading-tight">
  Título principal
</h2>
<p className="text-sm text-brand-muted mt-2 max-w-xl">
  Descrição opcional, 1-2 linhas, esclarece o bloco.
</p>
```

## 5. Espaçamento, raios, breakpoints

### Border radius
```css
none:    0px
soft:    2px
base:    4px   /* inputs, badges */
rounded: 8px   /* botões, cards pequenos */
large:   16px
circle:  9999px
```
Tailwind: `rounded`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-full`.
Padrão: **cards usam `rounded-xl`** (12px nativo do Tailwind), botões `rounded` (4px) ou `rounded-md` (6px).

### Breakpoints custom
```js
"2xsmall": "320px"   // celular pequeno
"xsmall":  "512px"
"small":   "1024px"  // ⭐ breakpoint principal — desktop começa aqui
"medium":  "1280px"
"large":   "1440px"  // max-w do content-container
"xlarge":  "1680px"
"2xlarge": "1920px"
```

### Container principal
```css
.content-container {
  max-w: 1440px;
  width: 100%;
  margin: auto;
  padding-x: 24px;
}
```

### Espaçamento vertical entre seções
- Seções principais: `py-12 small:py-16` ou `py-16 small:py-20`
- Cards internos: `p-5 small:p-6`
- Gap entre cards em grid: `gap-3 small:gap-5` (lista) ou `gap-4 small:gap-6` (showcase)

## 6. Componentes — biblioteca atual

> Tudo já existe em `apps/storefront/src/modules/`. A IA deve propor refinamentos visuais consistentes, **não recriar**. Cada componente abaixo tem propósito declarado.

### 6.1 Botões

#### Primário
```tsx
className="bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-50 text-white text-sm font-semibold rounded-md px-6 py-3 transition-colors"
```
Uso: CTA principal de qualquer tela ("Adicionar ao carrinho", "Continuar para entrega").

#### Secundário (outline)
```tsx
className="bg-brand-bg border border-brand-border text-brand-text hover:bg-brand-surface text-sm font-semibold px-5 py-2.5 rounded-md transition-colors"
```
Uso: ações alternativas ao primário ("Cancelar", "Ver política completa").

#### WhatsApp (verde)
```tsx
className="bg-brand-success hover:opacity-90 text-white text-sm font-semibold px-4 py-2 rounded-md transition-opacity"
```
Uso: qualquer CTA que abre conversa no WhatsApp. **Nunca** usar primário azul para WhatsApp.

#### Texto/link
```tsx
className="text-brand-primary hover:text-brand-primary-hover text-sm font-semibold"
```

### 6.2 Inputs e form fields

```tsx
const inputClass =
  "w-full bg-brand-bg border border-brand-border focus:border-brand-primary text-brand-text placeholder:text-brand-muted text-sm rounded px-3 py-2.5 outline-none transition-colors disabled:opacity-60"
```

### 6.3 Card padrão
```tsx
<section className="bg-brand-surface border border-brand-border rounded-xl p-5 small:p-6">
  {/* conteúdo */}
</section>
```

Variações:
- **Card de produto** (`<ProductCardDX>`): hover muda border pra `brand-primary` + sombra azul + scale 105% na imagem
- **Card "destacado"** (StepCard, GuaranteeHighlight): mesmo card + header com gradient sutil ou separador

### 6.4 Badges e selos

| Variante | Classe | Uso |
|---|---|---|
| Pix | `text-brand-pix font-bold uppercase text-xs` | "no Pix" depois de preço |
| Sucesso | `bg-brand-success/10 text-brand-success border border-brand-success/30 text-[11px] uppercase font-bold px-2.5 py-1 rounded` | "Pago", "Compatibilidade confirmada" |
| Warning | `bg-amber-500/10 text-amber-300 border border-amber-500/30 ...` | "Aguardando" |
| Danger | `bg-brand-danger/10 text-brand-danger border border-brand-danger/30 ...` | Erro, urgência |
| Promoção | `bg-brand-warning text-white text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded` | Badge canto do card |

### 6.5 Pricing display

Padrão DX para preços no produto e cards:
```
R$ 1.709,10 NO PIX · 10% OFF
Aprovação imediata — desconto à vista

ou R$ 1.899,00 em até 10x de R$ 189,90 sem juros
Boleto: R$ 1.804,05 (5% off)
```

- **Pix em destaque** (sempre): `text-2xl font-extrabold text-brand-text` + badge `text-brand-pix`
- **Preço cheio** ao lado: `text-xs text-brand-muted line-through`
- **Parcelamento** abaixo: `text-xs` com partes em `text-brand-text font-semibold`

Config canônica em `apps/storefront/src/lib/util/payment-display.ts`:
```ts
PAYMENT_CONFIG = {
  pixDiscount: 0.10,         // 10% off Pix
  boletoDiscount: 0.05,      // 5% off boleto
  maxInstallmentsNoInterest: 6,
  maxInstallments: 12,
  monthlyInterestRate: 0.0299,
  freeShippingThreshold: 50000  // R$ 500 em centavos
}
```

### 6.6 TrustSignals (4 cards 2×2 ao redor do CTA Comprar)
1. **Compra segura** — SSL · dados criptografados
2. **Garantia 2 anos** — Direto com a loja
3. **-10% no Pix** — Aprovação imediata
4. **Envio Brasil todo** — PAC e SEDEX

### 6.7 GuaranteeHighlight (bloco grande na PDP)
- Header com gradient `from-brand-success/15 to-transparent` + ícone shield + eyebrow "Garantia DX Automotive"
- 4 pilares em grid: O que cobre / Prazo / Como acionar / Trocas
- Footer com 2 CTAs: outline "Ver política completa" + verde "Falar pelo WhatsApp"

### 6.8 FeaturedCollection (gradient blocks)
Bloco da home/PDP com:
- Container `rounded-2xl` cheio com `linear-gradient(angle, color1, color2)` configurável
- Header com eyebrow branco + título extrabold + subtítulo + CTA "Ver todos →"
- Grid de produtos com fundo `bg-brand-bg` (volta ao escuro depois do gradient)
- 4 coleções demo: `mais-vendidos` (azul), `lancamentos` (roxo→rosa), `linha-premium` (cinza-escuro), `frete-gratis` (verde)

### 6.9 Modal (refeito em 10-prep C)
```tsx
// Backdrop
"bg-black/70 backdrop-blur-md"
// Painel
"bg-brand-surface border border-brand-border rounded-xl shadow-2xl"
// Title
"flex items-center justify-between border-b border-brand-border pb-4 mb-4"
// Footer
"pt-4 mt-4 border-t border-brand-border"
```

### 6.10 Step card (checkout)
4 estados: `open`, `completed`, `locked`. Ver `<StepCard>` em
`apps/storefront/src/modules/checkout/components/step-card/`.
Padrão: bolinha numerada à esquerda → vira check verde quando completed.

## 7. Páginas — inventário

### Storefront público (`/br/*`)

| Rota | Função |
|---|---|
| `/` (home) | Hero + Benefícios + Categorias + Flash Sale + Featured + Coleção em destaque + Promo + Testimonials + Novidades — **agora dirigida pelo Page Builder no admin** |
| `/store` | Catálogo geral com sort + paginação |
| `/categories/[handle]` | Listagem por categoria com **filtros laterais marca→modelo→ano em cascata via API real** |
| `/products/[handle]` | PDP com galeria + ProductPriceDX + ParcelamentoModal + CompatibilityBadge + FreteCalculator (ViaCEP) + WhatsAppButton + Tabs + TrustSignals + GuaranteeHighlight + VehicleCompatibility (agrupado por marca) |
| `/colecoes` | Índice das coleções com cards gradient |
| `/colecoes/[handle]` | Coleção com hero gradient + grid |
| `/cart` | FreeShippingBar + summary com Pix highlight |
| `/checkout` | 4 steps: Endereço · Entrega · Pagamento · Revisão. ViaCEP autopreenche. CheckoutSummary com Pix preview |
| `/preview/checkout` | Mockup interno do MercadoPago (Pix QR / cartão / boleto) |
| `/account` | Login/Register + Dashboard |
| `/account/orders`, `/orders/details/[id]` | Histórico + detalhe com status traduzidos |
| `/account/addresses` | CRUD de endereços com ViaCEP + 27 UFs + máscaras |
| `/account/profile` | Profile + ProfileBillingAddress |
| `/atacado` | Hero + perks + form B2B (persiste no banco + abre WhatsApp em paralelo) |
| `/politicas` + 4 sub | Garantia, Trocas, Entrega, Privacidade LGPD |
| 404 | DX dark com quick-links |

### Admin (`/app/*`)

Medusa Dashboard padrão **+ customizações DX**:
- Login customizado: "Bem-vindo à DX Automotive" (em vez de "Welcome to Medusa")
- Idioma forçado em pt-BR (ptBR builtin do Medusa + overrides DX)
- Widget KPIs em `order.list.before` (Pedidos hoje / mês / Leads atacado / Catálogo)
- Páginas custom no menu lateral:
  - **Editor da loja** (`/app/page-builder`) — Page Builder light estilo Shopify
  - **Leads atacado** (`/app/atacado-leads`) — gestão de cotações B2B com filtro
- Widgets em zonas:
  - `product.details.after`: gestão de veículos compatíveis
  - `product_collection.details.after`: editor visual de metadata DX (gradient + CTA + featured)
- I18n customizado com tela de login DX em pt-BR

## 8. Identidade brasileira/DX (não-negociável)

1. **Pix em primeiro lugar** — toda exibição de preço destaca Pix com 10% off antes de mencionar parcelamento
2. **WhatsApp como canal premium** — botão verde flutuante bottom-right + click-to-call no header + CTA na PDP. **WhatsApp ≠ azul**
3. **AnnouncementBar rotativa** com 5 mensagens: frete grátis acima de R$ 499 (1ª) → Pix → 12x → garantia 2 anos → atendimento
4. **Atacado como segunda persona** — link "Atacado" no menu primário + página dedicada com form que persiste no banco
5. **Compatibilidade veicular como diferencial #1** — toda PDP tem bloco "Veículos compatíveis" agrupado por marca; todo filtro de categoria tem cascata marca→modelo→ano via API real
6. **Garantia 2 anos direto com a loja** comunicada no announcement bar + 4 trust signals + bloco grande da PDP
7. **Tudo em pt-BR** para o usuário final; admin também em pt-BR
8. **Mobile-first sempre** — começa pelo celular, breakpoint `small:` (1024px) é o desktop
9. **Dark sempre** — sem light mode planejado

## 9. Assets já em uso

### Selos de segurança (em `/security/`)
- `ssl.svg` (SSL Seguro)
- `google-site-seguro-pt.svg` (Google Site Seguro)
- `reclame-aqui.svg` (Reclame Aqui)

### Bandeiras de pagamento (em `/payment/`)
- `pix.png` `visa.png` `mastercard.png` `elo.png` `amex.png` `hipercard.png` `discover.png` `boleto.png`

### Logo
- **PENDENTE** — hoje é só `<span class="text-brand-primary">DX</span> Automotive` em texto. Cliente vai fornecer SVG real.

### Fotos de produto
- **PENDENTES** — hoje aparece 📦 emoji como placeholder. Cliente vai fornecer.

### Banners do hero
- **PENDENTES** — hoje 3 slides com emojis 🚗 📱 🤝. Cliente vai fornecer.

## 10. Padrões de microcopy em pt-BR

- **CTAs:** "Adicionar ao carrinho", "Ver produto", "Continuar para entrega →", "Finalizar pedido", "Falar pelo WhatsApp"
- **Status:** "Aprovação imediata", "Esgotado", "Sob encomenda", "Pago", "Enviado", "Entregue"
- **Frete:** "Frete grátis acima de R$ 499 para todo o Brasil"
- **Pix:** "10% off pagando no Pix · aprovação imediata"
- **Parcelamento:** "em até 12x de R$ XXX sem juros"
- **Garantia:** "2 anos direto com a loja"
- **WhatsApp:** "Falar com vendedor", "Falar pelo WhatsApp", "Tirar dúvida"
- **Compatibilidade:** "Compatibilidade confirmada", "Veículos compatíveis", "Serve no meu carro?"
- **Atacado:** "Compre em volume", "Cotação rápida pelo WhatsApp", "Revendedor ou instalador?"
- **404:** "Página não encontrada"

## 11. Nomenclatura técnica

- **Storefront** = loja pública (Next.js)
- **Admin** = painel administrativo (Medusa Dashboard)
- **PDP** = Product Detail Page
- **PLP** = Product Listing Page (categoria)
- **CTA** = Call to Action
- **SKU** = unidade de produto vendável
- **Coleção** ≠ Categoria (coleção é agrupamento de marketing transversal; categoria é hierarquia do produto)
- **Veículo / Vehicle** = entidade compatibility (marca + modelo + ano)
- **Lead atacado** = cotação B2B persistida no banco

## 12. Estado da identidade — gaps reconhecidos

A IA pode propor melhorias **se** mantiver consistência com o que já existe.

### Pontos fortes atuais
- Paleta dark consistente, alto contraste
- Pix com badge própria + verde-água oficial
- WhatsApp tem cor própria (não confunde com primário)
- Eyebrow + título + descrição é um padrão que funciona
- Cards têm hover bem definido (border + shadow)
- Componentes ricos: TrustSignals, GuaranteeHighlight, FeaturedCollection com gradient

### Lacunas de design system identificadas
1. **Falta logo SVG real** — texto-only não escala pra mobile small nem favicon
2. **Sem design tokens secundários:** cores neutras `grey-*` existem no Tailwind mas não são usadas (somente brand-*)
3. **Tipografia mistura `font-extrabold` (800) com `font-bold` (700)** — pode unificar
4. **Sem documentação de iconografia** — hoje SVGs inline em cada componente, sem biblioteca consistente. Sugerimos padronizar com [Lucide](https://lucide.dev) ou similar
5. **Sem padrão pra ilustração** — emojis são fallback temporário (📦, 🚗, 🪞)
6. **Sem grid system formal** — usa Tailwind grid ad-hoc
7. **Skeleton loaders** existem mas estilo não documentado
8. **Estados focus** seguem o default Tailwind/Radix — pode ter um anel azul DX padronizado pra acessibilidade
9. **Animations** são variadas (`fade-in-right`, `fade-in-top`, `enter`, `slide-in`) — falta declarar quando usar cada uma
10. **Toast/notification** usa o do Medusa UI no admin; storefront não tem padrão definido
11. **Empty states** existem em várias telas (carrinho vazio, sem pedidos, sem coleções) mas com tom levemente diferente — pode unificar

## 13. O que pedir ao Claude.ai (sugestão de prompt)

> Tomando o documento DESIGN-SYSTEM-CONTEXT.md como base verdade do estado atual,
> proponha um **design system formal e expandido** mantendo:
> - Paleta `brand-*` exatamente como está
> - Padrões de eyebrow + título + descrição
> - Tom pt-BR e identidade automotiva BR
> - Mobile-first com breakpoint `small: 1024px`
>
> Entregue:
> 1. **Tabela de tokens** consolidada (cores + espaçamento + raios + tipografia + sombras + animações)
> 2. **Biblioteca de componentes** com 20-30 itens, cada um com (a) nome (b) anatomia (c) variantes (d) estados (e) regras de uso (f) Tailwind classes
> 3. **Padrões compostos**: PDP, listagem, checkout, conta, atacado — com hierarquia visual decidida
> 4. **Iconografia** — escolher 1 família (sugiro Lucide) e listar 30 ícones-chave do contexto automotivo
> 5. **Sistema de ilustrações** placeholders pra substituir emojis
> 6. **Voice & tone guide** — exemplos pt-BR do "como o DX fala": confiável, técnico-amigável, direto
> 7. **Padrão de motion/animação** — quando usar fade, slide, hover scale
> 8. **Logo brief** — diretrizes pra logo DX que se baseie no que já temos textualmente (azul + extrabold + uppercase)
> 9. **Specs de acessibilidade** — contraste, focus rings, sr-only patterns
> 10. **Versão print-ready** que eu possa colar no Tailwind config

## 14. Arquivos importantes para consultar

| Arquivo | Conteúdo |
|---|---|
| `apps/storefront/tailwind.config.js` | Tokens (cores, raios, breakpoints, animações) |
| `apps/storefront/src/styles/globals.css` | CSS vars + utility classes |
| `apps/storefront/src/lib/util/payment-display.ts` | Config canônica de Pix/parcelas |
| `apps/storefront/src/modules/products/components/product-card-dx/index.tsx` | Card de produto canônico |
| `apps/storefront/src/modules/products/components/trust-signals/index.tsx` | Padrão de selos de confiança |
| `apps/storefront/src/modules/products/components/guarantee-highlight/index.tsx` | Bloco grande de garantia |
| `apps/storefront/src/modules/collections/components/featured-collection/index.tsx` | Gradient com produtos |
| `apps/storefront/src/modules/checkout/components/step-card/index.tsx` | Step card padrão |
| `apps/storefront/src/modules/layout/templates/nav/index.tsx` | Header com WhatsApp + busca + categorias |
| `apps/storefront/src/modules/layout/templates/footer/index.tsx` | Footer com Newsletter + ícones pagamento + selos |
| `apps/storefront/src/modules/layout/components/announcement-bar/index.tsx` | 5 mensagens rotativas |
| `apps/backend/src/page-builder/manifests.ts` | Catálogo de blocos editáveis (Page Builder) |

---

## 15. Resumo executivo (pra a IA "entrar no clima")

DX Automotive é uma loja **dark, brasileira, técnica e direta** que vende acessório automotivo de **ticket alto** (R$ 1.500–8.000). A paleta é **preto + azul DX (#0066FF)** com verde-água Pix e verde WhatsApp como cores funcionais. Cada decisão visual reforça **confiança em compra digital de tecnologia automotiva**: Pix em destaque, WhatsApp em todos os pontos, garantia 2 anos repetida, compatibilidade veicular como bloco crítico da PDP. **Não confundir com loja de moda dark genérica** — aqui o cliente quer saber se serve no Civic 2018 dele e se chega em 7 dias úteis.

A IA deve preservar essa essência ao expandir o design system.
