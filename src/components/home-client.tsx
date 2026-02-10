"use client"

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button"
import { ToolCard } from "@/components/tool-card"
import {
    Music,
    Database,
    Ruler,
    FileJson,
    ShieldCheck,
    Regex,
    Clock,
    MonitorPlay,
    Video,
    Image as ImageIcon,
    Sparkles,
    LayoutGrid,
    Zap,
    Search,
    Info,
    Globe,
    FileCode,
    Terminal,
    QrCode,
    Wand2,
    Link,
    Minimize2,
    Maximize,
    FileText,
    Files,
    Box,
    ScanText,
    Layers,
    Fingerprint
} from "lucide-react"
import { YouTubeIcon } from "@/components/icons/youtube-icon";
import { cn } from "@/lib/utils"

export function HomeClient() {
    const t = useTranslations();
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    const tools = useMemo(() => [
        {
            id: 'torrent-history',
            title: t('Catalog.TorrentHistory.title'),
            description: t('Catalog.TorrentHistory.description'),
            icon: Fingerprint,
            href: "/tools/torrent-history",
            color: "text-red-600",
            tags: ['Security']
        },
        {
            id: 'security-tools',
            title: t('Catalog.SecurityTools.title'),
            description: t('Catalog.SecurityTools.description'),
            icon: ShieldCheck,
            href: "/tools/security-tools",
            color: "text-emerald-600",
            tags: ['Security']
        },
        {
            id: 'background-remover',
            title: t('Catalog.BackgroundRemover.title'),
            description: t('Catalog.BackgroundRemover.description'),
            icon: Wand2,
            href: "/tools/background-remover",
            color: "text-purple-500",
            tags: ['Media', 'AI']
        },
        {
            id: 'banner-generator',
            title: t('Catalog.BannerGenerator.title'),
            description: t('Catalog.BannerGenerator.description'),
            icon: Terminal,
            href: "/tools/banner-generator",
            color: "text-orange-500",
            tags: ['Development']
        },
        {
            id: 'base64-converter',
            title: t('Catalog.Base64Converter.title'),
            description: t('Catalog.Base64Converter.description'),
            icon: FileCode,
            href: "/tools/base64-converter",
            color: "text-emerald-600",
            tags: ['Development']
        },
        {
            id: 'base64-image',
            title: t('Catalog.Base64Image.title'),
            description: t('Catalog.Base64Image.description'),
            icon: ImageIcon,
            href: "/tools/base64-image",
            color: "text-purple-500",
            tags: ['Media']
        },
        {
            id: 'border-radius-generator',
            title: t('Catalog.BorderRadiusGenerator.title'),
            description: t('Catalog.BorderRadiusGenerator.description'),
            icon: Maximize,
            href: "/tools/border-radius-generator",
            color: "text-green-500",
            tags: ['Design']
        },
        {
            id: 'box-shadow-generator',
            title: t('Catalog.BoxShadowGenerator.title'),
            description: t('Catalog.BoxShadowGenerator.description'),
            icon: Layers,
            href: "/tools/box-shadow-generator",
            color: "text-indigo-500",
            tags: ['Design']
        },
        {
            id: 'browser-info',
            title: t('Catalog.BrowserInfo.title'),
            description: t('Catalog.BrowserInfo.description'),
            icon: Info,
            href: "/tools/browser-info",
            color: "text-cyan-500",
            tags: ['Utilities']
        },
        {
            id: 'color-palette',
            title: t('Catalog.ColorPalette.title'),
            description: t('Catalog.ColorPalette.description'),
            icon: ImageIcon,
            href: "/tools/color-palette",
            color: "text-pink-500",
            tags: ['Design']
        },
        {
            id: 'cron-generator',
            title: t('Catalog.CronGenerator.title'),
            description: t('Catalog.CronGenerator.description'),
            icon: Clock,
            href: "/tools/cron-generator",
            color: "text-cyan-500",
            tags: ['Development']
        },
        {
            id: 'css-gradient-generator',
            title: t('Catalog.GradientGenerator.title'),
            description: t('Catalog.GradientGenerator.description'),
            icon: Sparkles,
            href: "/tools/css-gradient-generator",
            color: "text-pink-500",
            tags: ['Design']
        },
        {
            id: 'favicon-generator',
            title: t('Catalog.FaviconGenerator.title'),
            description: t('Catalog.FaviconGenerator.description'),
            icon: Sparkles,
            href: "/tools/favicon-generator",
            color: "text-purple-500",
            tags: ['Design']
        },
        {
            id: 'glassmorphism',
            title: t('Catalog.Glassmorphism.title'),
            description: t('Catalog.Glassmorphism.description'),
            icon: Sparkles,
            href: "/tools/glassmorphism",
            color: "text-blue-400",
            tags: ['Design']
        },
        {
            id: 'image-compressor',
            title: t('Catalog.ImageCompressor.title'),
            description: t('Catalog.ImageCompressor.description'),
            icon: Minimize2,
            href: "/tools/image-compressor",
            color: "text-orange-500",
            tags: ['Media']
        },
        {
            id: 'image-converter',
            title: t('Catalog.ImageConverter.title'),
            description: t('Catalog.ImageConverter.description'),
            icon: ImageIcon,
            href: "/tools/image-converter",
            color: "text-orange-500",
            tags: ['Media']
        },
        {
            id: 'json-yaml',
            title: t('Catalog.JsonYaml.title'),
            description: t('Catalog.JsonYaml.description'),
            icon: FileJson,
            href: "/tools/json-yaml-converter",
            color: "text-blue-500",
            tags: ['Development']
        },
        {
            id: 'my-ip',
            title: t('Catalog.MyIp.title'),
            description: t('Catalog.MyIp.description'),
            icon: Globe,
            href: "/tools/my-ip",
            color: "text-blue-600",
            tags: ['Utilities']
        },
        {
            id: 'port-scanner',
            title: t('Catalog.PortScanner.title'),
            description: t('Catalog.PortScanner.description'),
            icon: Search,
            href: "/tools/port-scanner",
            color: "text-rose-500",
            tags: ['Security']
        },
        {
            id: 'qr-generator',
            title: t('Catalog.QrGenerator.title'),
            description: t('Catalog.QrGenerator.description'),
            icon: QrCode,
            href: "/tools/qr-generator",
            color: "text-indigo-500",
            tags: ['Utilities']
        },
        {
            id: 'regex-tester',
            title: t('Catalog.RegexTester.title'),
            description: t('Catalog.RegexTester.description'),
            icon: Regex,
            href: "/tools/regex-tester",
            color: "text-rose-500",
            tags: ['Development']
        },
        {
            id: 'speed-test',
            title: t('Catalog.SpeedTest.title'),
            description: t('Catalog.SpeedTest.description'),
            icon: Zap,
            href: "/tools/speed-test",
            color: "text-yellow-500",
            tags: ['Utilities']
        },
        {
            id: 'sql-converter',
            title: t('Catalog.SqlConverter.title'),
            description: t('Catalog.SqlConverter.description'),
            icon: Database,
            href: "/tools/sql-converter",
            color: "text-indigo-500",
            tags: ['Development']
        },
        {
            id: 'suno',
            title: t('Catalog.SunoDownloader.title'),
            description: t('Catalog.SunoDownloader.description'),
            icon: Music,
            href: "/tools/suno-downloader",
            color: "text-pink-500",
            tags: ['Media', 'AI']
        },
        {
            id: 'youtube-downloader',
            title: t('Catalog.YouTubeDownloader.title'),
            description: t('Catalog.YouTubeDownloader.description'),
            icon: YouTubeIcon,
            href: "/tools/youtube-downloader",
            color: "text-red-600 dark:text-red-500",
            tags: ['Media']
        },
        {
            id: 'svg-to-jsx',
            title: t('Catalog.SvgToJsx.title'),
            description: t('Catalog.SvgToJsx.description'),
            icon: MonitorPlay,
            href: "/tools/svg-to-jsx",
            color: "text-orange-500",
            tags: ['Development']
        },
        {
            id: 'unit-converter',
            title: t('Catalog.UnitConverter.title'),
            description: t('Catalog.UnitConverter.description'),
            icon: Ruler,
            href: "/tools/unit-converter",
            color: "text-orange-500",
            tags: ['Utilities']
        },
        {
            id: 'url-converter',
            title: t('Catalog.UrlConverter.title'),
            description: t('Catalog.UrlConverter.description'),
            icon: Link,
            href: "/tools/url-converter",
            color: "text-blue-500",
            tags: ['Development']
        },
        {
            id: 'video-converter',
            title: t('Catalog.VideoConverter.title'),
            description: t('Catalog.VideoConverter.description'),
            icon: Video,
            href: "/tools/video-converter",
            color: "text-indigo-600",
            tags: ['Media']
        },
        {
            id: 'data-tools',
            title: t('Catalog.DataTools.title'),
            description: t('Catalog.DataTools.description'),
            icon: Database,
            href: "/tools/data-tools",
            color: "text-blue-500",
            tags: ['Development']
        },
        {
            id: 'text-tools',
            title: t('Catalog.TextTools.title'),
            description: t('Catalog.TextTools.description'),
            icon: ScanText,
            href: "/tools/text-tools",
            color: "text-emerald-500",
            tags: ['Development']
        },
        {
            id: 'dev-tools',
            title: t('Catalog.DevTools.title'),
            description: t('Catalog.DevTools.description'),
            icon: Terminal,
            href: "/tools/dev-tools",
            color: "text-blue-500",
            tags: ['Development']
        },
        {
            id: 'hwp-viewer',
            title: t('Catalog.HwpViewer.title'),
            description: t('Catalog.HwpViewer.description'),
            icon: FileText,
            href: "/tools/hwp-viewer",
            color: "text-blue-500",
            tags: ['Media', 'Korea']
        },
        {
            id: 'xml-formatter',
            title: t('Catalog.XmlFormatter.title'),
            description: t('Catalog.XmlFormatter.description'),
            icon: FileCode,
            href: "/tools/xml-formatter",
            color: "text-green-500",
            tags: ['Development']
        },
        {
            id: 'pdf-tools',
            title: t('Catalog.PdfTools.title'),
            description: t('Catalog.PdfTools.description'),
            icon: Files,
            href: "/tools/pdf-tools",
            color: "text-red-500",
            tags: ['Media']
        },
        {
            id: '3d-viewer',
            title: t('Catalog.Basic3dViewer.title'),
            description: t('Catalog.Basic3dViewer.description'),
            icon: Box,
            href: "/tools/3d-viewer",
            color: "text-purple-600",
            tags: ['Media']
        },
        {
            id: 'youtube-thumbnail',
            title: t('Catalog.YoutubeThumbnail.title'),
            description: t('Catalog.YoutubeThumbnail.description'),
            icon: MonitorPlay,
            href: "/tools/youtube-thumbnail",
            color: "text-red-500",
            tags: ['Media']
        }
    ].sort((a, b) => a.title > b.title ? 1 : -1), [t]);

    const allTags = useMemo(() => {
        // Consolidated tags list for simplified UI
        return ['Development', 'Media', 'Design', 'Security', 'Utilities'];
    }, []);

    const filteredTools = useMemo(() => {
        if (!selectedTag) return tools;
        return tools.filter(tool => tool.tags.includes(selectedTag));
    }, [tools, selectedTag]);

    const tagCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const tool of tools) {
            for (const tag of tool.tags) {
                counts[tag] = (counts[tag] || 0) + 1;
            }
        }
        return counts;
    }, [tools]);

    return (
        <div className="container mx-auto px-4 pt-24 pb-12 max-w-6xl">
            <div className="flex flex-col items-center gap-12 text-center">

                {/* Hero Section */}
                <section className="space-y-6 max-w-3xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary shadow-[0_0_15px_rgba(59,130,246,0.3)] backdrop-blur-sm animate-fade-in hover:bg-primary/10 transition-colors group/badge">
                        <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse group-hover/badge:scale-110 transition-transform"></span>
                        {t('Hero.badge')}
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground select-none drop-shadow-sm break-keep">
                        {t('Hero.title_1')} <span className="text-primary">{t('Hero.title_2')}</span> {t('Hero.title_3')}
                    </h1>

                    <p className="hidden sm:block text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed whitespace-pre-line">
                        {t('Hero.description')}
                    </p>
                    <p className="block sm:hidden text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
                        {t('Hero.description_mobile')}
                    </p>
                </section>

                {/* Filter Controls */}
                <section className="w-full space-y-4">
                    <div className="flex flex-wrap items-center justify-center gap-2 px-4">
                        <Button
                            variant={selectedTag === null ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedTag(null)}
                            className="rounded-full px-4 cursor-pointer"
                        >
                            <LayoutGrid className="mr-2 h-4 w-4" />
                            {t('Home.allTools')}
                            <span className="ml-2 inline-flex items-center justify-center h-5 min-w-5 px-2 text-[11px] font-semibold rounded-full bg-primary-foreground/15 text-primary-foreground ring-1 ring-primary-foreground/20">
                                {tools.length}
                            </span>
                        </Button>
                        {allTags.map(tag => (
                            <Button
                                key={tag}
                                variant={selectedTag === tag ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedTag(tag)}
                                className={cn(
                                    "rounded-full px-4 transition-all duration-300 cursor-pointer",
                                    selectedTag === tag && "shadow-lg shadow-primary/20"
                                )}
                            >
                                {tag}
                                <span className="ml-2 inline-flex items-center justify-center h-4 min-w-4 px-1.5 text-[10px] font-semibold rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
                                    {tagCounts[tag] || 0}
                                </span>
                            </Button>
                        ))}
                    </div>
                </section>

                {/* Tools Grid */}
                <section id="catalog" className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 pb-20 space-y-16">
                    {selectedTag ? (
                        // Filtered View (Single Grid)
                        <div>
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {filteredTools.map((tool) => (
                                    <ToolCard
                                        key={tool.id}
                                        title={tool.title}
                                        description={tool.description}
                                        icon={tool.icon}
                                        href={tool.href}
                                        color={tool.color}
                                        tags={tool.tags}
                                    />
                                ))}
                            </div>
                            {filteredTools.length === 0 && (
                                <div className="py-20 text-center text-muted-foreground">
                                    No tools found for this category.
                                </div>
                            )}
                        </div>
                    ) : (
                        // Categorized View (Sections)
                        allTags.map((category) => {
                            const categoryTools = tools.filter(tool => tool.tags.includes(category));
                            if (categoryTools.length === 0) return null;

                            // Icon mapping for categories
                            const CategoryIcon = {
                                Development: Terminal,
                                Media: Video,
                                Design: Wand2,
                                Security: ShieldCheck,
                                Utilities: Zap
                            }[category] || LayoutGrid;

                            return (
                                <div key={category} className="space-y-6">
                                    <h2 className="text-2xl font-bold flex items-center gap-2 px-1">
                                        <CategoryIcon className="w-6 h-6 text-primary" />
                                        {/* Localized Category Title - properly references Catalog.Categories */}
                                        {t(`Catalog.Categories.${category}`)}
                                        <span className="text-sm font-normal text-foreground/80 ml-2 bg-muted/70 border border-border/60 px-2 py-0.5 rounded-full">
                                            {categoryTools.length}
                                        </span>
                                    </h2>
                                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                        {categoryTools.map((tool) => (
                                            <ToolCard
                                                key={tool.id}
                                                title={tool.title}
                                                description={tool.description}
                                                icon={tool.icon}
                                                href={tool.href}
                                                color={tool.color}
                                                tags={tool.tags}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </section>
            </div>
        </div>
    )
}
