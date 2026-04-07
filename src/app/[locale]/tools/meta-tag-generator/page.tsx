import { getTranslations } from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolPageHeader } from "@/components/tool-page-header"
import { MetaTagGenerator } from "@/components/tools/meta-tag-generator"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("MetaTagGenerator.title"),
    description: t("MetaTagGenerator.description"),
    path: "/tools/meta-tag-generator",
  })
}

export default async function MetaTagGeneratorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })
  const tool = getToolById("meta-tag-generator")
  const jsonLd = createToolJsonLd({
    locale,
    title: t("MetaTagGenerator.title"),
    description: t("MetaTagGenerator.description"),
    path: "/tools/meta-tag-generator",
    category: "DeveloperApplication",
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ToolPageHeader title={t("MetaTagGenerator.title")} description={t("MetaTagGenerator.description")} icon={tool?.icon} colorClass={tool?.color} />
      <MetaTagGenerator />
      <ToolGuide ns="MetaTagGenerator" />
    </div>
  )
}
