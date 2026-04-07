import { getTranslations } from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolPageHeader } from "@/components/tool-page-header"
import { ColorConverterTool } from "@/components/tools/color-converter"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("ColorConverter.title"),
    description: t("ColorConverter.description"),
    path: "/tools/color-converter",
  })
}

export default async function ColorConverterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })
  const tool = getToolById("color-converter")
  const jsonLd = createToolJsonLd({
    locale,
    title: t("ColorConverter.title"),
    description: t("ColorConverter.description"),
    path: "/tools/color-converter",
    category: "DesignApplication",
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ToolPageHeader title={t("ColorConverter.title")} description={t("ColorConverter.description")} icon={tool?.icon} colorClass={tool?.color} center />
      <ColorConverterTool />
      <ToolGuide ns="ColorConverter" />
    </div>
  )
}
