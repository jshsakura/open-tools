import { getTranslations } from "next-intl/server"
import { getToolById } from "@/lib/tools-catalog"
import { ToolPageHeader } from "@/components/tool-page-header"
import { ToolGuide } from "@/components/tool-guide-section"
import { SqlConverter } from "@/components/tools/sql-converter"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("SqlConverter.title"),
    description: t("SqlConverter.description"),
    path: "/tools/sql-converter",
  })
}

export default async function SqlConverterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })
  const tool = getToolById("sql-converter")
  const jsonLd = createToolJsonLd({
    locale,
    title: t("SqlConverter.title"),
    description: t("SqlConverter.description"),
    path: "/tools/sql-converter",
    category: "DeveloperApplication",
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <div className="mb-12 space-y-4">
        {tool && (
          <ToolPageHeader
            title={t.rich("SqlConverter.title", {
              span: (chunks) => <span className="text-primary">{chunks}</span>,
            })}
            description={t("SqlConverter.description")}
            icon={tool.icon}
            colorClass={tool.color}
          />
        )}
      </div>

      <SqlConverter />
      <ToolGuide ns="SqlConverter" />
    </div>
  )
}
