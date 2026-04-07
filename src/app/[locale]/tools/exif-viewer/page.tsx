import { getTranslations } from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolPageHeader } from "@/components/tool-page-header"
import { ExifViewerTool } from "@/components/tools/exif-viewer"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("ExifViewer.title"),
    description: t("ExifViewer.description"),
    path: "/tools/exif-viewer",
  })
}

export default async function ExifViewerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })
  const tool = getToolById("exif-viewer")
  const jsonLd = createToolJsonLd({
    locale,
    title: t("ExifViewer.title"),
    description: t("ExifViewer.description"),
    path: "/tools/exif-viewer",
    category: "UtilitiesApplication",
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ToolPageHeader title={t("ExifViewer.title")} description={t("ExifViewer.description")} icon={tool?.icon} colorClass={tool?.color} />
      <ExifViewerTool />
      <ToolGuide ns="ExifViewer" />
    </div>
  )
}
