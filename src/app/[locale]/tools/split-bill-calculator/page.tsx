import { getTranslations , setRequestLocale} from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolPageHeader } from "@/components/tool-page-header"
import { SplitBillCalculatorTool } from "@/components/tools/split-bill-calculator"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("SplitBillCalculator.title"),
    description: t("SplitBillCalculator.description"),
    path: "/tools/split-bill-calculator",
  })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function SplitBillCalculatorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Catalog" })
    const jsonLd = createToolJsonLd({
    locale,
    title: t("SplitBillCalculator.title"),
    description: t("SplitBillCalculator.description"),
    path: "/tools/split-bill-calculator",
    category: "FinanceApplication",
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ToolPageHeader title={t("SplitBillCalculator.title")} description={t("SplitBillCalculator.description")} toolId="split-bill-calculator" center />
      <SplitBillCalculatorTool />
      <ToolGuide ns="SplitBillCalculator" />
    </div>
  )
}
