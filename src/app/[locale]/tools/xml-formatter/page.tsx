import { getTranslations , setRequestLocale} from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolPageHeader } from "@/components/tool-page-header"
import { XmlFormatterTool } from "@/components/tools/xml-formatter"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("XmlFormatter.title"),
    description: t("XmlFormatter.description"),
    path: "/tools/xml-formatter",
  })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function XmlFormatterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale);
    const tool = getToolById("xml-formatter")
  const t = await getTranslations({ locale, namespace: "Catalog" })
    const jsonLd = createToolJsonLd({
    locale,
    title: t("XmlFormatter.title"),
    description: t("XmlFormatter.description"),
    path: "/tools/xml-formatter",
    category: "DeveloperApplication",
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <div className="mb-12 space-y-4">
        {tool ? (
          <ToolPageHeader
            title={t.rich("XmlFormatter.title", {
              span: (chunks) => <span className="text-primary">{chunks}</span>,
            })}
            description={t("XmlFormatter.description")}
            toolId="xml-formatter"
          />
        ) : null}
      </div>
      <XmlFormatterTool />
      <ToolGuide ns="XmlFormatter" />
    </div>
  )
}
