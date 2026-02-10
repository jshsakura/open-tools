import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import type { Metadata } from "next";
import { Header, Footer } from "@/components/layout";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider"
import { AdsenseSlot } from "@/components/ads/adsense-slot";
import NextTopLoader from 'nextjs-toploader';
import { BackgroundBlobs } from "@/components/background-blobs";
import { GoogleAnalytics } from "@/components/google-analytics";

export const metadata: Metadata = {
    title: {
        template: "Open Tools - %s",
        default: "Open Tools - 개발자를 위한 무료 도구 모음"
    },
    description: "50+ 개의 개발자 도구를 한 곳에서 - SQL 변환, 포맷터, PDF 병합, 이미지 처리, 암호화, 기타",
    icons: {
        icon: "/icon.svg",
        shortcut: "/favicon-16x16.png",
        apple: "/apple-touch-icon.png",
    },
    manifest: "/site.webmanifest",
};

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    if (!routing.locales.includes(locale as any)) {
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
                                    slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP}
                                />
                            </div>

                            <div className="w-full flex justify-center gap-8 px-4 pb-12">
                                {/* Left Sidebar Ad */}
                                <aside className="hidden 2xl:block w-[160px] sticky top-20 h-fit self-start shrink-0">
                                    <AdsenseSlot
                                        type="skyscraper"
                                        slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEFT}
                                    />
                                </aside>

                                {/* Main Content Area */}
                                <main className="flex-1 max-w-[1200px] min-w-0">
                                    {children}
                                </main>

                                {/* Right Sidebar Ad */}
                                <aside className="hidden xl:block w-[160px] sticky top-20 h-fit self-start shrink-0">
                                    <AdsenseSlot
                                        type="skyscraper"
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
