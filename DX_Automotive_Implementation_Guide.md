# DX Automotive — Guia de Implementação Visual
## Para Claude Code · Storefront Medusa + Next.js 15

> **Objetivo:** Aplicar o design system v2.1 completo no storefront Next.js da DX Automotive.
> Todas as decisões visuais foram validadas e aprovadas. Este documento é a fonte única da verdade para implementação.
> O arquivo de referência visual está em `DX_Automotive_Design_System_v2_KaBuM.html`.

---

## 1. CONTEXTO

O site está sendo construído sobre **Medusa.js v2** com **Next.js 15 (App Router)** e **Tailwind CSS**.
A identidade visual foi inspirada no KaBuM (estrutura de página) e adaptada à marca DX Automotive (dark, azul elétrico, inox cromado).
O site vende centrais multimídia, molduras, câmeras de ré e sensores de estacionamento para carros.

**Concorrência de referência:** kitssom.com.br · reidasmultimidias.com.br
**Diferencial:** filtro por marca+modelo+ano, verificador de compatibilidade, WhatsApp em cada produto, atacado integrado.

---

## 2. TOKENS CSS — `globals.css`

Substitua completamente as variáveis CSS existentes por este bloco. Adicionar em `:root`:

```css
:root {
  /* ── Fundos (azul-preto oficial da marca) */
  --brand-bg:           #050810;
  --brand-bg-deep:      #030610;
  --brand-surface:      #0D1528;
  --brand-surface-2:    #111E34;
  --brand-surface-3:    #162540;

  /* ── Bordas */
  --brand-border:       #1A2540;
  --brand-border-2:     #243050;

  /* ── Primária: azul elétrico do feixe do logo */
  --brand-primary:      #0088FF;
  --brand-primary-h:    #0066DD;
  --brand-primary-d:    #0044CC;

  /* ── Cyan: núcleo brilhante do feixe */
  --brand-cyan:         #00CCFF;

  /* ── Silver: cor "AUTO" no logo */
  --brand-silver:       #8AADCC;
  --brand-silver-dim:   #4A6880;

  /* ── Texto */
  --brand-text:         #E8F0F8;
  --brand-text-2:       #8AADCC;
  --brand-text-3:       #4A6880;

  /* ── Semânticas */
  --brand-success:      #00C851;
  --brand-warning:      #FF6B00;
  --brand-danger:       #FF3D3D;

  /* ── BR-específico */
  --brand-pix:          #32BCAD;
  --brand-wpp:          #25D366;
  --brand-wpp-hover:    #1DA851;

  /* ── Avaliações */
  --brand-star:         #FFB800;

  /* ── Gradientes oficiais */
  --grad-primary:       linear-gradient(135deg, #0099FF 0%, #0055DD 100%);
  --grad-electric:      linear-gradient(90deg, #00CCFF 0%, #0088FF 50%, #0044CC 100%);
  --grad-chrome:        linear-gradient(160deg, #F0F2F5 0%, #C4C8D0 30%, #8090A0 60%, #3A4050 100%);
  --grad-bg-deep:       linear-gradient(135deg, #0D1528 0%, #050810 100%);

  /* ── Glow (box-shadow) */
  --glow-primary:       0 0 20px rgba(0,136,255,.25), 0 0 40px rgba(0,100,220,.12);
  --glow-cyan:          0 0 16px rgba(0,204,255,.30), 0 0 32px rgba(0,136,255,.15);
  --glow-sm:            0 2px 12px rgba(0,120,255,.30);

  /* ── Sombras */
  --shadow-sm:          0 1px 4px rgba(0,0,0,.6);
  --shadow-md:          0 4px 20px rgba(0,0,0,.7);
  --shadow-lg:          0 8px 40px rgba(0,0,0,.8);
}
```

### Regras globais obrigatórias

```css
html { scroll-behavior: smooth; }

body {
  background: var(--brand-bg);
  color: var(--brand-text);
  font-family: 'Inter', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* Focus ring acessível — botões e links */
:focus-visible {
  outline: 2px solid rgba(0, 136, 255, .6);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Inputs sobrescrevem o focus-visible global (evita dupla marcação) */
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: none !important;
  box-shadow: none;
}
```

---

## 3. TAILWIND CONFIG — `tailwind.config.js`

```js
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg:           '#050810',
          'bg-deep':    '#030610',
          surface:      '#0D1528',
          'surface-2':  '#111E34',
          'surface-3':  '#162540',
          border:       '#1A2540',
          'border-2':   '#243050',
          primary:      '#0088FF',
          'primary-h':  '#0066DD',
          cyan:         '#00CCFF',
          silver:       '#8AADCC',
          'silver-dim': '#4A6880',
          text:         '#E8F0F8',
          'text-2':     '#8AADCC',
          'text-3':     '#4A6880',
          success:      '#00C851',
          warning:      '#FF6B00',
          danger:       '#FF3D3D',
          pix:          '#32BCAD',
          wpp:          '#25D366',
          'wpp-hover':  '#1DA851',
          star:         '#FFB800',
        }
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Barlow Condensed', 'sans-serif'],
      },
      screens: {
        '2xsmall': '320px',
        'xsmall':  '512px',
        'small':   '1024px',
        'medium':  '1280px',
        'large':   '1440px',
      },
      borderRadius: {
        xs:   '4px',
        sm:   '6px',
        DEFAULT: '8px',
        md:   '8px',
        lg:   '12px',
        xl:   '16px',
        '2xl':'20px',
      },
      backgroundImage: {
        'grad-primary':  'linear-gradient(135deg, #0099FF 0%, #0055DD 100%)',
        'grad-electric': 'linear-gradient(90deg, #00CCFF 0%, #0088FF 50%, #0044CC 100%)',
        'grad-chrome':   'linear-gradient(160deg, #F0F2F5 0%, #C4C8D0 30%, #8090A0 60%, #3A4050 100%)',
        'grad-bg-deep':  'linear-gradient(135deg, #0D1528 0%, #050810 100%)',
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(0,136,255,.25), 0 0 40px rgba(0,100,220,.12)',
        'glow-cyan':    '0 0 16px rgba(0,204,255,.30), 0 0 32px rgba(0,136,255,.15)',
        'glow-sm':      '0 2px 12px rgba(0,120,255,.30)',
      },
      keyframes: {
        'fade-in':  { from: { opacity:'0', transform:'translateY(8px)' }, to: { opacity:'1', transform:'none' } },
        'slide-in': { from: { transform:'translateX(-12px)', opacity:'0' }, to: { transform:'none', opacity:'1' } },
        'shimmer':  { from: { opacity:'.35' }, to: { opacity:'.7' } },
      },
      animation: {
        'fade-in':  'fade-in 0.4s ease both',
        'slide-in': 'slide-in 0.3s ease both',
        'shimmer':  'shimmer 1.3s ease-in-out infinite alternate',
      },
    }
  }
}
```

