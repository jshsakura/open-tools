import { getTranslations , setRequestLocale} from "next-intl/server"
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

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function ImageResizerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Catalog" })
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
        <ToolPageHeader title={t("ImageResizer.title")} description={t("ImageResizer.description")} toolId="image-resizer" />
      </div>
      <ImageResizerTool />
      <ToolGuide ns="ImageResizer" />
    </div>
  )
}
