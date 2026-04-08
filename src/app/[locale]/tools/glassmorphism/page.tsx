import { getTranslations , setRequestLocale} from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolPageHeader } from "@/components/tool-page-header"
import { GlassmorphismTool } from "@/components/tools/glassmorphism"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("Glassmorphism.title"),
    description: t("Glassmorphism.description"),
    path: "/tools/glassmorphism",
  })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function GlassmorphismPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale);
    const tool = getToolById("glassmorphism")
  const t = await getTranslations({ locale, namespace: "Catalog" })
    const jsonLd = createToolJsonLd({
    locale,
    title: t("Glassmorphism.title"),
    description: t("Glassmorphism.description"),
    path: "/tools/glassmorphism",
    category: "DesignApplication",
  })

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <div className="mb-12 space-y-4">
        {tool && (
          <ToolPageHeader
            title={t.rich("Glassmorphism.title", {
              span: (chunks) => <span className="text-primary">{chunks}</span>,
            })}
            description={t("Glassmorphism.description")}
            toolId="glassmorphism"
          />
        )}
      </div>

      <GlassmorphismTool />
      <ToolGuide ns="Glassmorphism" />
    </div>
  )
}
