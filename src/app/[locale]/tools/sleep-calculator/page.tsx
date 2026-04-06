import { getTranslations } from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolPageHeader } from "@/components/tool-page-header"
import { SleepCalculatorTool } from "@/components/tools/sleep-calculator"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("SleepCalculator.title"),
    description: t("SleepCalculator.description"),
    path: "/tools/sleep-calculator",
  })
}

export default async function SleepCalculatorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })
  const tool = getToolById("sleep-calculator")
  const jsonLd = createToolJsonLd({
    locale,
    title: t("SleepCalculator.title"),
    description: t("SleepCalculator.description"),
    path: "/tools/sleep-calculator",
    category: "HealthApplication",
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ToolPageHeader title={t("SleepCalculator.title")} description={t("SleepCalculator.description")} icon={tool?.icon} colorClass={tool?.color} center />
      <SleepCalculatorTool />
      <ToolGuide ns="SleepCalculator" />
    </div>
  )
}
