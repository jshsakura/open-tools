
"use client"

import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { Music } from "lucide-react"
import { ToolLoadingSkeleton } from "@/components/tool-loader"

const SunoDownloader = dynamic(
    () => import("@/components/tools/suno-downloader").then(mod => ({ default: mod.SunoDownloader })),
    {
        loading: () => <ToolLoadingSkeleton />,
        ssr: false
    }
)

export default function SunoDownloaderPage() {
    const t = useTranslations('Suno')

    return (
        <div className="container mx-auto px-4 py-24 min-h-screen max-w-6xl">
            <div className="mb-16 text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-pink-500/10 mb-4 ring-1 ring-pink-500/20">
                    <Music className="w-8 h-8 text-pink-500" />
                </div>
                <h1 className="text-5xl font-black tracking-tighter text-foreground sm:text-6xl drop-shadow-sm">
                    {t('title')}
                </h1>
                <p className="text-xl text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed">
                    {t('description')}
                </p>
            </div>

            <SunoDownloader />
        </div>
    )
}
