import { getTranslations } from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolPageHeader } from "@/components/tool-page-header"
import { WebhookTesterTool } from "@/components/tools/webhook-tester"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("WebhookTester.title"),
    description: t("WebhookTester.description"),
    path: "/tools/webhook-tester",
  })
}

export default async function WebhookTesterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })
  const tool = getToolById("webhook-tester")
  const jsonLd = createToolJsonLd({
    locale,
    title: t("WebhookTester.title"),
    description: t("WebhookTester.description"),
    path: "/tools/webhook-tester",
    category: "DeveloperApplication",
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ToolPageHeader title={t("WebhookTester.title")} description={t("WebhookTester.description")} icon={tool?.icon} colorClass={tool?.color} />
      <WebhookTesterTool />
      <ToolGuide ns="WebhookTester" />
    </div>
  )
}
