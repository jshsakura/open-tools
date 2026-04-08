import { getTranslations , setRequestLocale} from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { VideoConverter } from "@/components/tools/video-converter"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("VideoConverter.title"),
    description: t("VideoConverter.description"),
    path: "/tools/video-converter",
  })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function VideoConverterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Catalog" })
  const jsonLd = createToolJsonLd({
    locale,
    title: t("VideoConverter.title"),
    description: t("VideoConverter.description"),
    path: "/tools/video-converter",
    category: "UtilitiesApplication",
  })

  return (
    <div className="container mx-auto py-10">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <VideoConverter />
      <ToolGuide ns="VideoConverter" />
    </div>
  )
}
