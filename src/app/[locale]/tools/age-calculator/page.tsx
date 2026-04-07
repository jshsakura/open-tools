import { getTranslations } from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolPageHeader } from "@/components/tool-page-header"
import { AgeCalculatorTool } from "@/components/tools/age-calculator"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("AgeCalculator.title"),
    description: t("AgeCalculator.description"),
    path: "/tools/age-calculator",
  })
}

export default async function AgeCalculatorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })
  const tool = getToolById("age-calculator")
  const jsonLd = createToolJsonLd({
    locale,
    title: t("AgeCalculator.title"),
    description: t("AgeCalculator.description"),
    path: "/tools/age-calculator",
    category: "UtilitiesApplication",
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ToolPageHeader title={t("AgeCalculator.title")} description={t("AgeCalculator.description")} icon={tool?.icon} colorClass={tool?.color} center />
      <AgeCalculatorTool />
      <ToolGuide ns="AgeCalculator" />
    </div>
  )
}
