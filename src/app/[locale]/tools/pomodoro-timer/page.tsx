import { getTranslations, setRequestLocale } from "next-intl/server";
import { PomodoroTimer } from '@/components/tools/pomodoro-timer';
import { ToolGuide } from "@/components/tool-guide-section";
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"
import { getToolById } from "@/lib/tools-catalog"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "Catalog" });
    return createToolMetadata({
        locale,
        title: t("PomodoroTimer.title"),
        description: t("PomodoroTimer.description"),
        path: "/tools/pomodoro-timer",
    });
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function PomodoroTimerPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const tc = await getTranslations({ locale, namespace: "Catalog" });
    ;
    const jsonLd = createToolJsonLd({
        locale,
        title: tc("PomodoroTimer.title"),
        description: tc("PomodoroTimer.description"),
        path: "/tools/pomodoro-timer",
        category: "UtilityApplication",
    });

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <PomodoroTimer />
            <ToolGuide ns="PomodoroTimer" />
        </div>
    );
}
