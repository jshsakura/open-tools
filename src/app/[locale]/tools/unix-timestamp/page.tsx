import { getTranslations } from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolPageHeader } from "@/components/tool-page-header"
import { UnixTimestamp } from "@/components/tools/unix-timestamp"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("UnixTimestamp.title"),
    description: t("UnixTimestamp.description"),
    path: "/tools/unix-timestamp",
  })
}

export default async function UnixTimestampPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })
  const tool = getToolById("unix-timestamp")
  const jsonLd = createToolJsonLd({
    locale,
    title: t("UnixTimestamp.title"),
    description: t("UnixTimestamp.description"),
    path: "/tools/unix-timestamp",
    category: "UtilitiesApplication",
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ToolPageHeader title={t("UnixTimestamp.title")} description={t("UnixTimestamp.description")} icon={tool?.icon} colorClass={tool?.color} center />
      <UnixTimestamp />
      <ToolGuide ns="UnixTimestamp" />
    </div>
  )
}
