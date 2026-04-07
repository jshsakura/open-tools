import { getTranslations } from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolPageHeader } from "@/components/tool-page-header"
import { SubnetCalculatorTool } from "@/components/tools/subnet-calculator"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("SubnetCalculator.title"),
    description: t("SubnetCalculator.description"),
    path: "/tools/subnet-calculator",
  })
}

export default async function SubnetCalculatorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "SubnetCalculator" })
  const catT = await getTranslations({ locale, namespace: "Catalog" })
  const tool = getToolById("subnet-calculator")
  const jsonLd = createToolJsonLd({
    locale,
    title: catT("SubnetCalculator.title"),
    description: catT("SubnetCalculator.description"),
    path: "/tools/subnet-calculator",
    category: "DeveloperApplication",
  })

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      {tool && (
        <ToolPageHeader title={t("title")} description={t("description")} icon={tool.icon} colorClass={tool.color} />
      )}
      <SubnetCalculatorTool />
      <ToolGuide ns="SubnetCalculator" />
    </div>
  )
}
