import { getTranslations , setRequestLocale} from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolPageHeader } from "@/components/tool-page-header"
import { Base64ImageTool } from "@/components/tools/base64-image"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("Base64Image.title"),
    description: t("Base64Image.description"),
    path: "/tools/base64-image",
  })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function Base64ImagePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Catalog" })
  const tool = getToolById("base64-image")
  const jsonLd = createToolJsonLd({
    locale,
    title: t("Base64Image.title"),
    description: t("Base64Image.description"),
    path: "/tools/base64-image",
    category: "UtilitiesApplication",
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <div className="mb-12 space-y-4">
        <ToolPageHeader title={t("Base64Image.title")} description={t("Base64Image.description")} toolId="base64-image" />
      </div>
      <Base64ImageTool />
      <ToolGuide ns="Base64Image" />
    </div>
  )
}
