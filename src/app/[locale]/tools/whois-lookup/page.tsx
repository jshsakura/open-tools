import { getTranslations } from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolPageHeader } from "@/components/tool-page-header"
import { WhoisLookupTool } from "@/components/tools/whois-lookup"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("WhoisLookup.title"),
    description: t("WhoisLookup.description"),
    path: "/tools/whois-lookup",
  })
}

export default async function WhoisLookupPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })
  const tool = getToolById("whois-lookup")
  const jsonLd = createToolJsonLd({
    locale,
    title: t("WhoisLookup.title"),
    description: t("WhoisLookup.description"),
    path: "/tools/whois-lookup",
    category: "UtilitiesApplication",
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ToolPageHeader title={t("WhoisLookup.title")} description={t("WhoisLookup.description")} icon={tool?.icon} colorClass={tool?.color} />
      <WhoisLookupTool />
      <ToolGuide ns="WhoisLookup" />
    </div>
  )
}
