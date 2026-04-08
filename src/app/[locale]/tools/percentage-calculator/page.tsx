import { getTranslations , setRequestLocale} from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolPageHeader } from "@/components/tool-page-header"
import { PercentageCalculatorTool } from "@/components/tools/percentage-calculator"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("PercentageCalculator.title"),
    description: t("PercentageCalculator.description"),
    path: "/tools/percentage-calculator",
  })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function PercentageCalculatorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Catalog" })
    const jsonLd = createToolJsonLd({
    locale,
    title: t("PercentageCalculator.title"),
    description: t("PercentageCalculator.description"),
    path: "/tools/percentage-calculator",
    category: "FinanceApplication",
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ToolPageHeader title={t("PercentageCalculator.title")} description={t("PercentageCalculator.description")} toolId="percentage-calculator" center />
      <PercentageCalculatorTool />
      <ToolGuide ns="PercentageCalculator" />
    </div>
  )
}
