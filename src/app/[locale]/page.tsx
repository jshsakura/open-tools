import { getTranslations } from "next-intl/server";
import { HomeClient } from "@/components/home-client";
import { getBaseUrl } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Home' });
    const baseUrl = getBaseUrl();
    return {
        title: `${t('title')} | Open Tools`,
        description: t('description'),
        alternates: {
            canonical: `${baseUrl}/${locale}`,
            languages: {
                en: `${baseUrl}/en`,
                ko: `${baseUrl}/ko`,
            },
        },
    };
}

export default async function Home() {
    return <HomeClient />;
}
