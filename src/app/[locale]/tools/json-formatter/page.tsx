import { getTranslations , setRequestLocale} from "next-intl/server"
import { ToolPageHeader } from "@/components/tool-page-header"
import { JsonFormatterTool } from "@/components/tools/json-formatter"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("JsonFormatter.title"),
    description: t("JsonFormatter.description"),
    path: "/tools/json-formatter",
  })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function JsonFormatterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Catalog" })
    const jsonLd = createToolJsonLd({
    locale,
    title: t("JsonFormatter.title"),
    description: t("JsonFormatter.description"),
    path: "/tools/json-formatter",
    category: "DeveloperApplication",
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <div className="mb-12 space-y-4">
        <ToolPageHeader title={t("JsonFormatter.title")} description={t("JsonFormatter.description")} toolId="json-formatter" />
      </div>
      <JsonFormatterTool />
    </div>
  )
}
