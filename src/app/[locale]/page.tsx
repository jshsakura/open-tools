import { getTranslations, setRequestLocale } from "next-intl/server";
import { HomeClient } from "@/components/home-client";
import { getBaseUrl } from "@/lib/seo";

export function generateStaticParams() {
    return [{ locale: "ko" }, { locale: "en" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Home' });
    const baseUrl = getBaseUrl();

    const title = `${t('title')} | Open Tools`;
    const description = t('description');

    return {
        title,
        description,
        alternates: {
            canonical: `${baseUrl}/${locale}`,
            languages: {
                "x-default": `${baseUrl}/ko`,
                en: `${baseUrl}/en`,
                ko: `${baseUrl}/ko`,
            },
        },
        openGraph: {
            type: "website",
            title,
            description,
            url: `${baseUrl}/${locale}`,
            siteName: "Open Tools",
            images: [
                {
                    url: "/opengraph-image",
                    width: 1200,
                    height: 630,
                    alt: "Open Tools",
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: ["/opengraph-image"],
        },
    };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);

    const t = await getTranslations({ locale, namespace: 'Home' });
    const baseUrl = getBaseUrl();

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Open Tools",
        description: t('description'),
        url: baseUrl,
        inLanguage: locale,
        isAccessibleForFree: true,
    };

    return (
        <>
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <HomeClient />
        </>
    );
}
