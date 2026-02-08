import { getTranslations } from "next-intl/server"
import { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "TorrentHistory" })

    return {
        title: t("title"),
        description: t("description") || "Check if your IP address has been flagged for torrent activity.",
    }
}

export default function TorrentHistoryLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen">
            {children}
        </div>
    )
}
