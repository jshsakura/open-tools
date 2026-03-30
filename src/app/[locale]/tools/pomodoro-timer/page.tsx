import { getTranslations } from 'next-intl/server';
import { PomodoroTimer } from '@/components/tools/pomodoro-timer';
import { ToolGuide } from "@/components/tool-guide-section";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale });
    return {
        title: `${t('PomodoroTimer.title')} | ${t('Hero.title_1')} ${t('Hero.title_2')}`,
        description: t('PomodoroTimer.description'),
    };
}

export default function PomodoroTimerPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <PomodoroTimer />
            <ToolGuide ns="PomodoroTimer" />
        </div>
    );
}
