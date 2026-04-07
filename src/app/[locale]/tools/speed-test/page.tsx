import { getTranslations } from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolPageHeader } from "@/components/tool-page-header"
import { SpeedTestTool } from "@/components/tools/speed-test"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("SpeedTest.title"),
    description: t("SpeedTest.description"),
    path: "/tools/speed-test",
  })
}

export default async function SpeedTestPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const catalogT = await getTranslations({ locale, namespace: "Catalog" })
  const t = await getTranslations({ locale, namespace: "SpeedTest" })
  const tool = getToolById("speed-test")
  const jsonLd = createToolJsonLd({
    locale,
    title: catalogT("SpeedTest.title"),
    description: catalogT("SpeedTest.description"),
    path: "/tools/speed-test",
    category: "UtilitiesApplication",
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <div className="mb-12 space-y-4">
        <ToolPageHeader
          title={t.rich("title", {
            span: (chunks) => <span className="text-primary">{chunks}</span>,
          })}
          description={t("description")}
          icon={tool?.icon}
          colorClass={tool?.color}
        />
      </div>
      <SpeedTestTool />
      <ToolGuide ns="SpeedTest" />
    </div>
  )
}
