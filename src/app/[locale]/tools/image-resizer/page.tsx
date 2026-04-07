import { getTranslations } from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolPageHeader } from "@/components/tool-page-header"
import { ImageResizerTool } from "@/components/tools/image-resizer"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("ImageResizer.title"),
    description: t("ImageResizer.description"),
    path: "/tools/image-resizer",
  })
}

export default async function ImageResizerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })
  const tool = getToolById("image-resizer")
  const jsonLd = createToolJsonLd({
    locale,
    title: t("ImageResizer.title"),
    description: t("ImageResizer.description"),
    path: "/tools/image-resizer",
    category: "UtilitiesApplication",
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <div className="mb-12 space-y-4">
        <ToolPageHeader title={t("ImageResizer.title")} description={t("ImageResizer.description")} icon={tool?.icon} colorClass={tool?.color} />
      </div>
      <ImageResizerTool />
      <ToolGuide ns="ImageResizer" />
    </div>
  )
}
