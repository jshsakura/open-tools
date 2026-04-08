import { getTranslations , setRequestLocale} from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolPageHeader } from "@/components/tool-page-header"
import { BrowserInfoTool } from "@/components/tools/browser-info"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("BrowserInfo.title"),
    description: t("BrowserInfo.description"),
    path: "/tools/browser-info",
  })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function BrowserInfoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Catalog" })
    const jsonLd = createToolJsonLd({
    locale,
    title: t("BrowserInfo.title"),
    description: t("BrowserInfo.description"),
    path: "/tools/browser-info",
    category: "UtilitiesApplication",
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <div className="mb-12 space-y-4">
        <ToolPageHeader title={t("BrowserInfo.title")} description={t("BrowserInfo.description")} toolId="browser-info" />
      </div>
      <BrowserInfoTool />
      <ToolGuide ns="BrowserInfo" />
    </div>
  )
}