---

## 4. FONTES — `layout.tsx`

```tsx
import { Inter, Barlow_Condensed } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400','500','600','700','800'],
})

const barlow = Barlow_Condensed({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['700','800'],
})

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`dark ${inter.variable} ${barlow.variable}`}>
      <body className="bg-brand-bg text-brand-text font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
```

---

## 5. COMPONENTES — IMPLEMENTAÇÃO DETALHADA

### 5.1 Botões

```tsx
// btn-primary — gradiente oficial com glow
<button className="
  bg-grad-primary text-white font-bold text-sm
  px-6 py-3 rounded-md
  shadow-glow-sm hover:shadow-glow-primary
  transition-all duration-150
">
  Adicionar ao carrinho
</button>

// btn-buy — laranja (ação de compra imediata, urgência)
<button className="
  bg-brand-warning text-white font-bold text-[15px]
  px-7 py-[13px] rounded-md w-full
  hover:bg-[#E05A00] transition-colors duration-150
">
  Comprar agora
</button>

// btn-ghost
<button className="
  bg-transparent text-brand-text-2 font-semibold text-sm
  px-5 py-[10px] rounded-md
  border border-brand-border-2
  hover:border-brand-silver-dim hover:text-brand-text
  transition-all duration-150
">
  Cancelar
</button>

// btn-whatsapp
<button className="
  bg-brand-wpp text-white font-bold text-sm
  px-5 py-[10px] rounded-md
  flex items-center gap-2
  hover:bg-brand-wpp-hover transition-colors duration-150
">
  <WhatsAppIcon /> Falar com Vendedor
</button>

// btn-pix
<button className="
  bg-brand-pix/10 text-brand-pix font-bold text-sm
  px-5 py-[10px] rounded-md
  border border-brand-pix/25
  shadow-glow-cyan
  hover:bg-brand-pix/15 transition-all duration-150
">
  Pagar no Pix · 10% off
</button>
```

### 5.2 Badges / Pills

```tsx
// Em estoque
<span className="inline-flex items-center gap-1 text-[11px] font-bold
  bg-brand-success/10 text-brand-success
  px-2.5 py-0.5 rounded-full">
  <span className="w-1.5 h-1.5 rounded-full bg-brand-success" />
  Em estoque
</span>

// Oferta flash
<span className="text-[11px] font-black uppercase tracking-wide
  bg-brand-danger text-white px-2 py-0.5 rounded-[4px]">
  ⚡ 38% OFF
</span>

// Novo
<span className="text-[11px] font-black uppercase tracking-wide
  bg-brand-primary text-white px-2 py-0.5 rounded-[4px]">
  NOVO
</span>

// Compatível
<span className="text-[11px] font-bold
  bg-brand-success/10 text-brand-success
  border border-brand-success/25 px-2.5 py-0.5 rounded-full">
  ✓ Compatível
</span>

// Sob encomenda
<span className="text-[11px] font-bold
  bg-brand-warning/10 text-brand-warning
  border border-brand-warning/25 px-2.5 py-0.5 rounded-[4px]">
  Sob encomenda
</span>
```

### 5.3 Inputs e Selects

Regra crítica: **nunca** usar `outline` duplo. O container cuida do foco, o input interno tem `outline: none`.

```tsx
// Input base
<input
  className="
    w-full bg-brand-surface-2 text-brand-text text-sm
    px-3.5 py-2.5 rounded-md
    border border-brand-border
    placeholder:text-brand-text-3
    focus:border-brand-primary/50
    focus:shadow-[0_0_0_3px_rgba(0,136,255,0.08)]
    focus:outline-none
    transition-all duration-150
  "
/>

// Select
<select
  className="
    w-full bg-brand-surface text-brand-text text-sm
    px-3 py-2.5 rounded-md
    border border-brand-border
    focus:border-brand-primary/50 focus:outline-none
    cursor-pointer transition-colors duration-150
  "
/>

// Campo de busca (container cuida do foco)
<div className="
  flex-1 flex items-center gap-2
  bg-brand-surface-2 border border-brand-border
  rounded-md h-[42px] px-3.5
  focus-within:border-brand-primary/50
  focus-within:shadow-[0_0_0_2px_rgba(0,136,255,0.12)]
  transition-all duration-150 max-w-[560px]
">
  <SearchIcon className="text-brand-text-3 w-4 h-4 flex-shrink-0" />
  <input
    className="flex-1 bg-transparent border-none outline-none
      text-brand-text text-sm placeholder:text-brand-text-3"
    placeholder="Buscar central multimídia, câmera, sensor…"
  />
  <button className="bg-grad-primary text-white text-sm font-bold
    h-[34px] px-3.5 rounded-[6px] flex items-center gap-1.5
    shadow-glow-sm flex-shrink-0">
    Buscar
  </button>
</div>
```

---

## 6. ANNOUNCEMENT BAR — `AnnouncementBar.tsx`

5 mensagens rotativas. Fundo gradiente elétrico.

