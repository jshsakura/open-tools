import { getTranslations , setRequestLocale} from "next-intl/server"
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

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function ScreenshotBeautifierPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale);
    const tool = getToolById("screenshot-beautifier")
  const t = await getTranslations({ locale, namespace: "ScreenshotBeautifier" })
  const catalog = await getTranslations({ locale, namespace: "Catalog" })
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
      {tool && <ToolPageHeader title={t("title")} description={t("description")} toolId="screenshot-beautifier" />}
      <ScreenshotBeautifierTool />
      <ToolGuide ns="ScreenshotBeautifier" />
    </div>
  )
}
