"use client"

import { useState, useRef, useEffect } from "react"
import { useTranslations } from "next-intl"
import { removeBackground as imglyRemoveBackground } from "@imgly/background-removal"
import {
    Upload,
    Download,
    Loader2,
    X,
    Image as ImageIcon,
    Layers,
    MoveHorizontal,
    Wand2,
    Shield
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function BackgroundRemover() {
    const t = useTranslations('BackgroundRemover');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [originalUrl, setOriginalUrl] = useState<string | null>(null);
    const [processedUrl, setProcessedUrl] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);

    // Comparison slider state (0 = original hidden, 100 = processed hidden)
    // Let's implement a standard "Split View": 
    // Left side = Original, Right side = Processed
    // Slider position X% means X% of width shows Left image
    const [sliderValue, setSliderValue] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        return () => {
            if (originalUrl) URL.revokeObjectURL(originalUrl);
            if (processedUrl) URL.revokeObjectURL(processedUrl);
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            const url = URL.createObjectURL(file);
            setOriginalUrl(url);
            setProcessedUrl(null);
            setSliderValue(50);
            setProgress(0);
        }
    }

    const processImage = async () => {
        if (!imageFile || !originalUrl) return;

        setProcessing(true);
        setProgress(5);

        try {
            // Simulated progress for better UX
            const progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) return prev;
                    return prev + Math.random() * 10;
                });
            }, 500);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const blob = await (imglyRemoveBackground as any)(originalUrl, {
                progress: (key: string, current: number, total: number) => {
                    // console.log(`Downloading ${key}: ${current} of ${total}`);
                },
                model: 'medium' // 'small' or 'medium'
            });

            clearInterval(progressInterval);
            setProgress(100);

            const url = URL.createObjectURL(blob);
            setProcessedUrl(url);
            toast.success("Background removed successfully!");

        } catch (error) {
            console.error("Background removal error:", error);
            toast.error("Failed to remove background. Please try another image.");
            setProgress(0);
        } finally {
            setProcessing(false);
        }
    }

    const downloadResult = () => {
        if (!processedUrl) return;
        const link = document.createElement('a');
        link.href = processedUrl;
        link.download = `removed-bg-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <GlassCard className="p-8 rounded-2xl relative overflow-hidden min-h-[500px] flex flex-col justify-center">
                {!imageFile ? (
                    <div className={cn(
                        "relative flex flex-col items-center justify-center p-12 border-2 border-dashed border-muted-foreground/25 rounded-xl bg-secondary/50 hover:bg-secondary/70 transition-all cursor-pointer group h-[400px]",
                    )}>
                        <Input
                            type="file"
                            accept="image/png, image/jpeg, image/webp"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="text-center space-y-4">
                            <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-primary/5">
                                <ImageIcon className="w-12 h-12 text-primary" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-2xl font-bold">{t('inputPlaceholder')}</p>
                                <p className="text-sm text-muted-foreground">{t('supportedFormats')}</p>
                            </div>
                            <Button variant="outline" className="mt-4 pointer-events-none">
                                {t('selectImage')}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8 w-full">
                        {/* Image Preview / Comparison Area */}
                        {!processedUrl ? (
                            // Initial Preview
                            <div className="relative w-full aspect-video md:aspect-[16/9] max-h-[600px] mx-auto rounded-2xl overflow-hidden shadow-2xl border border-border/40 bg-black/5">
                                <img src={originalUrl!} alt="Preview" className="w-full h-full object-contain relative z-10" />
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-4 right-4 z-30 rounded-full shadow-lg"
                                    onClick={() => {
                                        setImageFile(null);
                                        setOriginalUrl(null);
                                        setProcessedUrl(null);
                                        setProcessing(false);
                                    }}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : (
                            // Comparison Slider
                            <div className="relative w-full aspect-video md:aspect-[16/9] max-h-[600px] mx-auto rounded-2xl overflow-hidden shadow-2xl border border-border/40 bg-[url('/checkerboard.png')] select-none" ref={containerRef}>
                                {/* Checkerboard */}
                                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,#808080_25%,transparent_25%,transparent_75%,#808080_75%,#808080),linear-gradient(45deg,#808080_25%,transparent_25%,transparent_75%,#808080_75%,#808080)] bg-[length:20px_20px] bg-[position:0_0,10px_10px]" />

                                {/* BACKGROUND: Processed Result (Always full) */}
                                <img
                                    src={processedUrl}
                                    alt="Result"
                                    className="absolute inset-0 w-full h-full object-contain"
                                />

                                {/* FOREGROUND: Original Image (Clipped) */}
                                <div
                                    className="absolute inset-0 w-full h-full border-r-2 border-white/50 overflow-hidden"
                                    style={{
                                        clipPath: `inset(0 ${100 - sliderValue}% 0 0)`
                                    }}
                                >
                                    <img
                                        src={originalUrl!}
                                        alt="Original"
                                        className="absolute inset-0 w-full h-full object-contain"
                                    />
                                    <div className="absolute top-4 left-4 bg-black/60 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                                        {t('labelOriginal')}
                                    </div>
                                </div>

                                {/* Label for Result (Right side) */}
                                <div className="absolute top-4 right-4 bg-primary/90 text-primary-foreground text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md shadow-lg pointer-events-none z-0">
                                    {t('labelRemoved')}
                                </div>

                                {/* Slider Handle */}
                                <div
                                    className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center hover:bg-primary transition-colors"
                                    style={{ left: `${sliderValue}%` }}
                                >
                                    <div className="w-8 h-8 rounded-full bg-white shadow-xl flex items-center justify-center -ml-[1px]">
                                        <MoveHorizontal className="w-4 h-4 text-gray-800" />
                                    </div>
                                </div>

                                {/* Invisible Range Input for Interaction */}
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={sliderValue}
                                    onChange={(e) => setSliderValue(Number(e.target.value))}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30 m-0 p-0"
                                />

                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-4 right-16 z-40 rounded-full shadow-lg"
                                    onClick={() => {
                                        setImageFile(null);
                                        setOriginalUrl(null);
                                        setProcessedUrl(null);
                                        setProcessing(false);
                                    }}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        )}

                        {/* Controls */}
                        <div className="flex flex-col items-center gap-6">
                            {processedUrl ? (
                                <div className="flex flex-col items-center gap-4 w-full">
                                    <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-4">
                                        <Button
                                            size="lg"
                                            onClick={downloadResult}
                                            className="rounded-xl shadow-lg shadow-primary/20 h-14 px-8 text-lg font-bold bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90"
                                        >
                                            <Download className="mr-2 h-5 w-5" />
                                            {t('download')}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            onClick={() => {
                                                setImageFile(null);
                                                setOriginalUrl(null);
                                                setProcessedUrl(null);
                                                setProcessing(false);
                                            }}
                                            className="rounded-xl h-14 px-6 text-lg"
                                        >
                                            Try Another
                                        </Button>
                                    </div>
                                    <p className="text-sm text-muted-foreground animate-pulse">
                                        Drag the slider to compare original and result
                                    </p>
                                </div>
                            ) : (
                                <div className="w-full max-w-sm space-y-4">
                                    <Button
                                        size="lg"
                                        className="w-full h-16 text-xl font-bold rounded-xl shadow-xl shadow-primary/20 relative overflow-hidden transition-all hover:scale-105 active:scale-95"
                                        onClick={processImage}
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="animate-spin mr-3 h-6 w-6" />
                                                Processing... {Math.round(progress)}%
                                            </>
                                        ) : (
                                            <>
                                                <Wand2 className="mr-3 h-6 w-6" />
                                                {t('removeBackground')}
                                            </>
                                        )}

                                        {/* Progress Bar Background */}
                                        {processing && (
                                            <div
                                                className="absolute bottom-0 left-0 h-1.5 bg-white/70 transition-all duration-300 ease-out"
                                                style={{ width: `${progress}%` }}
                                            />
                                        )}
                                    </Button>
                                    <p className="text-center text-xs text-muted-foreground">
                                        {t.rich('poweredBy')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </GlassCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                <GlassCard className="p-6 rounded-xl space-y-3 hover:translate-y-[-2px] transition-transform">
                    <h4 className="font-bold flex items-center gap-2 text-lg">
                        <Wand2 className="w-5 h-5 text-indigo-500" />
                        {t('howItWorksTitle')}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {t.rich('howItWorksDescription', {
                            b: (chunks) => <b>{chunks}</b>
                        })}
                    </p>
                </GlassCard>
                <GlassCard className="p-6 rounded-xl space-y-3 hover:translate-y-[-2px] transition-transform">
                    <h4 className="font-bold flex items-center gap-2 text-lg">
                        <Shield className="w-5 h-5 text-green-500" />
                        {t('privacyTitle')}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {t.rich('privacyDescription', {
                            b: (chunks) => <b>{chunks}</b>
                        })}
                    </p>
                </GlassCard>
            </div>
        </div>
    )
}
