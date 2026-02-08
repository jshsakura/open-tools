"use client"

import { Link, usePathname } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Sparkles, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { ModeToggle } from "@/components/mode-toggle"
import { LanguageToggle } from "@/components/language-toggle"

export function Header() {
    const pathname = usePathname();
    const t = useTranslations();

    // Map URL slugs to translation keys (using the top-level tool keys which usually have the specific title)
    // or Catalog keys if preferred. Let's use the top-level tool namespace titles for page headers.
    const toolTitleMap: Record<string, string> = {
        'suno-downloader': 'Catalog.SunoDownloader.title',
        'youtube-thumbnail': 'Catalog.YoutubeThumbnail.title',
        'image-converter': 'Catalog.ImageConverter.title',
        'sql-converter': 'Catalog.SqlConverter.title',
        'favicon-generator': 'Catalog.FaviconGenerator.title',
        'unit-converter': 'Catalog.UnitConverter.title',
        'json-yaml-converter': 'Catalog.JsonYaml.title',
        'jwt-debugger': 'Catalog.JwtDebugger.title',
        'regex-tester': 'Catalog.RegexTester.title',
        'cron-generator': 'Catalog.CronGenerator.title',
        'sql-formatter': 'Catalog.SqlFormatter.title',
        'video-converter': 'Catalog.VideoConverter.title',
        'base64-converter': 'Catalog.Base64Converter.title',
        'url-converter': 'Catalog.UrlConverter.title',
        'hash-generator': 'Catalog.HashGenerator.title',
        'qr-generator': 'Catalog.QrGenerator.title',
        'image-compressor': 'Catalog.ImageCompressor.title',
        'xml-formatter': 'Catalog.XmlFormatter.title',
        'banner-generator': 'Catalog.BannerGenerator.title',
        'my-ip': 'Catalog.MyIp.title',
        'aes-crypto': 'Catalog.AesCrypto.title',
        'box-shadow-generator': 'Catalog.BoxShadowGenerator.title',
        'css-gradient-generator': 'Catalog.GradientGenerator.title',
        'border-radius-generator': 'Catalog.BorderRadiusGenerator.title',
    };

    const currentToolSlug = pathname.split('/').pop() || '';
    const currentTitleKey = toolTitleMap[currentToolSlug];
    const displayTitle = currentTitleKey ? t(currentTitleKey) : null;

    return (
        <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-14 max-w-[1700px] items-center justify-between px-4">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80 group">
                        <Sparkles className="h-5 w-5 text-primary transition-transform duration-300 group-hover:rotate-12" />
                        <span className="font-pixel font-medium text-xl tracking-tight text-foreground">
                            OpenTools
                        </span>
                    </Link>

                    {displayTitle && (
                        <div className="hidden md:flex items-center space-x-2 text-sm font-medium">
                            <span className="text-muted-foreground/40">/</span>
                            <span className="text-foreground animate-in fade-in slide-in-from-left-2">
                                {displayTitle}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex items-center space-x-2">


                    <ModeToggle />
                    <LanguageToggle />
                </div>
            </div>
        </header>
    )
}

export function Footer() {
    const t = useTranslations('Layout');

    return (
        <footer className="py-6 md:px-8 border-t bg-muted/20 mt-auto">
            <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row max-w-5xl mx-auto">
                <p className="text-balance text-center text-xs leading-loose text-muted-foreground md:text-left">
                    {t.rich('footer', {
                        link: (chunks) => (
                            <Link
                                href="https://www.opencourse.kr/"
                                target="_blank"
                                rel="noreferrer"
                                className="font-medium underline underline-offset-4 hover:text-primary transition-colors"
                            >
                                {chunks}
                            </Link>
                        )
                    })}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                    <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
                    <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
                </div>
            </div>
        </footer>
    )
}
