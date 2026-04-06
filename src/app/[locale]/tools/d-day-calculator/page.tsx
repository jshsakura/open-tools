import { getTranslations } from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolPageHeader } from "@/components/tool-page-header"
import { DDayCalculatorTool } from "@/components/tools/d-day-calculator"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("DDayCalculator.title"),
    description: t("DDayCalculator.description"),
    path: "/tools/d-day-calculator",
  })
}

export default async function DDayCalculatorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })
  const tool = getToolById("d-day-calculator")
  const jsonLd = createToolJsonLd({
    locale,
    title: t("DDayCalculator.title"),
    description: t("DDayCalculator.description"),
    path: "/tools/d-day-calculator",
    category: "UtilitiesApplication",
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ToolPageHeader title={t("DDayCalculator.title")} description={t("DDayCalculator.description")} icon={tool?.icon} colorClass={tool?.color} center />
      <DDayCalculatorTool />
      <ToolGuide ns="DDayCalculator" />
    </div>
  )
}
