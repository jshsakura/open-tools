import { getTranslations } from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolPageHeader } from "@/components/tool-page-header"
import { SqlFormatter } from "@/components/tools/sql-formatter"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("SqlFormatter.title"),
    description: t("SqlFormatter.description"),
    path: "/tools/sql-formatter",
  })
}

export default async function SqlFormatterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })
  const tool = getToolById("sql-formatter")
  const jsonLd = createToolJsonLd({
    locale,
    title: t("SqlFormatter.title"),
    description: t("SqlFormatter.description"),
    path: "/tools/sql-formatter",
    category: "DeveloperApplication",
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <div className="mb-12 space-y-4">
        {tool ? <ToolPageHeader title={t("SqlFormatter.title")} description={t("SqlFormatter.description")} icon={tool.icon} colorClass={tool.color} /> : null}
      </div>
      <SqlFormatter />
      <ToolGuide ns="SqlFormatter" />
    </div>
  )
}
