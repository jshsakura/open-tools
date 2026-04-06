import { getTranslations } from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolPageHeader } from "@/components/tool-page-header"
import { DiscountCalculatorTool } from "@/components/tools/discount-calculator"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("DiscountCalculator.title"),
    description: t("DiscountCalculator.description"),
    path: "/tools/discount-calculator",
  })
}

export default async function DiscountCalculatorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })
  const tool = getToolById("discount-calculator")
  const jsonLd = createToolJsonLd({
    locale,
    title: t("DiscountCalculator.title"),
    description: t("DiscountCalculator.description"),
    path: "/tools/discount-calculator",
    category: "FinanceApplication",
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ToolPageHeader title={t("DiscountCalculator.title")} description={t("DiscountCalculator.description")} icon={tool?.icon} colorClass={tool?.color} center />
      <DiscountCalculatorTool />
      <ToolGuide ns="DiscountCalculator" />
    </div>
  )
}
