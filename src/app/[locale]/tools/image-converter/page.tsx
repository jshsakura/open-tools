import { getTranslations , setRequestLocale} from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { getToolById } from "@/lib/tools-catalog"
import { ToolPageHeader } from "@/components/tool-page-header"
import { ImageConverter } from "@/components/tools/image-converter"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("ImageConverter.title"),
    description: t("ImageConverter.description"),
    path: "/tools/image-converter",
  })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function ImageConverterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale);
    const tool = getToolById("image-converter")
  const t = await getTranslations({ locale, namespace: "Catalog" })
    const jsonLd = createToolJsonLd({
    locale,
    title: t("ImageConverter.title"),
    description: t("ImageConverter.description"),
    path: "/tools/image-converter",
    category: "UtilitiesApplication",
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <div className="mb-12 space-y-4">
        {tool && (
          <ToolPageHeader
            title={t.rich("ImageConverter.title", {
              span: (chunks) => <span className="text-primary">{chunks}</span>,
            })}
            description={t("ImageConverter.description")}
            toolId="image-converter"
          />
        )}
      </div>
      <ImageConverter />
      <ToolGuide ns="ImageConverter" />
    </div>
  )
}
