import { getTranslations , setRequestLocale} from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolPageHeader } from "@/components/tool-page-header"
import { QrGenerator } from "@/components/tools/qr-generator"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("QrGenerator.title"),
    description: t("QrGenerator.description"),
    path: "/tools/qr-generator",
  })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function QrGeneratorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale);
    const tool = getToolById("qr-generator")
  const t = await getTranslations({ locale, namespace: "QrGenerator" })
  const catalog = await getTranslations({ locale, namespace: "Catalog" })
    const jsonLd = createToolJsonLd({
    locale,
    title: catalog("QrGenerator.title"),
    description: catalog("QrGenerator.description"),
    path: "/tools/qr-generator",
    category: "UtilitiesApplication",
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
          toolId="qr-generator"
          colorClass={tool?.color}
        />
      </div>
      <QrGenerator />
      <ToolGuide ns="QrGenerator" />
    </div>
  )
}
