import { getTranslations, setRequestLocale } from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolPageHeader } from "@/components/tool-page-header"
import { JsonDiff } from "@/components/tools/json-diff"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("JsonDiff.title"),
    description: t("JsonDiff.description"),
    path: "/tools/json-diff",
  })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function JsonDiffPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: "Catalog" })
  
  const jsonLd = createToolJsonLd({
    locale,
    title: t("JsonDiff.title"),
    description: t("JsonDiff.description"),
    path: "/tools/json-diff",
    category: "DeveloperApplication",
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ToolPageHeader title={t("JsonDiff.title")} description={t("JsonDiff.description")} toolId="json-diff" center />
      <JsonDiff />
      <ToolGuide ns="JsonDiff" />
    </div>
  )
}
