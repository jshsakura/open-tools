import { getTranslations , setRequestLocale} from "next-intl/server"
import { TorrentHistoryPageClient } from "@/components/tools/torrent-history-page"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("TorrentHistory.title"),
    description: t("TorrentHistory.description"),
    path: "/tools/torrent-history",
  })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function TorrentHistoryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Catalog" })
  const jsonLd = createToolJsonLd({
    locale,
    title: t("TorrentHistory.title"),
    description: t("TorrentHistory.description"),
    path: "/tools/torrent-history",
    category: "SecurityApplication",
  })

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <TorrentHistoryPageClient />
    </>
  )
}
