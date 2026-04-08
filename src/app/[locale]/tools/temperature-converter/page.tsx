import { getTranslations , setRequestLocale} from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolPageHeader } from "@/components/tool-page-header"
import { TemperatureConverterTool } from "@/components/tools/temperature-converter"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("TemperatureConverter.title"),
    description: t("TemperatureConverter.description"),
    path: "/tools/temperature-converter",
  })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function TemperatureConverterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Catalog" })
    const jsonLd = createToolJsonLd({
    locale,
    title: t("TemperatureConverter.title"),
    description: t("TemperatureConverter.description"),
    path: "/tools/temperature-converter",
    category: "UtilitiesApplication",
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ToolPageHeader title={t("TemperatureConverter.title")} description={t("TemperatureConverter.description")} toolId="temperature-converter" center />
      <TemperatureConverterTool />
      <ToolGuide ns="TemperatureConverter" />
    </div>
  )
}
