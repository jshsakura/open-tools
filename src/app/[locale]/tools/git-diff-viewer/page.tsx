import { getTranslations } from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolPageHeader } from "@/components/tool-page-header"
import { GitDiffViewerTool } from "@/components/tools/git-diff-viewer"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("GitDiffViewer.title"),
    description: t("GitDiffViewer.description"),
    path: "/tools/git-diff-viewer",
  })
}

export default async function GitDiffViewerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })
  const tool = getToolById("git-diff-viewer")
  const jsonLd = createToolJsonLd({
    locale,
    title: t("GitDiffViewer.title"),
    description: t("GitDiffViewer.description"),
    path: "/tools/git-diff-viewer",
    category: "DeveloperApplication",
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ToolPageHeader title={t("GitDiffViewer.title")} description={t("GitDiffViewer.description")} icon={tool?.icon} colorClass={tool?.color} />
      <GitDiffViewerTool />
      <ToolGuide ns="GitDiffViewer" />
    </div>
  )
}
