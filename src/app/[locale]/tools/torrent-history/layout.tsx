import { getTranslations } from "next-intl/server"
import { createToolMetadata } from "@/lib/seo"

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

export default function TorrentHistoryLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen">
            {children}
        </div>
    )
}
