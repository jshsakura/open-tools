import { getTranslations } from "next-intl/server";
import { HomeClient } from "@/components/home-client";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Home' });
    return {
        title: `${t('title')} | Open Tools`,
        description: t('description'),
    };
}

export default async function Home() {
    return <HomeClient />;
}
