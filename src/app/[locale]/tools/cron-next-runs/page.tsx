import { getTranslations, setRequestLocale } from "next-intl/server"
import { CronNextRuns } from "@/components/tools/cron-next-runs"
import { ToolGuide } from "@/components/tool-guide-section"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "Catalog" })
    return createToolMetadata({
        locale,
        title: t("CronNextRuns.title"),
        description: t("CronNextRuns.description"),
        path: "/tools/cron-next-runs",
    })
}

export function generateStaticParams() {
    return [{ locale: "ko" }, { locale: "en" }]
}

export default async function CronNextRunsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    setRequestLocale(locale)
    const tc = await getTranslations({ locale, namespace: "Catalog" })

    const jsonLd = createToolJsonLd({
        locale,
        title: tc("CronNextRuns.title"),
        description: tc("CronNextRuns.description"),
        path: "/tools/cron-next-runs",
        category: "DeveloperApplication",
    })

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <CronNextRuns />
            <ToolGuide ns="CronNextRuns" />
        </div>
    )
}
