import { getTranslations } from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolPageHeader } from "@/components/tool-page-header"
import { CronGenerator } from "@/components/tools/cron-generator"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("CronGenerator.title"),
    description: t("CronGenerator.description"),
    path: "/tools/cron-generator",
  })
}

export default async function CronGeneratorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })
  const tool = getToolById("cron-generator")
  const jsonLd = createToolJsonLd({
    locale,
    title: t("CronGenerator.title"),
    description: t("CronGenerator.description"),
    path: "/tools/cron-generator",
    category: "DeveloperApplication",
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ToolPageHeader title={t("CronGenerator.title")} description={t("CronGenerator.description")} icon={tool?.icon} colorClass={tool?.color} center />
      <CronGenerator />
      <ToolGuide ns="CronGenerator" />
    </div>
  )
}