```tsx
'use client'
import { useState, useEffect } from 'react'

const messages = [
  '🚚 Frete grátis acima de R$ 499 para todo o Brasil',
  '⚡ Pix com 10% de desconto · aprovação imediata',
  '💳 Parcele em até 12x sem juros',
  '🛡️ Garantia 2 anos direto com a loja',
  '💬 Suporte via WhatsApp · Seg–Sáb 8h–18h',
]

export function AnnouncementBar() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % messages.length), 4000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="w-full px-6 py-2.5 flex items-center justify-center gap-3"
      style={{ background: 'linear-gradient(90deg, #00CCFF 0%, #0088FF 50%, #0044CC 100%)' }}>
      <button onClick={() => setIdx(i => (i - 1 + messages.length) % messages.length)}
        className="w-6 h-6 rounded-full bg-white/15 text-white text-xs flex items-center justify-center">
        ‹
      </button>
      <p className="text-white text-[13px] font-semibold text-center">
        {messages[idx]}
      </p>
      <button onClick={() => setIdx(i => (i + 1) % messages.length)}
        className="w-6 h-6 rounded-full bg-white/15 text-white text-xs flex items-center justify-center">
        ›
      </button>
    </div>
  )
}
```

---

## 7. NAVBAR — `nav/index.tsx`

Estrutura: AnnouncementBar → linha principal (logo + busca + CEP + conta + favoritos + carrinho) → linha de categorias.

```tsx
// Linha principal
<nav className="bg-brand-surface border-b border-brand-border">
  <div className="max-w-[1280px] mx-auto px-6 flex items-center h-[68px] gap-5">

    {/* Logo */}
    <div className="font-display text-[26px] font-extrabold flex-shrink-0">
      <span style={{
        background: 'linear-gradient(160deg, #E8F0F8, #8AADCC, #4A6880)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        filter: 'drop-shadow(0 0 8px rgba(0,136,255,.4))'
      }}>DX</span>
      <span className="text-brand-text font-semibold text-[20px]"> Automotive</span>
    </div>

    {/* Busca */}
    {/* usar componente de busca do item 5.3 */}

    {/* CEP */}
    <div className="flex-shrink-0 cursor-pointer">
      <p className="text-[10px] text-brand-text-3">Enviar para</p>
      <p className="text-[12px] font-semibold text-brand-text flex items-center gap-1">
        <PinIcon className="w-3 h-3" /> Digite o CEP ›
      </p>
    </div>

    {/* Conta */}
    <div className="flex-shrink-0 cursor-pointer">
      <p className="text-[10px] text-brand-text-3">Olá, visitante</p>
      <p className="text-[12px] font-bold text-brand-cyan">Entre ou cadastre-se ›</p>
    </div>

    {/* Favoritos */}
    <button className="w-[42px] h-[42px] rounded-md bg-brand-surface-2
      border border-brand-border text-brand-text-2
      flex items-center justify-center
      hover:border-brand-primary hover:text-brand-primary transition-all">
      <HeartIcon className="w-[18px] h-[18px]" />
    </button>

    {/* Carrinho */}
    <button className="relative w-[42px] h-[42px] rounded-md bg-brand-surface-2
      border border-brand-border text-brand-text-2
      flex items-center justify-center
      hover:border-brand-primary hover:text-brand-primary transition-all">
      <CartIcon className="w-[18px] h-[18px]" />
      <span className="absolute -top-1 -right-1 w-[17px] h-[17px]
        bg-grad-primary text-white text-[9px] font-black rounded-full
        flex items-center justify-center border-2 border-brand-bg">
        3
      </span>
    </button>
  </div>

  {/* Categorias */}
  <div className="max-w-[1280px] mx-auto px-6 flex items-center h-[42px] gap-1
    border-t border-brand-border">
    <NavCategoryItem label="≡ Departamentos" dropdown />
    <NavCategoryItem label="Multimídia" active />
    <NavCategoryItem label="Molduras" />
    <NavCategoryItem label="Câmera de Ré" />
    <NavCategoryItem label="Sensor" />
    <NavCategoryItem label="Iluminação" />
    <NavCategoryItem label="Sonorização" />
    <NavCategoryItem label="🔥 Ofertas" className="text-brand-warning font-bold ml-auto" />
    <NavCategoryItem label="Atacado ↗" className="text-brand-cyan font-bold" />
  </div>
</nav>

// Componente NavCategoryItem
function NavCategoryItem({ label, active, className }) {
  return (
    <button className={`
      text-[13px] font-semibold px-3 py-1.5 rounded-[6px]
      border-b-[3px] border-transparent -mb-px
      transition-all duration-150
      ${active
        ? 'text-brand-cyan bg-brand-primary/10 border-b-brand-cyan'
        : 'text-brand-text-2 hover:text-brand-text hover:bg-brand-surface-2 hover:border-b-brand-border-2'
      } ${className}
    `}>
      {label}
    </button>
  )
}
```

---

## 8. PRODUCT CARD — `product-card-dx/index.tsx`

Layout KaBuM: imagem 1:1 → badges → fav → corpo → categoria → nome → compat → stars → preço Pix (gradiente) → parcelamento → botão cart + botão WhatsApp.

