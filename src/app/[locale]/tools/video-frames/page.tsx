import { getTranslations, setRequestLocale } from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { VideoFrames } from "@/components/tools/video-frames"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("VideoFrames.title"),
    description: t("VideoFrames.description"),
    path: "/tools/video-frames",
  })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }]
}

export default async function VideoFramesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: "Catalog" })
  const jsonLd = createToolJsonLd({
    locale,
    title: t("VideoFrames.title"),
    description: t("VideoFrames.description"),
    path: "/tools/video-frames",
    category: "MultimediaApplication",
  })

  return (
    <div className="container mx-auto py-10">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <VideoFrames />
      <ToolGuide ns="VideoFrames" />
    </div>
  )
}
