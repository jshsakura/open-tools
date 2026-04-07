import { getTranslations } from "next-intl/server"
import { ScanText } from "lucide-react"
import { ToolPageHeader } from "@/components/tool-page-header"
import { OcrTool } from "@/components/tools/text-tools/ocr-tool"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("OcrTool.title"),
    description: t("OcrTool.description"),
    path: "/tools/ocr",
  })
}

export default async function OcrPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })
  const tool = getToolById("ocr")
  const jsonLd = createToolJsonLd({
    locale,
    title: t("OcrTool.title"),
    description: t("OcrTool.description"),
    path: "/tools/ocr",
    category: "UtilitiesApplication",
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ToolPageHeader
        title={t("OcrTool.title")}
        description={t("OcrTool.description")}
        icon={tool?.icon ?? ScanText}
        colorClass={tool?.color ?? "text-blue-500"}
      />
      <OcrTool />
    </div>
  )
}
