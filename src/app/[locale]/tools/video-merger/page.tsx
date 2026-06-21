import { getTranslations, setRequestLocale } from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { VideoMerger } from "@/components/tools/video-merger"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("VideoMerger.title"),
    description: t("VideoMerger.description"),
    path: "/tools/video-merger",
  })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function VideoMergerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Catalog" })
  const jsonLd = createToolJsonLd({
    locale,
    title: t("VideoMerger.title"),
    description: t("VideoMerger.description"),
    path: "/tools/video-merger",
    category: "MultimediaApplication",
  })

  return (
    <div className="container mx-auto py-10">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <VideoMerger />
      <ToolGuide ns="VideoMerger" />
    </div>
  )
}
