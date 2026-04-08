import { getTranslations , setRequestLocale} from "next-intl/server"
import { YoutubeDownloaderPageClient } from "@/components/tools/youtube-downloader-page"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("YouTubeDownloader.title"),
    description: t("YouTubeDownloader.description"),
    path: "/tools/youtube-downloader",
  })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function YoutubeDownloaderPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Catalog" })
  const jsonLd = createToolJsonLd({
    locale,
    title: t("YouTubeDownloader.title"),
    description: t("YouTubeDownloader.description"),
    path: "/tools/youtube-downloader",
    category: "MultimediaApplication",
  })

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <YoutubeDownloaderPageClient />
    </>
  )
}
