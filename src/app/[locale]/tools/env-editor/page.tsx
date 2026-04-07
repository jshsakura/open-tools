import { getTranslations } from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolPageHeader } from "@/components/tool-page-header"
import { EnvEditorTool } from "@/components/tools/env-editor"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("EnvEditor.title"),
    description: t("EnvEditor.description"),
    path: "/tools/env-editor",
  })
}

export default async function EnvEditorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })
  const tool = getToolById("env-editor")
  const jsonLd = createToolJsonLd({
    locale,
    title: t("EnvEditor.title"),
    description: t("EnvEditor.description"),
    path: "/tools/env-editor",
    category: "DeveloperApplication",
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ToolPageHeader title={t("EnvEditor.title")} description={t("EnvEditor.description")} icon={tool?.icon} colorClass={tool?.color} />
      <EnvEditorTool />
      <ToolGuide ns="EnvEditor" />
    </div>
  )
}
