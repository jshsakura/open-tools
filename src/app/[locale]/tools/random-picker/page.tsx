import { getTranslations } from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolPageHeader } from "@/components/tool-page-header"
import { RandomPickerTool } from "@/components/tools/random-picker"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("RandomPicker.title"),
    description: t("RandomPicker.description"),
    path: "/tools/random-picker",
  })
}

export default async function RandomPickerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })
  const tool = getToolById("random-picker")
  const jsonLd = createToolJsonLd({
    locale,
    title: t("RandomPicker.title"),
    description: t("RandomPicker.description"),
    path: "/tools/random-picker",
    category: "UtilitiesApplication",
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ToolPageHeader title={t("RandomPicker.title")} description={t("RandomPicker.description")} icon={tool?.icon} colorClass={tool?.color} center />
      <RandomPickerTool />
      <ToolGuide ns="RandomPicker" />
    </div>
  )
}
