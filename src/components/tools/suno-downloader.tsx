"use client"

import { useTranslations } from 'next-intl';
import { useState } from "react"
import { Search, Download, Music, Loader2, AlertCircle, Link as LinkIcon, CheckCircle2, Info, ListMusic, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Image from "next/image"
import { GlassCard } from "@/components/ui/glass-card"
import { Skeleton } from "@/components/ui/skeleton"

interface SunoData {
    title: string
    image: string
    audioUrl: string
    description?: string
}

export function SunoDownloader() {
    const t = useTranslations('Suno');
    const [url, setUrl] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [data, setData] = useState<SunoData[]>([])
    const [error, setError] = useState<string | null>(null)
    const [downloading, setDownloading] = useState<string[]>([]) // Track downloading IDs

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!url) return

        setIsLoading(true)
        setError(null)
        setData([])

        try {
            const response = await fetch("/api/suno/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url }),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || t('errorGeneric'))
            }

            // Always treat as array
            const resultsArray = Array.isArray(result) ? result : [result];
            setData(resultsArray)
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const downloadTrack = async (item: SunoData) => {
        if (!item.audioUrl) return

        try {
            const response = await fetch(item.audioUrl)
            const blob = await response.blob()
            const downloadUrl = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = downloadUrl
            link.download = `${item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp3`
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(downloadUrl)
            return true;
        } catch (e) {
            console.error("Download failed", e)
            window.open(item.audioUrl, '_blank')
            return false;
        }
    }

    const handleDownloadSingle = async (item: SunoData) => {
        setDownloading(prev => [...prev, item.audioUrl]);
        await downloadTrack(item);
        setDownloading(prev => prev.filter(url => url !== item.audioUrl));
    }

    const handleDownloadAll = async () => {
        const confirmMsg = `Download ${data.length} songs? Browsers might block multiple downloads. Please allow popups if prompted.`;
        if (!window.confirm(confirmMsg)) return;

        // Sequential download to avoid overwhelming browser
        for (const item of data) {
            setDownloading(prev => [...prev, item.audioUrl]);
            await downloadTrack(item);
            setDownloading(prev => prev.filter(url => url !== item.audioUrl));
            // Small delay
            await new Promise(r => setTimeout(r, 500));
        }
    }

    return (
        <div className="mx-auto max-w-4xl space-y-8">

            <GlassCard className="flex flex-wrap items-center gap-4 p-4 rounded-2xl">
                <form onSubmit={handleSearch} className="flex-1 flex flex-col sm:flex-row gap-4 w-full">
                    <div className="relative flex-1 group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                            <LinkIcon className="h-5 w-5" />
                        </div>
                        <Input
                            type="url"
                            placeholder={t('inputPlaceholder')}
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="h-12 border-border/40 bg-secondary/50 pl-12 text-foreground shadow-sm focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50 placeholder:text-muted-foreground/50 transition-all hover:bg-secondary/70 backdrop-blur-md rounded-xl"
                            required
                        />
                    </div>
                    <Button
                        type="submit"
                        size="lg"
                        className="h-12 rounded-xl px-8 font-bold tracking-wide transition-all shadow-sm hover:bg-primary/90 active:scale-95 bg-primary text-primary-foreground shrink-0"
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Search className="mr-2 h-5 w-5" />}
                        {t('resolveButton')}
                    </Button>
                </form>
            </GlassCard>

            {!isLoading && data.length === 0 && !error && (
                <div className="grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm shadow-lg shadow-primary/5">
                        <CardContent className="p-6 space-y-4">
                            <h3 className="text-xl font-bold flex items-center gap-2 text-primary">
                                <Info className="w-5 h-5" />
                                {t('guide.title')}
                            </h3>
                            <ul className="space-y-4">
                                <li className="flex gap-3 items-start">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary mt-0.5">1</span>
                                    <p className="text-muted-foreground text-sm leading-relaxed">{t('guide.step1')}</p>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary mt-0.5">2</span>
                                    <p className="text-muted-foreground text-sm leading-relaxed">{t('guide.step2')}</p>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary mt-0.5">3</span>
                                    <p className="text-muted-foreground text-sm leading-relaxed">{t('guide.step3')}</p>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardContent className="p-6 space-y-4">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                {t('guide.supported')}
                            </h3>
                            <div className="grid gap-3">
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50">
                                    <Music className="w-5 h-5 text-blue-500" />
                                    <div>
                                        <p className="font-medium text-sm">Song Link</p>
                                        <p className="text-xs text-muted-foreground">https://suno.com/song/...</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50">
                                    <ListMusic className="w-5 h-5 text-purple-500" />
                                    <div>
                                        <p className="font-medium text-sm">{t('guide.playlist')}</p>
                                        <p className="text-xs text-muted-foreground">https://suno.com/playlist/...</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50">
                                    <Share2 className="w-5 h-5 text-orange-500" />
                                    <div>
                                        <p className="font-medium text-sm">{t('guide.share')}</p>
                                        <p className="text-xs text-muted-foreground">https://mureka.ai/...</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {error && (
                <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {isLoading && data.length === 0 && (
                <div className="grid md:grid-cols-2 gap-4 animate-in fade-in zoom-in-50 duration-500">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
                            <div className="flex">
                                <Skeleton className="h-32 w-32 shrink-0 rounded-none bg-muted/60" />
                                <div className="flex flex-1 flex-col justify-between p-4 space-y-2">
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-3/4 bg-muted/60" />
                                        <Skeleton className="h-3 w-full bg-muted/60" />
                                    </div>
                                    <div className="flex items-center gap-2 mt-auto">
                                        <Skeleton className="h-8 flex-1 bg-muted/60 rounded-full" />
                                        <Skeleton className="h-8 w-8 shrink-0 bg-muted/60 rounded-lg" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {data.length > 0 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center px-2">
                        <h3 className="font-bold text-xl flex items-center gap-2">
                            <Music className="w-5 h-5 text-primary" />
                            {data.length} Songs Found
                        </h3>
                        {data.length > 1 && (
                            <Button onClick={handleDownloadAll} variant="default" className="gap-2">
                                <Download className="w-4 h-4" />
                                Download All ({data.length})
                            </Button>
                        )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        {data.map((item, idx) => (
                            <div key={idx} className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex">
                                    <div className="relative w-32 aspect-square shrink-0">
                                        {item.image ? (
                                            <Image
                                                src={item.image}
                                                alt={item.title}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-muted">
                                                <Music className="h-8 w-8 text-muted-foreground/50" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-1 flex-col justify-between p-4 min-w-0">
                                        <div className="space-y-1">
                                            <h4 className="font-semibold tracking-tight text-lg truncate" title={item.title}>{item.title}</h4>
                                            <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <audio controls src={item.audioUrl} className="flex-1 h-8 accent-primary w-full min-w-0" />
                                            <Button
                                                size="icon"
                                                variant="secondary"
                                                onClick={() => handleDownloadSingle(item)}
                                                disabled={downloading.includes(item.audioUrl)}
                                            >
                                                {downloading.includes(item.audioUrl) ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Download className="w-4 h-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
