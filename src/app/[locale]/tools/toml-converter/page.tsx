import { getTranslations , setRequestLocale} from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolPageHeader } from "@/components/tool-page-header"
import { TomlConverterTool } from "@/components/tools/toml-converter"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("TomlConverter.title"),
    description: t("TomlConverter.description"),
    path: "/tools/toml-converter",
  })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function TomlConverterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale);
    const tool = getToolById("toml-converter")
  const t = await getTranslations({ locale, namespace: "TomlConverter" })
  const catT = await getTranslations({ locale, namespace: "Catalog" })
    const jsonLd = createToolJsonLd({
    locale,
    title: catT("TomlConverter.title"),
    description: catT("TomlConverter.description"),
    path: "/tools/toml-converter",
    category: "DeveloperApplication",
  })

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ToolPageHeader title={t("title")} description={t("description")} toolId="toml-converter" />
      <TomlConverterTool />
      <ToolGuide ns="TomlConverter" />
    </div>
  )
}
