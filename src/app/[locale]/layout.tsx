import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import type { Metadata } from "next";
import { Header, Footer } from "@/components/layout";
import { ThemeProvider } from "@/components/theme-provider"
import { AdsenseSlot } from "@/components/ads/adsense-slot";
import NextTopLoader from 'nextjs-toploader';
import { BackgroundBlobs } from "@/components/background-blobs";
import { GoogleAnalytics } from "@/components/google-analytics";

const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://tools.opencourse.kr";

const rawMetaTags = process.env.NEXT_PUBLIC_META_TAGS;
const metaTags =
    rawMetaTags
        ? (() => {
            try {
                const parsed = JSON.parse(rawMetaTags);
                if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                    return parsed as Record<string, string>;
                }
            } catch {
                // Ignore invalid JSON
            }
            return undefined;
        })()
        : undefined;

export async function generateMetadata({
    params
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const lang = locale === "en" ? "en" : "ko";

    const metaText = {
        ko: {
            title: "Open Tools - 일상 · 업무 · 개발에 바로 쓰는 무료 온라인 도구",
            description: "할인 계산, 더치페이, 수분 섭취, 수면, BMI, PDF, 이미지, 개발 도구까지 한곳에서 빠르게 찾는 무료 온라인 도구 모음",
        },
        en: {
            title: "Open Tools - Free online tools for everyday life, work, and development",
            description: "Browse free online tools for discounts, split bills, hydration, sleep, BMI, PDF work, image editing, and practical developer tasks.",
        }
    }[lang];

    return {
        metadataBase: new URL(baseUrl),
        title: {
            template: "Open Tools - %s",
            default: metaText.title
        },
        description: metaText.description,
        alternates: {
            canonical: `${baseUrl}/${locale}`,
            languages: {
                en: `${baseUrl}/en`,
                ko: `${baseUrl}/ko`,
            },
        },
        icons: {
            icon: "/icon.svg",
            shortcut: "/favicon-16x16.png",
            apple: "/apple-touch-icon.png",
        },
        manifest: "/site.webmanifest",
        openGraph: {
            type: "website",
            title: metaText.title,
            description: metaText.description,
            url: baseUrl,
            images: [
                {
                    url: "/opengraph-image",
                    width: 1200,
                    height: 630,
                    alt: "Open Tools"
                }
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: metaText.title,
            description: metaText.description,
            images: ["/opengraph-image"],
        },
        other: metaTags,
    };
}

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    if (!routing.locales.some((supportedLocale) => supportedLocale === locale)) {
        notFound();
    }

    const messages = await getMessages();

    return (
        <>
            <NextTopLoader
                color="hsl(var(--primary))"
                initialPosition={0.08}
                crawlSpeed={200}
                height={3}
                crawl={true}
                showSpinner={false}
                easing="ease"
                speed={200}
                shadow="0 0 10px hsl(var(--primary)),0 0 5px hsl(var(--primary))"
            />

            <BackgroundBlobs />

            <NextIntlClientProvider messages={messages}>
                <GoogleAnalytics
                    gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}
                    adsenseId={process.env.NEXT_PUBLIC_ADSENSE_ID}
                />
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem={true}
                    disableTransitionOnChange
                >
                    <div className="relative flex min-h-screen flex-col">
                        <Header />

                        {/* Main Layout with Ad Spaces */}
                        <div className="flex-1 w-full max-w-[1700px] mx-auto flex flex-col items-center">
                            {/* Top Ad Area */}
                            <div className="w-full py-6 flex justify-center px-4">
                                <AdsenseSlot
                                    type="leaderboard"
                                    clientId={process.env.NEXT_PUBLIC_ADSENSE_ID}
                                    slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP}
                                />
                            </div>

                            <div className="w-full flex justify-center gap-8 pb-12">
                                {/* Left Sidebar Ad */}
                                <aside className="hidden 2xl:block w-[160px] sticky top-20 h-fit self-start shrink-0">
                                    <AdsenseSlot
                                        type="skyscraper"
                                        clientId={process.env.NEXT_PUBLIC_ADSENSE_ID}
                                        slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEFT}
                                    />
                                </aside>

                                {/* Main Content Area */}
                                <main className="flex-1 max-w-6xl min-w-0">
                                    {children}
                                </main>

                                {/* Right Sidebar Ad */}
                                <aside className="hidden md:block w-[160px] sticky top-20 h-fit self-start shrink-0">
                                    <AdsenseSlot
                                        type="skyscraper"
                                        clientId={process.env.NEXT_PUBLIC_ADSENSE_ID}
                                        slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_RIGHT}
                                    />
                                </aside>
                            </div>
                        </div>
                        <Footer />
                    </div>
                </ThemeProvider>
            </NextIntlClientProvider>
        </>
    );
}
