import { getTranslations , setRequestLocale} from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolPageHeader } from "@/components/tool-page-header"
import { SvgOptimizerTool } from "@/components/tools/svg-optimizer"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("SvgOptimizer.title"),
    description: t("SvgOptimizer.description"),
    path: "/tools/svg-optimizer",
  })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function SvgOptimizerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale);
    const tool = getToolById("svg-optimizer")
  const t = await getTranslations({ locale, namespace: "SvgOptimizer" })
  const catT = await getTranslations({ locale, namespace: "Catalog" })
    const jsonLd = createToolJsonLd({
    locale,
    title: catT("SvgOptimizer.title"),
    description: catT("SvgOptimizer.description"),
    path: "/tools/svg-optimizer",
    category: "DeveloperApplication",
  })

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ToolPageHeader title={t("title")} description={t("description")} toolId="svg-optimizer" />
      <SvgOptimizerTool />
      <ToolGuide ns="SvgOptimizer" />
    </div>
  )
}