```tsx
export function ProductCardDX({ product }) {
  return (
    <div className="
      bg-brand-surface border border-brand-border rounded-xl
      overflow-hidden flex flex-col
      transition-all duration-200
      hover:border-brand-primary hover:-translate-y-0.5 hover:shadow-lg
      group cursor-pointer
    ">
      {/* Imagem */}
      <div className="aspect-square bg-brand-surface-2 relative flex items-center justify-center">
        <Image src={product.thumbnail} alt={product.title} fill className="object-contain p-4" />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          {product.discount && (
            <span className="text-[11px] font-black uppercase bg-brand-danger text-white px-2 py-0.5 rounded-[4px]">
              ⚡ {product.discount}% OFF
            </span>
          )}
          {product.freeShipping && (
            <span className="text-[11px] font-black uppercase bg-brand-success text-white px-2 py-0.5 rounded-[4px]">
              FRETE GRÁTIS
            </span>
          )}
        </div>

        {/* Favorito — aparece no hover */}
        <button className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full
          bg-brand-surface border border-brand-border
          flex items-center justify-center text-brand-text-3
          opacity-0 group-hover:opacity-100 transition-opacity">
          ♡
        </button>
      </div>

      {/* Corpo */}
      <div className="p-3.5 flex flex-col gap-1.5 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[.15em] text-brand-cyan">
          {product.category}
        </p>

        <h3 className="text-[14px] font-semibold text-brand-text leading-[1.35]
          line-clamp-2">
          {product.title}
        </h3>

        {/* Compatibilidade */}
        {product.compat && (
          <p className="text-[11px] text-brand-text-2 flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-brand-success flex-shrink-0" />
            {product.compat}
          </p>
        )}

        {/* Stars */}
        <div className="flex items-center gap-1.5">
          <Stars rating={product.rating} />
          <span className="text-[11px] text-brand-text-2">({product.reviewCount})</span>
        </div>

        {/* Preço */}
        <div className="mt-1">
          {product.originalPrice && (
            <p className="text-[12px] text-brand-text-3 line-through">
              R$ {product.originalPrice}
            </p>
          )}
          <div className="flex items-baseline gap-1.5">
            {/* Gradiente elétrico no preço Pix */}
            <p className="text-[17px] font-black"
              style={{
                background: 'linear-gradient(90deg, #00CCFF, #0088FF, #0044CC)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
              R$ {product.pixPrice}
            </p>
            <span className="text-[10px] font-bold text-brand-pix
              bg-brand-pix/10 px-1.5 py-0.5 rounded-[4px]">
              PIX
            </span>
          </div>
          <p className="text-[11px] text-brand-text-2">
            ou <strong className="text-brand-text">{product.installments}x de R$ {product.installmentPrice}</strong> sem juros
          </p>
        </div>

        {/* CTAs */}
        <div className="flex gap-1.5 mt-auto pt-3">
          <button className="flex-1 bg-grad-primary text-white text-[13px] font-bold
            rounded-md py-2.5 shadow-glow-sm
            hover:shadow-glow-primary transition-all duration-150">
            Adicionar
          </button>
          <WhatsAppButton productName={product.title} productUrl={product.url} compact />
        </div>
      </div>
    </div>
  )
}
```

---

## 9. PDP — PÁGINA DE PRODUTO (3 COLUNAS)

Estrutura KaBuM: `grid-cols-[480px_1fr_320px]` desktop · stack mobile.

```
[Col 1 — Galeria]    [Col 2 — Info]                [Col 3 — Buy Box]
- Imagem principal   - Breadcrumb                  - Preço Pix (gradiente)
- Thumbnails         - Logo marca + código          - Preço cartão
- Zoom/swipe         - Título H1                   - Parcelamento
                     - Stars + nº reviews           - Estoque badge
                     - AI Summary (truncado)        - Btn Comprar agora (laranja)
                     - Verificador compat            - Btn Adicionar ao carrinho (azul)
                     - Abas (Desc/Spec/Reviews)     - Btn WhatsApp vendedor
                     - Descrição/Specs              - Btn Favoritar
                     - Avaliações                   - Calcular frete
                                                    - Trust signals
```

### 9.1 Buy Box

```tsx
<div className="bg-brand-surface border border-brand-primary/15 rounded-xl p-5
  sticky top-[72px] shadow-glow-primary">

  <p className="text-[11px] text-brand-text-2 mb-1">
    Vendido por <a className="text-brand-cyan font-semibold">DX Automotive</a>
    · <span className="text-brand-success font-bold">Loja oficial ✓</span>
  </p>

  <hr className="border-brand-border my-3" />

  {/* Preço original riscado */}
  <p className="text-[13px] text-brand-text-3 line-through">R$ 1.999,90</p>

  {/* Preço Pix — gradiente elétrico */}
  <div className="flex items-baseline gap-2 mb-0.5">
    <span className="text-[28px] font-black"
      style={{
        background: 'linear-gradient(90deg, #00CCFF, #0088FF, #0044CC)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
      R$ 1.249,90
    </span>
    <span className="text-[12px] font-bold text-brand-pix
      bg-brand-pix/10 px-2 py-0.5 rounded-[4px]">
      PIX 10% off
    </span>
  </div>
  <p className="text-[11px] text-brand-pix font-semibold mb-3">⚡ Aprovação imediata</p>

  <hr className="border-brand-border my-3" />

  {/* Preço cartão */}
  <p className="text-[15px] font-bold text-brand-text-2 mb-0.5">R$ 1.388,78 no cartão</p>
  <p className="text-[13px] text-brand-text-2 mb-4">
    ou <strong className="text-brand-text">10x de R$ 138,88</strong> sem juros
  </p>

  {/* Estoque */}
  <div className="flex items-center gap-2 text-[13px] font-semibold mb-4">
    <span className="w-2 h-2 rounded-full bg-brand-success flex-shrink-0" />
    <span className="text-brand-success">Em estoque</span>
    <span className="text-brand-text-2">· Envio em 1 dia útil</span>
  </div>

  {/* CTAs */}
  <div className="flex flex-col gap-2 mb-3">
    <button className="w-full bg-brand-warning text-white font-black text-[15px]
      py-3.5 rounded-md hover:bg-[#E05A00] transition-colors">
      Comprar agora
    </button>
    <button className="w-full bg-grad-primary text-white font-black text-[15px]
      py-3.5 rounded-md shadow-glow-sm hover:shadow-glow-primary transition-all">
      Adicionar ao carrinho
    </button>
    <button className="w-full flex items-center justify-center gap-2
      bg-brand-wpp/10 border border-brand-wpp/20 text-brand-wpp
      font-bold text-[13px] py-2.5 rounded-md
      hover:bg-brand-wpp/15 transition-all">
      <WhatsAppIcon /> Falar com Vendedor
    </button>
    <button className="w-full flex items-center justify-center gap-1.5
      bg-transparent border border-brand-border-2 text-brand-text-2
      font-semibold text-[13px] py-2.5 rounded-md
      hover:border-brand-silver-dim hover:text-brand-text transition-all">
      ♡ Adicionar aos favoritos
    </button>
  </div>

  {/* Calcular frete */}
  <div className="bg-brand-surface-2 border border-brand-border rounded-md p-3.5">
    <p className="text-[11px] font-bold uppercase tracking-[.1em] text-brand-text-3 mb-2">
      Calcular frete
    </p>
    <div className="flex gap-1.5">
      <input className="flex-1 bg-brand-surface border border-brand-border
        rounded-md text-[13px] text-brand-text px-3 py-2.5
        placeholder:text-brand-text-3 focus:border-brand-primary/50 focus:outline-none"
        placeholder="00000-000" />
      <button className="bg-grad-primary text-white font-bold text-[13px]
        px-4 rounded-md shadow-glow-sm">
        OK
      </button>
    </div>
  </div>

  {/* Trust signals */}
  <div className="flex flex-col gap-2 mt-3.5">
    {[
      ['🛡️', 'Garantia 2 anos direto com a loja'],
      ['🔒', 'Compra 100% segura'],
      ['🔄', 'Troca em até 7 dias'],
      ['🚚', 'Frete grátis neste produto'],
    ].map(([icon, text]) => (
      <div key={text} className="flex items-center gap-2 text-[12px] text-brand-text-2">
        <span>{icon}</span>{text}
      </div>
    ))}
  </div>
</div>
```

