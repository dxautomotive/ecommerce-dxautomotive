import Spinner from "@modules/common/icons/spinner"

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full py-16 gap-3 text-brand-muted">
      <Spinner size={36} />
      <span className="text-sm">Carregando…</span>
    </div>
  )
}
