/**
 * Skeleton de card de produto — design v2.1.
 *
 * Usa a animação `shimmer` declarada no Tailwind (opacity 0.35 → 0.7).
 * Estrutura espelha o ProductCardDX real: imagem quadrada + corpo
 * com 5 linhas (categoria/título/título/preço/botão).
 */
const SkeletonProductCard = () => {
  return (
    <div className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden">
      <div className="aspect-square bg-brand-surface-2 animate-shimmer" />
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

export default SkeletonProductCard
