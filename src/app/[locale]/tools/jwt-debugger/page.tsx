import { getTranslations } from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolPageHeader } from "@/components/tool-page-header"
import { JwtDebugger } from "@/components/tools/jwt-debugger"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("JwtDebugger.title"),
    description: t("JwtDebugger.description"),
    path: "/tools/jwt-debugger",
  })
}

export default async function JwtDebuggerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "JwtDebugger" })
  const catalog = await getTranslations({ locale, namespace: "Catalog" })
  const tool = getToolById("jwt-debugger")
  const jsonLd = createToolJsonLd({
    locale,
    title: catalog("JwtDebugger.title"),
    description: catalog("JwtDebugger.description"),
    path: "/tools/jwt-debugger",
    category: "DeveloperApplication",
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <div className="mb-12 space-y-4">
        <ToolPageHeader
          title={t.rich("title", {
            span: (chunks) => <span className="text-primary">{chunks}</span>,
          })}
          description={t("description")}
          icon={tool?.icon}
          colorClass={tool?.color}
        />
      </div>
      <JwtDebugger />
      <ToolGuide ns="JwtDebugger" />
    </div>
  )
}