### 9.2 AI Summary (truncado com Ver mais)

```tsx
'use client'
import { useState } from 'react'

export function AiSummary({ items, descriptionRef }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? items : items.slice(0, 2)

  function handleVerMais(e) {
    e.preventDefault()
    setExpanded(true)
    setTimeout(() => {
      descriptionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  return (
    <div className="bg-brand-surface-2 border border-brand-border rounded-xl p-4 mb-5">
      <p className="text-[10px] font-bold uppercase tracking-[.15em] text-brand-cyan mb-2.5
        flex items-center gap-1.5">
        <SparklesIcon className="w-3.5 h-3.5" />
        Resumo gerado por IA
      </p>
      {visible.map((item, i) => (
        <div key={i} className="text-[13px] text-brand-text-2 py-1.5
          border-b border-brand-border last:border-none last:pb-0 flex gap-2">
          <span className="text-brand-primary text-base leading-[1.3] flex-shrink-0">•</span>
          <span dangerouslySetInnerHTML={{ __html: item }} />
        </div>
      ))}
      {!expanded && (
        <a onClick={handleVerMais} className="inline-flex items-center gap-1
          text-[12px] font-bold text-brand-primary mt-2.5 cursor-pointer
          hover:text-brand-cyan transition-colors">
          Ver mais
          <ChevronDownIcon className="w-3 h-3" />
        </a>
      )}
    </div>
  )
}
```

### 9.3 Tabs da PDP

