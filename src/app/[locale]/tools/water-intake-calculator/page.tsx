import { getTranslations } from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolPageHeader } from "@/components/tool-page-header"
import { WaterIntakeCalculatorTool } from "@/components/tools/water-intake-calculator"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("WaterIntakeCalculator.title"),
    description: t("WaterIntakeCalculator.description"),
    path: "/tools/water-intake-calculator",
  })
}

export default async function WaterIntakeCalculatorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })
  const tool = getToolById("water-intake-calculator")
  const jsonLd = createToolJsonLd({
    locale,
    title: t("WaterIntakeCalculator.title"),
    description: t("WaterIntakeCalculator.description"),
    path: "/tools/water-intake-calculator",
    category: "HealthApplication",
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ToolPageHeader title={t("WaterIntakeCalculator.title")} description={t("WaterIntakeCalculator.description")} icon={tool?.icon} colorClass={tool?.color} center />
      <WaterIntakeCalculatorTool />
      <ToolGuide ns="WaterIntakeCalculator" />
    </div>
  )
}
