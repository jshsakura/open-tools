import { getTranslations , setRequestLocale} from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolPageHeader } from "@/components/tool-page-header"
import { BannerGeneratorTool } from "@/components/tools/banner-generator"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("BannerGenerator.title"),
    description: t("BannerGenerator.description"),
    path: "/tools/banner-generator",
  })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function BannerGeneratorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Catalog" })
    const jsonLd = createToolJsonLd({
    locale,
    title: t("BannerGenerator.title"),
    description: t("BannerGenerator.description"),
    path: "/tools/banner-generator",
    category: "DesignApplication",
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <div className="mb-12 space-y-4">
        <ToolPageHeader title={t("BannerGenerator.title")} description={t("BannerGenerator.description")} toolId="banner-generator" />
      </div>
      <BannerGeneratorTool />
      <ToolGuide ns="BannerGenerator" />
    </div>
  )
}