```tsx
function PdpTabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-0 border-b border-brand-border mb-6" id="pdp-descricao">
      {tabs.map(tab => (
        <button key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            text-[13px] font-semibold px-[18px] py-2.5
            border-b-[3px] -mb-px rounded-t-md
            transition-all duration-150
            ${active === tab.id
              ? 'text-brand-cyan border-b-brand-cyan bg-brand-primary/10 font-bold'
              : 'text-brand-text-2 border-b-transparent hover:text-brand-text hover:bg-brand-surface-2 hover:border-b-brand-border-2'
            }
          `}>
          {tab.label}
        </button>
      ))}
    </div>
  )
}
```

### 9.4 Verificador de Compatibilidade

```tsx
export function CompatibilityChecker({ productId }) {
  const [marca, setMarca] = useState('')
  const [modelo, setModelo] = useState('')
  const [ano, setAno] = useState('')
  const [result, setResult] = useState(null)

  const selectClass = `w-full bg-brand-surface border border-brand-border
    rounded-md text-brand-text text-[13px] px-3 py-2.5
    focus:border-brand-primary/50 focus:outline-none cursor-pointer`

  return (
    <div className="bg-brand-surface-2 border border-brand-border rounded-xl p-5 mb-5">
      <p className="text-[14px] font-bold text-brand-text mb-3.5 flex items-center gap-2">
        <CheckCircleIcon className="w-4 h-4 text-brand-primary" />
        Serve no meu carro?
      </p>

      <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end">
        <div>
          <label className="text-[12px] font-semibold text-brand-text-2 block mb-1">Marca</label>
          <select className={selectClass} value={marca} onChange={e => setMarca(e.target.value)}>
            <option value="">Selecione</option>
            {/* opções carregadas via API */}
          </select>
        </div>
        <div>
          <label className="text-[12px] font-semibold text-brand-text-2 block mb-1">Modelo</label>
          <select className={selectClass} value={modelo} onChange={e => setModelo(e.target.value)}>
            <option value="">Selecione</option>
          </select>
        </div>
        <div>
          <label className="text-[12px] font-semibold text-brand-text-2 block mb-1">Ano</label>
          <select className={selectClass} value={ano} onChange={e => setAno(e.target.value)}>
            <option value="">Selecione</option>
          </select>
        </div>
        <button
          onClick={checkCompat}
          className="h-[42px] px-4 bg-grad-primary text-white font-bold text-[13px]
            rounded-md shadow-glow-sm self-end">
          Verificar
        </button>
      </div>

      {result === 'ok' && (
        <div className="mt-3 bg-brand-success/8 border border-brand-success/20
          rounded-md p-3 flex items-center gap-2.5">
          <span className="text-[20px] text-brand-success font-black">✓</span>
          <div>
            <p className="text-[13px] font-bold text-brand-success">Compatibilidade confirmada!</p>
            <p className="text-[11px] text-brand-text-2">Plug & play. Sem corte de chicote.</p>
          </div>
        </div>
      )}
    </div>
  )
}
```

---

## 10. CARRINHO — `cart/page.tsx`

Layout: `grid-cols-[1fr_360px]` desktop · stack mobile.

```tsx
// Item do carrinho
<div className="p-5 border-b border-brand-border flex gap-4 items-start">
  {/* Imagem */}
  <div className="w-[88px] h-[88px] flex-shrink-0 bg-brand-surface-2
    border border-brand-border rounded-md flex items-center justify-center">
    <Image ... />
  </div>

  {/* Info */}
  <div className="flex-1">
    <p className="text-[14px] font-semibold text-brand-text leading-[1.4] mb-1">{item.name}</p>
    <p className="text-[11px] text-brand-text-3 mb-2">SKU: {item.sku}</p>

    {/* Qty control */}
    <div className="flex items-center gap-0">
      <button className="w-8 h-8 bg-brand-surface-2 border border-brand-border
        rounded-l-md text-brand-text-2 font-bold
        hover:border-brand-primary hover:text-brand-primary transition-all">−</button>
      <input readOnly value={item.qty}
        className="w-11 h-8 bg-brand-surface-2 border-y border-brand-border
          text-brand-text text-[14px] font-bold text-center outline-none" />
      <button className="w-8 h-8 bg-brand-surface-2 border border-brand-border
        rounded-r-md text-brand-text-2 font-bold
        hover:border-brand-primary hover:text-brand-primary transition-all">+</button>
    </div>
  </div>

  {/* Preço */}
  <div className="text-right flex-shrink-0">
    <p className="text-[12px] text-brand-text-3 line-through mb-0.5">{item.original}</p>
    <p className="text-[17px] font-black"
      style={{ background: 'linear-gradient(90deg,#00CCFF,#0088FF,#0044CC)',
        WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
      {item.pixPrice}
    </p>
    <p className="text-[10px] text-brand-pix font-semibold">no Pix</p>
  </div>
</div>

// Resumo do carrinho
<div className="bg-brand-surface border border-brand-border rounded-xl p-5 sticky top-[72px]">
  <h2 className="text-[16px] font-black text-brand-text mb-4">Resumo do Pedido</h2>
  {/* linhas de subtotal/desconto/frete */}
  <hr className="border-brand-border my-3" />
  <div className="flex justify-between items-end">
    <span className="text-[14px] font-bold text-brand-text">Total</span>
    <div className="text-right">
      <p className="text-[24px] font-black"
        style={{ background:'var(--grad-electric)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
        R$ 1.529,75
      </p>
      <p className="text-[11px] text-brand-pix font-semibold">no Pix</p>
    </div>
  </div>
  <button className="w-full bg-grad-primary text-white font-black text-[15px]
    py-3.5 rounded-md mt-4 shadow-glow-sm hover:shadow-glow-primary transition-all">
    Continuar para entrega →
  </button>
</div>
```

---

## 11. CHECKOUT — 4 ETAPAS

### Stepper visual

```tsx
function CheckoutStepper({ currentStep }) {
  const steps = ['Endereço', 'Entrega', 'Pagamento', 'Revisão']
  return (
    <div className="flex items-center gap-0 mb-7">
      {steps.map((label, i) => {
        const step = i + 1
        const done   = step < currentStep
        const active = step === currentStep
        return (
          <>
            <div key={label} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center
                text-[12px] font-black border-2 flex-shrink-0
                ${done   ? 'bg-brand-success border-brand-success text-white'
                : active ? 'bg-brand-primary border-brand-primary text-white'
                :          'bg-transparent border-brand-border-2 text-brand-text-3'}`}>
                {done ? '✓' : step}
              </div>
              <span className={`text-[12px] font-bold
                ${active ? 'text-brand-text' : done ? 'text-brand-text-2' : 'text-brand-text-3'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-2 ${done ? 'bg-brand-success' : 'bg-brand-border-2'}`} />
            )}
          </>
        )
      })}
    </div>
  )
}
```

### Tabs de pagamento

```tsx
function PaymentTabs({ active, onChange }) {
  const tabs = [
    { id: 'pix',    icon: '⚡', label: 'Pix'    },
    { id: 'card',   icon: '💳', label: 'Cartão' },
    { id: 'boleto', icon: '📄', label: 'Boleto' },
  ]
  return (
    <div className="flex gap-2 mb-4">
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className={`flex-1 flex flex-col items-center gap-1.5 p-3
            rounded-md border-2 transition-all duration-150
            ${active === t.id
              ? 'border-brand-cyan bg-brand-primary/10 shadow-[0_0_0_1px_rgba(0,204,255,.15)]'
              : 'border-brand-border bg-brand-surface-2 hover:border-brand-border-2'
            }`}>
          <span className="text-[22px]">{t.icon}</span>
          <span className={`text-[11px] font-bold
            ${active === t.id ? 'text-brand-cyan' : 'text-brand-text-2'}`}>
            {t.label}
          </span>
        </button>
      ))}
    </div>
  )
}
```

### Bloco Pix com QR + timer

```tsx
function PixPayment({ amount, expiresIn }) {
  return (
    <div className="bg-brand-primary/10 border border-brand-primary/15
      rounded-xl p-6 flex gap-6 items-center shadow-glow-primary">
      <div className="w-[120px] h-[120px] bg-white rounded-md flex-shrink-0
        flex items-center justify-center text-[11px] font-bold text-gray-700">
        {/* QR Code gerado pelo MercadoPago */}
        <QRCode value={pixCode} size={104} />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[.15em] text-brand-cyan mb-1">
          Total com Pix 10% off
        </p>
        <p className="text-[32px] font-black mb-0.5"
          style={{ background:'var(--grad-electric)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
          R$ {amount}
        </p>
        <p className="text-[12px] text-brand-text-2 mb-3">Aprovação imediata</p>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[12px] font-semibold text-brand-text-2">Expira em:</span>
          <span className="text-[22px] font-black font-mono text-brand-warning">
            {formatTimer(expiresIn)}
          </span>
        </div>
        <button className="bg-grad-electric text-white font-bold text-[13px]
          px-5 py-2.5 rounded-md shadow-glow-cyan">
          📋 Copiar código Pix
        </button>
      </div>
    </div>
  )
}
```

---

## 12. REVIEWS — Seção de Avaliações

```tsx
// Header com score geral + barras
<div className="flex items-center gap-8 bg-brand-surface-2 border border-brand-border
  rounded-xl p-6 mb-5">
  {/* Score */}
  <div className="text-center flex-shrink-0">
    <p className="text-[56px] font-black leading-none"
      style={{ background:'var(--grad-chrome)',
        WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
      4.9
    </p>
    <Stars rating={4.9} size="lg" className="justify-center my-1" />
    <p className="text-[12px] text-brand-text-2">247 avaliações</p>
  </div>

  {/* Barras */}
  <div className="flex-1">
    {[5,4,3,2,1].map(star => (
      <div key={star} className="flex items-center gap-2.5 mb-1.5">
        <span className="text-[12px] text-brand-text-2 w-10 text-right flex-shrink-0">
          {star} ★
        </span>
        <div className="flex-1 h-2 bg-brand-surface-3 rounded-full overflow-hidden">
          <div className="h-full bg-brand-star rounded-full"
            style={{ width: `${starPercent[star]}%` }} />
        </div>
        <span className="text-[11px] text-brand-text-3 w-8 flex-shrink-0">
          {starCount[star]}
        </span>
      </div>
    ))}
  </div>
</div>

// Card de review individual
<div className="bg-brand-surface border border-brand-border rounded-xl p-5 mb-3">
  <div className="flex items-center justify-between mb-2.5">
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-full bg-brand-primary/10
        border border-brand-primary/15 flex items-center justify-center
        text-[13px] font-bold text-brand-primary flex-shrink-0">
        {initials}
      </div>
      <div>
        <p className="text-[13px] font-bold text-brand-text">{author}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <Stars rating={rating} size="sm" />
          <span className="text-[11px] text-brand-text-3">{date}</span>
        </div>
      </div>
    </div>
    <span className="text-[10px] font-bold text-brand-success
      bg-brand-success/10 px-2 py-0.5 rounded-full">
      ✓ Compra verificada
    </span>
  </div>
  <p className="text-[14px] text-brand-text-2 leading-[1.6] mb-2.5">{body}</p>
  <div className="flex items-center gap-2 text-[12px] text-brand-text-3">
    <span>Útil?</span>
    <button className="border border-brand-border rounded-[6px] px-2.5 py-1
      hover:border-brand-primary hover:text-brand-primary transition-all">
      👍 Sim ({yes})
    </button>
    <button className="border border-brand-border rounded-[6px] px-2.5 py-1
      hover:border-brand-danger hover:text-brand-danger transition-all">
      👎 Não ({no})
    </button>
  </div>
</div>
```

---

## 13. TRUST SIGNALS — `TrustSignals.tsx`

```tsx
const items = [
  { icon: '🚚', label: 'Frete grátis', sub: 'Acima de R$ 499',    color: 'primary' },
  { icon: '⚡', label: 'Pix 10% off',  sub: 'Aprovação imediata', color: 'pix'     },
  { icon: '🛡️', label: 'Garantia 2 anos', sub: 'Direto com a loja', color: 'success' },
  { icon: '💬', label: 'WhatsApp',     sub: 'Seg–Sáb 8h–18h',     color: 'wpp'     },
]

const iconBg = {
  primary: 'bg-brand-primary/10',
  pix:     'bg-brand-pix/10',
  success: 'bg-brand-success/10',
  wpp:     'bg-brand-wpp/10',
}

export function TrustSignals() {
  return (
    <div className="grid grid-cols-4 gap-px bg-brand-border rounded-xl overflow-hidden">
      {items.map(({ icon, label, sub, color }) => (
        <div key={label} className="bg-brand-surface p-4.5 flex items-center gap-3">
          <div className={`w-9 h-9 rounded-md flex items-center justify-center
            text-[20px] flex-shrink-0 ${iconBg[color]}`}>
            {icon}
          </div>
          <div>
            <p className="text-[13px] font-bold text-brand-text">{label}</p>
            <p className="text-[11px] text-brand-text-2">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
```

---

## 14. WHATSAPP FLUTUANTE — `WhatsAppFloat.tsx`

```tsx
export function WhatsAppFloat() {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
  const msg = encodeURIComponent('Olá! Preciso de ajuda com um produto da DX Automotive')

  return (
    <a href={`https://wa.me/${phone}?text=${msg}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50
        w-[52px] h-[52px] bg-brand-wpp rounded-full
        flex items-center justify-center
        shadow-[0_4px_16px_rgba(37,211,102,0.4)]
        hover:bg-brand-wpp-hover hover:scale-110
        transition-all duration-150"
      aria-label="Falar pelo WhatsApp">
      <WhatsAppIcon className="w-7 h-7 fill-white" />
    </a>
  )
}
```

---

## 15. EMPTY STATES

```tsx
function EmptyState({ icon, title, desc, action }) {
  return (
    <div className="bg-brand-surface-2 border border-dashed border-brand-border-2
      rounded-xl px-8 py-12 text-center">
      <div className="text-[42px] text-brand-border-2 mb-3.5">{icon}</div>
      <h3 className="text-[18px] font-black text-brand-text mb-1.5">{title}</h3>
      <p className="text-[13px] text-brand-text-2 mb-5">{desc}</p>
      {action}
    </div>
  )
}

// Uso:
<EmptyState
  icon="🛒"
  title="Carrinho vazio"
  desc="Adicione produtos para continuar"
  action={<Link href="/" className="btn-primary">Ver produtos</Link>}
/>
```

---

## 16. SKELETON LOADERS

```tsx
function SkeletonProductCard() {
  return (
    <div className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden">
      {/* Imagem */}
      <div className="aspect-square bg-brand-surface-2 animate-shimmer" />
      {/* Body */}
      <div className="p-3.5 flex flex-col gap-2.5">
        <div className="h-2.5 w-16 bg-brand-border rounded animate-shimmer" />
        <div className="h-3.5 w-full bg-brand-border rounded animate-shimmer" />
        <div className="h-3.5 w-4/5 bg-brand-border rounded animate-shimmer" />
        <div className="h-5 w-28 bg-brand-border rounded animate-shimmer mt-1" />
        <div className="h-9 w-full bg-brand-border rounded-md animate-shimmer mt-2" />
      </div>
    </div>
  )
}
```

---

## 17. TOASTS — Notificações

```tsx
// Usar react-hot-toast ou sonner configurado com o tema DX
import { Toaster, toast } from 'sonner'

// Em layout.tsx
<Toaster
  theme="dark"
  toastOptions={{
    style: {
      background: '#111E34',
      border: '1.5px solid #1A2540',
      color: '#E8F0F8',
      borderRadius: '12px',
    },
  }}
/>

// Uso
toast.success('Produto adicionado ao carrinho!', {
  description: 'Central Multimídia 9" — Toyota Corolla',
})
toast.error('Erro ao processar pagamento')
toast('Pix expira em 28:47', { icon: '⚡' })
```

---

## 18. FOOTER — `footer/index.tsx`

```tsx
<footer className="bg-brand-bg-deep border-t border-brand-border pt-12 pb-6 px-6">
  <div className="max-w-[1280px] mx-auto">
    <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-10 mb-10">

      {/* Coluna da marca */}
      <div>
        {/* Logo igual ao navbar */}
        <p className="text-[13px] text-brand-text-2 leading-[1.6] mt-3 mb-4 max-w-[280px]">
          Tecnologia automotiva premium — centrais multimídia, câmeras,
          sensores e sonorização com garantia de 2 anos.
        </p>
        {/* Redes sociais */}
      </div>

      {/* Colunas de links */}
      {[
        { title: 'Produtos', links: ['Multimídia','Molduras','Câmera de Ré','Sensor','Iluminação','Sonorização'] },
        { title: 'Minha Conta', links: ['Entrar / Cadastrar','Meus Pedidos','Rastrear Pedido','Favoritos','Atacado'] },
        { title: 'Atendimento', links: ['WhatsApp','Garantia','Trocas','Entrega','Privacidade (LGPD)'] },
      ].map(col => (
        <div key={col.title}>
          <p className="text-[12px] font-black uppercase tracking-[.12em]
            text-brand-text mb-3.5">{col.title}</p>
          {col.links.map(link => (
            <a key={link} className="block text-[13px] text-brand-text-2 mb-2
              hover:text-brand-cyan transition-colors cursor-pointer">{link}</a>
          ))}
        </div>
      ))}
    </div>

    {/* Pagamentos */}
    <div className="border-t border-brand-border pt-6 mb-6">
      <p className="text-[11px] font-bold uppercase tracking-[.1em]
        text-brand-text-3 mb-3">Formas de Pagamento</p>
      <div className="flex flex-wrap gap-1.5">
        {['PIX','VISA','MASTER','ELO','AMEX','HIPERCARD','BOLETO'].map(m => (
          <span key={m} className="text-[10px] font-black text-brand-text-2
            bg-brand-surface-2 border border-brand-border
            px-2 py-1 rounded-[4px]">{m}</span>
        ))}
      </div>
    </div>

    {/* Bottom */}
    <div className="flex items-center justify-between border-t border-brand-border pt-5">
      <p className="text-[12px] text-brand-text-3">
        © 2026 DX Automotive — CNPJ 23.248.724/0001-54. Todos os direitos reservados.
      </p>
      <div className="flex gap-2">
        {['🔒 SSL Seguro','✓ Reclame Aqui','🛡️ Google Seguro'].map(s => (
          <span key={s} className="text-[10px] font-bold text-brand-text-2
            bg-brand-surface-2 border border-brand-border
            px-2.5 py-1.5 rounded-[6px]">{s}</span>
        ))}
      </div>
    </div>
  </div>
</footer>
```

---

## 19. REGRAS OBRIGATÓRIAS — NUNCA VIOLAR

1. **Dark sempre** — `bg-white`, `bg-gray-*`, `text-black` são proibidos em telas do cliente final.
2. **Gradiente nos preços Pix** — usar sempre `var(--grad-electric)` com `WebkitBackgroundClip: 'text'`.
3. **Gradiente nos CTAs primários** — `var(--grad-primary)` + `shadow-glow-sm` em todo botão principal.
4. **Botão "Comprar agora" é laranja** (`bg-brand-warning`) — criar urgência. Não mudar para azul.
5. **WhatsApp é verde** (`bg-brand-wpp`) — nunca usar azul no WhatsApp, confunde com primário.
6. **Inputs sem dupla marcação** — container cuida do `focus-within`, input interno tem `outline: none !important`.
7. **Tabs ativas em cyan** (`text-brand-cyan` + `border-brand-cyan`) — não em azul puro.
8. **Mobile-first** — breakpoint principal: `small:` = 1024px. Começar pelo celular.
9. **Pix em primeiro lugar** no checkout — tab Pix é sempre a primeira e padrão.
10. **Logo DX** usa gradiente cromo (`var(--grad-chrome)`) com `drop-shadow` azul.
11. **Frete grátis acima de R$ 499** — comunicar em todos os pontos de contato (announcement bar, carrinho, produto).
12. **Texto sempre pt-BR** — nenhuma string em inglês para o usuário final.

---

## 20. ORDEM DE IMPLEMENTAÇÃO RECOMENDADA

1. `globals.css` — tokens e regras globais
2. `tailwind.config.js` — cores, gradientes, animações
3. `layout.tsx` — fontes, dark class
4. `AnnouncementBar.tsx` — barra rotativa
5. `nav/index.tsx` — navbar completa com busca
6. `product-card-dx/index.tsx` — card canônico
7. `TrustSignals.tsx` — barra de confiança
8. `WhatsAppFloat.tsx` — botão flutuante
9. PDP — `product/[handle]/page.tsx` com 3 colunas
10. `CompatibilityChecker.tsx` — verificador
11. `AiSummary.tsx` — resumo truncado
12. `cart/page.tsx` — carrinho
13. `checkout/page.tsx` — 4 etapas com Pix
14. Reviews — seção de avaliações
15. `footer/index.tsx` — rodapé

---

*Documento gerado em Maio de 2026 — DX Automotive / Cristiano Bernardes*
*Referência visual: `DX_Automotive_Design_System_v2_KaBuM.html`*
