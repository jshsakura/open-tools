import { getTranslations , setRequestLocale} from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolPageHeader } from "@/components/tool-page-header"
import { JsonYamlConverter } from "@/components/tools/json-yaml-converter"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("JsonYaml.title"),
    description: t("JsonYaml.description"),
    path: "/tools/json-yaml-converter",
  })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function JsonYamlPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale);
    const tool = getToolById("json-yaml-converter")
  const t = await getTranslations({ locale, namespace: "JsonYaml" })
  const catalog = await getTranslations({ locale, namespace: "Catalog" })
    const jsonLd = createToolJsonLd({
    locale,
    title: catalog("JsonYaml.title"),
    description: catalog("JsonYaml.description"),
    path: "/tools/json-yaml-converter",
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
          toolId="json-yaml-converter"
          colorClass={tool?.color}
        />
      </div>
      <JsonYamlConverter />
      <ToolGuide ns="JsonYaml" />
    </div>
  )
}
