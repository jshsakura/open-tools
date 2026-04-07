import { getTranslations } from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolPageHeader } from "@/components/tool-page-header"
import { RobotsTxtGenerator } from "@/components/tools/robots-txt-generator"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("RobotsTxtGenerator.title"),
    description: t("RobotsTxtGenerator.description"),
    path: "/tools/robots-txt-generator",
  })
}

export default async function RobotsTxtGeneratorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })
  const tool = getToolById("robots-txt-generator")
  const jsonLd = createToolJsonLd({
    locale,
    title: t("RobotsTxtGenerator.title"),
    description: t("RobotsTxtGenerator.description"),
    path: "/tools/robots-txt-generator",
    category: "DeveloperApplication",
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ToolPageHeader title={t("RobotsTxtGenerator.title")} description={t("RobotsTxtGenerator.description")} icon={tool?.icon} colorClass={tool?.color} />
      <RobotsTxtGenerator />
      <ToolGuide ns="RobotsTxtGenerator" />
    </div>
  )
}
