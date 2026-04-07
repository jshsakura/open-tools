import { getTranslations } from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolPageHeader } from "@/components/tool-page-header"
import { RegexTester } from "@/components/tools/regex-tester"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("RegexTester.title"),
    description: t("RegexTester.description"),
    path: "/tools/regex-tester",
  })
}

export default async function RegexTesterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })
  const tool = getToolById("regex-tester")
  const jsonLd = createToolJsonLd({
    locale,
    title: t("RegexTester.title"),
    description: t("RegexTester.description"),
    path: "/tools/regex-tester",
    category: "DeveloperApplication",
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ToolPageHeader title={t("RegexTester.title")} description={t("RegexTester.description")} icon={tool?.icon} colorClass={tool?.color} center />
      <RegexTester />
      <ToolGuide ns="RegexTester" />
    </div>
  )
}
