import { getTranslations , setRequestLocale} from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolPageHeader } from "@/components/tool-page-header"
import { YoutubeThumbnail } from "@/components/tools/youtube-thumbnail"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("YoutubeThumbnail.title"),
    description: t("YoutubeThumbnail.description"),
    path: "/tools/youtube-thumbnail",
  })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function YoutubeThumbnailPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale);
    const tool = getToolById("youtube-thumbnail")
  const catalog = await getTranslations({ locale, namespace: "Catalog" })
  const t = await getTranslations({ locale, namespace: "YoutubeThumbnail" })
    const jsonLd = createToolJsonLd({
    locale,
    title: catalog("YoutubeThumbnail.title"),
    description: catalog("YoutubeThumbnail.description"),
    path: "/tools/youtube-thumbnail",
    category: "UtilitiesApplication",
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <div className="mb-12 space-y-4">
        {tool ? (
          <ToolPageHeader
            title={t.rich("title", {
              span: (chunks) => <span className="text-primary">{chunks}</span>,
            })}
            description={t("description")}
            toolId="youtube-thumbnail"
            center
          />
        ) : null}
      </div>
      <YoutubeThumbnail />
      <ToolGuide ns="YoutubeThumbnail" />
    </div>
  )
}
