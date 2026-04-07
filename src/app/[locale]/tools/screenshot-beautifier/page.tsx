import { getTranslations } from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolPageHeader } from "@/components/tool-page-header"
import { ScreenshotBeautifierTool } from "@/components/tools/screenshot-beautifier"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("ScreenshotBeautifier.title"),
    description: t("ScreenshotBeautifier.description"),
    path: "/tools/screenshot-beautifier",
  })
}

export default async function ScreenshotBeautifierPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "ScreenshotBeautifier" })
  const catalog = await getTranslations({ locale, namespace: "Catalog" })
  const tool = getToolById("screenshot-beautifier")
  const jsonLd = createToolJsonLd({
    locale,
    title: catalog("ScreenshotBeautifier.title"),
    description: catalog("ScreenshotBeautifier.description"),
    path: "/tools/screenshot-beautifier",
    category: "DesignApplication",
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      {tool && <ToolPageHeader title={t("title")} description={t("description")} icon={tool.icon} colorClass={tool.color} />}
      <ScreenshotBeautifierTool />
      <ToolGuide ns="ScreenshotBeautifier" />
    </div>
  )
}
