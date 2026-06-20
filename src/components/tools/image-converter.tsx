"use client"

import { useState } from "react"
import { useTranslations } from 'next-intl'
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ClipboardPasteButton } from "@/components/clipboard-paste-button"
import { Slider } from "@/components/ui/slider"
import { Upload, Download, FileImage, RefreshCw, X } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

type ImageFormat = 'image/png' | 'image/jpeg' | 'image/webp'

// Default output quality (%). Only affects lossy targets (JPEG/WebP).
const DEFAULT_QUALITY = 90

interface ConvertedImage {
    name: string;
    url: string;
    size: string;
    type: string;
}

interface SourceImage {
    file: File;
    previewUrl: string;
}

export function ImageConverter() {
    const t = useTranslations('ImageConverter');
    const [sources, setSources] = useState<SourceImage[]>([]);
    const [isConverting, setIsConverting] = useState(false);
    const [convertedImages, setConvertedImages] = useState<ConvertedImage[]>([]);
    const [quality, setQuality] = useState(DEFAULT_QUALITY);

    const setFiles = (files: File[]) => {
        if (files.length === 0) return;

        const picked: SourceImage[] = files.map((file) => ({
            file,
            previewUrl: URL.createObjectURL(file),
        }));

        setSources((prev) => {
            // Revoke any previously held preview URLs to avoid leaks.
            prev.forEach((s) => URL.revokeObjectURL(s.previewUrl));
            return picked;
        });
        setConvertedImages((prev) => {
            prev.forEach((c) => URL.revokeObjectURL(c.url));
            return [];
        });
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setFiles(Array.from(files));
    }

    const handleFile = (file: File) => setFiles([file]);

    const clearSources = () => {
        sources.forEach((s) => URL.revokeObjectURL(s.previewUrl));
        convertedImages.forEach((c) => URL.revokeObjectURL(c.url));
        setSources([]);
        setConvertedImages([]);
    }

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    const convertOne = (source: SourceImage, format: ImageFormat, qualityRatio: number) =>
        new Promise<ConvertedImage>((resolve, reject) => {
            const img = document.createElement('img');
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas not supported'));
                    return;
                }
                // JPEG has no alpha channel; paint a white background first
                // so transparent PNGs don't turn black.
                if (format === 'image/jpeg') {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                ctx.drawImage(img, 0, 0);
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Conversion failed'));
                            return;
                        }
                        const ext = format.split('/')[1];
                        const base = source.file.name.includes('.')
                            ? source.file.name.substring(0, source.file.name.lastIndexOf('.'))
                            : source.file.name;
                        const newName = `${base}.${ext === 'jpeg' ? 'jpg' : ext}`;
                        resolve({
                            name: newName,
                            url: URL.createObjectURL(blob),
                            size: formatSize(blob.size),
                            type: format,
                        });
                    },
                    format,
                    qualityRatio
                );
            };
            img.onerror = () => reject(new Error(`Could not load ${source.file.name}`));
            img.src = source.previewUrl;
        });

    const convertImages = async (format: ImageFormat) => {
        if (sources.length === 0) {
            toast.error(t('uploadFirst'));
            return;
        }

        setIsConverting(true);
        const qualityRatio = quality / 100;

        try {
            const results = await Promise.all(
                sources.map((source) => convertOne(source, format, qualityRatio))
            );
            setConvertedImages((prev) => {
                prev.forEach((c) => URL.revokeObjectURL(c.url));
                return results;
            });
            toast.success(t('conversionComplete'));
        } catch (error) {
            console.error(error);
            const message = error instanceof Error ? error.message : t('conversionError');
            toast.error(message);
        } finally {
            setIsConverting(false);
        }
    }

    const downloadImage = (img: ConvertedImage) => {
        const link = document.createElement('a');
        link.href = img.url;
        link.download = img.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const downloadAll = () => {
        convertedImages.forEach(downloadImage);
    }

    return (
        <div className="mx-auto max-w-5xl space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">{t('introTitle')}</h2>
                <p className="text-muted-foreground">{t('introDesc')}</p>
                <p className="text-sm text-muted-foreground">{t('supportedFormats')}</p>
            </div>

            <GlassCard className="p-8 rounded-2xl">
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-muted-foreground/25 rounded-xl bg-secondary/50 hover:bg-secondary/70 transition-colors cursor-pointer relative">
                    <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-0"
                    />
                    {sources.length > 0 ? (
                        <div className="text-center space-y-4">
                            <div className="flex flex-wrap justify-center gap-4">
                                {sources.slice(0, 4).map((s) => (
                                    <div key={s.previewUrl} className="relative w-40 h-40 rounded-lg overflow-hidden shadow-lg border border-border/40 bg-muted/20">
                                        <Image src={s.previewUrl} alt="Preview" fill className="object-cover" />
                                    </div>
                                ))}
                            </div>
                            <div>
                                <p className="font-medium text-lg">
                                    {sources.length === 1
                                        ? sources[0].file.name
                                        : t('filesSelected', { count: sources.length })}
                                </p>
                                <p className="text-muted-foreground">
                                    {formatSize(sources.reduce((sum, s) => sum + s.file.size, 0))}
                                </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                clearSources();
                            }} className="relative z-10 pointer-events-auto">
                                <X className="mr-2 h-4 w-4" />
                                {t('remove')}
                            </Button>
                        </div>
                    ) : (
                        <div className="text-center space-y-2">
                            <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                            <p className="text-lg font-medium">{t('clickOrDrag')}</p>
                            <p className="text-sm text-muted-foreground">{t('dropDesc')}</p>
                            <div className="relative z-10 flex justify-center pt-2 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                                <ClipboardPasteButton onImageFile={handleFile} />
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 space-y-3">
                        <div className="flex justify-between items-center">
                            <Label className="text-base">{t('quality')}</Label>
                            <span className="font-mono font-bold text-primary">{quality}%</span>
                        </div>
                        <Slider
                            value={[quality]}
                            onValueChange={([val]) => setQuality(val)}
                            min={10}
                            max={100}
                            step={1}
                            className="py-2"
                        />
                        <p className="text-xs text-muted-foreground">{t('qualityHint')}</p>
                </div>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Button
                        onClick={() => convertImages('image/png')}
                        disabled={isConverting || sources.length === 0}
                        className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/20"
                    >
                        {isConverting ? <RefreshCw className="animate-spin mr-2 h-4 w-4" /> : <FileImage className="mr-2 h-4 w-4" />}
                        {t('convertToPng')}
                    </Button>
                    <Button
                        onClick={() => convertImages('image/jpeg')}
                        disabled={isConverting || sources.length === 0}
                        className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20"
                    >
                        {isConverting ? <RefreshCw className="animate-spin mr-2 h-4 w-4" /> : <FileImage className="mr-2 h-4 w-4" />}
                        {t('convertToJpg')}
                    </Button>
                    <Button
                        onClick={() => convertImages('image/webp')}
                        disabled={isConverting || sources.length === 0}
                        className="bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20"
                    >
                        {isConverting ? <RefreshCw className="animate-spin mr-2 h-4 w-4" /> : <FileImage className="mr-2 h-4 w-4" />}
                        {t('convertToWebp')}
                    </Button>
                </div>
            </GlassCard>

            {convertedImages.length > 0 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    {convertedImages.length > 1 && (
                        <div className="flex justify-end">
                            <Button onClick={downloadAll}>
                                <Download className="mr-2 h-4 w-4" />
                                {t('downloadAll')}
                            </Button>
                        </div>
                    )}
                    <div className="grid gap-4">
                        {convertedImages.map((img) => (
                            <GlassCard key={img.url} className="p-4 flex items-center justify-between rounded-xl">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-muted/20 rounded-lg">
                                        <FileImage className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">{img.name}</p>
                                        <p className="text-sm text-muted-foreground">{img.size}</p>
                                    </div>
                                </div>
                                <Button onClick={() => downloadImage(img)}>
                                    <Download className="mr-2 h-4 w-4" />
                                    {t('download')}
                                </Button>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
