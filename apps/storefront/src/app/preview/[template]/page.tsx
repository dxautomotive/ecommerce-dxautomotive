import { notFound } from "next/navigation"
import { getRegion } from "@lib/data/regions"
import { getPageTemplateDraft } from "@lib/data/page-builder-draft"
import { SECTION_MAP } from "@modules/page-builder/section-map"
import PreviewRefreshListener from "./preview-refresh-listener"

export const revalidate = 0

const ALLOWED = ["home"] as const

type Props = {
  params: Promise<{ template: string }>
  searchParams: Promise<{ countryCode?: string }>
}

export default async function PreviewPage({ params, searchParams }: Props) {
  const { template: templateName } = await params
  const { countryCode = "br" } = await searchParams

  if (!ALLOWED.includes(templateName as (typeof ALLOWED)[number])) {
    notFound()
  }

  const [template, region] = await Promise.all([
    getPageTemplateDraft(templateName as "home"),
    getRegion(countryCode).catch(() => null),
  ])

  if (!template || !region) return null

  const rendered = await Promise.all(
    template.order.map(async (id) => {
      const section = template.sections[id]
      if (!section) return null
      const renderer = SECTION_MAP[section.type]
      if (!renderer) return null
      try {
        return await Promise.resolve(renderer(section, { countryCode }))
      } catch {
        return null
      }
    })
  )

  return (
    <>
      <PreviewRefreshListener />
      <div style={{ paddingTop: 26 }}>
        {rendered.map((node, i) => (
          <div key={template.order[i]}>{node}</div>
        ))}
      </div>
    </>
  )
}
