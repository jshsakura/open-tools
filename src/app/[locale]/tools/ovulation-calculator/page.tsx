import { getTranslations } from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolPageHeader } from "@/components/tool-page-header"
import { OvulationCalculatorTool } from "@/components/tools/ovulation-calculator"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("OvulationCalculator.title"),
    description: t("OvulationCalculator.description"),
    path: "/tools/ovulation-calculator",
  })
}

export default async function OvulationCalculatorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })
  const tool = getToolById("ovulation-calculator")
  const jsonLd = createToolJsonLd({
    locale,
    title: t("OvulationCalculator.title"),
    description: t("OvulationCalculator.description"),
    path: "/tools/ovulation-calculator",
    category: "HealthApplication",
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ToolPageHeader title={t("OvulationCalculator.title")} description={t("OvulationCalculator.description")} icon={tool?.icon} colorClass={tool?.color} center />
      <OvulationCalculatorTool />
      <ToolGuide ns="OvulationCalculator" />
    </div>
  )
}
