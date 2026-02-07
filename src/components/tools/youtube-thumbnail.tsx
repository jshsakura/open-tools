"use client"

import { useState } from "react"
import { useTranslations } from 'next-intl'
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Download, ExternalLink, ImageIcon } from "lucide-react"
import Image from "next/image"

export function YoutubeThumbnail() {
    const t = useTranslations('YoutubeThumbnail');
    const [url, setUrl] = useState("")
    const [videoId, setVideoId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const extractVideoId = (inputUrl: string) => {
        try {
            const urlObj = new URL(inputUrl);
            const hostname = urlObj.hostname;

            if (hostname.includes('youtube.com')) {
                if (urlObj.pathname === '/watch') {
                    return urlObj.searchParams.get('v');
                } else if (urlObj.pathname.startsWith('/shorts/')) {
                    return urlObj.pathname.split('/')[2];
                }
            } else if (hostname.includes('youtu.be')) {
                return urlObj.pathname.slice(1);
            }
        } catch (e) {
            // Check if input is just the ID
            if (inputUrl.length === 11) return inputUrl;
        }
        return null;
    }

    const handleExtract = (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        const id = extractVideoId(url)
        if (id) {
            setVideoId(id)
        } else {
            setError(t('errorInvalidUrl'))
            setVideoId(null)
        }
    }

    const downloadImage = async (imageUrl: string, fileName: string) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
            window.open(imageUrl, '_blank');
        }
    };

    const thumbnails = videoId ? [
        { label: 'Max Resolution (HD)', url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, size: '1280x720' },
        { label: 'High Quality', url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, size: '480x360' },
        { label: 'Medium Quality', url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`, size: '320x180' },
    ] : [];

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <GlassCard className="p-8 rounded-2xl">
                <form onSubmit={handleExtract} className="flex flex-col sm:flex-row gap-4">
                    <Input
                        placeholder={t('inputPlaceholder')}
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="h-12 text-lg bg-secondary/50 border-border/40 focus:ring-red-500/50 rounded-xl"
                    />
                    <Button
                        type="submit"
                        size="lg"
                        className="h-12 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shrink-0"
                    >
                        <Search className="mr-2 h-5 w-5" />
                        {t('extractButton')}
                    </Button>
                </form>
                {error && (
                    <div className="mt-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium text-center animate-in fade-in">
                        {error}
                    </div>
                )}
            </GlassCard>

            {videoId && (
                <div className="grid gap-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
                    {thumbnails.map((thumb, index) => (
                        <GlassCard key={index} className="overflow-hidden rounded-2xl p-6">
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                <div className="relative w-full md:w-2/3 aspect-video rounded-xl overflow-hidden bg-muted/50 border border-border/40 shadow-lg">
                                    <Image
                                        src={thumb.url}
                                        alt={thumb.label}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                                <div className="flex-1 space-y-4 w-full">
                                    <div>
                                        <h3 className="text-xl font-bold">{thumb.label}</h3>
                                        <p className="text-muted-foreground">{thumb.size}</p>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <Button
                                            onClick={() => downloadImage(thumb.url, `youtube-thumbnail-${thumb.size}.jpg`)}
                                            className="w-full bg-white/10 hover:bg-white/20 text-foreground border border-white/10"
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Download
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => window.open(thumb.url, '_blank')}
                                            className="w-full"
                                        >
                                            <ExternalLink className="mr-2 h-4 w-4" />
                                            Open in New Tab
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}
        </div>
    )
}
