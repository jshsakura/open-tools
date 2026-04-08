import { getTranslations , setRequestLocale} from "next-intl/server"
import { ToolPageHeader } from "@/components/tool-page-header"
import { ColorPaletteTool } from "@/components/tools/color-palette"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("ColorPalette.title"),
    description: t("ColorPalette.description"),
    path: "/tools/color-palette",
  })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function ColorPalettePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Catalog" })
    const jsonLd = createToolJsonLd({
    locale,
    title: t("ColorPalette.title"),
    description: t("ColorPalette.description"),
    path: "/tools/color-palette",
    category: "DesignApplication",
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <div className="mb-12 space-y-4">
        <ToolPageHeader title={t("ColorPalette.title")} description={t("ColorPalette.description")} toolId="color-palette" />
      </div>
      <ColorPaletteTool />
    </div>
  )
}
